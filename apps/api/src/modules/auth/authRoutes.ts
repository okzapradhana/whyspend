import type { FastifyInstance } from "fastify";
import { loginSchema, registerSchema } from "../shared/schemas.js";
import { getCurrentUser, loginUser, registerUser } from "./authService.js";
import { requireAuth } from "./authMiddleware.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request) => {
    const body = registerSchema.parse(request.body);
    return registerUser(body);
  });

  app.post("/auth/login", async (request) => {
    const body = loginSchema.parse(request.body);
    return loginUser(body);
  });

  app.post("/auth/logout", async () => ({ ok: true }));

  app.get("/auth/me", { preHandler: requireAuth }, async (request) => getCurrentUser(request.auth.subjectUserId));
}
