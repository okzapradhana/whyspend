import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsPage } from "../src/features/settings/SettingsPage";
import { authenticatedAuthState } from "./test-utils";

vi.mock("../src/app/authState", () => ({
  useAuth: () => authenticatedAuthState
}));

vi.mock("../src/lib/api/budgets", () => ({
  listCategoryBudgets: vi.fn(async () => ({
    month: "2026-06",
    budgets: [],
    budgetableCategories: [
      {
        categoryId: "expense-1",
        categoryName: "Subscription",
        isArchived: false,
        budget: { id: "budget-1", amount: 350000, source: "explicit" }
      }
    ]
  })),
  saveCategoryBudget: vi.fn(async () => ({})),
  deleteCategoryBudget: vi.fn(async () => ({}))
}));

vi.mock("../src/lib/api/categories", () => ({
  listCategories: vi.fn(async () => ({
    categories: [
      { id: "expense-1", name: "Subscription", type: "expense", scope: "member", isArchived: false },
      { id: "income-1", name: "Other Income", type: "income", scope: "household", isArchived: false },
      { id: "savings-1", name: "Emas", type: "savings", scope: "both", isArchived: false }
    ]
  })),
  createCategory: vi.fn(async () => ({ id: "new", name: "New", type: "expense", scope: "both", isArchived: false })),
  updateCategory: vi.fn(async () => ({})),
  deleteCategory: vi.fn(async () => ({}))
}));

vi.mock("../src/lib/api/households", () => ({
  getHousehold: vi.fn(async () => ({
    id: "household-1",
    name: "Home",
    role: "owner",
    members: [],
    invitations: [{
      id: "invite-1",
      householdId: "household-1",
      email: "spouse@example.com",
      token: "invite-token-123456",
      status: "pending",
      invitedByUserId: "user-1",
      acceptedByUserId: null,
      expiresAt: "2026-08-09T00:00:00.000Z",
      acceptedAt: null,
      createdAt: "2026-08-02T00:00:00.000Z",
      updatedAt: "2026-08-02T00:00:00.000Z",
      inviteUrl: "http://localhost:5173/invite/invite-token-123456"
    }]
  })),
  createHouseholdInvitation: vi.fn(async () => ({
    id: "invite-1",
    householdId: "household-1",
    email: "spouse@example.com",
    token: "invite-token-123456",
    status: "pending",
    invitedByUserId: "user-1",
    acceptedByUserId: null,
    expiresAt: "2026-08-09T00:00:00.000Z",
    acceptedAt: null,
    createdAt: "2026-08-02T00:00:00.000Z",
    updatedAt: "2026-08-02T00:00:00.000Z",
    inviteUrl: "http://localhost:5173/invite/invite-token-123456"
  }))
}));

describe("OpenDesign Settings conversion", () => {
  it("uses the compact category table and opens category editing contextually", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Categories and budgets" })).toBeInTheDocument();
    expect((await screen.findAllByText("Subscription")).length).toBeGreaterThan(0);
    expect(screen.getByText("Other Income")).toBeInTheDocument();
    expect(screen.getByText("Emas")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Household access" })).toBeInTheDocument();
    expect(screen.getByLabelText("Invitation link")).toHaveValue("http://localhost:5173/invite/invite-token-123456");
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add category" }));

    expect(screen.getByRole("dialog", { name: "Add category" })).toBeInTheDocument();
    expect(screen.getByLabelText("Category name")).toBeInTheDocument();
  });

  it("keeps a pending invitation link copyable after the invitation is created", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    render(<SettingsPage />);

    await user.click(await screen.findByRole("button", { name: "Copy link" }));

    expect(writeText).toHaveBeenCalledWith("http://localhost:5173/invite/invite-token-123456");
    expect(await screen.findByText("Invitation link copied to clipboard.")).toBeInTheDocument();
  });
});
