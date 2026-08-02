import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HistoricalIncomeExpenseChart } from "../src/features/summaries/HistoricalIncomeExpenseChart";

describe("summary history UI", () => {
  it("shows historical labels for missing and populated months", () => {
    render(
      <HistoricalIncomeExpenseChart
        data={[
          { month: "2026-05", incomeAmount: 0, expenseAmount: 0, netAmount: 0, hasRecords: false },
          { month: "2026-06", incomeAmount: 1000000, expenseAmount: 250000, netAmount: 750000, hasRecords: true }
        ]}
      />
    );
    expect(screen.getByText("May")).toBeInTheDocument();
    expect(screen.getByText("Jun")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /jun: income .*expense .*250.000/i })).toHaveClass("trend-hotspot");
  });
});
