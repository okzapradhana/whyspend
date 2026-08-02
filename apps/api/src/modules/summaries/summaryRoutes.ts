import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireHouseholdAccess } from "../auth/authMiddleware.js";
import { incomeExpenseHistoryQuerySchema, monthSchema } from "../shared/schemas.js";
import { getIncomeExpenseHistory, getMonthlySummary } from "./summaryService.js";

const summaryQuerySchema = z.object({
  month: monthSchema
});

export async function summaryRoutes(app: FastifyInstance) {
  app.get<{ Params: { householdId: string } }>(
    "/households/:householdId/summaries/monthly",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const query = summaryQuerySchema.parse(request.query);
      return getMonthlySummary({
        householdId: request.params.householdId,
        month: query.month
      });
    }
  );

  app.get<{ Params: { householdId: string } }>(
    "/households/:householdId/summaries/income-expenses-history",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const query = incomeExpenseHistoryQuerySchema.parse(request.query);
      return getIncomeExpenseHistory({
        householdId: request.params.householdId,
        fromMonth: query.fromMonth,
        toMonth: query.toMonth
      });
    }
  );
}
