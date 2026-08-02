import { prisma } from "../../db/prisma.js";
import { ApiError, unauthenticated } from "../../server/http.js";
import { toPublicUser } from "../shared/serializers.js";
import { signAccessToken } from "./jwt.js";
import { hashPassword, verifyPassword } from "./password.js";

export async function registerUser(input: { email: string; password: string; displayName: string }) {
  const password = await hashPassword(input.password);
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(409, "email_exists", "This email cannot be used.");
  }
  const user = await prisma.user.create({
    data: {
      email: input.email,
      displayName: input.displayName,
      password
    }
  });
  const households = await prisma.householdMember.findMany({
    where: { userId: user.id },
    include: { household: true }
  });
  const token = await signAccessToken({
    subjectUserId: user.id,
    householdIds: households.map((membership) => membership.household.id)
  });
  return { token, user: toPublicUser(user) };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await verifyPassword(input.password, user.password))) {
    throw unauthenticated();
  }
  const households = await prisma.householdMember.findMany({
    where: { userId: user.id },
    include: { household: true }
  });
  const token = await signAccessToken({
    subjectUserId: user.id,
    householdIds: households.map((membership) => membership.household.id)
  });
  return { token, user: toPublicUser(user) };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          household: true
        }
      }
    }
  });
  if (!user) {
    throw new ApiError(401, "unauthenticated", "Sign in to continue.");
  }
  return {
    user: toPublicUser(user),
    households: user.memberships.map(({ household, role }) => ({ id: household.id, name: household.name, role }))
  };
}
