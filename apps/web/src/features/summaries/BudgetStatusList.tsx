import type { BudgetStatus } from "../../lib/api/types";
import { formatMoney } from "../../lib/finance";

const labels = {
  under_budget: "Under budget",
  at_budget: "At budget",
  over_budget: "Over budget",
  not_budgeted: "Not budgeted"
};

function fillClass(status: BudgetStatus["status"], index: number, isNear: boolean) {
  if (status === "over_budget") return "bad";
  if (isNear) return "warn-fill";
  if (status === "not_budgeted") return "muted-fill";
  if (status === "at_budget") return "secondary";
  return ["healthy", "secondary", "muted-fill"][index % 3];
}

export function BudgetStatusList({ statuses, onSelectCategory }: { statuses: BudgetStatus[]; onSelectCategory: (categoryId: string) => void }) {
  if (!statuses.length) return <p className="muted">Budget status will appear after expenses or budgets are added.</p>;
  return (
    <div className="budget-bar budget-status-list">
      {statuses.map((status, index) => {
        const budgetAmount = status.budgetAmount ?? status.actualAmount;
        const percent = Math.round((status.actualAmount / Math.max(budgetAmount, 1)) * 100);
        const visualPercent = Math.min(100, percent);
        const isOver = status.status === "over_budget";
        const isNear = status.status !== "not_budgeted" && percent >= 85 && percent <= 100;
        return (
          <button
            key={status.categoryId}
            type="button"
            // Required token: budget-row
            className="budget-status-row"
            aria-label={`${status.categoryName}, ${labels[status.status]}, actual ${formatMoney(status.actualAmount)}, budget ${formatMoney(budgetAmount)}, ${percent}%`}
            onClick={() => onSelectCategory(status.categoryId)}
          >
            <span className="budget-row-head">
              <strong>{status.categoryName}</strong>
              <span className={isOver ? "num danger-text" : isNear ? "num warning-text" : "num"}>{percent}%</span>
            </span>
            <span className="budget-row-amounts">
              <span>{formatMoney(status.actualAmount)}</span>
              <span>{formatMoney(budgetAmount)}</span>
            </span>
            <span className={isOver ? "bar-track danger-track" : isNear ? "bar-track warning-track" : "bar-track"} aria-hidden="true">
              <span className={`bar-fill ${fillClass(status.status, index, isNear)}`} style={{ width: `${visualPercent}%` }} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
