import { expect, test } from "@playwright/test";

test("desktop viewport can load app shell", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page).toHaveTitle(/WhySpend/);
});
