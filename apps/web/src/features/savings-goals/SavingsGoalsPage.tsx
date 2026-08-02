import { Plus, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../app/authState";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { StatusMessage } from "../../components/StatusMessage";
import { createSavingsGoal, deleteSavingsGoal, listSavingsGoals, updateSavingsGoal } from "../../lib/api/savingsGoals";
import type { SavingsGoal } from "../../lib/api/types";
import { formatMoney, formatPercent, ratioPercent } from "../../lib/finance";
import { SavingsGoalCard } from "./SavingsGoalCard";
import { SavingsGoalForm } from "./SavingsGoalForm";
import "./savings-goals.css";

export function SavingsGoalsPage() {
  const { activeHousehold } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [deleting, setDeleting] = useState<SavingsGoal | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function loadGoals() {
    if (!activeHousehold) return;
    setLoading(true);
    setStatus(null);
    try {
      const result = await listSavingsGoals(activeHousehold.id);
      setGoals(result.goals);
    } catch {
      setStatus("Could not load savings goals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, [activeHousehold?.id]);

  const totals = useMemo(
    () =>
      goals.reduce(
        (acc, goal) => ({
          saved: acc.saved + goal.savedAmount,
          target: acc.target + goal.targetAmount
        }),
        { saved: 0, target: 0 }
      ),
    [goals]
  );
  const progress = ratioPercent(totals.saved, totals.target);

  function openForm(goal?: SavingsGoal) {
    setEditing(goal ?? null);
    setFormOpen(true);
  }

  async function saveGoal(goal: { id?: string; name: string; targetAmount: number; startingAmount: number; targetDate?: string }) {
    if (!activeHousehold) return;
    setSaving(true);
    setStatus(null);
    try {
      if (goal.id) {
        await updateSavingsGoal(activeHousehold.id, goal.id, {
          name: goal.name,
          targetAmount: goal.targetAmount,
          startingAmount: goal.startingAmount,
          targetDate: goal.targetDate ?? null
        });
      } else {
        await createSavingsGoal(activeHousehold.id, {
          name: goal.name,
          targetAmount: goal.targetAmount,
          startingAmount: goal.startingAmount,
          targetDate: goal.targetDate ?? null
        });
      }
      await loadGoals();
      setFormOpen(false);
      setEditing(null);
    } catch {
      setStatus("Could not save savings goal.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!activeHousehold || !deleting) return;
    setSaving(true);
    setStatus(null);
    try {
      await deleteSavingsGoal(activeHousehold.id, deleting.id);
      setDeleting(null);
      await loadGoals();
    } catch {
      setStatus("Could not delete savings goal.");
    } finally {
      setSaving(false);
    }
  }

  if (!activeHousehold) return null;

  return (
    <main className="content page savings-goals-page">
      <header className="page-head savings-head page-header" data-od-id="savings-head">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-kicker">Track shared dreams and personal targets without mixing them into expense totals.</p>
        </div>
        <Button className="btn-primary" type="button" icon={<Plus size={18} />} onClick={() => openForm()}>
          Add new goal
        </Button>
      </header>
      {status ? <StatusMessage tone="error">{status}</StatusMessage> : null}

      <section className="savings-summary card card-soft" aria-label="Savings goal summary" data-od-id="savings-summary">
        <div className="card-head">
          <div>
            <h2 className="card-title">Total Savings Progress</h2>
            <p className="card-subtitle">Summary of ledger contributions across all goals.</p>
          </div>
          <span className="status good">{formatPercent(progress)}</span>
        </div>
        <strong className="metric-value num">{formatMoney(totals.saved)} <span className="metric-note">/ {formatMoney(totals.target)} target</span></strong>
        <div className="progress" aria-label={`Total savings progress ${formatPercent(progress)}`}>
          <span style={{ "--value": `${progress * 100}%` } as CSSProperties} />
        </div>
      </section>

      <section className="grid grid-2 goal-grid" aria-label="Savings goals" data-od-id="goal-cards">
        {loading ? (
          <div className="skeleton-block">Loading savings goals...</div>
        ) : goals.length ? (
          goals.map((goal) => <SavingsGoalCard key={goal.id} goal={goal} onEdit={openForm} onDelete={setDeleting} />)
        ) : (
          <div className="empty-state">
            <h2>No savings goals yet</h2>
            <p>Add the first goal so savings transactions have a dedicated target.</p>
          </div>
        )}
      </section>

      <Dialog
        title={editing ? "Edit Goal" : "Add New Goal"}
        description={editing ? "Update your target details for a clearer path to your future." : "Set a clear target for your shared future. Every small step counts."}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        className="goal-dialog"
        panelClassName="goal-modal"
        headerClassName="goal-modal-head"
        closeButtonClassName="goal-modal-close"
      >
        <SavingsGoalForm editing={editing} saving={saving} onCancel={() => setFormOpen(false)} onSave={saveGoal} />
      </Dialog>

      <Dialog
        title="Delete goal"
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        className="goal-dialog"
        panelClassName="delete-goal-modal"
        showHeader={false}
      >
        <div className="delete-goal-content">
          <div className="delete-goal-head">
            <Trash2 aria-hidden="true" />
            <h2>Delete Goal?</h2>
          </div>
          <p>
            Are you sure you want to delete <strong>{deleting?.name ? `'${deleting.name}'` : "this goal"}</strong>? This action cannot be undone.
          </p>
          <div className="delete-goal-footer actions">
            <Button type="button" className="goal-cancel-button" variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="delete-goal-button"
              variant="danger"
              loading={saving}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
