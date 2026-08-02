export type RecordType = "income" | "expense" | "savings";
export type RecordScope = "household" | "member";
export type CategoryScope = "household" | "member" | "both";
export type HouseholdRole = "owner" | "member";
export type BudgetSource = "explicit" | "inherited";
export type BudgetStatusLabel = "under_budget" | "at_budget" | "over_budget" | "not_budgeted";
export type InvitationStatus = "pending" | "accepted" | "revoked";
export type InsightStoryType =
  | "highest_spending"
  | "lowest_nonzero_spending"
  | "over_budget"
  | "under_budget"
  | "no_expense_activity"
  | "income_expense_context";
export type InsightSeverity = "neutral" | "attention" | "positive";

export interface User {
  id: string;
  email: string;
  displayName: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
}

export interface Household {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  role: HouseholdRole;
  joinedAt: string;
  displayName?: string;
}

export interface HouseholdInvitation {
  id: string;
  householdId: string;
  email: string;
  token: string;
  status: InvitationStatus;
  invitedByUserId: string;
  acceptedByUserId: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  householdId: string;
  name: string;
  type: RecordType;
  scope: CategoryScope;
  isArchived: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
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

export interface CategoryBudget {
  id: string;
  householdId: string;
  categoryId: string;
  month: string;
  amount: number;
  source: BudgetSource;
  createdByUserId: string;
  updatedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudgetView {
  id: string;
  categoryId: string;
  categoryName: string;
  month: string;
  amount: number;
  source: BudgetSource;
  isArchivedCategory: boolean;
}

export interface BudgetableCategoryView {
  categoryId: string;
  categoryName: string;
  isArchived: boolean;
  budget: {
    id: string;
    amount: number;
    source: BudgetSource;
  } | null;
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

export interface MonthlyInsightStory {
  id: string;
  type: InsightStoryType;
  priority: number;
  title: string;
  body: string;
  categoryId: string | null;
  amount: number | null;
  comparisonAmount: number | null;
  percentOfExpenses: number | null;
  severity: InsightSeverity;
  sourceRefs: string[];
}

export interface HistoricalIncomeExpensePoint {
  month: string;
  incomeAmount: number;
  expenseAmount: number;
  netAmount: number;
  hasRecords: boolean;
}

export interface FinancialRecord {
  id: string;
  householdId: string;
  ownerUserId: string;
  categoryId: string;
  type: RecordType;
  scope: RecordScope;
  amount: number;
  occurredOn: string;
  month: string;
  note: string | null;
  createdByUserId: string;
  updatedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionView extends FinancialRecord {
  owner: {
    userId: string;
    displayName: string;
  };
  category: {
    id: string;
    name: string;
    type: RecordType;
  };
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName
  };
}
