import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../../components/Button";
import { EmptyState, LoadingState, StatusChip, TableFrame } from "../../components/design-system";
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
    return <LoadingState>Loading transactions...</LoadingState>;
  }

  if (!transactions.length) {
    return (
      <EmptyState>
        <h2>No transactions for this month yet.</h2>
        <p>Add one income, expense, or savings record to start building the monthly picture.</p>
      </EmptyState>
    );
  }

  return (
    <TableFrame>
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
              <td data-label="Date">{transaction.occurredOn}</td>
              <td data-label="Type"><StatusChip className={`type-${transaction.type}`}>{typeLabel[transaction.type]}</StatusChip></td>
              <td data-label="Category / Goal">{transaction.category?.name ?? "Category"}</td>
              <td data-label="Owner">{transaction.owner?.displayName ?? "Member"}</td>
              <td data-label="Notes">{transaction.note ?? (transaction.scope === "household" ? "Household" : "Personal")}</td>
              <td data-label="Amount" className="align-right money">{formatMoney(transaction.amount)}</td>
              <td data-label="Actions">
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
    </TableFrame>
  );
}
