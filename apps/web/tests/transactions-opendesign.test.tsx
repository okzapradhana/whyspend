import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TransactionsPage } from "../src/features/transactions/TransactionsPage";
import { authenticatedAuthState } from "./test-utils";

vi.mock("../src/app/authState", () => ({
  useAuth: () => authenticatedAuthState
}));

vi.mock("../src/lib/api/transactions", () => ({
  listTransactions: vi.fn(async () => ({
    transactions: [
      {
        id: "t1",
        householdId: "household-1",
        ownerUserId: "user-1",
        categoryId: "c1",
        type: "expense",
        amount: 281000,
        occurredOn: "2026-06-05",
        month: "2026-06",
        scope: "member",
        note: "Monthly subscription",
        owner: { userId: "user-1", displayName: "Okza" },
        category: { id: "c1", name: "Subscription", type: "expense" }
      }
    ]
  })),
  createTransaction: vi.fn(async () => ({})),
  updateTransaction: vi.fn(async () => ({})),
  deleteTransaction: vi.fn(async () => ({}))
}));

vi.mock("../src/lib/api/categories", () => ({
  listCategories: vi.fn(async (_householdId: string, params?: { type?: string }) => ({
    categories: [{ id: "c1", name: params?.type === "savings" ? "Emas" : "Subscription", type: params?.type ?? "expense", scope: "both", isArchived: false }]
  }))
}));

describe("OpenDesign transactions conversion", () => {
  it("renders month, search, type filters, ledger rows, and source-style add dialog", async () => {
    render(<TransactionsPage />);

    expect(await screen.findByRole("heading", { level: 1, name: "Transactions" })).toBeInTheDocument();
    expect(screen.getByText("Review a month, filter quickly, and use one familiar form for expenses, income, and savings.")).toBeInTheDocument();
    expect(screen.getByLabelText("Choose transaction month")).toBeInTheDocument();
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByLabelText("Transaction type filters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expense" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByLabelText("Monthly transaction totals")).not.toBeInTheDocument();
    expect((await screen.findAllByText("Subscription")).length).toBeGreaterThan(0);

    const addTransactionButton = screen.getByRole("button", { name: /add transaction/i });
    expect(addTransactionButton).toHaveClass("button-icon");
    await userEvent.click(addTransactionButton);
    const dialog = screen.getByRole("dialog", { name: /add expense/i });
    expect(dialog).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Savings" }));
    expect(await screen.findByLabelText("Goal")).toBeInTheDocument();
    expect(screen.queryByLabelText("New goal")).not.toBeInTheDocument();
  }, 10_000);
});
