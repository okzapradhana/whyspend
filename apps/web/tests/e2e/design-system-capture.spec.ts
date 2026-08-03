import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { installDesignReviewFixtures, openPasswordRecoveryReview, signInDesignReview } from "./design-review-fixtures";

const phase = process.env.CAPTURE_PHASE;
const outputRoot = resolve(process.cwd(), "../../docs/screenshots/design-system-redesign", phase ?? "unknown");
const viewports = [{ width: 1440, height: 1000 }, { width: 390, height: 844 }] as const;

async function capture(page: Page, name: string, width: number, height: number) {
  await page.setViewportSize({ width, height });
  if (phase === "before") {
    await page.addStyleTag({ content: "html, body { overflow-x: clip !important; }" });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const overflowElements = overflow > 1 ? await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
    .map((element) => ({ selector: element.className || element.tagName, left: Math.round(element.getBoundingClientRect().left), right: Math.round(element.getBoundingClientRect().right), width: Math.round(element.getBoundingClientRect().width) }))
    .filter((box) => box.right > window.innerWidth + 1)
    .slice(0, 12)) : [];
  expect(overflow, `${name} must not overflow horizontally at ${width}px; offenders: ${JSON.stringify(overflowElements)}`).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: resolve(outputRoot, `${name}-${width}x${height}.png`),
    animations: "disabled",
    fullPage: false
  });
}

async function captureRoute(page: Page, name: string, route: string, heading: RegExp) {
  await page.goto(route);
  await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  for (const viewport of viewports) await capture(page, name, viewport.width, viewport.height);
}

test.beforeEach(async () => {
  test.skip(phase !== "before" && phase !== "after", "Set CAPTURE_PHASE=before or CAPTURE_PHASE=after");
  await mkdir(outputRoot, { recursive: true });
});

test("captures public and authentication routes with deterministic content", async ({ page }) => {
  await installDesignReviewFixtures(page);
  await captureRoute(page, "auth-login", "/auth", /welcome back/i);

  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /create account/i })).toBeVisible();
  for (const viewport of viewports) await capture(page, "auth-signup", viewport.width, viewport.height);

  await page.goto("/auth");
  await page.getByRole("button", { name: /forgot password/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /reset your password/i })).toBeVisible();
  for (const viewport of viewports) await capture(page, "auth-recovery-request", viewport.width, viewport.height);

  await openPasswordRecoveryReview(page);
  await expect(page.getByRole("heading", { level: 1, name: /set a new password/i })).toBeVisible();
  for (const viewport of viewports) await capture(page, "auth-update-password", viewport.width, viewport.height);

  await captureRoute(page, "privacy", "/privacy", /privacy policy/i);
  await captureRoute(page, "terms", "/terms", /terms of service/i);
  await captureRoute(page, "invite", "/invite/design-review-token", /join a shared whyspend household/i);
});

test("captures household setup without creating remote data", async ({ page }) => {
  await installDesignReviewFixtures(page, { household: false });
  await signInDesignReview(page);
  await expect(page).toHaveURL(/\/household-setup$/);
  await expect(page.getByText("Design review")).toBeVisible();
  for (const viewport of viewports) await capture(page, "household-setup", viewport.width, viewport.height);
});

test("captures every authenticated routed screen and representative overlays", async ({ page }) => {
  await installDesignReviewFixtures(page);
  await signInDesignReview(page);

  for (const [name, route, heading] of [
    ["dashboard", "/dashboard", /household overview/i],
    ["transactions", "/transactions", /^transactions$/i],
    ["savings-goals", "/savings-goals", /savings goals/i],
    ["settings", "/settings", /^settings$/i],
    ["support", "/support", /household support/i]
  ] as const) {
    await captureRoute(page, name, route, heading);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /design review/i }).click();
  await expect(page.getByRole("menuitem", { name: /sign out/i })).toBeVisible();
  await capture(page, "account-menu", 1440, 1000);

  await page.goto("/transactions");
  await page.getByRole("button", { name: /add transaction/i }).first().click();
  await expect(page.getByRole("dialog", { name: /add (transaction|expense)/i })).toBeVisible();
  await capture(page, "transaction-dialog", 1440, 1000);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /menu/i }).click();
  await expect(page.getByRole("link", { name: /transactions/i }).first()).toBeVisible();
  await capture(page, "mobile-drawer", 390, 844);

  await page.goto("/savings-goals");
  await page.getByRole("button", { name: /add new goal/i }).click();
  await expect(page.getByRole("dialog", { name: /add new goal/i })).toBeVisible();
  await capture(page, "savings-dialog", 390, 844);
});
