import { useEffect, useState } from "react";
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
        <label htmlFor="goal-name">Goal Name</label>
        <input
          id="goal-name"
          name="goalName"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g., Dream Home Fund"
          required
        />
      </div>
      <div className="goal-amount-grid">
        <div className="goal-field">
          <label htmlFor="goal-target">Target Amount</label>
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
          <label htmlFor="goal-start">Starting Contribution <em>(Optional)</em></label>
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
        <label htmlFor="goal-date">Target Date</label>
        <div className="goal-input-wrap goal-date-wrap">
          <input id="goal-date" name="targetDate" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
        </div>
      </div>
      <div className="goal-share-card">
        <div className="goal-avatar-pair" aria-hidden="true">
          <span>A</span>
          <span>N</span>
        </div>
        <p>This goal will be shared with the household.</p>
      </div>
      <div className="goal-modal-footer actions">
        <Button className="goal-cancel-button" type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="goal-save-button" type="submit" loading={saving}>{editing ? "Save Changes" : "Add Goal"}</Button>
      </div>
    </form>
  );
}
