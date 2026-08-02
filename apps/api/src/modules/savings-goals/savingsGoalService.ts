import { prisma } from "../../db/prisma.js";
import { conflict, notFound } from "../../server/http.js";
import { toSavingsGoal } from "../shared/serializers.js";

export async function listSavingsGoals(input: { householdId: string }) {
  const goals = await prisma.savingsGoal.findMany({
    where: {
      householdId: input.householdId,
      category: {
        isArchived: false
      }
    },
    include: {
      category: true,
      household: true
    },
    orderBy: {
      category: {
        name: "asc"
      }
    }
  });

  const transactionSums = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      householdId: input.householdId,
      type: "savings",
      categoryId: {
        in: goals.map((goal) => goal.categoryId)
      }
    },
    _sum: {
      amount: true
    }
  });

  const sumMap = new Map(transactionSums.map((item) => [item.categoryId, item._sum.amount ?? 0]));

  return {
    goals: goals.map((goal) => toSavingsGoal(goal, goal.startingAmount + (sumMap.get(goal.categoryId) ?? 0)))
  };
}

export async function createSavingsGoal(input: {
  householdId: string;
  userId: string;
  name: string;
  targetAmount: number;
  startingAmount: number;
  targetDate?: string | null;
}) {
  const duplicate = await prisma.category.findFirst({
    where: {
      householdId: input.householdId,
      type: "savings",
      isArchived: false,
      name: {
        equals: input.name,
        mode: "insensitive"
      }
    }
  });
  if (duplicate) {
    throw conflict("goal_duplicate", "A savings goal with this name already exists.");
  }

  const created = await prisma.$transaction(async (tx) => {
    const category = await tx.category.create({
      data: {
        householdId: input.householdId,
        name: input.name,
        type: "savings",
        scope: "both",
        createdByUserId: input.userId
      }
    });
    return tx.savingsGoal.create({
      data: {
        householdId: input.householdId,
        categoryId: category.id,
        targetAmount: input.targetAmount,
        startingAmount: input.startingAmount,
        targetDate: input.targetDate ? new Date(input.targetDate) : null
      },
      include: {
        category: true
      }
    });
  });

  return toSavingsGoal(created, created.startingAmount);
}

export async function updateSavingsGoal(input: {
  householdId: string;
  goalId: string;
  name?: string;
  targetAmount?: number;
  startingAmount?: number;
  targetDate?: string | null;
}) {
  const existing = await prisma.savingsGoal.findFirst({
    where: {
      id: input.goalId,
      householdId: input.householdId
    },
    include: {
      category: true
    }
  });
  if (!existing) {
    throw notFound("Savings goal not found.");
  }

  if (input.name && input.name.toLowerCase() !== existing.category.name.toLowerCase()) {
    const duplicate = await prisma.category.findFirst({
      where: {
        householdId: input.householdId,
        type: "savings",
        isArchived: false,
        id: { not: existing.categoryId },
        name: {
          equals: input.name,
          mode: "insensitive"
        }
      }
    });
    if (duplicate) {
      throw conflict("goal_duplicate", "A savings goal with this name already exists.");
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.name) {
      await tx.category.update({
        where: { id: existing.categoryId },
        data: { name: input.name }
      });
    }
    return tx.savingsGoal.update({
      where: { id: input.goalId },
      data: {
        targetAmount: input.targetAmount,
        startingAmount: input.startingAmount,
        targetDate:
          input.targetDate === undefined ? undefined : input.targetDate ? new Date(input.targetDate) : null
      },
      include: {
        category: true
      }
    });
  });

  const sum = await prisma.transaction.aggregate({
    where: {
      householdId: input.householdId,
      type: "savings",
      categoryId: updated.categoryId
    },
    _sum: {
      amount: true
    }
  });

  return toSavingsGoal(updated, updated.startingAmount + (sum._sum.amount ?? 0));
}

export async function deleteSavingsGoal(input: { householdId: string; goalId: string }) {
  const existing = await prisma.savingsGoal.findFirst({
    where: {
      id: input.goalId,
      householdId: input.householdId
    }
  });
  if (!existing) {
    throw notFound("Savings goal not found.");
  }

  const linkedTransactions = await prisma.transaction.count({
    where: {
      householdId: input.householdId,
      categoryId: existing.categoryId
    }
  });

  await prisma.$transaction(async (tx) => {
    await tx.savingsGoal.delete({
      where: { id: input.goalId }
    });
    if (linkedTransactions > 0) {
      await tx.category.update({
        where: { id: existing.categoryId },
        data: { isArchived: true }
      });
      return;
    }
    await tx.category.delete({
      where: { id: existing.categoryId }
    });
  });

  return { ok: true as const };
}
