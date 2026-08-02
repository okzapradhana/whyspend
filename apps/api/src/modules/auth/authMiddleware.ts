import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../db/prisma.js";
import { forbidden, unauthenticated } from "../../server/http.js";
import { verifyAccessToken, type AuthClaims } from "./jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    auth: AuthClaims;
  }
}

export function registerAuthDecorators(app: FastifyInstance) {
  app.decorateRequest("auth", undefined as unknown as AuthClaims);
}

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw unauthenticated();
  }
  try {
    request.auth = await verifyAccessToken(header.slice("Bearer ".length));
  } catch {
    throw unauthenticated();
  }
}

export async function requireHouseholdAccess(request: FastifyRequest<{ Params: { householdId: string } }>) {
  await requireAuth(request, {} as FastifyReply);
  const membership = await prisma.householdMember.findFirst({
    where: {
      householdId: request.params.householdId,
      userId: request.auth.subjectUserId
    },
    select: { id: true }
  });
  const authorized = Boolean(membership);
  if (!authorized) {
    throw forbidden();
  }
}
