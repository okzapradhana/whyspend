import { useEffect, useState } from "react";
import { useAuth } from "../../app/authState";
import { Select } from "../../components/Select";
import { StatusMessage } from "../../components/StatusMessage";
import { deleteCategory, listCategories, updateCategory } from "../../lib/api/categories";
import type { Category, RecordType } from "../../lib/api/types";
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";
import "./categories.css";

const filterOptions = [
  { label: "All types", value: "all" },
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Savings", value: "savings" }
];

export function CategoriesPage({ embedded = false }: { embedded?: boolean }) {
  const { activeHousehold } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [filter, setFilter] = useState<RecordType | "all">("all");
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    if (!activeHousehold) return;
    const result = await listCategories(activeHousehold.id, {
      type: filter === "all" ? undefined : filter,
      includeArchived: true
    });
    setCategories(result.categories);
  }

  useEffect(() => {
    load().catch(() => setStatus("Could not load categories."));
  }, [activeHousehold?.id, filter]);

  async function onArchive(category: Category) {
    if (!activeHousehold) return;
    await updateCategory(activeHousehold.id, category.id, { isArchived: true });
    await load();
  }

  async function onDelete(category: Category) {
    if (!activeHousehold) return;
    try {
      await deleteCategory(activeHousehold.id, category.id);
      await load();
      setStatus(null);
    } catch {
      setStatus("This category is used by transactions. Archive it or reassign records first.");
    }
  }

  if (!activeHousehold) return null;

  const content = (
    <>
      <header className="page-header">
        <div>
          <p className="kicker">Category management</p>
          <h1>Keep categories useful as life changes.</h1>
        </div>
        <Select label="Filter" value={filter} options={filterOptions} onChange={(event) => setFilter(event.target.value as RecordType | "all")} />
      </header>
      <section className="surface">
        <h2>{editing ? "Edit category" : "Create category"}</h2>
        <CategoryForm
          householdId={activeHousehold.id}
          editing={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      </section>
      <section className="surface">
        <div className="section-heading">
          <h2>Categories</h2>
          {status ? <StatusMessage tone="error">{status}</StatusMessage> : null}
        </div>
        <CategoryList categories={categories} onEdit={setEditing} onArchive={onArchive} onDelete={onDelete} />
      </section>
    </>
  );

  if (embedded) {
    return <section className="categories-page">{content}</section>;
  }

  return (
    <main className="page categories-page">
      {content}
    </main>
  );
}
