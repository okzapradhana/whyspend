import { prisma } from "../../db/prisma.js";
import { conflict, notFound } from "../../server/http.js";
import { toCategory } from "../shared/serializers.js";
import type { CategoryScope, RecordType } from "../shared/types.js";

export async function createCategory(input: {
  householdId: string;
  name: string;
  type: RecordType;
  scope: CategoryScope;
  createdByUserId: string;
}) {
  const duplicate = await prisma.category.findFirst({
    where: {
      householdId: input.householdId,
      type: input.type,
      isArchived: false,
      name: {
        equals: input.name,
        mode: "insensitive"
      }
    }
  });
  if (duplicate) {
    throw conflict("category_duplicate", "A category with this name already exists for this type.");
  }

  const category = await prisma.$transaction(async (tx) => {
    const created = await tx.category.create({
      data: input
    });
    if (input.type === "savings") {
      await tx.savingsGoal.create({
        data: {
          householdId: input.householdId,
          categoryId: created.id,
          targetAmount: 0,
          startingAmount: 0
        }
      });
    }
    return created;
  });
  return toCategory(category);
}

export async function listCategories(input: { householdId: string; type?: RecordType; includeArchived?: boolean }) {
  const categories = await prisma.category.findMany({
    where: {
      householdId: input.householdId,
      type: input.type,
      ...(input.includeArchived ? {} : { isArchived: false })
    },
    orderBy: { name: "asc" }
  });
  return {
    categories: categories.map(toCategory)
  };
}

export async function updateCategory(input: {
  householdId: string;
  categoryId: string;
  name?: string;
  scope?: CategoryScope;
  isArchived?: boolean;
}) {
  const existing = await prisma.category.findFirst({
    where: {
      id: input.categoryId,
      householdId: input.householdId
    }
  });
  if (!existing) {
    throw notFound("Category not found");
  }
  if (input.name && input.name.toLowerCase() !== existing.name.toLowerCase()) {
    const duplicate = await prisma.category.findFirst({
      where: {
        householdId: input.householdId,
        type: existing.type,
        isArchived: false,
        id: { not: input.categoryId },
        name: {
          equals: input.name,
          mode: "insensitive"
        }
      }
    });
    if (duplicate) {
      throw conflict("category_duplicate", "A category with this name already exists for this type.");
    }
  }

  const updated = await prisma.category.update({
    where: { id: input.categoryId },
    data: {
      name: input.name,
      scope: input.scope,
      isArchived: input.isArchived
    }
  });
  return toCategory(updated);
}

export async function deleteCategory(input: { householdId: string; categoryId: string }) {
  const category = await prisma.category.findFirst({
    where: {
      id: input.categoryId,
      householdId: input.householdId
    }
  });
  if (!category) {
    throw notFound("Category not found");
  }
  const linkedTransactions = await prisma.transaction.count({
    where: {
      householdId: input.householdId,
      categoryId: input.categoryId
    }
  });
  if (linkedTransactions > 0) {
    throw conflict("category_in_use", "Archive or rename this category before deleting it.");
  }

  await prisma.$transaction(async (tx) => {
    if (category.type === "savings") {
      await tx.savingsGoal.deleteMany({ where: { categoryId: input.categoryId } });
    }
    await tx.categoryBudget.deleteMany({ where: { categoryId: input.categoryId } });
    await tx.category.delete({ where: { id: input.categoryId } });
  });
  return { ok: true };
}
