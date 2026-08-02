import { supabase } from "../supabaseClient";
import type { SavingsGoal } from "./types";

export async function listSavingsGoals(householdId: string) {
  const { data, error } = await supabase
    .from("SavingsGoal")
    .select(`
      id,
      householdId,
      categoryId,
      targetAmount,
      startingAmount,
      targetDate,
      createdAt,
      updatedAt,
      category:Category!SavingsGoal_categoryId_fkey (
        name,
        isArchived
      )
    `)
    .eq("householdId", householdId);

  if (error) throw error;

  const activeGoals = (data || []).filter((goal: any) => goal.category && !goal.category.isArchived);

  // Fetch all transactions to compute savedAmount in memory
  const { data: txs, error: txError } = await supabase
    .from("Transaction")
    .select("categoryId, amount")
    .eq("householdId", householdId)
    .eq("type", "savings");

  if (txError) throw txError;

  const sumMap = new Map<string, number>();
  for (const tx of txs || []) {
    sumMap.set(tx.categoryId, (sumMap.get(tx.categoryId) || 0) + tx.amount);
  }

  const goals = activeGoals.map((goal: any) => ({
    id: goal.id,
    householdId: goal.householdId,
    categoryId: goal.categoryId,
    name: goal.category.name,
    targetAmount: goal.targetAmount,
    startingAmount: goal.startingAmount,
    savedAmount: goal.startingAmount + (sumMap.get(goal.categoryId) || 0),
    targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : null,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt
  }));

  return { goals: goals as SavingsGoal[] };
}

export async function createSavingsGoal(
  householdId: string,
  input: { name: string; targetAmount: number; startingAmount: number; targetDate?: string | null }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  // Check duplicate category name
  const { data: duplicateData, error: dupError } = await supabase
    .from("Category")
    .select("id")
    .eq("householdId", householdId)
    .eq("type", "savings")
    .eq("isArchived", false)
    .ilike("name", input.name);

  if (dupError) throw dupError;
  if (duplicateData && duplicateData.length > 0) {
    throw new Error("A savings goal with this name already exists.");
  }

  // Create category
  const { data: catData, error: catError } = await supabase
    .from("Category")
    .insert({
      id: window.crypto.randomUUID(),
      householdId,
      name: input.name,
      type: "savings",
      scope: "both",
      createdByUserId: user.id,
      updatedAt: new Date().toISOString()
    })
    .select()
    .single();

  if (catError) throw catError;

  // Create SavingsGoal
  const { data: goalData, error: goalError } = await supabase
    .from("SavingsGoal")
    .insert({
      id: window.crypto.randomUUID(),
      householdId,
      categoryId: catData.id,
      targetAmount: input.targetAmount,
      startingAmount: input.startingAmount,
      targetDate: input.targetDate ? new Date(input.targetDate).toISOString() : null,
      updatedAt: new Date().toISOString()
    })
    .select(`
      id,
      householdId,
      categoryId,
      targetAmount,
      startingAmount,
      targetDate,
      createdAt,
      updatedAt,
      category:Category!SavingsGoal_categoryId_fkey (
        name
      )
    `)
    .single();

  if (goalError) throw goalError;

  return {
    id: goalData.id,
    householdId: goalData.householdId,
    categoryId: goalData.categoryId,
    name: (goalData.category as any)?.name || "",
    targetAmount: goalData.targetAmount,
    startingAmount: goalData.startingAmount,
    savedAmount: goalData.startingAmount,
    targetDate: goalData.targetDate ? goalData.targetDate.slice(0, 10) : null,
    createdAt: goalData.createdAt,
    updatedAt: goalData.updatedAt
  } as SavingsGoal;
}

export async function updateSavingsGoal(
  householdId: string,
  goalId: string,
  input: Partial<{ name: string; targetAmount: number; startingAmount: number; targetDate: string | null }>
) {
  const { data: existing, error: existError } = await supabase
    .from("SavingsGoal")
    .select(`
      id,
      categoryId,
      category:Category!SavingsGoal_categoryId_fkey (
        name
      )
    `)
    .eq("id", goalId)
    .eq("householdId", householdId)
    .single();

  if (existError) throw existError;
  if (!existing) throw new Error("Savings goal not found.");

  if (input.name && input.name.toLowerCase() !== ((existing as any).category?.name || "").toLowerCase()) {
    const { data: duplicateData, error: dupError } = await supabase
      .from("Category")
      .select("id")
      .eq("householdId", householdId)
      .eq("type", "savings")
      .eq("isArchived", false)
      .neq("id", existing.categoryId)
      .ilike("name", input.name);

    if (dupError) throw dupError;
    if (duplicateData && duplicateData.length > 0) {
      throw new Error("A savings goal with this name already exists.");
    }
  }

  if (input.name) {
    const { error: catUpdateError } = await supabase
      .from("Category")
      .update({ name: input.name, updatedAt: new Date().toISOString() })
      .eq("id", existing.categoryId)
      .eq("householdId", householdId);

    if (catUpdateError) throw catUpdateError;
  }

  const updatePayload: any = { updatedAt: new Date().toISOString() };
  if (input.targetAmount !== undefined) updatePayload.targetAmount = input.targetAmount;
  if (input.startingAmount !== undefined) updatePayload.startingAmount = input.startingAmount;
  if (input.targetDate !== undefined) {
    updatePayload.targetDate = input.targetDate ? new Date(input.targetDate).toISOString() : null;
  }

  const { data: goalData, error: goalUpdateError } = await supabase
    .from("SavingsGoal")
    .update(updatePayload)
    .eq("id", goalId)
    .eq("householdId", householdId)
    .select(`
      id,
      householdId,
      categoryId,
      targetAmount,
      startingAmount,
      targetDate,
      createdAt,
      updatedAt,
      category:Category!SavingsGoal_categoryId_fkey (
        name
      )
    `)
    .single();

  if (goalUpdateError) throw goalUpdateError;

  // sum of transactions
  const { data: txs, error: txError } = await supabase
    .from("Transaction")
    .select("amount")
    .eq("householdId", householdId)
    .eq("categoryId", goalData.categoryId)
    .eq("type", "savings");

  if (txError) throw txError;

  const savedAmount = goalData.startingAmount + (txs || []).reduce((acc: number, t: any) => acc + t.amount, 0);

  return {
    id: goalData.id,
    householdId: goalData.householdId,
    categoryId: goalData.categoryId,
    name: (goalData.category as any)?.name || "",
    targetAmount: goalData.targetAmount,
    startingAmount: goalData.startingAmount,
    savedAmount,
    targetDate: goalData.targetDate ? goalData.targetDate.slice(0, 10) : null,
    createdAt: goalData.createdAt,
    updatedAt: goalData.updatedAt
  } as SavingsGoal;
}

export async function deleteSavingsGoal(householdId: string, goalId: string) {
  const { data: existing, error: existError } = await supabase
    .from("SavingsGoal")
    .select("categoryId")
    .eq("id", goalId)
    .eq("householdId", householdId)
    .single();

  if (existError) throw existError;
  if (!existing) throw new Error("Savings goal not found.");

  const { count, error: countError } = await supabase
    .from("Transaction")
    .select("*", { count: "exact", head: true })
    .eq("householdId", householdId)
    .eq("categoryId", existing.categoryId);

  if (countError) throw countError;

  const { error: deleteGoalError } = await supabase
    .from("SavingsGoal")
    .delete()
    .eq("id", goalId)
    .eq("householdId", householdId);

  if (deleteGoalError) throw deleteGoalError;

  if (count && count > 0) {
    const { error: archiveCatError } = await supabase
      .from("Category")
      .update({ isArchived: true })
      .eq("id", existing.categoryId)
      .eq("householdId", householdId);

    if (archiveCatError) throw archiveCatError;
  } else {
    const { error: deleteCatError } = await supabase
      .from("Category")
      .delete()
      .eq("id", existing.categoryId)
      .eq("householdId", householdId);

    if (deleteCatError) throw deleteCatError;
  }

  return { ok: true as const };
}

