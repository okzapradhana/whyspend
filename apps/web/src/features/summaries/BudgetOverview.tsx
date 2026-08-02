import type { MonthlySummary } from "../../lib/api/types";
import { formatMoney } from "../../lib/finance";

export function BudgetOverview({ summary }: { summary: MonthlySummary }) {
  const totals = summary.totals;
  return (
    <section className="metric-row" aria-label="Budget overview">
      <div><span>Budgeted expenses</span><strong>{formatMoney(totals.totalBudgetedExpenses ?? 0)}</strong></div>
      <div><span>Budgeted actual</span><strong>{formatMoney(totals.budgetedActualExpenses ?? 0)}</strong></div>
      <div><span>Remaining budget</span><strong>{formatMoney(totals.remainingBudget ?? 0)}</strong></div>
      <div><span>Exceeded budget</span><strong>{formatMoney(totals.exceededBudget ?? 0)}</strong></div>
    </section>
  );
}
