import { supabase } from "../supabaseClient";
import type { Category, CategoryScope, RecordType } from "./types";

export async function listCategories(householdId: string, options: { type?: RecordType; includeArchived?: boolean } = {}) {
  let query = supabase
    .from("Category")
    .select("*")
    .eq("householdId", householdId);

  if (options.type) {
    query = query.eq("type", options.type);
  }
  if (!options.includeArchived) {
    query = query.eq("isArchived", false);
  }

  const { data, error } = await query.order("name", { ascending: true });
  if (error) throw error;
  
  return { categories: (data || []) as Category[] };
}

export async function createCategory(
  householdId: string,
  input: { name: string; type: RecordType; scope: CategoryScope }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { data, error } = await supabase
    .from("Category")
    .insert({
      id: window.crypto.randomUUID(),
      householdId,
      name: input.name,
      type: input.type,
      scope: input.scope,
      createdByUserId: user.id,
      updatedAt: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-initialize SavingsGoal if type is savings (matches backend service logic)
  if (input.type === "savings") {
    const { error: goalError } = await supabase
      .from("SavingsGoal")
      .insert({
        id: window.crypto.randomUUID(),
        householdId,
        categoryId: data.id,
        targetAmount: 0,
        startingAmount: 0,
        updatedAt: new Date().toISOString()
      });
    if (goalError) {
      console.error("Failed to initialize savings goal for new category:", goalError);
    }
  }

  return data as Category;
}

export async function updateCategory(
  householdId: string,
  categoryId: string,
  input: { name?: string; scope?: CategoryScope; isArchived?: boolean }
) {
  const { data, error } = await supabase
    .from("Category")
    .update({
      name: input.name,
      scope: input.scope,
      isArchived: input.isArchived,
      updatedAt: new Date().toISOString()
    })
    .eq("id", categoryId)
    .eq("householdId", householdId)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(householdId: string, categoryId: string) {
  // Catch cascade dependencies
  await supabase.from("SavingsGoal").delete().eq("categoryId", categoryId);
  await supabase.from("CategoryBudget").delete().eq("categoryId", categoryId);

  const { error } = await supabase
    .from("Category")
    .delete()
    .eq("id", categoryId)
    .eq("householdId", householdId);

  if (error) throw error;
  return { ok: true as const };
}
