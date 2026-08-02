import { supabase } from "../supabaseClient";
import type { Household, HouseholdInvitation } from "./types";

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", scope: "both" },
  { name: "Freelance", scope: "member" },
  { name: "Bonus", scope: "member" },
  { name: "Other Income", scope: "both" }
] as const;

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Subscription", scope: "member" },
  { name: "Entertainment", scope: "member" },
  { name: "Sedekah", scope: "member" },
  { name: "Paket data", scope: "member" },
  { name: "Transport (member parking)", scope: "member" },
  { name: "Transport (e-money)", scope: "member" },
  { name: "Transport (bensin)", scope: "member" },
  { name: "Skincare", scope: "member" },
  { name: "Shopping", scope: "member" },
  { name: "Treats", scope: "member" },
  { name: "Holiday", scope: "member" },
  { name: "Gift", scope: "member" },
  { name: "Family needs", scope: "member" },
  { name: "Others", scope: "member" },
  { name: "Health", scope: "member" },
  { name: "Kebutuhan Dapur", scope: "both" },
  { name: "Household", scope: "both" },
  { name: "Sport", scope: "member" },
  { name: "WiFi", scope: "both" },
  { name: "Electricity", scope: "both" },
  { name: "Home Maintenance", scope: "both" },
  { name: "Gas & Air", scope: "both" }
] as const;

const DEFAULT_SAVINGS_GOALS = [
  { name: "Emergency Fund", targetAmount: 50_000_000, startingAmount: 10_000_000, targetDate: "2024-12-31" },
  { name: "Japan Trip 2026", targetAmount: 45_000_000, startingAmount: 15_000_000, targetDate: "2026-08-31" },
  { name: "DP Rumah", targetAmount: 100_000_000, startingAmount: 25_000_000, targetDate: "2026-06-30" },
  { name: "New Handphone", targetAmount: 15_000_000, startingAmount: 5_000_000, targetDate: "2024-10-31" }
] as const;

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export class HouseholdInvitationExpiredError extends Error {
  readonly code = "INVITATION_EXPIRED";

  constructor() {
    super("Invitation has expired.");
    this.name = "HouseholdInvitationExpiredError";
  }
}

export function isHouseholdInvitationExpiredError(error: unknown): error is HouseholdInvitationExpiredError {
  return error instanceof HouseholdInvitationExpiredError || (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "INVITATION_EXPIRED"
  );
}

function generateToken(): string {
  const arr = new Uint8Array(24);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createHousehold(input: { name: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const now = new Date().toISOString();
  const householdId = window.crypto.randomUUID();

  // Create household
  const { data: hh, error: hhErr } = await supabase
    .from("Household")
    .insert({
      id: householdId,
      name: input.name,
      updatedAt: now
    })
    .select()
    .single();

  if (hhErr) throw hhErr;

  // Add owner member
  const { error: memErr } = await supabase
    .from("HouseholdMember")
    .insert({
      id: window.crypto.randomUUID(),
      householdId: hh.id,
      userId: user.id,
      role: "owner"
    });

  if (memErr) throw memErr;

  // Create default categories
  const categoriesToInsert = [
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
      id: window.crypto.randomUUID(),
      householdId: hh.id,
      name: c.name,
      type: "income",
      scope: c.scope,
      createdByUserId: user.id,
      updatedAt: now
    })),
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
      id: window.crypto.randomUUID(),
      householdId: hh.id,
      name: c.name,
      type: "expense",
      scope: c.scope,
      createdByUserId: user.id,
      updatedAt: now
    })),
    ...DEFAULT_SAVINGS_GOALS.map((g) => ({
      id: window.crypto.randomUUID(),
      householdId: hh.id,
      name: g.name,
      type: "savings",
      scope: "both",
      createdByUserId: user.id,
      updatedAt: now
    }))
  ];

  const { data: insertedCats, error: catErr } = await supabase
    .from("Category")
    .insert(categoriesToInsert)
    .select();

  if (catErr) throw catErr;

  // Create savings goals for the savings categories
  const savingsCats = (insertedCats || []).filter((c: any) => c.type === "savings");
  const goalsToInsert = savingsCats.map((cat: any) => {
    const match = DEFAULT_SAVINGS_GOALS.find((g) => g.name === cat.name)!;
    return {
      id: window.crypto.randomUUID(),
      householdId: hh.id,
      categoryId: cat.id,
      targetAmount: match.targetAmount,
      startingAmount: match.startingAmount,
      targetDate: new Date(match.targetDate).toISOString(),
      updatedAt: now
    };
  });

  const { error: goalErr } = await supabase
    .from("SavingsGoal")
    .insert(goalsToInsert);

  if (goalErr) throw goalErr;

  return {
    id: hh.id,
    name: hh.name,
    createdAt: hh.createdAt,
    updatedAt: hh.updatedAt
  } as Household;
}

export async function getHousehold(householdId: string) {
  const { data: hh, error: hhErr } = await supabase
    .from("Household")
    .select(`
      id,
      name,
      members:HouseholdMember (
        userId,
        role,
        user:User (
          displayName
        )
      ),
      invitations:HouseholdInvitation (
        id,
        householdId,
        email,
        token,
        status,
        invitedByUserId,
        acceptedByUserId,
        expiresAt,
        acceptedAt,
        createdAt,
        updatedAt
      )
    `)
    .eq("id", householdId)
    .single();

  if (hhErr) throw hhErr;
  if (!hh) throw new Error("Household not found");

  const pendingInvitations = (hh.invitations || [])
    .filter((inv: any) => inv.status === "pending")
    .map((inv: any) => ({
      id: inv.id,
      householdId: inv.householdId,
      email: inv.email,
      token: inv.token,
      status: inv.status,
      invitedByUserId: inv.invitedByUserId,
      acceptedByUserId: inv.acceptedByUserId,
      expiresAt: inv.expiresAt,
      acceptedAt: inv.acceptedAt,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      inviteUrl: `${window.location.origin}/invite/${inv.token}`
    }));

  const members = (hh.members || []).map((m: any) => ({
    userId: m.userId,
    displayName: m.user?.displayName || "",
    role: m.role
  }));

  return {
    id: hh.id,
    name: hh.name,
    members,
    invitations: pendingInvitations
  } as Household;
}

export async function createHouseholdInvitation(householdId: string, input: { email: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { data: membership, error: memErr } = await supabase
    .from("HouseholdMember")
    .select("role")
    .eq("householdId", householdId)
    .eq("userId", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (memErr) throw memErr;
  if (!membership) throw new Error("Only a household owner can invite a spouse.");

  const { data: targetUser, error: userErr } = await supabase
    .from("User")
    .select("id")
    .eq("email", input.email)
    .maybeSingle();

  if (userErr) throw userErr;

  if (targetUser) {
    const { data: existingMember, error: existMemberErr } = await supabase
      .from("HouseholdMember")
      .select("id")
      .eq("householdId", householdId)
      .eq("userId", targetUser.id)
      .maybeSingle();

    if (existMemberErr) throw existMemberErr;
    if (existingMember) {
      throw new Error("This user is already part of the household.");
    }
  }

  const { data: existingInvite, error: inviteErr } = await supabase
    .from("HouseholdInvitation")
    .select("*")
    .eq("householdId", householdId)
    .eq("email", input.email)
    .eq("status", "pending")
    .gt("expiresAt", new Date().toISOString())
    .maybeSingle();

  if (inviteErr) throw inviteErr;

  if (existingInvite) {
    return {
      id: existingInvite.id,
      householdId: existingInvite.householdId,
      email: existingInvite.email,
      token: existingInvite.token,
      status: existingInvite.status,
      invitedByUserId: existingInvite.invitedByUserId,
      acceptedByUserId: existingInvite.acceptedByUserId,
      expiresAt: existingInvite.expiresAt,
      acceptedAt: existingInvite.acceptedAt,
      createdAt: existingInvite.createdAt,
      updatedAt: existingInvite.updatedAt,
      inviteUrl: `${window.location.origin}/invite/${existingInvite.token}`
    } as HouseholdInvitation;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITATION_LIFETIME_MS).toISOString();

  const { data: invitation, error: createInviteErr } = await supabase
    .from("HouseholdInvitation")
    .insert({
      id: window.crypto.randomUUID(),
      householdId,
      email: input.email,
      token,
      invitedByUserId: user.id,
      expiresAt,
      updatedAt: new Date().toISOString()
    })
    .select()
    .single();

  if (createInviteErr) throw createInviteErr;

  return {
    id: invitation.id,
    householdId: invitation.householdId,
    email: invitation.email,
    token: invitation.token,
    status: invitation.status,
    invitedByUserId: invitation.invitedByUserId,
    acceptedByUserId: invitation.acceptedByUserId,
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
    inviteUrl: `${window.location.origin}/invite/${invitation.token}`
  } as HouseholdInvitation;
}

export async function acceptHouseholdInvitation(token: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { data: invitation, error: inviteErr } = await supabase
    .from("HouseholdInvitation")
    .select(`
      *,
      household:Household (
        id,
        name
      )
    `)
    .eq("token", token)
    .single();

  if (inviteErr) throw inviteErr;
  if (!invitation) throw new Error("Invitation is no longer available.");

  if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error("Sign in with the invited email address to join this household.");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation is no longer available.");
  }

  if (new Date(invitation.expiresAt) <= new Date()) {
    throw new HouseholdInvitationExpiredError();
  }

  const { error: memberUpsertErr } = await supabase
    .from("HouseholdMember")
    .upsert({
      id: window.crypto.randomUUID(),
      householdId: invitation.householdId,
      userId: user.id,
      role: "member"
    }, {
      onConflict: "householdId,userId"
    });

  if (memberUpsertErr) throw memberUpsertErr;

  const { error: updateInviteErr } = await supabase
    .from("HouseholdInvitation")
    .update({
      status: "accepted",
      acceptedAt: new Date().toISOString(),
      acceptedByUserId: user.id
    })
    .eq("id", invitation.id);

  if (updateInviteErr) throw updateInviteErr;

  return {
    household: {
      id: invitation.household.id,
      name: invitation.household.name
    }
  };
}

export async function refreshHouseholdInvitation(token: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { data: invitation, error: inviteErr } = await supabase
    .from("HouseholdInvitation")
    .select("*")
    .eq("token", token)
    .single();

  if (inviteErr) throw inviteErr;
  if (!invitation) throw new Error("Invitation is no longer available.");

  if (!user.email || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error("Sign in with the invited email address to refresh this invitation.");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation is no longer available.");
  }

  if (new Date(invitation.expiresAt) > new Date()) {
    throw new Error("Invitation has not expired.");
  }

  const refreshedToken = generateToken();
  const expiresAt = new Date(Date.now() + INVITATION_LIFETIME_MS).toISOString();
  const updatedAt = new Date().toISOString();

  const { data: refreshedInvitation, error: refreshErr } = await supabase
    .from("HouseholdInvitation")
    .update({
      token: refreshedToken,
      expiresAt,
      updatedAt
    })
    .eq("id", invitation.id)
    .eq("token", invitation.token)
    .eq("householdId", invitation.householdId)
    .eq("email", invitation.email)
    .eq("status", "pending")
    .eq("invitedByUserId", invitation.invitedByUserId)
    .is("acceptedByUserId", null)
    .is("acceptedAt", null)
    .select()
    .maybeSingle();

  if (refreshErr) throw refreshErr;
  if (!refreshedInvitation) throw new Error("Invitation could not be refreshed.");

  return {
    id: refreshedInvitation.id,
    householdId: refreshedInvitation.householdId,
    email: refreshedInvitation.email,
    token: refreshedInvitation.token,
    status: refreshedInvitation.status,
    invitedByUserId: refreshedInvitation.invitedByUserId,
    acceptedByUserId: refreshedInvitation.acceptedByUserId,
    expiresAt: refreshedInvitation.expiresAt,
    acceptedAt: refreshedInvitation.acceptedAt,
    createdAt: refreshedInvitation.createdAt,
    updatedAt: refreshedInvitation.updatedAt,
    inviteUrl: `${window.location.origin}/invite/${refreshedInvitation.token}`
  } as HouseholdInvitation;
}
