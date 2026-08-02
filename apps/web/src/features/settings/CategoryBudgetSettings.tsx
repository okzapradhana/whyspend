import { useEffect, useState } from "react";
import { StatusMessage } from "../../components/StatusMessage";
import { deleteCategoryBudget, listCategoryBudgets, saveCategoryBudget } from "../../lib/api/budgets";
import type { BudgetableCategory } from "../../lib/api/types";
import { currentMonth } from "../../lib/finance";
import { BudgetMonthSelector } from "./BudgetMonthSelector";
import { CategoryBudgetRow } from "./CategoryBudgetRow";

export function CategoryBudgetSettings({ householdId }: { householdId: string }) {
  const [month, setMonth] = useState(currentMonth());
  const [categories, setCategories] = useState<BudgetableCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const result = await listCategoryBudgets(householdId, { month });
      setCategories(result.budgetableCategories);
      setStatus(null);
    } catch {
      setStatus({ tone: "error", message: "Could not load category budgets." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [householdId, month]);

  async function save(categoryId: string, amount: number) {
    setSavingId(categoryId);
    try {
      await saveCategoryBudget(householdId, categoryId, { month, amount });
      await load();
      setStatus({ tone: "success", message: "Budget saved." });
    } catch {
      setStatus({ tone: "error", message: "Could not save this budget." });
    } finally {
      setSavingId(null);
    }
  }

  async function remove(categoryId: string) {
    setSavingId(categoryId);
    try {
      await deleteCategoryBudget(householdId, categoryId, month);
      await load();
      setStatus({ tone: "success", message: "Budget removed." });
    } catch {
      setStatus({ tone: "error", message: "Could not remove this budget." });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="card surface settings-budget-panel">
      <div className="card-head section-heading">
        <div>
          <h2>Expense category budgets</h2>
          <p>Set maximum monthly spending targets for household expense categories.</p>
        </div>
        <BudgetMonthSelector month={month} onChange={setMonth} />
      </div>
      {status ? <StatusMessage tone={status.tone}>{status.message}</StatusMessage> : null}
      {loading ? (
        <div className="skeleton-block">Loading category budgets...</div>
      ) : categories.length ? (
        <div className="table-wrap budget-list">
          {categories.map((category) => (
            <CategoryBudgetRow
              key={category.categoryId}
              category={category}
              saving={savingId === category.categoryId}
              onSave={(amount) => save(category.categoryId, amount)}
              onRemove={() => remove(category.categoryId)}
            />
          ))}
        </div>
      ) : (
        <p className="muted">Create expense categories first, then add monthly budgets here.</p>
      )}
    </section>
  );
}
