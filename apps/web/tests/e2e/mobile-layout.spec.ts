import { expect, test } from "@playwright/test";

test("mobile viewport can load app shell", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page).toHaveTitle(/WhySpend/);
});
