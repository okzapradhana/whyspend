import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireHouseholdAccess } from "../auth/authMiddleware.js";
import {
  categoryBudgetDeleteQuerySchema,
  categoryBudgetListQuerySchema,
  categoryBudgetUpsertSchema,
  idSchema
} from "../shared/schemas.js";
import { deleteCategoryBudget, listCategoryBudgets, upsertCategoryBudget } from "./budgetService.js";

const budgetParamsSchema = z.object({
  householdId: idSchema,
  categoryId: idSchema
});

export async function budgetRoutes(app: FastifyInstance) {
  app.get<{ Params: { householdId: string } }>(
    "/households/:householdId/budgets/category",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const query = categoryBudgetListQuerySchema.parse(request.query);
      return listCategoryBudgets({
        householdId: request.params.householdId,
        month: query.month,
        includeInherited: query.includeInherited
      });
    }
  );

  app.put<{ Params: { householdId: string; categoryId: string } }>(
    "/households/:householdId/budgets/category/:categoryId",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const params = budgetParamsSchema.parse(request.params);
      const body = categoryBudgetUpsertSchema.parse(request.body);
      return upsertCategoryBudget({
        householdId: params.householdId,
        categoryId: params.categoryId,
        month: body.month,
        amount: body.amount,
        userId: request.auth.subjectUserId
      });
    }
  );

  app.delete<{ Params: { householdId: string; categoryId: string } }>(
    "/households/:householdId/budgets/category/:categoryId",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const params = budgetParamsSchema.parse(request.params);
      const query = categoryBudgetDeleteQuerySchema.parse(request.query);
      return deleteCategoryBudget({
        householdId: params.householdId,
        categoryId: params.categoryId,
        month: query.month
      });
    }
  );
}
