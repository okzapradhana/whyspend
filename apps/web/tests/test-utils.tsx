import { render, screen, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import type { BudgetableCategory, Category, Household, Transaction, User } from "../src/lib/api/types";

export const testUser: User = {
  id: "user-1",
  displayName: "Okza",
  email: "okza@example.com"
};

export const testHousehold: Household = {
  id: "household-1",
  name: "Home",
  role: "owner",
  members: [{ userId: testUser.id, displayName: testUser.displayName, role: "owner" }]
};

export const authenticatedAuthState = {
  user: testUser,
  households: [testHousehold],
  activeHousehold: testHousehold,
  loading: false,
  setSession: async () => undefined,
  refresh: async () => undefined,
  signOut: () => undefined
};

export const openDesignClassGroups = {
  shell: ["drawer-backdrop", "mobile-bar", "app-shell", "sidebar", "brand", "nav-group", "nav-item", "screen", "content", "top-actions", "account-pill"],
  dashboard: ["page-head", "summary-metrics", "metric-railed", "dashboard-charts", "pie-chart", "legend-only", "budget-bar", "bar-track", "line-chart"],
  transactions: ["transaction-controls", "filter-row", "filter-menu", "transaction-list", "data-table", "fab-button", "transaction-dialog", "transaction-toggle", "modal-action"],
  settings: [
    "settings-head",
    "settings-content",
    "grid-main",
    "unified-category-card",
    "settings-category-table",
    "settings-access-card",
    "settings-category-dialog"
  ],
  savingsGoals: ["savings-head", "savings-summary", "goal-grid", "goal-card", "goal-card-menu", "goal-modal", "delete-goal-modal"],
  auth: ["auth-page", "auth-shell", "auth-brand", "auth-card", "auth-form", "auth-field", "auth-input-wrap", "auth-status", "auth-submit"]
};

export function expectOpenDesignClasses(root: ParentNode, classes: string[]) {
  for (const className of classes) {
    expect(root.querySelector(`.${className}`)).not.toBeNull();
  }
}

export function expectVisibleOpenDesignClass(className: string) {
  expect(screen.getByText((_content, node) => Boolean(node?.closest(`.${className}`)))).toBeTruthy();
}

export const realisticCategories: Category[] = [
  { id: "cat-income", name: "Monthly salary", type: "income", scope: "both", isArchived: false },
  { id: "cat-groceries", name: "Groceries and household supplies", type: "expense", scope: "both", isArchived: false },
  { id: "cat-goal", name: "Cicilan Tanah", type: "savings", scope: "both", isArchived: false }
];

export const realisticBudgetableCategories: BudgetableCategory[] = [
  {
    categoryId: "cat-groceries",
    categoryName: "Groceries and household supplies",
    isArchived: false,
    budget: { id: "budget-groceries", amount: 12500000, source: "explicit" }
  }
];

export const realisticTransactions: Transaction[] = [
  {
    id: "tx-high",
    householdId: testHousehold.id,
    ownerUserId: testUser.id,
    categoryId: "cat-groceries",
    type: "expense",
    amount: 987654321,
    occurredOn: "2026-06-06",
    month: "2026-06",
    scope: "household",
    note: "Long note for household supplies and shared budget review",
    category: { id: realisticCategories[1].id, name: realisticCategories[1].name, type: realisticCategories[1].type },
    owner: { userId: testUser.id, displayName: testUser.displayName }
  }
];

export function renderWithRouter(ui: ReactElement, options: RenderOptions & { route?: string } = {}) {
  const { route = "/", ...renderOptions } = options;
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>, renderOptions);
}
