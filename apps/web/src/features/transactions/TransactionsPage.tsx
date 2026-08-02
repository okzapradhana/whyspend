import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../../app/authState";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { StatusMessage } from "../../components/StatusMessage";
import { Input } from "../../components/Input";
import type { RecordType, Transaction } from "../../lib/api/types";
import { deleteTransaction, listTransactions } from "../../lib/api/transactions";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import "./transactions.css";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function TransactionsPage() {
  const { user, activeHousehold } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecordType | "all">("all");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    if (!activeHousehold) return;
    setLoading(true);
    setStatus(null);
    try {
      const result = await listTransactions(activeHousehold.id, { month });
      setTransactions(result.transactions);
    } catch {
      setStatus("Could not load transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [activeHousehold?.id, month]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesSearch =
        !query ||
        transaction.category.name.toLowerCase().includes(query) ||
        transaction.owner.displayName.toLowerCase().includes(query) ||
        transaction.note?.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [search, transactions, typeFilter]);

  async function onDelete(transaction: Transaction) {
    if (!activeHousehold) return;
    await deleteTransaction(activeHousehold.id, transaction.id);
    await load();
  }

  function openAddDialog() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditDialog(transaction: Transaction) {
    setEditing(transaction);
    setFormOpen(true);
  }

  if (!user || !activeHousehold) {
    return null;
  }

  return (
    <main className="content page transactions-page">
      <header className="page-head transactions-head page-header" data-od-id="transactions-head">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-kicker kicker">Review a month, filter quickly, and use one familiar form for expenses, income, and savings.</p>
        </div>
        <div className="actions">
          <Input className="month-picker" label="Choose transaction month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </div>
      </header>
      <section className="card surface transaction-controls" aria-label="Transaction filters" data-od-id="transaction-controls">
        <div className="filter-row">
          <Input label="Search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Category, owner, or note" />
          <div className="filter-menu filter-group" aria-label="Transaction type filters">
            <span className="filter-label">Types</span>
            {(["all", "expense", "income", "savings"] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={typeFilter === type ? "filter-button active" : "filter-button"}
                aria-pressed={typeFilter === type}
                onClick={() => setTypeFilter(type)}
              >
                {type === "all" ? "All" : type[0].toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="transaction-list card surface" data-od-id="transaction-list">
        <div className="section-heading">
          <h2>Transactions</h2>
          {status ? <StatusMessage tone="error">{status}</StatusMessage> : null}
        </div>
        <TransactionList transactions={filteredTransactions} loading={loading} onEdit={openEditDialog} onDelete={onDelete} />
      </section>
      <Button className="fab-button" type="button" icon={<Plus size={18} />} iconOnly aria-label="Add transaction" onClick={openAddDialog}>
        Add transaction
      </Button>
      <Dialog title={editing ? "Edit transaction" : "Add Expense"} open={formOpen} onClose={() => setFormOpen(false)} className="transaction-dialog">
        <TransactionForm
          householdId={activeHousehold.id}
          userId={user.id}
          editing={editing}
          onCancel={() => setFormOpen(false)}
          onSaved={() => {
            setEditing(null);
            setFormOpen(false);
            load();
          }}
        />
      </Dialog>
    </main>
  );
}
