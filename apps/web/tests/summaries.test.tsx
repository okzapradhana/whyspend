import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryChart } from "../src/features/summaries/CategoryChart";
import { CategoryDrilldown } from "../src/features/summaries/CategoryDrilldown";
import type { MonthlySummary, Transaction } from "../src/lib/api/types";

const summary: MonthlySummary = {
  month: "2026-01",
  totals: { income: 0, expenses: 300000, savings: 0, remainingDifference: -300000 },
  byCategory: [{ categoryId: "c1", categoryName: "Subscription", type: "expense", amount: 300000, transactionCount: 2 }],
  byMember: [],
  byScope: { household: { income: 0, expenses: 0, savings: 0 }, member: { income: 0, expenses: 300000, savings: 0 } }
};

const transaction: Transaction = {
  id: "t1",
  householdId: "h1",
  ownerUserId: "u1",
  categoryId: "c1",
  type: "expense",
  amount: 300000,
  occurredOn: "2026-01-10",
  month: "2026-01",
  scope: "member",
  note: "Monthly subscription",
  owner: { userId: "u1", displayName: "Okza" },
  category: { id: "c1", name: "Subscription", type: "expense" }
};

describe("summary UI", () => {
  it("shows category totals and supports drill-down selection", async () => {
    const onSelect = vi.fn();
    render(<CategoryChart summary={summary} onSelectCategory={onSelect} />);

    expect(screen.getByText("Subscription")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /subscription/i }));
    expect(onSelect).toHaveBeenCalledWith("c1");
  });

  it("lists transactions bound to a selected category", () => {
    render(<CategoryDrilldown categoryName="Subscription" transactions={[transaction]} />);
    expect(screen.getByText("Monthly subscription")).toBeInTheDocument();
    expect(screen.getByText(/Okza/)).toBeInTheDocument();
  });
});
