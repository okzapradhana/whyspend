import type { FastifyInstance } from "fastify";
import { householdCreateSchema, householdInvitationAcceptSchema, householdInvitationCreateSchema } from "../shared/schemas.js";
import { requireAuth, requireHouseholdAccess } from "../auth/authMiddleware.js";
import { acceptHouseholdInvitation, createHousehold, createHouseholdInvitation, getHouseholdDetails } from "./householdService.js";

export async function householdRoutes(app: FastifyInstance) {
  app.post("/households", { preHandler: requireAuth }, async (request) => {
    const body = householdCreateSchema.parse(request.body);
    return createHousehold({ name: body.name, ownerUserId: request.auth.subjectUserId });
  });

  app.get<{ Params: { householdId: string } }>(
    "/households/:householdId",
    { preHandler: requireHouseholdAccess },
    async (request) => getHouseholdDetails({ householdId: request.params.householdId })
  );

  app.post<{ Params: { householdId: string } }>(
    "/households/:householdId/invitations",
    { preHandler: requireHouseholdAccess },
    async (request) => {
      const body = householdInvitationCreateSchema.parse(request.body);
      return createHouseholdInvitation({
        householdId: request.params.householdId,
        invitedByUserId: request.auth.subjectUserId,
        email: body.email,
        baseUrl: request.headers.origin ?? process.env.APP_BASE_URL
      });
    }
  );

  app.post(
    "/households/invitations/accept",
    { preHandler: requireAuth },
    async (request) => {
      const body = householdInvitationAcceptSchema.parse(request.body);
      return acceptHouseholdInvitation({
        token: body.token,
        userId: request.auth.subjectUserId
      });
    }
  );
}
