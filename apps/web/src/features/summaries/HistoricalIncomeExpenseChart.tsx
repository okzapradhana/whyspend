import type { CSSProperties } from "react";
import type { HistoricalIncomeExpensePoint } from "../../lib/api/types";
import { formatMoney } from "../../lib/finance";

function monthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) return month;
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(Date.UTC(year, monthIndex - 1, 1)));
}

function getBezierPath(values: number[], maxValue: number) {
  if (values.length === 0) return "";
  const points = values.map((val, idx) => ({
    x: pointX(idx, values.length),
    y: pointY(val, maxValue)
  }));
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
    const cpY2 = p1.y;
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function getAreaPath(values: number[], maxValue: number) {
  if (values.length === 0) return "";
  const path = getBezierPath(values, maxValue);
  if (!path) return "";
  const firstX = pointX(0, values.length);
  const lastX = pointX(values.length - 1, values.length);
  return `${path} L ${lastX} 190 L ${firstX} 190 Z`;
}

function pointX(index: number, length: number) {
  return length === 1 ? 500 : (index / (length - 1)) * 1000;
}

function pointY(value: number, maxValue: number) {
  return 190 - (value / maxValue) * 160;
}

export function HistoricalIncomeExpenseChart({ data }: { data: HistoricalIncomeExpensePoint[] }) {
  if (!data.length) return <p className="muted">Historical income and expenses will appear after records are added.</p>;

  const trendData = data.map((point) => ({
    ...point,
    savingsAmount: point.savingsAmount ?? point.netAmount
  }));
  const maxValue = Math.max(1, ...trendData.flatMap((point) => [point.incomeAmount, point.expenseAmount, point.savingsAmount]));
  
  const incomeLine = getBezierPath(trendData.map((p) => p.incomeAmount), maxValue);
  const incomeArea = getAreaPath(trendData.map((p) => p.incomeAmount), maxValue);
  
  const expenseLine = getBezierPath(trendData.map((p) => p.expenseAmount), maxValue);
  const expenseArea = getAreaPath(trendData.map((p) => p.expenseAmount), maxValue);
  
  const savingsLine = getBezierPath(trendData.map((p) => p.savingsAmount), maxValue);
  const savingsArea = getAreaPath(trendData.map((p) => p.savingsAmount), maxValue);

  return (
    <div className="line-chart detailed-trend chart-block" role="img" aria-label="Cash flow trend for income, expenses, and savings over time">
      <div className="trend-grid" aria-hidden="true" />
      <svg viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="income-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="expense-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="savings-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--tertiary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Areas */}
        <path d={incomeArea} fill="url(#income-gradient)" style={{ pointerEvents: "none" }} />
        <path d={expenseArea} fill="url(#expense-gradient)" style={{ pointerEvents: "none" }} />
        <path d={savingsArea} fill="url(#savings-gradient)" style={{ pointerEvents: "none" }} />

        {/* Lines */}
        <path className="trend-path income" d={incomeLine} fill="none" />
        <path className="trend-path expense emphasized" d={expenseLine} fill="none" />
        <path className="trend-path savings dashed" d={savingsLine} fill="none" />
        <g className="expense-points" aria-hidden="true">
          {trendData.map((point, index) => {
            const x = pointX(index, trendData.length);
            const y = pointY(point.expenseAmount, maxValue);
            return <circle key={point.month} cx={x} cy={y} r="5" />;
          })}
        </g>
      </svg>
      {trendData.map((point, index) => {
        const svgX = pointX(index, trendData.length);
        const svgY = pointY(point.expenseAmount, maxValue);
        const x = (svgX / 1000) * 100;
        const y = ((svgY - 30) / 160) * 72 + 14;
        const month = monthLabel(point.month);
        const tooltip = `${month}\nIncome ${formatMoney(point.incomeAmount)}\nExpense ${formatMoney(point.expenseAmount)}\nSavings ${formatMoney(point.savingsAmount)}`;
        const label = `${month}: income ${formatMoney(point.incomeAmount)}, expense ${formatMoney(point.expenseAmount)}, savings ${formatMoney(point.savingsAmount)}`;
        return (
          <button
            key={point.month}
            type="button"
            className="trend-hotspot"
            style={{ "--x": `${x}%`, "--y": `${y}%` } as CSSProperties}
            data-trend-tip={tooltip}
            aria-label={label}
          />
        );
      })}
      <div className="trend-months" aria-hidden="true">
        {trendData.map((point) => (
          <span key={point.month}>{monthLabel(point.month)}</span>
        ))}
      </div>
    </div>
  );
}
