import type { FastifyReply } from "fastify";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
  }
}

export function notFound(message = "Resource not found") {
  return new ApiError(404, "not_found", message);
}

export function badRequest(message: string, fields?: Record<string, string>) {
  return new ApiError(400, "bad_request", message, fields);
}

export function conflict(code: string, message: string) {
  return new ApiError(409, code, message);
}

export function unauthenticated() {
  return new ApiError(401, "unauthenticated", "Sign in to continue.");
}

export function forbidden() {
  return new ApiError(403, "forbidden", "You do not have access to this household.");
}

export function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
      fields: error.fields
    });
  }

  return reply.status(500).send({
    error: "internal_error",
    message: "Something went wrong."
  });
}
