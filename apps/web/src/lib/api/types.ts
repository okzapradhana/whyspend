export type RecordType = "income" | "expense" | "savings";
export type RecordScope = "household" | "member";
export type CategoryScope = "household" | "member" | "both";
export type BudgetSource = "explicit" | "inherited";
export type BudgetStatusLabel = "under_budget" | "at_budget" | "over_budget" | "not_budgeted";

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Household {
  id: string;
  name: string;
  role?: "owner" | "member";
  members?: Array<{ userId: string; displayName: string; role: string }>;
  invitations?: HouseholdInvitation[];
}

export interface HouseholdInvitation {
  id: string;
  householdId: string;
  email: string;
  token: string;
  status: "pending" | "accepted" | "revoked";
  invitedByUserId: string;
  acceptedByUserId: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  inviteUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  type: RecordType;
  scope: CategoryScope;
  isArchived: boolean;
}

export interface Transaction {
  id: string;
  householdId: string;
  ownerUserId: string;
  categoryId: string;
  type: RecordType;
  amount: number;
  occurredOn: string;
  month: string;
  scope: RecordScope;
  note: string | null;
  owner: { userId: string; displayName: string };
  category: { id: string; name: string; type: RecordType };
}

export interface MonthlySummary {
  month: string;
  totals: {
    income: number;
    expenses: number;
    savings: number;
    remainingDifference: number;
    totalBudgetedExpenses?: number;
    budgetedActualExpenses?: number;
    remainingBudget?: number;
    exceededBudget?: number;
  };
  budgetStatuses?: BudgetStatus[];
  spendingByCategory?: SpendingByCategoryPoint[];
  spendingVsBudget?: SpendingVsBudgetPoint[];
  incomeVsExpenses?: IncomeVsExpenses;
  insightStories?: MonthlyInsightStory[];
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    type: RecordType;
    amount: number;
    transactionCount: number;
  }>;
  byMember: Array<{
    userId: string;
    displayName: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  byScope: {
    household: { income: number; expenses: number; savings: number };
    member: { income: number; expenses: number; savings: number };
  };
}

export interface CategoryBudget {
  id: string;
  categoryId: string;
  categoryName: string;
  month: string;
  amount: number;
  source: BudgetSource;
  isArchivedCategory: boolean;
}

export interface BudgetableCategory {
  categoryId: string;
  categoryName: string;
  isArchived: boolean;
  budget: {
    id: string;
    amount: number;
    source: BudgetSource;
  } | null;
}

export interface CategoryBudgetList {
  month: string;
  budgets: CategoryBudget[];
  budgetableCategories: BudgetableCategory[];
}

export interface BudgetStatus {
  categoryId: string;
  categoryName: string;
  month: string;
  actualAmount: number;
  budgetAmount: number | null;
  remainingAmount: number;
  exceededAmount: number;
  varianceAmount: number | null;
  status: BudgetStatusLabel;
  transactionCount: number;
  isBudgetInherited: boolean;
}

export interface SpendingByCategoryPoint {
  categoryId: string;
  label: string;
  amount: number;
  percentOfExpenses: number;
  transactionCount: number;
}

export interface SpendingVsBudgetPoint {
  categoryId: string;
  label: string;
  actualAmount: number;
  budgetAmount: number | null;
  status: BudgetStatusLabel;
}

export interface IncomeVsExpenses {
  incomeAmount: number;
  expenseAmount: number;
  netAmount: number;
}

export interface HistoricalIncomeExpensePoint extends IncomeVsExpenses {
  month: string;
  hasRecords: boolean;
  savingsAmount?: number;
}

export interface SavingsGoal {
  id: string;
  householdId: string;
  categoryId: string;
  name: string;
  targetAmount: number;
  startingAmount: number;
  savedAmount: number;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyInsightStory {
  id: string;
  type:
    | "highest_spending"
    | "lowest_nonzero_spending"
    | "over_budget"
    | "under_budget"
    | "no_expense_activity"
    | "income_expense_context";
  priority: number;
  title: string;
  body: string;
  categoryId: string | null;
  amount: number | null;
  comparisonAmount: number | null;
  percentOfExpenses: number | null;
  severity: "neutral" | "attention" | "positive";
  sourceRefs: string[];
}
