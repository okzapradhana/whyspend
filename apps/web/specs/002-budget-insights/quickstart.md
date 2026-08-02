# Quickstart: Category Budgets And Dashboard Trends

## Context

This feature extends the current split app:

- Frontend: `whyspend/`
- API: `../whyspend-api/`
- Active spec: `specs/002-budget-insights/spec.md`
- Plan: `specs/002-budget-insights/plan.md`
- Design authority: `DESIGN.md`

## Setup

Install frontend dependencies:

```bash
pnpm install
```

Install API dependencies:

```bash
pnpm --dir ../whyspend-api install
```

Tailwind CSS is the styling foundation for this feature. Configure Tailwind from Serene Union tokens in `DESIGN.md` before building Settings or dashboard UI.

Expected Tailwind setup work for this repo:

```bash
pnpm add tailwindcss @tailwindcss/vite
```

Do not install or generate shadcn/ui components for this feature. Build project-owned components and utilities against Tailwind classes and Serene Union tokens.

## Development Servers

Start the API:

```bash
pnpm --dir ../whyspend-api dev
```

Start the frontend:

```bash
pnpm dev
```

Default URLs:

```text
Frontend: http://127.0.0.1:5173
API:      http://127.0.0.1:4174/api
```

## Implementation Checks

API:

```bash
pnpm --dir ../whyspend-api test
pnpm --dir ../whyspend-api run build
```

Frontend:

```bash
pnpm test
pnpm run build
pnpm exec playwright test
```

## Required Feature Verification

1. Settings budget CRUD:
   - Create expense categories.
   - Set budgets for at least 10 categories.
   - Edit one budget.
   - Remove one budget.
   - Confirm invalid zero, negative, missing, and non-money amounts are rejected.

2. Dashboard selected-month data:
   - Enter income and expense records for a selected month.
   - Confirm totals match transactions.
   - Confirm spending-by-category pie data matches category totals.
   - Confirm spending-vs-budget bar data matches budget statuses.
   - Confirm income vs expenses values are exact.

3. Historical trend:
   - Enter records across multiple months.
   - Include one month with no records.
   - Confirm line chart data includes all months in range.
   - Confirm income and expense legends and text labels are clear without color.

4. Insight stories:
   - Confirm highest-spending story uses correct category and amount.
   - Confirm lowest non-zero spending story ignores zero-spend categories.
   - Confirm over-budget story uses calm, specific language.
   - Confirm no-expense month uses an empty state.

5. UI and accessibility:
   - Inspect desktop and mobile rendered UI.
   - Check hamburger navigation with keyboard.
   - Check Settings budget form focus and validation messages.
   - Check chart legends, labels, and numeric summaries.
   - Check long category names.
   - Check loading, empty, error, success, and overflow states.
   - Confirm Serene Union tokens from `DESIGN.md` are used.

## Tailwind Acceptance Rule

Tailwind passes for this project only if:

- It maps directly to Serene Union tokens from `DESIGN.md`.
- It keeps or improves keyboard and screen-reader accessibility.
- It does not introduce hard-bordered cards, default neutral dashboard aesthetics, or dark banking-style shells.
- It does not replace domain-specific budget, chart, and insight logic.

## Verification Results

Recorded on 2026-06-01 after implementation:

- `pnpm --dir ../whyspend-api test`: PASS, 9 files / 11 tests.
- `pnpm --dir ../whyspend-api run build`: PASS.
- `pnpm test`: PASS, 9 files / 11 tests.
- `pnpm run build`: PASS. Vite reported a non-blocking large bundle warning for the application chunk.
- `pnpm exec playwright test`: PASS, 4 browser smoke tests.

Coverage added:

- Category budget API contract and integration tests cover create, update, delete, list, validation, expense-only categories, inherited defaults, and unauthorized household access.
- Monthly summary API tests cover budget statuses, budget overview totals, spending-by-category chart data, selected-month income vs expenses, history gaps, and insight stories.
- Frontend tests cover Settings budget row validation, dashboard budget overview/status/bars, selected-month charts, history chart labels, and insight story drill-down.
- Playwright confirms desktop shell load, mobile shell load, JWT header behavior, and the register-to-summary smoke path after selector updates for the new budget status rows.

Rendered UI review:

- Dashboard and Settings states use existing project surfaces, Serene Union CSS variables, 24px rounded budget/story/chart containers, non-color labels, tabular currency, and wrapped category/story text.
- Keyboard-visible focus remains handled by global focus styles; chart and budget rows expose text summaries and buttons for drill-down.
- No shadcn/ui package, generated component, or Radix dependency was introduced.
