import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import { Button } from "../../components/Button";
import { parseRpInput } from "../../lib/finance";
import type { SavingsGoal } from "../../lib/api/types";

interface SavingsGoalFormProps {
  editing?: SavingsGoal | null;
  saving?: boolean;
  onCancel: () => void;
  onSave: (goal: {
    id?: string;
    name: string;
    targetAmount: number;
    startingAmount: number;
    targetDate?: string;
  }) => void | Promise<void>;
}

export function SavingsGoalForm({ editing, saving, onCancel, onSave }: SavingsGoalFormProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    setName(editing?.name ?? "");
    setTargetAmount(editing ? String(editing.targetAmount) : "");
    setSavedAmount(editing ? String(editing.startingAmount) : "");
    setTargetDate(editing?.targetDate ?? "");
  }, [editing]);

  return (
    <form
      className="goal-modal-form form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          id: editing?.id,
          name,
          targetAmount: parseRpInput(targetAmount),
          startingAmount: parseRpInput(savedAmount),
          targetDate: targetDate || undefined
        });
      }}
    >
      <div className="goal-field">
        <label htmlFor="goal-name">Goal name</label>
        <input
          id="goal-name"
          name="goalName"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="For example, dream home fund"
          required
        />
      </div>
      <div className="goal-amount-grid">
        <div className="goal-field">
          <label htmlFor="goal-target">Target amount</label>
          <div className="goal-input-wrap">
            <span className="currency-prefix">Rp.</span>
            <input
              id="goal-target"
              name="targetAmount"
              type="number"
              inputMode="numeric"
              min="0"
              value={targetAmount}
              onChange={(event) => setTargetAmount(event.target.value)}
              placeholder="0"
              required
            />
          </div>
        </div>
        <div className="goal-field">
          <label htmlFor="goal-start">Starting contribution <em>(optional)</em></label>
          <div className="goal-input-wrap is-muted">
            <span className="currency-prefix">Rp.</span>
            <input
              id="goal-start"
              name="savedAmount"
              type="number"
              inputMode="numeric"
              min="0"
              value={savedAmount}
              onChange={(event) => setSavedAmount(event.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>
      <div className="goal-field">
        <label htmlFor="goal-date">Target date</label>
        <div className="goal-input-wrap goal-date-wrap">
          <input id="goal-date" name="targetDate" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
        </div>
      </div>
      <div className="goal-share-card">
        <span className="goal-share-icon" aria-hidden="true"><UsersRound size={22} /></span>
        <p>This goal will be shared with the household.</p>
      </div>
      <div className="goal-modal-footer actions">
        <Button className="goal-cancel-button" type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="goal-save-button" type="submit" loading={saving}>{editing ? "Save changes" : "Add goal"}</Button>
      </div>
    </form>
  );
}
