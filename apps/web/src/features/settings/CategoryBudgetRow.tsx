import { useState } from "react";
import { Button } from "../../components/Button";
import type { BudgetableCategory } from "../../lib/api/types";
import { formatMoney, parseRpInput } from "../../lib/finance";

export function CategoryBudgetRow({
  category,
  saving,
  onSave,
  onRemove
}: {
  category: BudgetableCategory;
  saving?: boolean;
  onSave: (amount: number) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const [value, setValue] = useState(category.budget ? String(category.budget.amount) : "");
  const [error, setError] = useState<string | null>(null);
  const amount = parseRpInput(value);

  async function submit() {
    if (!amount || amount <= 0) {
      setError("Enter a positive budget amount.");
      return;
    }
    setError(null);
    await onSave(amount);
  }

  return (
    <article className="budget-row data-table">
      <div className="budget-row__copy">
        <strong>{category.categoryName}</strong>
        <span>
          {category.budget
            ? category.budget.source === "inherited"
              ? `Default from last saved budget: ${formatMoney(category.budget.amount)}`
              : `Saved budget: ${formatMoney(category.budget.amount)}`
            : "Not budgeted"}
        </span>
        {error ? <span className="field-error">{error}</span> : null}
      </div>
      <label className="budget-row__field">
        <span>Monthly limit</span>
        <input
          inputMode="numeric"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Rp 0"
          aria-describedby={error ? `${category.categoryId}-budget-error` : undefined}
        />
      </label>
      <div className="budget-row__actions">
        <Button type="button" onClick={submit} disabled={saving}>
          Save
        </Button>
        <Button type="button" variant="ghost" onClick={onRemove} disabled={saving || !category.budget}>
          Remove
        </Button>
      </div>
    </article>
  );
}
