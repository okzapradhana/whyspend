import type { BudgetStatus, MonthlyInsightStory, TransactionView } from "../shared/types.js";

function pct(part: number, total: number) {
  return total > 0 ? Number(((part / total) * 100).toFixed(2)) : 0;
}

export function buildInsightStories(input: {
  month: string;
  expenseTransactions: TransactionView[];
  budgetStatuses: BudgetStatus[];
  totalExpenses: number;
}): MonthlyInsightStory[] {
  if (input.expenseTransactions.length === 0 || input.totalExpenses === 0) {
    return [
      {
        id: `no-expense-${input.month}`,
        type: "no_expense_activity",
        priority: 1,
        title: "No expense activity",
        body: "There are no expenses recorded for this month yet.",
        categoryId: null,
        amount: null,
        comparisonAmount: null,
        percentOfExpenses: null,
        severity: "neutral",
        sourceRefs: []
      }
    ];
  }

  const byCategory = new Map<string, { categoryId: string; categoryName: string; amount: number; transactionIds: string[] }>();
  for (const transaction of input.expenseTransactions) {
    const current = byCategory.get(transaction.categoryId) ?? {
      categoryId: transaction.categoryId,
      categoryName: transaction.category.name,
      amount: 0,
      transactionIds: []
    };
    current.amount += transaction.amount;
    current.transactionIds.push(transaction.id);
    byCategory.set(transaction.categoryId, current);
  }

  const categories = [...byCategory.values()].sort((a, b) => b.amount - a.amount || a.categoryName.localeCompare(b.categoryName));
  const lowest = [...categories].filter((category) => category.amount > 0).sort((a, b) => a.amount - b.amount || a.categoryName.localeCompare(b.categoryName))[0];
  const highest = categories[0];
  const stories: MonthlyInsightStory[] = [];

  stories.push({
    id: `highest-${highest.categoryId}`,
    type: "highest_spending",
    priority: 1,
    title: "Most spending",
    body: `${highest.categoryName} is the largest expense this month at IDR ${highest.amount.toLocaleString("id-ID")}.`,
    categoryId: highest.categoryId,
    amount: highest.amount,
    comparisonAmount: input.totalExpenses,
    percentOfExpenses: pct(highest.amount, input.totalExpenses),
    severity: "neutral",
    sourceRefs: highest.transactionIds
  });

  if (lowest && lowest.categoryId !== highest.categoryId) {
    stories.push({
      id: `lowest-${lowest.categoryId}`,
      type: "lowest_nonzero_spending",
      priority: 2,
      title: "Smallest active category",
      body: `${lowest.categoryName} has the smallest non-zero spending at IDR ${lowest.amount.toLocaleString("id-ID")}.`,
      categoryId: lowest.categoryId,
      amount: lowest.amount,
      comparisonAmount: input.totalExpenses,
      percentOfExpenses: pct(lowest.amount, input.totalExpenses),
      severity: "neutral",
      sourceRefs: lowest.transactionIds
    });
  }

  const overBudget = [...input.budgetStatuses]
    .filter((status) => status.status === "over_budget")
    .sort((a, b) => b.exceededAmount - a.exceededAmount || a.categoryName.localeCompare(b.categoryName))[0];

  if (overBudget) {
    stories.push({
      id: `over-budget-${overBudget.categoryId}`,
      type: "over_budget",
      priority: 3,
      title: "Budget needs attention",
      body: `${overBudget.categoryName} is IDR ${overBudget.exceededAmount.toLocaleString("id-ID")} over its monthly budget.`,
      categoryId: overBudget.categoryId,
      amount: overBudget.actualAmount,
      comparisonAmount: overBudget.budgetAmount,
      percentOfExpenses: pct(overBudget.actualAmount, input.totalExpenses),
      severity: "attention",
      sourceRefs: [overBudget.categoryId]
    });
  } else {
    const remaining = [...input.budgetStatuses]
      .filter((status) => status.budgetAmount !== null && status.remainingAmount > 0)
      .sort((a, b) => b.remainingAmount - a.remainingAmount || a.categoryName.localeCompare(b.categoryName))[0];
    stories.push({
      id: remaining ? `under-budget-${remaining.categoryId}` : `budget-context-${input.month}`,
      type: "under_budget",
      priority: 3,
      title: "Budget context",
      body: remaining
        ? `${remaining.categoryName} has IDR ${remaining.remainingAmount.toLocaleString("id-ID")} remaining this month.`
        : "No category is over budget this month.",
      categoryId: remaining?.categoryId ?? null,
      amount: remaining?.actualAmount ?? null,
      comparisonAmount: remaining?.budgetAmount ?? null,
      percentOfExpenses: remaining ? pct(remaining.actualAmount, input.totalExpenses) : null,
      severity: "positive",
      sourceRefs: remaining ? [remaining.categoryId] : []
    });
  }

  return stories;
}
