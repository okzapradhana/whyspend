import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryChart } from "../src/features/summaries/CategoryChart";
import { IncomeExpenseSummary } from "../src/features/summaries/IncomeExpenseSummary";
import type { MonthlySummary } from "../src/lib/api/types";

const summary: MonthlySummary = {
  month: "2026-06",
  totals: { income: 1000000, expenses: 300000, savings: 0, remainingDifference: 700000 },
  spendingByCategory: [{ categoryId: "c1", label: "Food", amount: 300000, percentOfExpenses: 100, transactionCount: 2 }],
  byCategory: [],
  byMember: [],
  byScope: { household: { income: 0, expenses: 0, savings: 0 }, member: { income: 0, expenses: 0, savings: 0 } }
};

describe("summary selected-month charts", () => {
  it("shows spending pie labels and income-vs-expense values", () => {
    render(
      <>
        <CategoryChart summary={summary} onSelectCategory={() => undefined} />
        <IncomeExpenseSummary data={{ incomeAmount: 1000000, expenseAmount: 300000, netAmount: 700000 }} />
      </>
    );
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText(/1.000.000/)).toBeInTheDocument();
    expect(screen.getByText(/700.000/)).toBeInTheDocument();
  });
});
