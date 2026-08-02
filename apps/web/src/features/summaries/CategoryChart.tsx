import { useState, type CSSProperties } from "react";
import type { MonthlySummary } from "../../lib/api/types";
import { formatMoney, formatPercent } from "../../lib/finance";

const colorSlots = [
  { className: "primary", color: "#416743" },
  { className: "secondary", color: "#406373" },
  { className: "tertiary", color: "#615e57" },
  { className: "warn", color: "#a66f3f" },
  { className: "muted", color: "#a09b93" },
  { className: "primary", color: "#7da67d" },
  { className: "secondary", color: "#a7ccde" },
  { className: "muted", color: "#d4cec6" }
];

function normalizePercent(value: number, amount: number, total: number) {
  if (Number.isFinite(value) && value > 0) {
    return value > 1 ? value / 100 : value;
  }
  return total > 0 ? amount / total : 0;
}

export function CategoryChart({ summary, onSelectCategory }: { summary: MonthlySummary; onSelectCategory: (categoryId: string) => void }) {
  const sourceData = (summary.spendingByCategory?.length
    ? summary.spendingByCategory
    : summary.byCategory
        .filter((item) => item.type === "expense")
        .map((item) => ({ categoryId: item.categoryId, label: item.categoryName, amount: item.amount, percentOfExpenses: 0, transactionCount: item.transactionCount }))
  ).slice(0, 8);
  const total = sourceData.reduce((sum, item) => sum + item.amount, 0);
  const data = sourceData.map((item) => ({
    ...item,
    percentOfExpenses: normalizePercent(item.percentOfExpenses, item.amount, total)
  }));

  const [activeItem, setActiveItem] = useState<typeof data[number] | null>(null);

  if (!data.length) return <p className="muted">Expense categories will appear after transactions are added.</p>;

  let offset = 0;

  return (
    <div className="category-chart-grid grid grid-2">
      <div className="pie-chart chart-block" role="img" aria-label="Expense totals by category">
        <svg className="pie-svg" viewBox="0 0 120 120" aria-hidden="true">
          {data.map((item, index) => {
            const slot = colorSlots[index % colorSlots.length];
            const slice = Math.max(item.percentOfExpenses * 100, 0);
            const currentOffset = offset;
            offset -= slice;
            const isHovered = activeItem?.label === item.label;

            // Calculate midpoint of slice for inline percentage labels
            const midPath = -currentOffset + slice / 2;
            const angleRad = (midPath / 100) * 2 * Math.PI;
            const R = 46;
            const labelX = 60 + R * Math.cos(angleRad);
            const labelY = 60 + R * Math.sin(angleRad);
            // Render label if it's significant (>= 3.5%) to avoid crowding
            const showLabel = item.percentOfExpenses >= 0.035;

            return (
              <g key={item.categoryId}>
                <circle
                  className={`pie-slice slice-${slot.className}${isHovered ? " active" : ""}`}
                  data-pie-slice={`${item.label}\n${formatMoney(item.amount)} • ${formatPercent(item.percentOfExpenses)}`}
                  aria-label={`${item.label}, ${formatMoney(item.amount)}, ${formatPercent(item.percentOfExpenses)}`}
                  cx="60"
                  cy="60"
                  r="46"
                  pathLength="100"
                  strokeDasharray={`${slice} ${Math.max(100 - slice, 0)}`}
                  strokeDashoffset={currentOffset}
                  style={{ "--slice-color": slot.color } as CSSProperties}
                  onMouseEnter={() => setActiveItem(item)}
                  onMouseLeave={() => setActiveItem(null)}
                  onFocus={() => setActiveItem(item)}
                  onBlur={() => setActiveItem(null)}
                />
                {showLabel && (
                  <text
                    x={labelX}
                    y={labelY + 1.5}
                    className="pie-slice-percentage"
                    textAnchor="middle"
                    transform={`rotate(90, ${labelX}, ${labelY})`}
                  >
                    {formatPercent(item.percentOfExpenses)}
                  </text>
                )}
              </g>
            );
          })}
          <g className="pie-center-text">
            <text x="60" y={activeItem ? 49 : 55} className="pie-center-label" textAnchor="middle">
              {activeItem ? activeItem.label : "Total Spent"}
            </text>
            <text x="60" y={activeItem ? 64 : 70} className="pie-center-value" textAnchor="middle">
              {formatMoney(activeItem ? activeItem.amount : total)}
            </text>
            {activeItem && (
              <text x="60" y="76" className="pie-center-sub" textAnchor="middle">
                {formatPercent(activeItem.percentOfExpenses)} of total
              </text>
            )}
          </g>
        </svg>
        <span className="pie-hover-value" aria-live="polite" />
      </div>
      <ul className="legend legend-only chart-legend" aria-label="Expense category totals">
        {data.map((item, index) => {
          const slot = colorSlots[index % colorSlots.length];
          const percent = formatPercent(item.percentOfExpenses);
          return (
            <li key={item.categoryId} className="legend-item">
              <button
                type="button"
                onClick={() => onSelectCategory(item.categoryId)}
                aria-label={`${item.label}, ${formatMoney(item.amount)}${percent ? `, ${percent}` : ""}`}
              >
                <span className={`dot ${slot.className}`} style={{ background: slot.color }} aria-hidden="true" />
                <span>{item.label}</span>
                <strong>
                  {formatMoney(item.amount)}
                  {percent ? ` · ${percent}` : ""}
                </strong>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
