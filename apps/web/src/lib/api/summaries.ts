import { supabase } from "../supabaseClient";
import type { HistoricalIncomeExpensePoint, MonthlySummary, BudgetStatus, BudgetStatusLabel } from "./types";

const emptyTotals = { income: 0, expenses: 0, savings: 0 };

function percentOf(amount: number, total: number) {
  return total > 0 ? Number(((amount / total) * 100).toFixed(2)) : 0;
}

function pct(part: number, total: number) {
  return total > 0 ? Number(((part / total) * 100).toFixed(2)) : 0;
}

function buildInsightStories(input: {
  month: string;
  expenseTransactions: any[];
  budgetStatuses: BudgetStatus[];
  totalExpenses: number;
}) {
  if (input.expenseTransactions.length === 0 || input.totalExpenses === 0) {
    return [
      {
        id: `no-expense-${input.month}`,
        type: "no_expense_activity" as const,
        priority: 1,
        title: "No expense activity",
        body: "There are no expenses recorded for this month yet.",
        categoryId: null,
        amount: null,
        comparisonAmount: null,
        percentOfExpenses: null,
        severity: "neutral" as const,
        sourceRefs: []
      }
    ];
  }

  const byCategory = new Map<string, { categoryId: string; categoryName: string; amount: number; transactionIds: string[] }>();
  for (const transaction of input.expenseTransactions) {
    const current = byCategory.get(transaction.categoryId) ?? {
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name || "Category",
      amount: 0,
      transactionIds: [] as string[]
    };
    current.amount += transaction.amount;
    current.transactionIds.push(transaction.id);
    byCategory.set(transaction.categoryId, current);
  }

  const categories = [...byCategory.values()].sort((a, b) => b.amount - a.amount || a.categoryName.localeCompare(b.categoryName));
  const lowest = [...categories].filter((category) => category.amount > 0).sort((a, b) => a.amount - b.amount || a.categoryName.localeCompare(b.categoryName))[0];
  const highest = categories[0];
  const stories: any[] = [];

  stories.push({
    id: `highest-${highest.categoryId}`,
    type: "highest_spending" as const,
    priority: 1,
    title: "Most spending",
    body: `${highest.categoryName} is the largest expense this month at IDR ${highest.amount.toLocaleString("id-ID")}.`,
    categoryId: highest.categoryId,
    amount: highest.amount,
    comparisonAmount: input.totalExpenses,
    percentOfExpenses: pct(highest.amount, input.totalExpenses),
    severity: "neutral" as const,
    sourceRefs: highest.transactionIds
  });

  if (lowest && lowest.categoryId !== highest.categoryId) {
    stories.push({
      id: `lowest-${lowest.categoryId}`,
      type: "lowest_nonzero_spending" as const,
      priority: 2,
      title: "Smallest active category",
      body: `${lowest.categoryName} has the smallest non-zero spending at IDR ${lowest.amount.toLocaleString("id-ID")}.`,
      categoryId: lowest.categoryId,
      amount: lowest.amount,
      comparisonAmount: input.totalExpenses,
      percentOfExpenses: pct(lowest.amount, input.totalExpenses),
      severity: "neutral" as const,
      sourceRefs: lowest.transactionIds
    });
  }

  const overBudget = [...input.budgetStatuses]
    .filter((status) => status.status === "over_budget")
    .sort((a, b) => b.exceededAmount - a.exceededAmount || a.categoryName.localeCompare(b.categoryName))[0];

  if (overBudget) {
    stories.push({
      id: `over-budget-${overBudget.categoryId}`,
      type: "over_budget" as const,
      priority: 3,
      title: "Budget needs attention",
      body: `${overBudget.categoryName} is IDR ${overBudget.exceededAmount.toLocaleString("id-ID")} over its monthly budget.`,
      categoryId: overBudget.categoryId,
      amount: overBudget.actualAmount,
      comparisonAmount: overBudget.budgetAmount,
      percentOfExpenses: pct(overBudget.actualAmount, input.totalExpenses),
      severity: "attention" as const,
      sourceRefs: [overBudget.categoryId]
    });
  } else {
    const remaining = [...input.budgetStatuses]
      .filter((status) => status.budgetAmount !== null && status.remainingAmount > 0)
      .sort((a, b) => b.remainingAmount - a.remainingAmount || a.categoryName.localeCompare(b.categoryName))[0];
    stories.push({
      id: remaining ? `under-budget-${remaining.categoryId}` : `budget-context-${input.month}`,
      type: "under_budget" as const,
      priority: 3,
      title: "Budget context",
      body: remaining
        ? `${remaining.categoryName} has IDR ${remaining.remainingAmount.toLocaleString("id-ID")} remaining this month.`
        : "No category is over budget this month.",
      categoryId: remaining?.categoryId ?? null,
      amount: remaining?.actualAmount ?? null,
      comparisonAmount: remaining?.budgetAmount ?? null,
      percentOfExpenses: remaining ? pct(remaining.actualAmount, input.totalExpenses) : null,
      severity: "positive" as const,
      sourceRefs: remaining ? [remaining.categoryId] : []
    });
  }

  return stories;
}

export async function getMonthlySummary(householdId: string, month: string) {
  const [txRes, budgetsRes] = await Promise.all([
    supabase
      .from("Transaction")
      .select(`
        id,
        householdId,
        ownerUserId,
        categoryId,
        type,
        amount,
        occurredOn,
        month,
        scope,
        note,
        createdAt,
        owner:User!Transaction_ownerUserId_fkey (
          userId:id,
          displayName
        ),
        category:Category!Transaction_categoryId_fkey (
          id,
          name,
          type
        )
      `)
      .eq("householdId", householdId)
      .eq("month", month)
      .order("occurredOn", { ascending: false })
      .order("createdAt", { ascending: false }),
    supabase
      .from("CategoryBudget")
      .select(`
        id,
        categoryId,
        month,
        amount,
        category:Category!CategoryBudget_categoryId_fkey (
          name,
          isArchived
        )
      `)
      .eq("householdId", householdId)
      .eq("month", month)
  ]);

  if (txRes.error) throw txRes.error;
  if (budgetsRes.error) throw budgetsRes.error;

  const transactions = txRes.data || [];
  const budgets = budgetsRes.data || [];

  const totals = {
    ...emptyTotals,
    remainingDifference: 0,
    totalBudgetedExpenses: 0,
    budgetedActualExpenses: 0,
    remainingBudget: 0,
    exceededBudget: 0
  };

  const categoryMap = new Map<
    string,
    { categoryId: string; categoryName: string; type: string; amount: number; transactionCount: number }
  >();
  const memberMap = new Map<string, { userId: string; displayName: string; income: number; expenses: number; savings: number }>();
  const byScope = {
    household: { ...emptyTotals },
    member: { ...emptyTotals }
  };

  for (const record of transactions) {
    const totalKey = record.type === "expense" ? "expenses" : (record.type as "income" | "savings");
    totals[totalKey] += record.amount;
    (byScope as any)[record.scope][totalKey] += record.amount;

    const existingCategory = categoryMap.get(record.categoryId) ?? {
      categoryId: record.categoryId,
      categoryName: (record as any).category?.name || "Category",
      type: record.type,
      amount: 0,
      transactionCount: 0
    };
    existingCategory.amount += record.amount;
    existingCategory.transactionCount += 1;
    categoryMap.set(record.categoryId, existingCategory);

    const existingMember = memberMap.get(record.ownerUserId) ?? {
      userId: record.ownerUserId,
      displayName: (record as any).owner?.displayName || "Member",
      income: 0,
      expenses: 0,
      savings: 0
    };
    existingMember[totalKey] += record.amount;
    memberMap.set(record.ownerUserId, existingMember);
  }

  totals.remainingDifference = totals.income - totals.expenses - totals.savings;

  const expenseByCategory = [...categoryMap.values()].filter((category) => category.type === "expense");
  const expenseActivity = new Map(expenseByCategory.map((category) => [category.categoryId, category]));
  const budgetByCategory = new Map(budgets.map((budget) => [budget.categoryId, budget]));
  const categoryIds = new Set([...expenseActivity.keys(), ...budgetByCategory.keys()]);

  const budgetStatuses: BudgetStatus[] = [...categoryIds]
    .map((categoryId) => {
      const activity = expenseActivity.get(categoryId);
      const budget = budgetByCategory.get(categoryId);
      const actualAmount = activity?.amount ?? 0;
      const budgetAmount = budget?.amount ?? null;
      const varianceAmount = budgetAmount === null ? null : budgetAmount - actualAmount;
      const status: BudgetStatusLabel =
        budgetAmount === null
          ? "not_budgeted"
          : actualAmount > budgetAmount
            ? "over_budget"
            : actualAmount === budgetAmount
              ? "at_budget"
              : "under_budget";
      const remainingAmount = budgetAmount === null ? 0 : Math.max(budgetAmount - actualAmount, 0);
      const exceededAmount = budgetAmount === null ? 0 : Math.max(actualAmount - budgetAmount, 0);
      if (budgetAmount !== null) {
        totals.totalBudgetedExpenses += budgetAmount;
        totals.budgetedActualExpenses += actualAmount;
        totals.remainingBudget += remainingAmount;
        totals.exceededBudget += exceededAmount;
      }
      return {
        categoryId,
        categoryName: activity?.categoryName ?? (budget as any)?.category?.name ?? "Category",
        month: month,
        actualAmount,
        budgetAmount,
        remainingAmount,
        exceededAmount,
        varianceAmount,
        status,
        transactionCount: activity?.transactionCount ?? 0,
        isBudgetInherited: false
      };
    })
    .sort((a, b) => b.actualAmount - a.actualAmount || a.categoryName.localeCompare(b.categoryName));

  const spendingByCategory = expenseByCategory
    .map((category) => ({
      categoryId: category.categoryId,
      label: category.categoryName,
      amount: category.amount,
      percentOfExpenses: percentOf(category.amount, totals.expenses),
      transactionCount: category.transactionCount
    }))
    .sort((a, b) => b.amount - a.amount || a.label.localeCompare(b.label));

  const spendingVsBudget = budgetStatuses.map((status) => ({
    categoryId: status.categoryId,
    label: status.categoryName,
    actualAmount: status.actualAmount,
    budgetAmount: status.budgetAmount,
    status: status.status
  }));

  const expenseTransactions = transactions.filter((transaction) => transaction.type === "expense");
  const insightStories = buildInsightStories({
    month: month,
    expenseTransactions,
    budgetStatuses,
    totalExpenses: totals.expenses
  });

  return {
    month: month,
    totals,
    budgetStatuses,
    spendingByCategory,
    spendingVsBudget,
    incomeVsExpenses: {
      incomeAmount: totals.income,
      expenseAmount: totals.expenses,
      netAmount: totals.income - totals.expenses
    },
    insightStories,
    byCategory: [...categoryMap.values()].sort((a, b) => b.amount - a.amount) as any[],
    byMember: [...memberMap.values()].sort((a, b) => a.displayName.localeCompare(b.displayName)),
    byScope
  } as MonthlySummary;
}

export async function getIncomeExpenseHistory(householdId: string, fromMonth: string, toMonth: string) {
  if (fromMonth.localeCompare(toMonth) > 0) {
    throw new Error("Choose a valid month range.");
  }

  const { data: transactions, error } = await supabase
    .from("Transaction")
    .select("month, type, amount")
    .eq("householdId", householdId)
    .gte("month", fromMonth)
    .lte("month", toMonth)
    .order("month", { ascending: true });

  if (error) throw error;

  const monthMap = new Map<string, { incomeAmount: number; expenseAmount: number; savingsAmount: number; hasRecords: boolean }>();
  for (const record of transactions || []) {
    const current = monthMap.get(record.month) ?? {
      incomeAmount: 0,
      expenseAmount: 0,
      savingsAmount: 0,
      hasRecords: false
    };
    if (record.type === "income") current.incomeAmount += record.amount;
    if (record.type === "expense") current.expenseAmount += record.amount;
    if (record.type === "savings") current.savingsAmount += record.amount;
    current.hasRecords = true;
    monthMap.set(record.month, current);
  }

  const months: string[] = [];
  const [fromYear, fromMonthNum] = fromMonth.split("-").map(Number);
  const [toYear, toMonthNum] = toMonth.split("-").map(Number);
  let year = fromYear;
  let month = fromMonthNum;
  while (year < toYear || (year === toYear && month <= toMonthNum)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  const points = months.map((monthKey) => {
    const point = monthMap.get(monthKey) ?? {
      incomeAmount: 0,
      expenseAmount: 0,
      savingsAmount: 0,
      hasRecords: false
    };
    return {
      month: monthKey,
      incomeAmount: point.incomeAmount,
      expenseAmount: point.expenseAmount,
      netAmount: point.incomeAmount - point.expenseAmount,
      savingsAmount: point.savingsAmount,
      hasRecords: point.hasRecords
    };
  });

  return { fromMonth, toMonth, points: points as HistoricalIncomeExpensePoint[] };
}

