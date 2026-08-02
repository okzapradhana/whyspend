import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";
import { authRoutes } from "../modules/auth/authRoutes.js";
import { registerAuthDecorators } from "../modules/auth/authMiddleware.js";
import { budgetRoutes } from "../modules/budgets/budgetRoutes.js";
import { categoryRoutes } from "../modules/categories/categoryRoutes.js";
import { householdRoutes } from "../modules/households/householdRoutes.js";
import { savingsGoalRoutes } from "../modules/savings-goals/savingsGoalRoutes.js";
import { summaryRoutes } from "../modules/summaries/summaryRoutes.js";
import { transactionRoutes } from "../modules/transactions/transactionRoutes.js";
import { badRequest, sendError } from "./http.js";

export function buildServer() {
  const app = Fastify({ logger: true });

  registerAuthDecorators(app);

  app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: true
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      const fields = Object.fromEntries(error.issues.map((issue) => [issue.path.join("."), issue.message]));
      return sendError(reply, badRequest("Check the highlighted fields.", fields));
    }
    return sendError(reply, error);
  });

  app.get("/health", async () => ({ ok: true }));
  app.register(authRoutes, { prefix: "/api" });
  app.register(householdRoutes, { prefix: "/api" });
  app.register(budgetRoutes, { prefix: "/api" });
  app.register(categoryRoutes, { prefix: "/api" });
  app.register(transactionRoutes, { prefix: "/api" });
  app.register(summaryRoutes, { prefix: "/api" });
  app.register(savingsGoalRoutes, { prefix: "/api" });

  return app;
}
