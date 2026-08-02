import { expect, test, type Page } from "@playwright/test";

async function createAccountAndHousehold(page: Page) {
  const email = `fab-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  await page.goto("/");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.getByLabel(/display name/i).fill("Okza");
  await page.getByLabel(/email/i).fill(email);
  await page.locator("input[name='password']").fill("password123");
  await page.locator("form button[type='submit']").click();
  await page.getByLabel("Household name").fill("Home");
  await page.getByRole("button", { name: /create household/i }).click();
}

async function expectFabFloats(page: Page) {
  await page.goto("/transactions");
  const fab = page.getByRole("button", { name: /add transaction/i });
  await expect(fab).toBeVisible();

  await expect(fab).toHaveCSS("position", "fixed");
  await expect(fab).toHaveCSS("width", "64px");
  await expect(fab).toHaveCSS("height", "64px");

  await page.evaluate(() => {
    const pageElement = document.querySelector<HTMLElement>(".transactions-page");
    if (pageElement) {
      pageElement.style.minHeight = "1800px";
    }
  });

  const before = await fab.boundingBox();
  expect(before).not.toBeNull();

  await page.mouse.wheel(0, 900);
  await page.waitForFunction(() => window.scrollY > 0);

  const after = await fab.boundingBox();
  expect(after).not.toBeNull();

  expect(Math.abs(after!.x - before!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(1);
  expect(after!.x + after!.width).toBeGreaterThan(page.viewportSize()!.width - 80);
  expect(after!.y + after!.height).toBeGreaterThan(page.viewportSize()!.height - 80);
}

test("transaction add button stays floating while scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await createAccountAndHousehold(page);
  await expectFabFloats(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expectFabFloats(page);
});
