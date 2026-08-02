import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireHouseholdAccess } from "../auth/authMiddleware.js";
import { categoryCreateSchema, categoryUpdateSchema, recordTypeSchema } from "../shared/schemas.js";
import { createCategory, deleteCategory, listCategories, updateCategory } from "./categoryService.js";

const listQuerySchema = z.object({
  type: recordTypeSchema.optional(),
  includeArchived: z.coerce.boolean().optional()
});

export async function categoryRoutes(app: FastifyInstance) {
  app.get<{ Params: { householdId: string } }>(
    "/households/:householdId/categories",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const query = listQuerySchema.parse(request.query);
      return listCategories({
        householdId: request.params.householdId,
        type: query.type,
        includeArchived: query.includeArchived
      });
    }
  );

  app.post<{ Params: { householdId: string } }>(
    "/households/:householdId/categories",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const body = categoryCreateSchema.parse(request.body);
      return createCategory({
        householdId: request.params.householdId,
        createdByUserId: request.auth.subjectUserId,
        ...body
      });
    }
  );

  app.patch<{ Params: { householdId: string; categoryId: string } }>(
    "/households/:householdId/categories/:categoryId",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const body = categoryUpdateSchema.parse(request.body);
      return updateCategory({
        householdId: request.params.householdId,
        categoryId: request.params.categoryId,
        ...body
      });
    }
  );

  app.delete<{ Params: { householdId: string; categoryId: string } }>(
    "/households/:householdId/categories/:categoryId",
    { preHandler: requireHouseholdAccess },
    async (request) => deleteCategory(request.params)
  );
}
