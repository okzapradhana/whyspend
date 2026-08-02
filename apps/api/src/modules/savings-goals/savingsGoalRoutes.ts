import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireHouseholdAccess } from "../auth/authMiddleware.js";
import { idSchema, savingsGoalCreateSchema, savingsGoalUpdateSchema } from "../shared/schemas.js";
import {
  createSavingsGoal,
  deleteSavingsGoal,
  listSavingsGoals,
  updateSavingsGoal
} from "./savingsGoalService.js";

const goalParamsSchema = z.object({
  householdId: idSchema,
  goalId: idSchema
});

export async function savingsGoalRoutes(app: FastifyInstance) {
  app.get<{ Params: { householdId: string } }>(
    "/households/:householdId/savings-goals",
    { preHandler: requireHouseholdAccess },
    async (request) => listSavingsGoals({ householdId: request.params.householdId })
  );

  app.post<{ Params: { householdId: string } }>(
    "/households/:householdId/savings-goals",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const body = savingsGoalCreateSchema.parse(request.body);
      return createSavingsGoal({
        householdId: request.params.householdId,
        userId: request.auth.subjectUserId,
        ...body
      });
    }
  );

  app.patch<{ Params: { householdId: string; goalId: string } }>(
    "/households/:householdId/savings-goals/:goalId",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const params = goalParamsSchema.parse(request.params);
      const body = savingsGoalUpdateSchema.parse(request.body);
      return updateSavingsGoal({
        householdId: params.householdId,
        goalId: params.goalId,
        ...body
      });
    }
  );

  app.delete<{ Params: { householdId: string; goalId: string } }>(
    "/households/:householdId/savings-goals/:goalId",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const params = goalParamsSchema.parse(request.params);
      return deleteSavingsGoal({
        householdId: params.householdId,
        goalId: params.goalId
      });
    }
  );
}
