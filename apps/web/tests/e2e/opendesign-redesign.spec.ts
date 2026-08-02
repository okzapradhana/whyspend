import { expect, test, type Page } from "@playwright/test";

export const OPENDESIGN_ROOT =
  "/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0";

export const referenceScreens = {
  dashboard: `${OPENDESIGN_ROOT}/screens/dashboard.html`,
  transactions: `${OPENDESIGN_ROOT}/screens/transactions.html`,
  settings: `${OPENDESIGN_ROOT}/screens/settings.html`,
  savingsGoals: `${OPENDESIGN_ROOT}/screens/savings-goals.html`,
  login: `${OPENDESIGN_ROOT}/screens/login.html`,
  signup: `${OPENDESIGN_ROOT}/screens/signup.html`
};

export async function setDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
}

export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
}

export async function captureTiming<T>(label: string, action: () => Promise<T>) {
  const startedAt = performance.now();
  const result = await action();
  test.info().annotations.push({ type: "timing", description: `${label}: ${Math.round(performance.now() - startedAt)}ms` });
  return result;
}

async function createAccountAndHousehold(page: Page) {
  const email = `opendesign-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  await page.goto("/");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.getByLabel(/display name/i).fill("Okza");
  await page.getByLabel(/email/i).fill(email);
  await page.locator("input[name='password']").fill("password123");
  await page.locator("form button[type='submit']").click();
  await page.getByLabel("Household name").fill("Home");
  await page.getByRole("button", { name: /create household/i }).click();
}

test("desktop and mobile shell expose OpenDesign route vocabulary", async ({ page }) => {
  await setDesktopViewport(page);
  await createAccountAndHousehold(page);

  await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /transactions/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /savings goals/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /settings/i })).toBeVisible();
  await expect(page.getByTestId("desktop-shell").getByRole("link", { name: /support/i })).toBeHidden();
  await page.getByRole("button", { name: /okza/i }).click();
  await expect(page.getByRole("menuitem", { name: /sign out/i })).toBeVisible();

  await setMobileViewport(page);
  await page.reload();
  await page.getByRole("button", { name: /menu/i }).click();
  await expect(page.getByRole("link", { name: /dashboard/i }).first()).toBeVisible();
});

test("auth screens render login and signup layouts on desktop and mobile", async ({ page }) => {
  await setDesktopViewport(page);
  await page.goto("/auth");
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await expect(page.getByLabel(/e-mail/i)).toBeVisible();
  await expect(page.locator("input[name='password']")).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: /show password/i }).click();
  await expect(page.locator("input[name='password']")).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page.getByLabel(/display name/i)).toBeVisible();

  await setMobileViewport(page);
  await page.reload();
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
});

test("captures navigation timing evidence for the 10-second target", async ({ page }) => {
  await setDesktopViewport(page);
  await createAccountAndHousehold(page);

  await captureTiming("dashboard-to-transactions", async () => {
    await page.getByRole("link", { name: /transactions/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Transactions" })).toBeVisible();
  });

  await captureTiming("transactions-to-savings-goals", async () => {
    await page.getByRole("link", { name: /savings goals/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Savings Goals" })).toBeVisible();
  });
});

test("monthly workflow covers dashboard, transaction entry, Settings budget update, and savings goal review", async ({ page }) => {
  await setDesktopViewport(page);
  await createAccountAndHousehold(page);

  await captureTiming("monthly-workflow", async () => {
    await expect(page.getByRole("heading", { name: /household overview/i })).toBeVisible();

    await page.getByRole("link", { name: /settings/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    await page.getByRole("button", { name: /add category/i }).click();
    const categoryDialog = page.getByRole("dialog", { name: /add category/i });
    await categoryDialog.getByLabel(/category name/i).fill("Subscription");
    await categoryDialog.getByRole("button", { name: /add category/i }).click();
    await expect(page.getByRole("table", { name: /categories and monthly budgets/i })).toBeVisible();

    await page.getByRole("link", { name: /transactions/i }).click();
    await page.getByRole("button", { name: /add transaction/i }).click();
    await expect(page.getByRole("dialog", { name: /add expense/i })).toBeVisible();
    await page.getByLabel("Amount").fill("281000");
    await page.getByLabel("Category").selectOption({ label: "Subscription" });
    await page.getByLabel(/note/i).fill("Monthly subscription");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByRole("cell", { name: "Subscription", exact: true })).toBeVisible();

    await page.getByRole("link", { name: /settings/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    await expect(page.getByRole("table", { name: /categories and monthly budgets/i })).toBeVisible();

    await page.getByRole("link", { name: /savings goals/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Savings Goals" })).toBeVisible();
    await expect(page.getByText("Total Savings Progress")).toBeVisible();
  });
});

test("mobile keyboard, focus, reduced-motion, and overflow checks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await setMobileViewport(page);
  await createAccountAndHousehold(page);

  const menu = page.getByRole("button", { name: /menu/i });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: /dashboard/i }).first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();

  await menu.click();
  await page.getByRole("link", { name: /savings goals/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Savings Goals" })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("PWA shell assets remain available after the OpenDesign conversion", async ({ page, request }) => {
  await page.goto("/");

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBe("/manifest.webmanifest");

  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  await expect(manifestResponse.json()).resolves.toMatchObject({
    name: "WhySpend",
    display: "standalone"
  });

  const serviceWorkerResponse = await request.get("/service-worker.js");
  expect(serviceWorkerResponse.ok()).toBe(true);
});
