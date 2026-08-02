import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BudgetOverview } from "../src/features/summaries/BudgetOverview";
import { BudgetStatusList } from "../src/features/summaries/BudgetStatusList";
import { SpendingVsBudgetChart } from "../src/features/summaries/SpendingVsBudgetChart";
import type { MonthlySummary } from "../src/lib/api/types";

const summary = {
  month: "2026-06",
  totals: {
    income: 0,
    expenses: 250000,
    savings: 0,
    remainingDifference: -250000,
    totalBudgetedExpenses: 200000,
    budgetedActualExpenses: 250000,
    remainingBudget: 0,
    exceededBudget: 50000
  },
  byCategory: [],
  byMember: [],
  byScope: { household: { income: 0, expenses: 0, savings: 0 }, member: { income: 0, expenses: 0, savings: 0 } }
} satisfies MonthlySummary;

describe("summary budget UI", () => {
  it("shows budget overview, status, and spending-vs-budget labels", async () => {
    const onSelect = vi.fn();
    render(
      <>
        <BudgetOverview summary={summary} />
        <BudgetStatusList
          statuses={[{ categoryId: "c1", categoryName: "Food", month: "2026-06", actualAmount: 250000, budgetAmount: 200000, remainingAmount: 0, exceededAmount: 50000, varianceAmount: -50000, status: "over_budget", transactionCount: 1, isBudgetInherited: false }]}
          onSelectCategory={onSelect}
        />
        <SpendingVsBudgetChart data={[{ categoryId: "c1", label: "Food", actualAmount: 250000, budgetAmount: 200000, status: "over_budget" }]} />
      </>
    );

    expect(screen.getByText(/exceeded budget/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /food/i }));
    expect(onSelect).toHaveBeenCalledWith("c1");
    expect(screen.getAllByText(/250.000/).length).toBeGreaterThan(0);
  });
});
