import { expect, test } from "@playwright/test";

test("household expense tracker smoke path", async ({ page }) => {
  const email = `owner-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  await page.goto("/");
  await expect(page).toHaveTitle(/WhySpend/);
  await page.getByRole("button", { name: /create account/i }).click();
  await page.getByLabel(/display name/i).fill("Okza");
  await page.getByLabel(/email/i).fill(email);
  await page.locator("input[name='password']").fill("password123");
  await page.locator("form button[type='submit']").click();

  await expect(page.getByRole("heading", { name: /create your household workspace/i })).toBeVisible();
  await page.getByLabel("Household name").fill("Home");
  await page.getByRole("button", { name: /create household/i }).click();

  await expect(page.getByRole("heading", { name: /household overview/i })).toBeVisible();
  await page.getByRole("link", { name: /settings/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
  await page.getByRole("button", { name: /add category/i }).click();
  const categoryDialog = page.getByRole("dialog", { name: /add category/i });
  await categoryDialog.getByLabel(/category name/i).fill("Subscription");
  await categoryDialog.getByRole("button", { name: /add category/i }).click();

  await page.getByRole("link", { name: /transactions/i }).click();
  await expect(page.getByRole("heading", { name: /record the month/i })).toBeVisible();

  await page.getByRole("button", { name: /add transaction/i }).click();
  await expect(page.getByRole("dialog", { name: /add expense/i })).toBeVisible();
  await page.getByLabel("Amount").fill("281000");
  await page.getByLabel("Category").selectOption({ label: "Subscription" });
  await page.getByLabel(/note/i).fill("Monthly subscription");
  await page.getByRole("button", { name: /^add$/i }).click();

  await expect(page.getByRole("cell", { name: "Subscription", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /dashboard/i }).click();
  await expect(page.getByRole("heading", { name: /household overview/i })).toBeVisible();
  await expect(page.locator(".chart-legend").getByText("Subscription")).toBeVisible();
  await expect(page.getByRole("heading", { name: /budget health/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /cash flow trend/i })).toBeVisible();
});
