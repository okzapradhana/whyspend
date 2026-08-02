import { expect, test, type Page } from "@playwright/test";
import { pathToFileURL } from "node:url";

const openDesignRoot =
  "/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0";

const threshold = {
  maxDiffPixelRatio: 0.25
};

const strictThreshold = {
  maxDiffPixelRatio: 0.02
};

async function createAccountAndHousehold(page: Page) {
  const email = `visual-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  await page.goto("/");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.getByLabel(/display name/i).fill("Okza");
  await page.getByLabel(/email/i).fill(email);
  await page.locator("input[name='password']").fill("password123");
  await page.locator("form button[type='submit']").click();
  await page.getByLabel("Household name").fill("Home");
  await page.getByRole("button", { name: /create household/i }).click();
}

async function captureReference(page: Page, relativePath: string) {
  await page.goto(pathToFileURL(`${openDesignRoot}/${relativePath}`).toString());
  await page.setViewportSize({ width: 1440, height: 1000 });
  return page.screenshot({ fullPage: false });
}

async function expectRouteCloseToReference(page: Page, route: string, referencePath: string, name: string, options = threshold) {
  const reference = await captureReference(page, referencePath);
  await page.goto(route);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page).toHaveScreenshot(`${name}.png`, {
    ...options,
    animations: "disabled",
    fullPage: false,
    mask: [page.locator("input[type='month']"), page.locator("input[type='date']")]
  });
  test.info().attach(`${name}-reference.png`, { body: reference, contentType: "image/png" });
}

test("auth route remains close to OpenDesign login and signup references", async ({ page }) => {
  await expectRouteCloseToReference(page, "/auth", "screens/login.html", "auth-login-opendesign");
  await page.goto("/auth");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveScreenshot("auth-signup-opendesign.png", {
    ...threshold,
    animations: "disabled",
    fullPage: false
  });
});

test("authenticated routes have OpenDesign screenshot comparison coverage", async ({ page }) => {
  await createAccountAndHousehold(page);
  await expectRouteCloseToReference(page, "/dashboard", "screens/dashboard.html", "dashboard-opendesign");
  await expectRouteCloseToReference(page, "/transactions", "screens/transactions.html", "transactions-opendesign");
  await expectRouteCloseToReference(page, "/settings", "screens/settings.html", "settings-opendesign");
  await expectRouteCloseToReference(page, "/savings-goals", "screens/savings-goals.html", "savings-goals-opendesign", strictThreshold);
});
