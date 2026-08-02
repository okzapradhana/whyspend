import { prisma } from "../../db/prisma.js";
import { badRequest } from "../../server/http.js";
import { toTransactionView } from "../shared/serializers.js";
import type { BudgetStatus, BudgetStatusLabel, RecordType } from "../shared/types.js";
import { buildInsightStories } from "./insightService.js";

const emptyTotals = { income: 0, expenses: 0, savings: 0 };

function percentOf(amount: number, total: number) {
  return total > 0 ? Number(((amount / total) * 100).toFixed(2)) : 0;
}

function compareMonths(fromMonth: string, toMonth: string) {
  return fromMonth.localeCompare(toMonth);
}

export async function getMonthlySummary(input: { householdId: string; month: string }) {
  const [transactions, budgets] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        householdId: input.householdId,
        month: input.month
      },
      include: {
        ownerUser: true,
        category: true
      },
      orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }]
    }),
    prisma.categoryBudget.findMany({
      where: {
        householdId: input.householdId,
        month: input.month
      },
      include: {
        category: true
      }
    })
  ]);

  const transactionViews = transactions.map(toTransactionView);
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
    { categoryId: string; categoryName: string; type: RecordType; amount: number; transactionCount: number }
  >();
  const memberMap = new Map<string, { userId: string; displayName: string; income: number; expenses: number; savings: number }>();
  const byScope = {
    household: { ...emptyTotals },
    member: { ...emptyTotals }
  };

  for (const record of transactionViews) {
    const totalKey = record.type === "expense" ? "expenses" : record.type;
    totals[totalKey] += record.amount;
    byScope[record.scope][totalKey] += record.amount;

    const existingCategory = categoryMap.get(record.categoryId) ?? {
      categoryId: record.categoryId,
      categoryName: record.category.name,
      type: record.type,
      amount: 0,
      transactionCount: 0
    };
    existingCategory.amount += record.amount;
    existingCategory.transactionCount += 1;
    categoryMap.set(record.categoryId, existingCategory);

    const existingMember = memberMap.get(record.ownerUserId) ?? {
      userId: record.ownerUserId,
      displayName: record.owner.displayName,
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
        categoryName: activity?.categoryName ?? budget?.category.name ?? "Category",
        month: input.month,
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

  const expenseTransactions = transactionViews.filter((transaction) => transaction.type === "expense");
  const insightStories = buildInsightStories({
    month: input.month,
    expenseTransactions,
    budgetStatuses,
    totalExpenses: totals.expenses
  });

  return {
    month: input.month,
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
    byCategory: [...categoryMap.values()].sort((a, b) => b.amount - a.amount),
    byMember: [...memberMap.values()].sort((a, b) => a.displayName.localeCompare(b.displayName)),
    byScope
  };
}

export async function getIncomeExpenseHistory(input: { householdId: string; fromMonth: string; toMonth: string }) {
  if (compareMonths(input.fromMonth, input.toMonth) > 0) {
    throw badRequest("Choose a valid month range.");
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      householdId: input.householdId,
      month: {
        gte: input.fromMonth,
        lte: input.toMonth
      }
    },
    select: {
      month: true,
      type: true,
      amount: true
    },
    orderBy: {
      month: "asc"
    }
  });

  const monthMap = new Map<string, { incomeAmount: number; expenseAmount: number; savingsAmount: number; hasRecords: boolean }>();
  for (const record of transactions) {
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
  const [fromYear, fromMonth] = input.fromMonth.split("-").map(Number);
  const [toYear, toMonth] = input.toMonth.split("-").map(Number);
  let year = fromYear;
  let month = fromMonth;
  while (year < toYear || (year === toYear && month <= toMonth)) {
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

  return { fromMonth: input.fromMonth, toMonth: input.toMonth, points };
}
