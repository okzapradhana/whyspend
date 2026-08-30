import { test, expect } from "@playwright/test";
import { installDesignReviewFixtures, signInDesignReview, REVIEW_HOUSEHOLD } from "./design-review-fixtures";

test("household spouse transaction renders without TypeError and shows displayName", async ({ page, request }) => {
  // Strict ownership check: ensure the server on baseURL is the fixed worktree, not a stale checkout
  const marker = await request.get("/__worktree_marker.json");
  expect(marker.ok(), `Worktree marker missing: another checkout may own ${test.info().project.baseURL} — kill stale vite on 5174 and restart fixed worktree with --strictPort`).toBeTruthy();
  const markerJson = await marker.json();
  expect(markerJson.marker).toBe("fixed-household-transactions-2026-08-29");
  expect(markerJson.issue).toBe(4);
  const state = await installDesignReviewFixtures(page);

  // Inject a spouse-owned transaction that would previously have owner: null due to User RLS
  state.transactions.unshift({
    id: "tx-spouse",
    householdId: REVIEW_HOUSEHOLD.id,
    ownerUserId: "spouse-user",
    categoryId: "category-expense",
    type: "expense",
    amount: 850000,
    occurredOn: "2026-08-08T00:00:00.000Z",
    month: "2026-08",
    scope: "household",
    note: "Groceries spouse",
    createdAt: "2026-08-08T00:00:00.000Z",
    // Simulate pre-fix RLS shape: owner null (User row not visible) but household_member_identity will resolve it
    owner: null as any,
    category: { id: "category-expense", name: "Groceries", type: "expense" as const }
  } as any);

  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await signInDesignReview(page);
  await page.goto("/transactions");
  await expect(page.getByRole("heading", { level: 1, name: "Transactions" })).toBeVisible();

  // Loading should finish
  await expect(page.getByText("Loading transactions")).not.toBeVisible({ timeout: 10000 });

  // Transaction list surface is visible
  await expect(page.locator("[data-od-id='transaction-list']")).toBeVisible();

  // No uncaught displayName null dereference
  expect(pageErrors.join("\n")).not.toContain("displayName");
  expect(pageErrors.join("\n")).not.toContain("Cannot read properties of null");

  // Spouse-owned row must show real displayName via household_member_identity projection (not silent Member fallback)
  await expect(page.getByText("Ajeng").first()).toBeVisible({ timeout: 8000 });

  // Search by spouse name should be safe and not throw — verify real page contract (input + filter)
  // Input component renders label wrapping input; use placeholder as most reliable selector across refactors
  const searchInput = page.getByPlaceholder("Category, owner, or note");
  await expect(searchInput).toBeVisible();
  await searchInput.fill("Ajeng");
  // After filtering, spouse row must still be visible, and list must not crash
  await expect(page.locator("[data-od-id='transaction-list']")).toBeVisible();
  await expect(page.getByText("Ajeng").first()).toBeVisible();

  // Clear search and verify list still visible with both household members
  await searchInput.fill("");
  await expect(page.locator("[data-od-id='transaction-list']")).toBeVisible();
  await expect(page.getByText("Ajeng").first()).toBeVisible();
  await expect(page.getByText("Design review").first()).toBeVisible();

  // Verify category and amount still render (real page contract)
  await expect(page.getByText(/Groceries/).first()).toBeVisible();
  await expect(page.getByText(/850[.,]000/).first()).toBeVisible();
});
