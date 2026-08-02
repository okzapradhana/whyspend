import { test, expect } from "@playwright/test";

test("debug budget bars round 2", async ({ page }) => {
  await page.goto("http://127.0.0.1:5175/");
  await page.setViewportSize({ width: 1440, height: 1200 });

  await page.locator("input[name='email']").fill("demo@whyspend.local");
  await page.locator("input[name='password']").fill("password123");
  await page.locator("form button[type='submit']").click();

  await page.waitForURL("**/dashboard");
  await page.waitForSelector("[data-od-id='summary-metrics']");
  await page.waitForTimeout(1000);

  const firstRow = page.locator(".budget-status-row").first();
  const html = await firstRow.innerHTML();
  console.log("DOM HTML of first row:\n", html);

  const rowStyles = await firstRow.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      display: styles.display,
      flexDirection: styles.flexDirection,
      alignItems: styles.alignItems,
      height: styles.height,
      width: styles.width,
    };
  });
  console.log("Row styles:\n", JSON.stringify(rowStyles, null, 2));

  const barTrack = firstRow.locator(".bar-track");
  const computedStyles = await barTrack.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      display: styles.display,
      height: styles.height,
      width: styles.width,
      backgroundColor: styles.backgroundColor,
      opacity: styles.opacity,
      visibility: styles.visibility,
    };
  });
  console.log("Computed styles of .bar-track:\n", JSON.stringify(computedStyles, null, 2));
});
