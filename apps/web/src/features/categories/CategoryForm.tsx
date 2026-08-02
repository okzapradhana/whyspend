import { useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import type { Category, CategoryScope, RecordType } from "../../lib/api/types";
import { createCategory, updateCategory } from "../../lib/api/categories";

const typeOptions = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Savings", value: "savings" }
];

const scopeOptions = [
  { label: "Both personal and household", value: "both" },
  { label: "Personal", value: "member" },
  { label: "Household/shared", value: "household" }
];

export function CategoryForm({
  householdId,
  editing,
  onSaved,
  onCancel
}: {
  householdId: string;
  editing?: Category | null;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [type, setType] = useState<RecordType>(editing?.type ?? "expense");
  const [scope, setScope] = useState<CategoryScope>(editing?.scope ?? "both");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await updateCategory(householdId, editing.id, { name, scope });
      } else {
        await createCategory(householdId, { name, type, scope });
      }
      setName("");
      onSaved();
    } catch {
      setError("Use a unique category name for this type.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form-stack category-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <Input label="Category name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Select label="Type" value={type} options={typeOptions} disabled={Boolean(editing)} onChange={(event) => setType(event.target.value as RecordType)} />
        <Select label="Scope" value={scope} options={scopeOptions} onChange={(event) => setScope(event.target.value as CategoryScope)} />
      </div>
      {error ? <p className="status status-error">{error}</p> : null}
      <div className="actions">
        <Button type="submit" loading={submitting}>{editing ? "Save category" : "Add category"}</Button>
        {editing && onCancel ? <Button type="button" variant="ghost" onClick={onCancel}>Cancel edit</Button> : null}
      </div>
    </form>
  );
}
