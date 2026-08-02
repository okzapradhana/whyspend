import { beforeEach } from "vitest";
import { prisma } from "../src/db/prisma.js";

beforeEach(async () => {
  if (process.env.SKIP_DB_TESTS === "1") {
    return;
  }
  await prisma.householdInvitation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.categoryBudget.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.householdMember.deleteMany();
  await prisma.household.deleteMany();
  await prisma.user.deleteMany();
});

export async function createSession(app: { inject: (options: unknown) => Promise<{ json: () => any }> }) {
  const registered = await app.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: { email: "owner@example.com", password: "password123", displayName: "Owner" }
  });
  const auth = registered.json();
  const householdResponse = await app.inject({
    method: "POST",
    url: "/api/households",
    headers: { authorization: `Bearer ${auth.token}` },
    payload: { name: "Home" }
  });
  return {
    token: auth.token,
    user: auth.user,
    household: householdResponse.json()
  };
}
