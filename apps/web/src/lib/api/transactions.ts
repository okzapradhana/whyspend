import { supabase } from "../supabaseClient";
import type { RecordScope, RecordType, Transaction } from "./types";

export interface TransactionInput {
  type: RecordType;
  amount: number;
  occurredOn: string;
  categoryId: string;
  ownerUserId: string;
  scope: RecordScope;
  note?: string | null;
}

const OWNER_FALLBACK_DISPLAY_NAME = "Member";

function normalizeTransaction(raw: any, ownerMap: Map<string, string>): Transaction {
  const displayName = ownerMap.get(raw.ownerUserId) ?? raw.owner?.displayName ?? OWNER_FALLBACK_DISPLAY_NAME;
  const owner = {
    userId: raw.ownerUserId,
    displayName
  };
  const category = raw.category ?? { id: raw.categoryId, name: "Category", type: raw.type as RecordType };
  return {
    ...raw,
    occurredOn: typeof raw.occurredOn === "string" ? raw.occurredOn.slice(0, 10) : raw.occurredOn,
    owner,
    category
  } as Transaction;
}

class HouseholdMemberIdentityUnavailableError extends Error {
  constructor(cause: string) {
    super(`household_member_identity lookup failed: ${cause} — ensure migration 20260829000000_household_member_identity is applied and grants allow household-member reads`);
    this.name = "HouseholdMemberIdentityUnavailableError";
  }
}

async function fetchOwnerDisplayNames(householdId: string, ownerUserIds: string[]): Promise<Map<string, string>> {
  if (!ownerUserIds.length) return new Map();
  const unique = [...new Set(ownerUserIds)];
  const { data, error } = await supabase
    .from("household_member_identity")
    .select("userId, displayName")
    .eq("householdId", householdId)
    .in("userId", unique);
  if (error) {
    // Fail fast: do not silently hide spouse name behind Member fallback
    throw new HouseholdMemberIdentityUnavailableError(`${error.message} (code=${(error as any).code ?? "unknown"})`);
  }
  if (!data) return new Map();
  return new Map((data as Array<{ userId: string; displayName: string }>).map((r) => [r.userId, r.displayName]));
}

export async function listTransactions(
  householdId: string,
  options: { month: string; type?: RecordType; ownerUserId?: string; categoryId?: string }
) {
  let query = supabase
    .from("Transaction")
    .select(`
      id,
      householdId,
      ownerUserId,
      categoryId,
      type,
      amount,
      occurredOn,
      month,
      scope,
      note,
      createdAt,
      owner:User!Transaction_ownerUserId_fkey (
        userId:id,
        displayName
      ),
      category:Category!Transaction_categoryId_fkey (
        id,
        name,
        type
      )
    `)
    .eq("householdId", householdId)
    .eq("month", options.month);

  if (options.type) {
    query = query.eq("type", options.type);
  }
  if (options.ownerUserId) {
    query = query.eq("ownerUserId", options.ownerUserId);
  }
  if (options.categoryId) {
    query = query.eq("categoryId", options.categoryId);
  }

  const { data, error } = await query.order("occurredOn", { ascending: false }).order("createdAt", { ascending: false });
  if (error) throw error;

  const rows = data || [];
  let ownerMap: Map<string, string>;
  try {
    ownerMap = await fetchOwnerDisplayNames(
      householdId,
      rows.map((r: any) => r.ownerUserId)
    );
  } catch (e) {
    // Controlled error policy: propagate projection contract violation, do not silently render Member
    throw e;
  }
  // Merge fallback only if projection returned no entry but embedded User join had a value
  // (e.g., legacy local dev with projection not yet populated). Projection is authoritative when present.
  for (const row of rows as any[]) {
    if (row.owner?.displayName && !ownerMap.has(row.ownerUserId)) {
      ownerMap.set(row.ownerUserId, row.owner.displayName);
    }
  }

  const formattedTransactions = rows.map((t: any) => normalizeTransaction(t, ownerMap));

  return { transactions: formattedTransactions };
}

export async function createTransaction(householdId: string, input: TransactionInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  // Resolve projection before mutation to avoid duplicate-on-retry after committed write
  let preFetchedOwnerMap: Map<string, string>;
  try {
    preFetchedOwnerMap = await fetchOwnerDisplayNames(householdId, [input.ownerUserId]);
  } catch (e) {
    // Fail before mutation, so no duplicate row is created
    throw e;
  }

  const month = input.occurredOn.slice(0, 7);

  const { data, error } = await supabase
    .from("Transaction")
    .insert({
      id: window.crypto.randomUUID(),
      householdId,
      ownerUserId: input.ownerUserId,
      categoryId: input.categoryId,
      type: input.type,
      scope: input.scope,
      amount: input.amount,
      occurredOn: new Date(input.occurredOn).toISOString(),
      month,
      note: input.note,
      createdByUserId: user.id,
      updatedByUserId: user.id,
      updatedAt: new Date().toISOString()
    })
    .select(`
      id,
      householdId,
      ownerUserId,
      categoryId,
      type,
      amount,
      occurredOn,
      month,
      scope,
      note,
      owner:User!Transaction_ownerUserId_fkey (
        userId:id,
        displayName
      ),
      category:Category!Transaction_categoryId_fkey (
        id,
        name,
        type
      )
    `)
    .single();

  if (error) throw error;

  // Reuse pre-fetched projection; do not re-query after commit to avoid failed post-write lookup being reported as save failure
  const ownerMap = preFetchedOwnerMap;
  // Merge embedded fallback only if projection had no entry
  if ((data as any).owner?.displayName && !ownerMap.has(data.ownerUserId)) {
    ownerMap.set(data.ownerUserId, (data as any).owner.displayName);
  }
  // If committed row's owner not in pre-fetched map (e.g., owner changed server-side), try one safe post-write fetch but do not fail the save
  if (!ownerMap.has(data.ownerUserId) && data.ownerUserId !== input.ownerUserId) {
    try {
      const extra = await fetchOwnerDisplayNames(householdId, [data.ownerUserId]);
      for (const [k, v] of extra) ownerMap.set(k, v);
    } catch {
      // Do not throw after commit; fallback to Member will be used
      console.warn("[transactions] post-write projection lookup failed after commit, using fallback Member");
    }
  }
  return normalizeTransaction(data, ownerMap);
}

export async function updateTransaction(householdId: string, transactionId: string, input: Partial<TransactionInput>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  // If owner is being changed, validate projection before mutation to avoid committed-write-then-failed-lookup
  let preFetchedOwnerMap: Map<string, string> | null = null;
  if (input.ownerUserId) {
    try {
      preFetchedOwnerMap = await fetchOwnerDisplayNames(householdId, [input.ownerUserId]);
    } catch (e) {
      throw e;
    }
  }

  const updatePayload: any = {
    amount: input.amount,
    categoryId: input.categoryId,
    ownerUserId: input.ownerUserId,
    scope: input.scope,
    note: input.note,
    updatedByUserId: user.id,
    updatedAt: new Date().toISOString()
  };

  if (input.occurredOn) {
    updatePayload.occurredOn = new Date(input.occurredOn).toISOString();
    updatePayload.month = input.occurredOn.slice(0, 7);
  }

  const { data, error } = await supabase
    .from("Transaction")
    .update(updatePayload)
    .eq("id", transactionId)
    .eq("householdId", householdId)
    .select(`
      id,
      householdId,
      ownerUserId,
      categoryId,
      type,
      amount,
      occurredOn,
      month,
      scope,
      note,
      owner:User!Transaction_ownerUserId_fkey (
        userId:id,
        displayName
      ),
      category:Category!Transaction_categoryId_fkey (
        id,
        name,
        type
      )
    `)
    .single();

  if (error) throw error;

  // Reuse pre-fetched if owner was changed, otherwise fetch post-write but do not fail save on projection error
  let ownerMap2: Map<string, string>;
  if (preFetchedOwnerMap && preFetchedOwnerMap.has(data.ownerUserId)) {
    ownerMap2 = preFetchedOwnerMap;
  } else if (preFetchedOwnerMap) {
    // owner changed but post-write owner differs (edge); try to augment without failing save
    ownerMap2 = preFetchedOwnerMap;
    try {
      const extra = await fetchOwnerDisplayNames(householdId, [data.ownerUserId]);
      for (const [k, v] of extra) ownerMap2.set(k, v);
    } catch {
      console.warn("[transactions] post-write projection lookup failed after commit, using fallback");
    }
  } else {
    try {
      ownerMap2 = await fetchOwnerDisplayNames(householdId, [data.ownerUserId]);
    } catch {
      // Update already committed; do not report as save failure to avoid duplicate-on-retry
      console.warn("[transactions] post-write projection lookup failed after commit, using fallback Member");
      ownerMap2 = new Map();
    }
  }
  if ((data as any).owner?.displayName && !ownerMap2.has(data.ownerUserId)) {
    ownerMap2.set(data.ownerUserId, (data as any).owner.displayName);
  }
  return normalizeTransaction(data, ownerMap2);
}

export async function deleteTransaction(householdId: string, transactionId: string) {
  const { error } = await supabase
    .from("Transaction")
    .delete()
    .eq("id", transactionId)
    .eq("householdId", householdId);

  if (error) throw error;
  return { ok: true as const };
}
