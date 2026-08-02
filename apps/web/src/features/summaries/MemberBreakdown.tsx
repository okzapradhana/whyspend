import type { MonthlySummary } from "../../lib/api/types";
import { formatMoney } from "../transactions/TransactionList";

export function MemberBreakdown({ summary }: { summary: MonthlySummary }) {
  if (!summary.byMember.length) {
    return <p className="muted">No member totals for this month.</p>;
  }

  return (
    <div className="member-list">
      {summary.byMember.map((member) => (
        <div key={member.userId} className="member-row">
          <strong>{member.displayName}</strong>
          <span>Income {formatMoney(member.income)}</span>
          <span>Expenses {formatMoney(member.expenses)}</span>
          <span>Savings {formatMoney(member.savings)}</span>
        </div>
      ))}
    </div>
  );
}
