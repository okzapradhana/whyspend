import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../../components/Button";
import type { Transaction } from "../../lib/api/types";

const typeLabel = {
  income: "Income",
  expense: "Expense",
  savings: "Savings"
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

export function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete
}: {
  transactions: Transaction[];
  loading?: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  if (loading) {
    return <div className="skeleton-block">Loading transactions...</div>;
  }

  if (!transactions.length) {
    return (
      <div className="empty-state">
        <h2>No transactions for this month yet.</h2>
        <p>Add one income, expense, or savings record to start building the monthly picture.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category / Goal</th>
            <th>Owner</th>
            <th>Notes</th>
            <th className="align-right">Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.occurredOn}</td>
              <td><span className={`type-pill type-${transaction.type}`}>{typeLabel[transaction.type]}</span></td>
              <td>{transaction.category.name}</td>
              <td>{transaction.owner.displayName}</td>
              <td>{transaction.note ?? (transaction.scope === "household" ? "Household" : "Personal")}</td>
              <td className="align-right money">{formatMoney(transaction.amount)}</td>
              <td>
                <div className="row-actions">
                  <Button type="button" variant="ghost" icon={<Pencil size={15} />} onClick={() => onEdit(transaction)}>
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" icon={<Trash2 size={15} />} onClick={() => onDelete(transaction)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
