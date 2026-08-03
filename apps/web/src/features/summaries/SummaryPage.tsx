import { useEffect, useState } from "react";
import { useAuth } from "../../app/authState";
import { Input } from "../../components/Input";
import { StatusMessage } from "../../components/StatusMessage";
import { LoadingState, MetricCard, PageHeader, Surface, Toolbar } from "../../components/design-system";
import { getIncomeExpenseHistory, getMonthlySummary } from "../../lib/api/summaries";
import type { HistoricalIncomeExpensePoint, MonthlySummary } from "../../lib/api/types";
import { addMonths, currentMonth, formatMoney } from "../../lib/finance";
import { BudgetStatusList } from "./BudgetStatusList";
import { CategoryChart } from "./CategoryChart";
import { HistoricalIncomeExpenseChart } from "./HistoricalIncomeExpenseChart";
import "./summaries.css";

function formatDashboardMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) {
    return month;
  }
  return new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(Date.UTC(year, monthIndex - 1, 1)));
}

export function SummaryPage() {
  const { activeHousehold } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [history, setHistory] = useState<HistoricalIncomeExpensePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function loadSummary() {
    if (!activeHousehold) return;
    setLoading(true);
    setStatus(null);
    try {
      const result = await getMonthlySummary(activeHousehold.id, month);
      setSummary(result);
      const historyResult = await getIncomeExpenseHistory(activeHousehold.id, addMonths(month, -5), month);
      setHistory(historyResult.points);
    } catch {
      setStatus("Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, [activeHousehold?.id, month]);

  if (!activeHousehold) return null;
  const dashboardMonth = formatDashboardMonth(month);

  const prevMonth = addMonths(month, -1);
  const prevPoint = history.find((p) => p.month === prevMonth);

  const getDeltaInfo = (current: number, prev: number | undefined, isExpense: boolean = false) => {
    if (prev === undefined) {
      return { hasPrev: false, text: "", isPositive: false, pct: 0, diff: 0 };
    }
    const diff = current - prev;
    const pct = prev > 0 ? (diff / prev) * 100 : 0;
    const isPositive = isExpense ? diff < 0 : diff > 0;
    return { hasPrev: true, diff, pct, isPositive };
  };

  const incomeDelta = summary
    ? getDeltaInfo(summary.totals.income, prevPoint?.incomeAmount)
    : { hasPrev: false, diff: 0, pct: 0, isPositive: false };
  const expenseDelta = summary
    ? getDeltaInfo(summary.totals.expenses, prevPoint?.expenseAmount, true)
    : { hasPrev: false, diff: 0, pct: 0, isPositive: false };
  const savingsDelta = summary
    ? getDeltaInfo(
        summary.totals.savings,
        prevPoint ? (prevPoint.savingsAmount ?? prevPoint.netAmount) : undefined
      )
    : { hasPrev: false, diff: 0, pct: 0, isPositive: false };

  const renderMetricNote = (delta: ReturnType<typeof getDeltaInfo>, defaultNote: string) => {
    if (!delta.hasPrev) {
      return <span className="metric-note">{defaultNote}</span>;
    }
    if (delta.diff === 0) {
      return <span className="metric-note neutral-note">No change vs last month</span>;
    }
    const formattedPct = Math.abs(delta.pct).toFixed(0);
    const arrow = delta.diff! > 0 ? "▲" : "▼";
    const statusClass = delta.isPositive ? "positive" : "negative";
    return (
      <span className={`metric-note delta-note ${statusClass}`}>
        <span className="delta-arrow">{arrow}</span>
        <strong>{formattedPct}%</strong> ({formatMoney(Math.abs(delta.diff!))}) vs last month
      </span>
    );
  };

  return (
    <main className="content page summary-page">
      <PageHeader data-od-id="dashboard-head">
        <div>
          <h1 className="page-title">{dashboardMonth} household overview</h1>
          <p className="page-kicker">Track shared spending, savings momentum, and the categories that need a quick conversation.</p>
        </div>
        <Toolbar>
          <Input className="month-picker" label="Choose dashboard month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </Toolbar>
      </PageHeader>
      {status ? <StatusMessage tone="error">{status}</StatusMessage> : null}
      {loading || !summary ? (
        <LoadingState>Loading dashboard...</LoadingState>
      ) : (
        <>
          <section className="summary-metrics metric-row grid grid-3" aria-label="Monthly totals" data-od-id="summary-metrics">
            <MetricCard className="metric metric-railed metric-income">
              <div className="metric-top">
                <span className="metric-label">Total income</span>
                <span className="metric-icon" aria-hidden="true" />
              </div>
              <strong className="metric-value num">{formatMoney(summary.totals.income)}</strong>
              {renderMetricNote(incomeDelta, "Current month total")}
            </MetricCard>
            <MetricCard className="metric metric-railed metric-expense">
              <div className="metric-top">
                <span className="metric-label">Total expenses</span>
                <span className="metric-icon" aria-hidden="true" />
              </div>
              <strong className="metric-value num">{formatMoney(summary.totals.expenses)}</strong>
              {renderMetricNote(expenseDelta, "Recorded expenses this month")}
            </MetricCard>
            <MetricCard className="metric metric-railed metric-saving">
              <div className="metric-top">
                <span className="metric-label">Net savings</span>
                <span className="metric-icon" aria-hidden="true" />
              </div>
              <strong className="metric-value num">{formatMoney(summary.totals.savings)}</strong>
              {renderMetricNote(savingsDelta, "Reserved for shared goals")}
            </MetricCard>
          </section>
          <section className="dashboard-charts dashboard-chart-pair summary-grid grid grid-2" data-od-id="dashboard-charts">
            <Surface as="article">
              <div className="card-head">
                <div>
                  <h2 className="card-title">Monthly spending by category</h2>
                  <p className="card-subtitle">Pie chart for {dashboardMonth} expenses across configured categories.</p>
                </div>
              </div>
              <CategoryChart summary={summary} onSelectCategory={() => undefined} />
            </Surface>
            <Surface as="article">
              <div className="card-head">
                <div>
                <h2 className="card-title">Budget health</h2>
                  <p className="card-subtitle">Progress towards monthly category limits.</p>
                </div>
              </div>
              <BudgetStatusList statuses={summary.budgetStatuses ?? []} onSelectCategory={() => undefined} />
            </Surface>
          </section>
          <section className="budget-and-trend grid" data-od-id="budget-and-trend">
            <Surface as="article" className="trend-card">
              <div className="card-head">
                <div>
                <h2 className="card-title">Cash flow trend</h2>
                  <p className="card-subtitle">6-month overview of income, expenses, and savings.</p>
                </div>
                <div className="trend-legend" aria-label="Trend legend">
                  <span><i className="legend-line income-line" />Income</span>
                  <span><i className="legend-line expense-line" />Expense</span>
                  <span><i className="legend-line savings-line" />Savings</span>
                </div>
              </div>
              <HistoricalIncomeExpenseChart data={history} />
            </Surface>
          </section>
        </>
      )}
    </main>
  );
}
