import { randomBytes } from "node:crypto";
import { prisma } from "../../db/prisma.js";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_SAVINGS_GOALS } from "../../db/defaults.js";
import { conflict, notFound } from "../../server/http.js";
import { toHousehold, toInvitation } from "../shared/serializers.js";

export async function createHousehold(input: { name: string; ownerUserId: string }) {
  const created = await prisma.$transaction(async (tx) => {
    const household = await tx.household.create({
      data: {
        name: input.name,
        members: {
          create: {
            userId: input.ownerUserId,
            role: "owner"
          }
        }
      }
    });

    await tx.category.createMany({
      data: [
        ...DEFAULT_INCOME_CATEGORIES.map((category) => ({
          householdId: household.id,
          name: category.name,
          type: "income" as const,
          scope: category.scope,
          createdByUserId: input.ownerUserId
        })),
        ...DEFAULT_EXPENSE_CATEGORIES.map((category) => ({
          householdId: household.id,
          name: category.name,
          type: "expense" as const,
          scope: category.scope,
          createdByUserId: input.ownerUserId
        })),
        ...DEFAULT_SAVINGS_GOALS.map((goal) => ({
          householdId: household.id,
          name: goal.name,
          type: "savings" as const,
          scope: "both" as const,
          createdByUserId: input.ownerUserId
        }))
      ]
    });

    const savingsCategories = await tx.category.findMany({
      where: {
        householdId: household.id,
        type: "savings"
      }
    });

    await tx.savingsGoal.createMany({
      data: savingsCategories.map((category) => {
        const match = DEFAULT_SAVINGS_GOALS.find((goal) => goal.name === category.name)!;
        return {
          householdId: household.id,
          categoryId: category.id,
          targetAmount: match.targetAmount,
          startingAmount: match.startingAmount,
          targetDate: new Date(match.targetDate)
        };
      })
    });

    return household;
  });

  return toHousehold(created);
}

export async function getHouseholdDetails(input: { householdId: string }) {
  const household = await prisma.household.findUnique({
    where: { id: input.householdId },
    include: {
      members: {
        include: {
          user: true
        }
      },
      invitations: {
        where: { status: "pending" },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!household) {
    throw notFound("Household not found");
  }
  return {
    id: household.id,
    name: household.name,
    members: household.members.map((member) => ({
      userId: member.userId,
      displayName: member.user.displayName,
      role: member.role
    })),
    invitations: household.invitations.map((invitation) => ({
      ...toInvitation(invitation),
      inviteUrl: `/invite/${invitation.token}`
    }))
  };
}

export async function createHouseholdInvitation(input: {
  householdId: string;
  invitedByUserId: string;
  email: string;
  baseUrl?: string;
}) {
  const membership = await prisma.householdMember.findFirst({
    where: {
      householdId: input.householdId,
      userId: input.invitedByUserId,
      role: "owner"
    }
  });
  if (!membership) {
    throw notFound("Only a household owner can invite a spouse.");
  }

  const existingMember = await prisma.householdMember.findFirst({
    where: {
      householdId: input.householdId,
      user: {
        email: input.email
      }
    }
  });
  if (existingMember) {
    throw conflict("invite_exists", "This user is already part of the household.");
  }

  const existingInvite = await prisma.householdInvitation.findFirst({
    where: {
      householdId: input.householdId,
      email: input.email,
      status: "pending",
      expiresAt: { gt: new Date() }
    }
  });
  if (existingInvite) {
    return {
      ...toInvitation(existingInvite),
      inviteUrl: `${input.baseUrl ?? "http://127.0.0.1:4173"}/invite/${existingInvite.token}`
    };
  }

  const invitation = await prisma.householdInvitation.create({
    data: {
      householdId: input.householdId,
      email: input.email,
      token: randomBytes(24).toString("hex"),
      invitedByUserId: input.invitedByUserId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return {
    ...toInvitation(invitation),
    inviteUrl: `${input.baseUrl ?? "http://127.0.0.1:4173"}/invite/${invitation.token}`
  };
}

export async function acceptHouseholdInvitation(input: { token: string; userId: string }) {
  const invitation = await prisma.householdInvitation.findUnique({
    where: { token: input.token },
    include: {
      household: true,
      invitedByUser: true
    }
  });
  if (!invitation || invitation.status !== "pending" || invitation.expiresAt <= new Date()) {
    throw notFound("Invitation is no longer available.");
  }

  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw conflict("invite_email_mismatch", "Sign in with the invited email address to join this household.");
  }

  const accepted = await prisma.$transaction(async (tx) => {
    await tx.householdMember.upsert({
      where: {
        householdId_userId: {
          householdId: invitation.householdId,
          userId: input.userId
        }
      },
      update: {},
      create: {
        householdId: invitation.householdId,
        userId: input.userId,
        role: "member"
      }
    });

    return tx.householdInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "accepted",
        acceptedAt: new Date(),
        acceptedByUserId: input.userId
      }
    });
  });

  return {
    ...toInvitation(accepted),
    household: {
      id: invitation.household.id,
      name: invitation.household.name
    }
  };
}
