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

  const formattedTransactions = (data || []).map((t: any) => ({
    ...t,
    occurredOn: t.occurredOn.slice(0, 10)
  }));

  return { transactions: formattedTransactions as unknown as Transaction[] };
}

export async function createTransaction(householdId: string, input: TransactionInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

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

  return {
    ...data,
    occurredOn: data.occurredOn.slice(0, 10)
  } as unknown as Transaction;
}

export async function updateTransaction(householdId: string, transactionId: string, input: Partial<TransactionInput>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

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

  return {
    ...data,
    occurredOn: data.occurredOn.slice(0, 10)
  } as unknown as Transaction;
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
