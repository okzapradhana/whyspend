import type { SpendingVsBudgetPoint } from "../../lib/api/types";
import { formatMoney } from "../../lib/finance";

export function SpendingVsBudgetChart({ data }: { data: SpendingVsBudgetPoint[] }) {
  if (!data.length) return <p className="muted">Spending and budget bars will appear after budgets or expenses are added.</p>;
  return (
    <div className="budget-bars" aria-label="Spending compared with category budgets">
      {data.map((item) => {
        const max = Math.max(item.actualAmount, item.budgetAmount ?? 0, 1);
        return (
          <article key={item.categoryId} className={`budget-bar budget-bar--${item.status}`}>
            <div className="budget-bar__label">
              <strong>{item.label}</strong>
              <span>{formatMoney(item.actualAmount)} spent{item.budgetAmount === null ? " · not budgeted" : ` · ${formatMoney(item.budgetAmount)} budget`}</span>
            </div>
            <div className="budget-bar__track" aria-hidden="true">
              <span className="budget-bar__actual" style={{ width: `${Math.min((item.actualAmount / max) * 100, 100)}%` }} />
              {item.budgetAmount !== null ? <span className="budget-bar__budget" style={{ left: `${Math.min((item.budgetAmount / max) * 100, 100)}%` }} /> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
