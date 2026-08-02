import { apiRequest } from "./client";
import type { Household, User } from "./types";

interface AuthResponse {
  token: string;
  user: User;
}

export function register(input: { email: string; password: string; displayName: string }) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function login(input: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function logout() {
  return apiRequest<{ ok: true }>("/auth/logout", { method: "POST" });
}

export function me() {
  return apiRequest<{ user: User; households: Household[] }>("/auth/me");
}
