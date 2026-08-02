import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SummaryPage } from "../src/features/summaries/SummaryPage";
import { BudgetStatusList } from "../src/features/summaries/BudgetStatusList";
import { CategoryChart } from "../src/features/summaries/CategoryChart";
import { HistoricalIncomeExpenseChart } from "../src/features/summaries/HistoricalIncomeExpenseChart";
import { authenticatedAuthState } from "./test-utils";

vi.mock("../src/app/authState", () => ({
  useAuth: () => authenticatedAuthState
}));

vi.mock("../src/lib/api/summaries", () => ({
  getMonthlySummary: vi.fn(async () => ({
    month: "2026-06",
    totals: {
      income: 18000000,
      expenses: 7250000,
      savings: 3200000,
      remainingDifference: 7550000,
      totalBudgetedExpenses: 8000000,
      budgetedActualExpenses: 7250000,
      remainingBudget: 750000,
      exceededBudget: 0
    },
    budgetStatuses: [
      {
        categoryId: "c1",
        categoryName: "Subscription",
        month: "2026-06",
        actualAmount: 281000,
        budgetAmount: 350000,
        remainingAmount: 69000,
        exceededAmount: 0,
        varianceAmount: 69000,
        status: "under_budget",
        transactionCount: 1,
        isBudgetInherited: false
      }
    ],
    spendingByCategory: [{ categoryId: "c1", label: "Subscription", amount: 281000, percentOfExpenses: 0.04, transactionCount: 1 }],
    spendingVsBudget: [{ categoryId: "c1", label: "Subscription", actualAmount: 281000, budgetAmount: 350000, status: "under_budget" }],
    incomeVsExpenses: { incomeAmount: 18000000, expenseAmount: 7250000, netAmount: 10750000 },
    insightStories: [],
    byCategory: [{ categoryId: "c1", categoryName: "Subscription", type: "expense", amount: 281000, transactionCount: 1 }],
    byMember: [{ userId: "user-1", displayName: "Okza", income: 18000000, expenses: 7250000, savings: 3200000 }],
    byScope: {
      household: { income: 0, expenses: 5000000, savings: 3200000 },
      member: { income: 18000000, expenses: 2250000, savings: 0 }
    }
  })),
  getIncomeExpenseHistory: vi.fn(async () => ({
    points: [{ month: "2026-06", incomeAmount: 18000000, expenseAmount: 7250000, netAmount: 10750000, hasRecords: true }]
  }))
}));

vi.mock("../src/lib/api/transactions", () => ({
  listTransactions: vi.fn(async () => ({ transactions: [] }))
}));

describe("OpenDesign dashboard conversion", () => {
  it("renders dashboard metrics, charts, budget health, and selected month control", async () => {
    render(<SummaryPage />);

    expect(await screen.findByRole("heading", { name: /june household overview/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Choose dashboard month")).toBeInTheDocument();
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    expect(screen.getByText("Net Savings")).toBeInTheDocument();
    expect(screen.queryByText("Remaining")).not.toBeInTheDocument();
    expect(screen.queryByText("Budgeted expenses")).not.toBeInTheDocument();
    expect(screen.getByText("Monthly spending by category")).toBeInTheDocument();
    expect(screen.getByText("Budget Health")).toBeInTheDocument();
    expect(screen.getByText("Cash Flow Trend")).toBeInTheDocument();
    expect(screen.getByLabelText("Trend legend")).toBeInTheDocument();
    expect(screen.queryByText("Monthly stories")).not.toBeInTheDocument();
    expect(screen.queryByText("Spending vs budget")).not.toBeInTheDocument();
    expect(screen.queryByText("Category transactions")).not.toBeInTheDocument();
    expect(screen.queryByText("Members")).not.toBeInTheDocument();
    expect(screen.getAllByText("Subscription").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /subscription, .*4%/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /jun: income/i })).toHaveClass("trend-hotspot");
  });

  it("keeps chart legend and budget rows interactive with OpenDesign accessible labels", async () => {
    const onSelectCategory = vi.fn();
    const summary = {
      month: "2026-06",
      totals: {
        income: 18000000,
        expenses: 7250000,
        savings: 3200000,
        remainingDifference: 7550000,
        totalBudgetedExpenses: 8000000,
        budgetedActualExpenses: 7250000,
        remainingBudget: 750000,
        exceededBudget: 0
      },
      budgetStatuses: [],
      spendingByCategory: [{ categoryId: "c1", label: "Subscription", amount: 281000, percentOfExpenses: 0.04, transactionCount: 1 }],
      spendingVsBudget: [],
      incomeVsExpenses: { incomeAmount: 18000000, expenseAmount: 7250000, netAmount: 10750000 },
      insightStories: [],
      byCategory: [],
      byMember: [],
      byScope: {
        household: { income: 0, expenses: 0, savings: 0 },
        member: { income: 0, expenses: 0, savings: 0 }
      }
    };

    const { container } = render(<CategoryChart summary={summary} onSelectCategory={onSelectCategory} />);
    expect(container.querySelector(".pie-svg")).toBeInTheDocument();
    expect(container.querySelector(".pie-slice.slice-primary")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /subscription/i }));
    expect(onSelectCategory).toHaveBeenCalledWith("c1");

    render(
      <BudgetStatusList
        statuses={[
          {
            categoryId: "c1",
            categoryName: "Subscription",
            month: "2026-06",
            actualAmount: 281000,
            budgetAmount: 350000,
            remainingAmount: 69000,
            exceededAmount: 0,
            varianceAmount: 69000,
            status: "under_budget",
            transactionCount: 1,
            isBudgetInherited: false
          }
        ]}
        onSelectCategory={onSelectCategory}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /actual .*budget .*80%/i }));
    expect(onSelectCategory).toHaveBeenCalledWith("c1");
  });

  it("renders source-style trend hotspots and month labels from historical data", () => {
    render(
      <HistoricalIncomeExpenseChart
        data={[
          { month: "2026-05", incomeAmount: 15000000, expenseAmount: 8000000, netAmount: 7000000, hasRecords: true },
          { month: "2026-06", incomeAmount: 18000000, expenseAmount: 7250000, savingsAmount: 3200000, netAmount: 10750000, hasRecords: true }
        ]}
      />
    );

    expect(screen.getByRole("button", { name: /may: income/i })).toHaveClass("trend-hotspot");
    expect(screen.getByRole("button", { name: /jun: income/i })).toHaveClass("trend-hotspot");
    expect(screen.getByRole("button", { name: /jun: income/i })).toHaveAttribute("data-trend-tip", expect.stringContaining("Income"));
    expect(screen.getByText("May")).toBeInTheDocument();
    expect(screen.getByText("Jun")).toBeInTheDocument();
  });

  it("computes source-style pie percentages when the API point has no percentage", () => {
    const summary = {
      month: "2026-06",
      totals: { income: 0, expenses: 1000000, savings: 0, remainingDifference: -1000000 },
      budgetStatuses: [],
      spendingByCategory: [
        { categoryId: "c1", label: "Groceries", amount: 750000, percentOfExpenses: 0, transactionCount: 3 },
        { categoryId: "c2", label: "Transport", amount: 250000, percentOfExpenses: 0, transactionCount: 2 }
      ],
      spendingVsBudget: [],
      incomeVsExpenses: { incomeAmount: 0, expenseAmount: 1000000, netAmount: -1000000 },
      insightStories: [],
      byCategory: [],
      byMember: [],
      byScope: {
        household: { income: 0, expenses: 0, savings: 0 },
        member: { income: 0, expenses: 0, savings: 0 }
      }
    };

    render(<CategoryChart summary={summary} onSelectCategory={() => undefined} />);

    expect(screen.getByRole("button", { name: /groceries, .*75%/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /transport, .*25%/i })).toBeInTheDocument();
  });
});
