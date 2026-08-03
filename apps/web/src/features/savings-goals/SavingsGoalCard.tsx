import { Calendar, Home, MoreVertical, Pencil, PiggyBank, Plane, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { Button } from "../../components/Button";
import { Surface } from "../../components/design-system";
import { formatMoney, formatPercent, ratioPercent } from "../../lib/finance";
import type { SavingsGoal } from "../../lib/api/types";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
}

export function SavingsGoalCard({ goal, onEdit, onDelete }: SavingsGoalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = ratioPercent(goal.savedAmount, goal.targetAmount);
  const Icon = iconForGoal(goal.name);

  return (
    <Surface as="article" className={`goal-card${menuOpen ? " menu-open" : ""}`} data-goal-card>
      <div className="card-head goal-card-head">
        <span className="row-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <div className="goal-card-actions goal-card__menu">
          <Button
            className="goal-menu-button"
            type="button"
            variant="ghost"
            icon={<MoreVertical size={22} />}
            aria-expanded={menuOpen}
            aria-label={`Open ${goal.name} menu`}
            iconOnly
            onClick={() => setMenuOpen((open) => !open)}
          >
            Actions
          </Button>
          {menuOpen ? (
            <div className="goal-card-menu goal-card__menu-list" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(goal);
                }}
              >
                <Pencil size={16} /> Edit
              </button>
              <button
                type="button"
                className="danger"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(goal);
                }}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <h2 className="card-title">{goal.name}</h2>
      <p className="card-subtitle num">{formatMoney(goal.savedAmount)} / {formatMoney(goal.targetAmount)}</p>
      <div className="goal-meta-row">
        <span>
          <Calendar size={16} aria-hidden="true" />
          {formatGoalDate(goal.targetDate)}
        </span>
        <span>
          Progress <strong>{formatPercent(progress)}</strong>
        </span>
      </div>
      <div className="progress" aria-label={`${goal.name} progress ${formatPercent(progress)}`}>
        <span style={{ "--value": `${progress * 100}%` } as CSSProperties} />
      </div>
    </Surface>
  );
}

function formatGoalDate(targetDate?: string | null) {
  if (!targetDate) {
    return "No target date";
  }
  const [year, month] = targetDate.split("-").map(Number);
  if (!year || !month) {
    return targetDate;
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1))
  );
}

function iconForGoal(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("emergency")) return ShieldCheck;
  if (normalized.includes("trip") || normalized.includes("japan")) return Plane;
  if (normalized.includes("rumah") || normalized.includes("home") || normalized.includes("house")) return Home;
  if (normalized.includes("phone") || normalized.includes("handphone")) return Smartphone;
  return PiggyBank;
}
