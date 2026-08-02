import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BudgetStatusList } from "../src/features/summaries/BudgetStatusList";
import { TransactionList } from "../src/features/transactions/TransactionList";
import { CategoryBudgetRow } from "../src/features/settings/CategoryBudgetRow";
import { SavingsGoalCard } from "../src/features/savings-goals/SavingsGoalCard";

const longName = "Transport e-money subscription for an unusually long household category name";

describe("OpenDesign overflow protections", () => {
  it("renders long labels and high currency values across dashboard, transactions, Settings, and savings goals", () => {
    render(
      <>
        <BudgetStatusList
          statuses={[
            {
              categoryId: "long",
              categoryName: longName,
              month: "2026-06",
              actualAmount: 987654321,
              budgetAmount: 1234567890,
              remainingAmount: 246913569,
              exceededAmount: 0,
              varianceAmount: 246913569,
              status: "under_budget",
              transactionCount: 4,
              isBudgetInherited: false
            }
          ]}
          onSelectCategory={vi.fn()}
        />
        <TransactionList
          loading={false}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          transactions={[
            {
              id: "t1",
              householdId: "h1",
              ownerUserId: "u1",
              categoryId: "long",
              type: "expense",
              amount: 987654321,
              occurredOn: "2026-06-06",
              month: "2026-06",
              scope: "household",
              note: "Long note that should wrap without pushing action buttons out of view",
              owner: { userId: "u1", displayName: "Okza With A Very Long Display Name" },
              category: { id: "long", name: longName, type: "expense" }
            }
          ]}
        />
        <CategoryBudgetRow
          category={{ categoryId: "long", categoryName: longName, isArchived: false, budget: { id: "b1", amount: 1234567890, source: "explicit" } }}
          onSave={async () => undefined}
          onRemove={async () => undefined}
        />
        <SavingsGoalCard
          goal={{ id: "g1", name: longName, targetAmount: 1500000000, savedAmount: 987654321 }}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </>
    );

    expect(screen.getAllByText(longName).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/987/).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /open .* menu/i })).toBeInTheDocument();
  });
});
