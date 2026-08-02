import { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import type { Category, RecordScope, RecordType, Transaction } from "../../lib/api/types";
import { listCategories } from "../../lib/api/categories";
import { createTransaction, updateTransaction } from "../../lib/api/transactions";

const scopeOptions = [
  { label: "Personal", value: "member" },
  { label: "Household/shared", value: "household" }
];

export function TransactionForm({
  householdId,
  userId,
  editing,
  onSaved,
  onCancel
}: {
  householdId: string;
  userId: string;
  editing?: Transaction | null;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [type, setType] = useState<RecordType>(editing?.type ?? "expense");
  const [amount, setAmount] = useState(editing?.amount ? String(editing.amount) : "");
  const [occurredOn, setOccurredOn] = useState(editing?.occurredOn ?? new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [scope, setScope] = useState<RecordScope>(editing?.scope ?? "member");
  const [note, setNote] = useState(editing?.note ?? "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setType(editing?.type ?? "expense");
    setAmount(editing?.amount ? String(editing.amount) : "");
    setOccurredOn(editing?.occurredOn ?? new Date().toISOString().slice(0, 10));
    setCategoryId(editing?.categoryId ?? "");
    setScope(editing?.scope ?? "member");
    setNote(editing?.note ?? "");
    setStatus(null);
  }, [editing]);

  async function loadCategories(nextType = type) {
    const result = await listCategories(householdId, { type: nextType });
    setCategories(result.categories);
    const nextCategoryId = editing?.type === nextType ? editing.categoryId : categoryId;
    if (!result.categories.some((category) => category.id === nextCategoryId)) {
      setCategoryId(result.categories[0]?.id ?? "");
    }
  }

  useEffect(() => {
    loadCategories().catch(() => setStatus("Could not load categories."));
  }, [householdId, type]);

  const categoryOptions = useMemo(
    () => [
      {
        label: categories.length
          ? `Choose ${type === "savings" ? "goal" : "category"}`
          : `${type === "savings" ? "Create a savings goal first" : "Create a category in Settings first"}`,
        value: ""
      },
      ...categories.map((category) => ({ label: category.name, value: category.id }))
    ],
    [categories, type]
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryId) {
      setStatus(type === "savings" ? "Choose an existing savings goal before saving." : "Choose an existing category before saving.");
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const input = {
        type,
        amount: Number(amount),
        occurredOn,
        categoryId,
        ownerUserId: userId,
        scope,
        note: note || null
      };
      if (editing) {
        await updateTransaction(householdId, editing.id, input);
      } else {
        await createTransaction(householdId, input);
      }
      setAmount("");
      setNote("");
      onSaved();
    } catch {
      setStatus("Check the amount, date, category, and owner before saving.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="transaction-modal transaction-form form-stack" onSubmit={onSubmit}>
      <div className="modal-body">
        <div className="amount-entry">
          <label htmlFor="transaction-amount">Amount</label>
          <div className="amount-line">
            <span>Rp</span>
            <input
              id="transaction-amount"
              name="amount"
              inputMode="numeric"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="transaction-toggle" aria-label="Transaction type">
          {(["expense", "savings", "income"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={type === option ? "active" : ""}
              onClick={() => setType(option)}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-divider" />

        <div className="form-grid">
          <label className="modal-field" htmlFor="transaction-date">
            <span>Date</span>
            <span className="soft-input with-icon">
              <input
                id="transaction-date"
                type="date"
                value={occurredOn}
                onChange={(event) => setOccurredOn(event.target.value)}
                required
              />
              <Calendar size={20} aria-hidden="true" />
            </span>
          </label>
          <Select label="Scope" value={scope} options={scopeOptions} onChange={(event) => setScope(event.target.value as RecordScope)} />
        </div>
        <Select
          id="transaction-target"
          label={type === "savings" ? "Goal" : "Category"}
          value={categoryId}
          options={categoryOptions}
          onChange={(event) => setCategoryId(event.target.value)}
          required
        />
        <label className="modal-field" htmlFor="transaction-note">
          <span>Note (Optional)</span>
          <textarea
            id="transaction-note"
            name="notes"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g Dinner in Kintan"
            rows={3}
          />
        </label>
      </div>
      {status ? <p className="status status-error">{status}</p> : null}
      <div className="modal-footer actions">
        {onCancel ? <Button className="modal-action secondary" type="button" variant="ghost" onClick={onCancel}>Cancel</Button> : null}
        <Button className="modal-action primary" type="submit" loading={submitting}>{editing ? "Save changes" : "Add"}</Button>
      </div>
    </form>
  );
}
