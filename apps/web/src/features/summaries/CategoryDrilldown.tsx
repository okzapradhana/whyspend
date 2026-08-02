import type { Transaction } from "../../lib/api/types";
import { formatMoney } from "../transactions/TransactionList";

export function CategoryDrilldown({
  categoryName,
  transactions,
  loading
}: {
  categoryName?: string;
  transactions: Transaction[];
  loading?: boolean;
}) {
  if (!categoryName) {
    return <p className="muted">Select an expense category to see the records behind that total.</p>;
  }

  if (loading) {
    return <div className="skeleton-block">Loading category transactions...</div>;
  }

  if (!transactions.length) {
    return <p className="muted">No transactions found for {categoryName}.</p>;
  }

  return (
    <div className="drilldown-list">
      <h3>{categoryName}</h3>
      {transactions.map((transaction) => (
        <article key={transaction.id} className="drilldown-row">
          <div>
            <strong>{transaction.note || transaction.category.name}</strong>
            <span>{transaction.occurredOn} · {transaction.owner.displayName}</span>
          </div>
          <strong>{formatMoney(transaction.amount)}</strong>
        </article>
      ))}
    </div>
  );
}
