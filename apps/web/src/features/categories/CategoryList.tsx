import { Archive, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import type { BudgetableCategory, Category } from "../../lib/api/types";
import { formatMoney, parseRpInput } from "../../lib/finance";

function InlineBudgetEditor({
  budget,
  saving,
  onSave,
  onRemove
}: {
  budget: BudgetableCategory["budget"];
  saving?: boolean;
  onSave: (amount: number) => void;
  onRemove: () => void;
}) {
  const [value, setValue] = useState(budget ? String(budget.amount) : "");
  const [error, setError] = useState<string | null>(null);
  const amount = parseRpInput(value);

  function submit() {
    if (!amount || amount <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    setError(null);
    onSave(amount);
  }

  return (
    <div className="inline-budget">
      <span className="inline-budget__status">
        {budget
          ? budget.source === "inherited"
            ? `Default: ${formatMoney(budget.amount)}`
            : `Budget: ${formatMoney(budget.amount)}`
          : "Not budgeted"}
      </span>
      <div className="inline-budget__controls">
        <label className="inline-budget__field">
          <span className="sr-only">Monthly limit</span>
          <input
            inputMode="numeric"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Rp 0"
            aria-label="Monthly limit"
          />
        </label>
        <Button type="button" onClick={submit} disabled={saving}>
          Save
        </Button>
        <Button type="button" variant="ghost" onClick={onRemove} disabled={saving || !budget}>
          Remove
        </Button>
      </div>
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

export function CategoryList({
  categories,
  loading = false,
  budgetsLoading = false,
  budgetMap,
  savingBudgetId,
  onEdit,
  onArchive,
  onDelete,
  onSaveBudget,
  onRemoveBudget
}: {
  categories: Category[];
  loading?: boolean;
  budgetsLoading?: boolean;
  budgetMap?: Map<string, BudgetableCategory>;
  savingBudgetId?: string | null;
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
  onDelete: (category: Category) => void;
  onSaveBudget?: (categoryId: string, amount: number) => void;
  onRemoveBudget?: (categoryId: string) => void;
}) {
  const [menuCategoryId, setMenuCategoryId] = useState<string | null>(null);
  const [budgetCategoryId, setBudgetCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!menuCategoryId) return;

    const closeMenu = () => setMenuCategoryId(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuCategoryId]);

  if (loading) {
    return (
      <div className="settings-category-table settings-category-table--loading" aria-label="Loading categories">
        <CategoryTableHeader />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="settings-category-skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="empty-state settings-category-empty">
        <h2>No categories yet.</h2>
        <p>Create categories for income, expenses, and savings. Nothing is imported automatically.</p>
      </div>
    );
  }

  return (
    <div className="settings-category-table" role="table" aria-label="Categories and monthly budgets">
      <CategoryTableHeader />
      <div role="rowgroup">
        {categories.map((category) => {
          const budgetEntry = budgetMap?.get(category.id) ?? null;
          const canBudget = category.type === "expense" && Boolean(budgetMap && onSaveBudget && onRemoveBudget);
          const budgetOpen = budgetCategoryId === category.id;
          const menuOpen = menuCategoryId === category.id;

          return (
            <div key={category.id} className={`settings-category-entry${category.isArchived ? " is-archived" : ""}`}>
              <div className="settings-category-row" role="row">
                <div className="settings-category-cell settings-category-cell--name" role="cell">
                  <strong>{category.name}</strong>
                  {category.isArchived ? <span className="settings-archived-label">Archived</span> : null}
                </div>
                <div className="settings-category-cell settings-category-cell--meta" role="cell">
                  <span>{formatCategoryType(category.type)}</span>
                  <span>{formatCategoryScope(category.scope)}</span>
                </div>
                <div className="settings-category-cell settings-category-cell--budget" role="cell">
                  {canBudget ? (
                    <button
                      className="settings-budget-trigger"
                      type="button"
                      aria-expanded={budgetOpen}
                      onClick={() => setBudgetCategoryId((current) => current === category.id ? null : category.id)}
                    >
                      {budgetsLoading ? "Loading..." : budgetEntry?.budget ? formatMoney(budgetEntry.budget.amount) : "Not budgeted"}
                    </button>
                  ) : (
                    <span className="settings-budget-na">Not applicable</span>
                  )}
                </div>
                <div className="settings-category-cell settings-category-cell--actions" role="cell">
                  <div className="settings-row-menu" onMouseDown={(event) => event.stopPropagation()}>
                    <Button
                      className="settings-row-menu__trigger"
                      type="button"
                      variant="ghost"
                      icon={<MoreVertical size={20} />}
                      iconOnly
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      aria-label={`Open ${category.name} menu`}
                      onClick={() => setMenuCategoryId((current) => current === category.id ? null : category.id)}
                    >
                      Actions
                    </Button>
                    {menuOpen ? (
                      <div className="settings-row-menu__list" role="menu">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuCategoryId(null);
                            onEdit(category);
                          }}
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuCategoryId(null);
                            onArchive(category);
                          }}
                        >
                          <Archive size={16} />
                          Archive
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="danger"
                          onClick={() => {
                            setMenuCategoryId(null);
                            onDelete(category);
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              {canBudget && budgetOpen ? (
                <InlineBudgetEditor
                  budget={budgetEntry?.budget ?? null}
                  saving={savingBudgetId === category.id}
                  onSave={(amount) => onSaveBudget?.(category.id, amount)}
                  onRemove={() => onRemoveBudget?.(category.id)}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryTableHeader() {
  return (
    <div className="settings-category-table__header" role="row">
      <span role="columnheader">Category</span>
      <span role="columnheader">Type and scope</span>
      <span role="columnheader">Monthly budget</span>
      <span className="sr-only" role="columnheader">Actions</span>
    </div>
  );
}

function formatCategoryType(type: Category["type"]) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatCategoryScope(scope: Category["scope"]) {
  if (scope === "both") return "Personal and household";
  if (scope === "household") return "Household/shared";
  return "Personal";
}
