export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function addMonths(month: string, delta: number) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function parseRpInput(value: string) {
  const normalized = value.replace(/[^\d]/g, "");
  return normalized ? Number(normalized) : 0;
}

export function formatPercent(value: number, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    maximumFractionDigits: 0,
    ...options
  }).format(value);
}

export function ratioPercent(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return Math.min(Math.max(value / total, 0), 1);
}

export function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) {
    return month;
  }
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(Date.UTC(year, monthIndex - 1, 1)));
}

export function formatChartCurrencyLabel(label: string, value: number) {
  return `${label}: ${formatMoney(value)}`;
}
