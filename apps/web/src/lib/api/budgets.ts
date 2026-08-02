import { supabase } from "../supabaseClient";
import type { CategoryBudget, CategoryBudgetList, BudgetableCategory } from "./types";

export async function listCategoryBudgets(
  householdId: string,
  options: { month: string; includeInherited?: boolean }
) {
  const [categoriesRes, budgetsRes] = await Promise.all([
    supabase
      .from("Category")
      .select("*")
      .eq("householdId", householdId)
      .eq("type", "expense")
      .order("name", { ascending: true }),
    supabase
      .from("CategoryBudget")
      .select(`
        id,
        categoryId,
        month,
        amount,
        category:Category!CategoryBudget_categoryId_fkey (
          name,
          isArchived
        )
      `)
      .eq("householdId", householdId)
      .eq("month", options.month)
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (budgetsRes.error) throw budgetsRes.error;

  const budgets: CategoryBudget[] = (budgetsRes.data || []).map((b: any) => ({
    id: b.id,
    categoryId: b.categoryId,
    categoryName: b.category?.name || "",
    month: b.month,
    amount: b.amount,
    source: "explicit" as const,
    isArchivedCategory: b.category?.isArchived || false
  }));

  const budgetMap = new Map(budgets.map((b) => [b.categoryId, b]));
  const budgetableCategories: BudgetableCategory[] = (categoriesRes.data || []).map((c: any) => {
    const budget = budgetMap.get(c.id);
    return {
      categoryId: c.id,
      categoryName: c.name,
      isArchived: c.isArchived,
      budget: budget
        ? {
            id: budget.id,
            amount: budget.amount,
            source: "explicit" as const
          }
        : null
    };
  });

  return {
    month: options.month,
    budgets,
    budgetableCategories
  } as CategoryBudgetList;
}

export async function saveCategoryBudget(
  householdId: string,
  categoryId: string,
  input: { month: string; amount: number }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  // Determine if it already exists to preserve createdByUserId and id
  const { data: existing } = await supabase
    .from("CategoryBudget")
    .select("id, createdByUserId")
    .eq("householdId", householdId)
    .eq("categoryId", categoryId)
    .eq("month", input.month)
    .maybeSingle();

  const budgetId = existing?.id || window.crypto.randomUUID();
  const createdByUserId = existing?.createdByUserId || user.id;

  const { data, error } = await supabase
    .from("CategoryBudget")
    .upsert({
      id: budgetId,
      householdId,
      categoryId,
      month: input.month,
      amount: input.amount,
      createdByUserId,
      updatedByUserId: user.id,
      updatedAt: new Date().toISOString()
    }, {
      onConflict: "householdId,categoryId,month"
    })
    .select(`
      id,
      categoryId,
      month,
      amount,
      category:Category!CategoryBudget_categoryId_fkey (
        name,
        isArchived
      )
    `)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    categoryId: data.categoryId,
    categoryName: (data as any).category?.name || "",
    month: data.month,
    amount: data.amount,
    source: "explicit" as const,
    isArchivedCategory: (data as any).category?.isArchived || false
  } as CategoryBudget;
}

export async function deleteCategoryBudget(householdId: string, categoryId: string, month: string) {
  const { error } = await supabase
    .from("CategoryBudget")
    .delete()
    .eq("householdId", householdId)
    .eq("categoryId", categoryId)
    .eq("month", month);

  if (error) throw error;
  return { ok: true as const };
}
