import { expect, test, type Page } from "@playwright/test";
import { installDesignReviewFixtures, openPasswordRecoveryReview, signInDesignReview } from "./design-review-fixtures";

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    visibleOffenders: [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && box.width > 0 && (box.left < -1 || box.right > window.innerWidth + 1);
      })
      .map((element) => element.className || element.tagName)
      .slice(0, 10)
  }));
  expect(result.overflow, `${label} document overflow`).toBeLessThanOrEqual(1);
  expect(result.visibleOffenders, `${label} visible clipping`).toEqual([]);
}

test("all unique live routes remain usable without horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await installDesignReviewFixtures(page);

  for (const route of ["/auth", "/privacy", "/terms", "/invite/design-review-token"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page, route);
  }

  await signInDesignReview(page);
  for (const route of ["/dashboard", "/transactions", "/savings-goals", "/settings", "/support"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page, route);
  }

  await openPasswordRecoveryReview(page);
  await expect(page.getByRole("heading", { name: /set a new password/i })).toBeVisible();
  await expectNoHorizontalOverflow(page, "/update-password");
});

test("household setup remains usable without horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await installDesignReviewFixtures(page, { household: false });
  await signInDesignReview(page);
  await expect(page.getByRole("heading", { name: /create your household workspace/i })).toBeVisible();
  await expectNoHorizontalOverflow(page, "/household-setup");
});

test("transaction dialog contains focus and completes a deterministic add workflow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await installDesignReviewFixtures(page);
  await signInDesignReview(page);
  await page.goto("/transactions");

  const opener = page.getByRole("button", { name: /add transaction/i }).first();
  await opener.click();
  const dialog = page.getByRole("dialog", { name: /add transaction/i });
  const close = page.getByRole("button", { name: /close add transaction/i });
  const add = dialog.getByRole("button", { name: /^add$/i });
  await expect(close).toBeFocused();
  await expect(page.locator("#root")).toHaveAttribute("inert", "");
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Shift+Tab");
  await expect(add).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();

  await dialog.getByLabel("Amount").fill("125000");
  await dialog.getByLabel("Category").selectOption({ label: "Groceries" });
  await dialog.getByLabel(/note/i).fill("Design review purchase");
  await add.click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("Design review purchase")).toBeVisible();
  await expect(opener).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("active filters, menus, settings, and chart controls use consistent corners and hit targets", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await installDesignReviewFixtures(page);
  await signInDesignReview(page);
  await page.goto("/transactions");
  for (const filter of await page.locator(".filter-button").all()) {
    await expect(filter).toHaveCSS("border-radius", "8px");
    expect((await filter.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".desktop-add-transaction")).toBeHidden();
  await expect(page.locator(".fab-button")).toBeVisible();
  await expect(page.locator(".desktop-add-transaction, .fab-button")).toHaveCount(2);
  await expect(page.getByRole("button", { name: /add transaction/i })).toHaveCount(1);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/savings-goals");
  const trigger = page.getByRole("button", { name: /open rainy day menu/i });
  await expect(trigger).toHaveCSS("border-radius", "8px");
  expect((await trigger.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await trigger.click();
  for (const item of await page.getByRole("menuitem").all()) {
    await expect(item).toHaveCSS("border-radius", "8px");
    expect((await item.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole("menuitem", { name: /delete/i }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".delete-goal-modal")).toHaveCSS("border-radius", "24px");
  await page.getByRole("button", { name: /cancel/i }).click();

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/dashboard");
  for (const chartControl of await page.locator(".chart-legend button").all()) {
    expect((await chartControl.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }

  await page.goto("/settings");
  const budgetTrigger = page.getByRole("button", { name: /rp 4\.000\.000/i });
  expect((await budgetTrigger.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await budgetTrigger.click();
  expect((await page.getByLabel("Monthly limit").boundingBox())?.height).toBeGreaterThanOrEqual(44);
  for (const budgetAction of ["Save", "Remove"]) {
    expect((await page.getByRole("button", { name: budgetAction, exact: true }).boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }

  const categoryMenu = page.getByRole("button", { name: /open groceries menu/i });
  expect((await categoryMenu.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await categoryMenu.click();
  for (const item of await page.getByRole("menuitem").all()) {
    expect((await item.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
});

test("loading, empty, and error product states remain explicit", async ({ browser, baseURL }) => {
  const loadingContext = await browser.newContext({ baseURL, serviceWorkers: "block" });
  const loadingPage = await loadingContext.newPage();
  await installDesignReviewFixtures(loadingPage, { delayTables: ["Transaction"] });
  await signInDesignReview(loadingPage);
  await expect(loadingPage.getByText("Loading dashboard...")).toBeVisible();
  await loadingContext.close();

  const emptyContext = await browser.newContext({ baseURL, serviceWorkers: "block" });
  const emptyPage = await emptyContext.newPage();
  await installDesignReviewFixtures(emptyPage, { empty: true });
  await signInDesignReview(emptyPage);
  await emptyPage.goto("/transactions");
  await expect(emptyPage.getByRole("heading", { name: /no transactions for this month/i })).toBeVisible();
  await emptyContext.close();

  const errorContext = await browser.newContext({ baseURL, serviceWorkers: "block" });
  const errorPage = await errorContext.newPage();
  await installDesignReviewFixtures(errorPage, { failTables: ["Transaction"] });
  await signInDesignReview(errorPage);
  await expect(errorPage.getByRole("alert")).toContainText(/could not load dashboard/i);
  await errorContext.close();
});
