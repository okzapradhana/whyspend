import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireHouseholdAccess } from "../auth/authMiddleware.js";
import {
  monthSchema,
  recordTypeSchema,
  transactionCreateSchema,
  transactionUpdateSchema
} from "../shared/schemas.js";
import { createTransaction, deleteTransaction, listTransactions, updateTransaction } from "./transactionService.js";

const listQuerySchema = z.object({
  month: monthSchema,
  type: recordTypeSchema.optional(),
  ownerUserId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional()
});

export async function transactionRoutes(app: FastifyInstance) {
  app.get<{ Params: { householdId: string } }>(
    "/households/:householdId/transactions",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const query = listQuerySchema.parse(request.query);
      return listTransactions({
        householdId: request.params.householdId,
        ...query
      });
    }
  );

  app.post<{ Params: { householdId: string } }>(
    "/households/:householdId/transactions",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const body = transactionCreateSchema.parse(request.body);
      return createTransaction({
        householdId: request.params.householdId,
        createdByUserId: request.auth.subjectUserId,
        ...body
      });
    }
  );

  app.patch<{ Params: { householdId: string; transactionId: string } }>(
    "/households/:householdId/transactions/:transactionId",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const body = transactionUpdateSchema.parse(request.body);
      return updateTransaction({
        householdId: request.params.householdId,
        transactionId: request.params.transactionId,
        updatedByUserId: request.auth.subjectUserId,
        ...body
      });
    }
  );

  app.delete<{ Params: { householdId: string; transactionId: string } }>(
    "/households/:householdId/transactions/:transactionId",
    { preHandler: requireHouseholdAccess },
    async (request) => deleteTransaction(request.params)
  );
}
