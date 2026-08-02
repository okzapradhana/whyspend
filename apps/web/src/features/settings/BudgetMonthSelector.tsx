import { Input } from "../../components/Input";

export function BudgetMonthSelector({ month, onChange }: { month: string; onChange: (month: string) => void }) {
  return <Input label="Budget month" type="month" value={month} onChange={(event) => onChange(event.target.value)} />;
}
