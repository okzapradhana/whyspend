import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { Select } from "../../components/Select";
import { StatusMessage } from "../../components/StatusMessage";
import { Surface } from "../../components/design-system";
import { deleteCategory, listCategories, updateCategory } from "../../lib/api/categories";
import { deleteCategoryBudget, listCategoryBudgets, saveCategoryBudget } from "../../lib/api/budgets";
import type { BudgetableCategory, Category, RecordType } from "../../lib/api/types";
import { currentMonth } from "../../lib/finance";
import { CategoryForm } from "../categories/CategoryForm";
import { CategoryList } from "../categories/CategoryList";
import { BudgetMonthSelector } from "./BudgetMonthSelector";

const filterOptions = [
  { label: "All types", value: "all" },
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Savings", value: "savings" }
];

export function UnifiedCategoryCard({ householdId }: { householdId: string }) {
  const [month, setMonth] = useState(currentMonth());
  const [filter, setFilter] = useState<RecordType | "all">("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgetMap, setBudgetMap] = useState<Map<string, BudgetableCategory>>(new Map());
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [savingBudgetId, setSavingBudgetId] = useState<string | null>(null);

  async function loadCategories() {
    setCategoriesLoading(true);
    try {
      const result = await listCategories(householdId, {
        type: filter === "all" ? undefined : filter,
        includeArchived: true
      });
      setCategories(result.categories);
    } catch {
      setStatus({ tone: "error", message: "Could not load categories." });
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function loadBudgets() {
    setBudgetsLoading(true);
    try {
      const result = await listCategoryBudgets(householdId, { month });
      const map = new Map<string, BudgetableCategory>();
      for (const b of result.budgetableCategories) {
        map.set(b.categoryId, b);
      }
      setBudgetMap(map);
    } catch {
      setStatus({ tone: "error", message: "Could not load category budgets." });
    } finally {
      setBudgetsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, [householdId, filter]);

  useEffect(() => {
    loadBudgets();
  }, [householdId, month]);

  async function onArchive(category: Category) {
    await updateCategory(householdId, category.id, { isArchived: true });
    await loadCategories();
    await loadBudgets();
  }

  async function onDelete(category: Category) {
    try {
      await deleteCategory(householdId, category.id);
      await loadCategories();
      await loadBudgets();
      setStatus(null);
    } catch {
      setStatus({ tone: "error", message: "This category is used by transactions. Archive it or reassign records first." });
    }
  }

  async function onSaveBudget(categoryId: string, amount: number) {
    setSavingBudgetId(categoryId);
    try {
      await saveCategoryBudget(householdId, categoryId, { month, amount });
      await loadBudgets();
      setStatus({ tone: "success", message: "Budget saved." });
    } catch {
      setStatus({ tone: "error", message: "Could not save this budget." });
    } finally {
      setSavingBudgetId(null);
    }
  }

  async function onRemoveBudget(categoryId: string) {
    setSavingBudgetId(categoryId);
    try {
      await deleteCategoryBudget(householdId, categoryId, month);
      await loadBudgets();
      setStatus({ tone: "success", message: "Budget removed." });
    } catch {
      setStatus({ tone: "error", message: "Could not remove this budget." });
    } finally {
      setSavingBudgetId(null);
    }
  }

  function openCreateForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <>
      <Surface className="unified-category-card">
        <div className="settings-card-heading settings-category-heading">
          <div>
            <h2>Categories and budgets</h2>
            <p>Organize shared spending and set monthly limits.</p>
          </div>
          <Button type="button" icon={<Plus size={17} />} onClick={openCreateForm}>
            Add category
          </Button>
        </div>

        <div className="unified-toolbar">
          <BudgetMonthSelector month={month} onChange={setMonth} />
          <Select
            label="Filter"
            value={filter}
            options={filterOptions}
            onChange={(event) => setFilter(event.target.value as RecordType | "all")}
          />
        </div>

        {status ? <StatusMessage tone={status.tone}>{status.message}</StatusMessage> : null}

        <CategoryList
          categories={categories}
          loading={categoriesLoading}
          budgetsLoading={budgetsLoading}
          budgetMap={budgetMap}
          savingBudgetId={savingBudgetId}
          onEdit={openEditForm}
          onArchive={onArchive}
          onDelete={onDelete}
          onSaveBudget={onSaveBudget}
          onRemoveBudget={onRemoveBudget}
        />
      </Surface>

      <Dialog
        title={editing ? "Edit category" : "Add category"}
        description={editing ? "Update the category name and scope." : "Create an income, expense, or savings category."}
        open={formOpen}
        onClose={closeForm}
        className="settings-category-dialog"
        panelClassName="settings-category-dialog__panel"
      >
        <CategoryForm
          key={editing?.id ?? "new-category"}
          householdId={householdId}
          editing={editing}
          onCancel={closeForm}
          onSaved={() => {
            closeForm();
            loadCategories();
            loadBudgets();
          }}
        />
      </Dialog>
    </>
  );
}
