import { prisma } from "../../db/prisma.js";
import { badRequest, notFound } from "../../server/http.js";
import { toBudgetView } from "../shared/serializers.js";

export async function listCategoryBudgets(input: {
  householdId: string;
  month: string;
  includeInherited?: boolean;
}) {
  const [categories, budgets] = await Promise.all([
    prisma.category.findMany({
      where: {
        householdId: input.householdId,
        type: "expense"
      },
      orderBy: { name: "asc" }
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

  const budgetMap = new Map(budgets.map((budget) => [budget.categoryId, budget]));

  return {
    month: input.month,
    budgets: budgets.map(toBudgetView),
    budgetableCategories: categories.map((category) => {
      const budget = budgetMap.get(category.id);
      return {
        categoryId: category.id,
        categoryName: category.name,
        isArchived: category.isArchived,
        budget: budget
          ? {
              id: budget.id,
              amount: budget.amount,
              source: "explicit" as const
            }
          : null
      };
    })
  };
}

export async function upsertCategoryBudget(input: {
  householdId: string;
  categoryId: string;
  month: string;
  amount: number;
  userId: string;
}) {
  const category = await prisma.category.findFirst({
    where: {
      id: input.categoryId,
      householdId: input.householdId
    }
  });
  if (!category) {
    throw notFound("Category does not belong to household.");
  }
  if (category.type !== "expense") {
    throw badRequest("Only expense categories can have budgets.");
  }

  const budget = await prisma.categoryBudget.upsert({
    where: {
      householdId_categoryId_month: {
        householdId: input.householdId,
        categoryId: input.categoryId,
        month: input.month
      }
    },
    update: {
      amount: input.amount,
      updatedByUserId: input.userId
    },
    create: {
      householdId: input.householdId,
      categoryId: input.categoryId,
      month: input.month,
      amount: input.amount,
      createdByUserId: input.userId,
      updatedByUserId: input.userId
    },
    include: {
      category: true
    }
  });

  return toBudgetView(budget);
}

export async function deleteCategoryBudget(input: { householdId: string; categoryId: string; month: string }) {
  await prisma.categoryBudget.deleteMany({
    where: {
      householdId: input.householdId,
      categoryId: input.categoryId,
      month: input.month
    }
  });
  return { ok: true as const };
}
