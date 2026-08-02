import type { IncomeVsExpenses } from "../../lib/api/types";
import { formatMoney } from "../../lib/finance";

export function IncomeExpenseSummary({ data }: { data?: IncomeVsExpenses }) {
  const incomeAmount = data?.incomeAmount ?? 0;
  const expenseAmount = data?.expenseAmount ?? 0;
  const netAmount = data?.netAmount ?? incomeAmount - expenseAmount;
  return (
    <div className="income-expense-summary">
      <div><span>Income</span><strong>{formatMoney(incomeAmount)}</strong></div>
      <div><span>Expenses</span><strong>{formatMoney(expenseAmount)}</strong></div>
      <div><span>Income after expenses</span><strong>{formatMoney(netAmount)}</strong></div>
    </div>
  );
}
