import type {
  Category as PrismaCategory,
  CategoryBudget as PrismaCategoryBudget,
  Household as PrismaHousehold,
  HouseholdInvitation as PrismaHouseholdInvitation,
  HouseholdMember as PrismaHouseholdMember,
  SavingsGoal as PrismaSavingsGoal,
  Transaction as PrismaTransaction,
  User as PrismaUser
} from "@prisma/client";
import type {
  Category,
  CategoryBudgetView,
  Household,
  HouseholdInvitation,
  HouseholdMember,
  PublicUser,
  SavingsGoal,
  TransactionView,
  User
} from "./types.js";

export function asIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

export function asDateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

export function toUser(user: PrismaUser): User {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    password: user.password,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export function toPublicUser(user: PrismaUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName
  };
}

export function toHousehold(household: PrismaHousehold): Household {
  return {
    id: household.id,
    name: household.name,
    createdAt: household.createdAt.toISOString(),
    updatedAt: household.updatedAt.toISOString()
  };
}

export function toHouseholdMember(member: PrismaHouseholdMember, displayName?: string): HouseholdMember {
  return {
    id: member.id,
    householdId: member.householdId,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt.toISOString(),
    displayName
  };
}

export function toInvitation(invitation: PrismaHouseholdInvitation): HouseholdInvitation {
  return {
    id: invitation.id,
    householdId: invitation.householdId,
    email: invitation.email,
    token: invitation.token,
    status: invitation.status,
    invitedByUserId: invitation.invitedByUserId,
    acceptedByUserId: invitation.acceptedByUserId,
    expiresAt: invitation.expiresAt.toISOString(),
    acceptedAt: asIso(invitation.acceptedAt),
    createdAt: invitation.createdAt.toISOString(),
    updatedAt: invitation.updatedAt.toISOString()
  };
}

export function toCategory(category: PrismaCategory): Category {
  return {
    id: category.id,
    householdId: category.householdId,
    name: category.name,
    type: category.type,
    scope: category.scope,
    isArchived: category.isArchived,
    createdByUserId: category.createdByUserId,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  };
}

export function toBudgetView(budget: PrismaCategoryBudget & { category: PrismaCategory }): CategoryBudgetView {
  return {
    id: budget.id,
    categoryId: budget.categoryId,
    categoryName: budget.category.name,
    month: budget.month,
    amount: budget.amount,
    source: "explicit",
    isArchivedCategory: budget.category.isArchived
  };
}

export function toSavingsGoal(
  goal: PrismaSavingsGoal & { category: PrismaCategory },
  savedAmount: number
): SavingsGoal {
  return {
    id: goal.id,
    householdId: goal.householdId,
    categoryId: goal.categoryId,
    name: goal.category.name,
    targetAmount: goal.targetAmount,
    startingAmount: goal.startingAmount,
    savedAmount,
    targetDate: asDateOnly(goal.targetDate),
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString()
  };
}

export function toTransactionView(
  transaction: PrismaTransaction & {
    ownerUser: PrismaUser;
    category: PrismaCategory;
  }
): TransactionView {
  return {
    id: transaction.id,
    householdId: transaction.householdId,
    ownerUserId: transaction.ownerUserId,
    categoryId: transaction.categoryId,
    type: transaction.type,
    scope: transaction.scope,
    amount: transaction.amount,
    occurredOn: transaction.occurredOn.toISOString().slice(0, 10),
    month: transaction.month,
    note: transaction.note,
    createdByUserId: transaction.createdByUserId,
    updatedByUserId: transaction.updatedByUserId,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
    owner: {
      userId: transaction.ownerUser.id,
      displayName: transaction.ownerUser.displayName
    },
    category: {
      id: transaction.category.id,
      name: transaction.category.name,
      type: transaction.category.type
    }
  };
}
