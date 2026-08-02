import { prisma } from "../../db/prisma.js";
import { badRequest, notFound } from "../../server/http.js";
import { toTransactionView } from "../shared/serializers.js";
import { monthFromDate } from "../shared/schemas.js";
import type { RecordScope, RecordType } from "../shared/types.js";

async function ensureOwnerMembership(householdId: string, ownerUserId: string) {
  const membership = await prisma.householdMember.findFirst({
    where: {
      householdId,
      userId: ownerUserId
    }
  });
  if (!membership) {
    throw badRequest("Selected owner is not part of this household.");
  }
}

async function ensureCategory(householdId: string, categoryId: string, type: RecordType) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      householdId
    }
  });
  if (!category) {
    throw notFound("Category not found.");
  }
  if (category.type !== type) {
    throw badRequest("Transaction type and selected category do not match.");
  }
  return category;
}

export async function createTransaction(input: {
  householdId: string;
  ownerUserId: string;
  categoryId: string;
  type: RecordType;
  scope: RecordScope;
  amount: number;
  occurredOn: string;
  note?: string | null;
  createdByUserId: string;
}) {
  await ensureOwnerMembership(input.householdId, input.ownerUserId);
  await ensureCategory(input.householdId, input.categoryId, input.type);
  const transaction = await prisma.transaction.create({
    data: {
      householdId: input.householdId,
      ownerUserId: input.ownerUserId,
      categoryId: input.categoryId,
      type: input.type,
      scope: input.scope,
      amount: input.amount,
      occurredOn: new Date(input.occurredOn),
      month: monthFromDate(input.occurredOn),
      note: input.note,
      createdByUserId: input.createdByUserId,
      updatedByUserId: input.createdByUserId
    },
    include: {
      ownerUser: true,
      category: true
    }
  });
  return toTransactionView(transaction);
}

export async function listTransactions(input: {
  householdId: string;
  month: string;
  type?: RecordType;
  ownerUserId?: string;
  categoryId?: string;
}) {
  const transactions = await prisma.transaction.findMany({
    where: {
      householdId: input.householdId,
      month: input.month,
      type: input.type,
      ownerUserId: input.ownerUserId,
      categoryId: input.categoryId
    },
    include: {
      ownerUser: true,
      category: true
    },
    orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }]
  });

  return {
    transactions: transactions.map(toTransactionView)
  };
}

export async function updateTransaction(input: {
  householdId: string;
  transactionId: string;
  updatedByUserId: string;
  amount?: number;
  occurredOn?: string;
  categoryId?: string;
  ownerUserId?: string;
  scope?: RecordScope;
  note?: string | null;
}) {
  const existing = await prisma.transaction.findFirst({
    where: {
      id: input.transactionId,
      householdId: input.householdId
    }
  });
  if (!existing) {
    throw notFound("Transaction not found.");
  }

  const nextOwnerUserId = input.ownerUserId ?? existing.ownerUserId;
  const nextCategoryId = input.categoryId ?? existing.categoryId;
  await ensureOwnerMembership(input.householdId, nextOwnerUserId);
  await ensureCategory(input.householdId, nextCategoryId, existing.type);

  const transaction = await prisma.transaction.update({
    where: { id: input.transactionId },
    data: {
      amount: input.amount,
      occurredOn: input.occurredOn ? new Date(input.occurredOn) : undefined,
      month: input.occurredOn ? monthFromDate(input.occurredOn) : undefined,
      categoryId: input.categoryId,
      ownerUserId: input.ownerUserId,
      scope: input.scope,
      note: input.note,
      updatedByUserId: input.updatedByUserId
    },
    include: {
      ownerUser: true,
      category: true
    }
  });

  return toTransactionView(transaction);
}

export async function deleteTransaction(input: { householdId: string; transactionId: string }) {
  const existing = await prisma.transaction.findFirst({
    where: {
      id: input.transactionId,
      householdId: input.householdId
    }
  });
  if (!existing) {
    throw notFound("Transaction not found.");
  }
  await prisma.transaction.delete({
    where: { id: input.transactionId }
  });
  return { ok: true };
}
