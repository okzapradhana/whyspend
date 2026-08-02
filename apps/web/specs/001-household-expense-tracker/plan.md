# Implementation Plan: Household Expense Tracker

**Branch**: `001-household-expense-tracker` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-household-expense-tracker/spec.md`

## Summary

Build WhySpend as a split web application: this repository is the React TSX + Vite frontend, and a sibling API repository/folder handles all persistence and PostgreSQL access. The first release focuses on JWT-authenticated household members creating accounts, entering expense/income/savings transactions, reviewing selected-month transaction lists, managing categories and savings goals from Settings, reviewing monthly summaries with clear charts, and drilling into category totals to see contributing transactions.

## Technical Context

**Language/Version**: TypeScript for frontend and API. Exact runtime/package versions are chosen during implementation from current stable project defaults.

**Primary Dependencies**: React TSX, Vite, React Router, PWA support, a charting library for accessible financial summaries, API client utilities in the frontend; TypeScript HTTP API framework, validation, JWT authentication/authorization, PostgreSQL client/migrations, and password handling in the sibling API.

**Storage**: PostgreSQL for users, households, categories, financial records, and derived monthly summaries.

**Testing**: Frontend unit/component tests, API unit/integration tests, contract tests for API responses, JWT authorization tests, PWA/responsive checks, and end-to-end smoke checks for account creation, login, hamburger navigation, transaction entry, selected-month transaction lists, Settings-based category management, category drill-down, and monthly summaries.

**Target Platform**: Responsive PWA browser website for desktop and mobile widths, backed by a separate HTTP API service.

**Project Type**: Web application with separated frontend and API projects.

**Performance Goals**: Transaction entry should feel immediate; monthly summary and category drill-down changes should render within one second for normal household data volumes.

**Constraints**: JWT-authenticated household access, PostgreSQL persistence, no direct database calls from the frontend, frontend and API kept in separate sibling folders, responsive desktop/mobile PWA, toggleable hamburger navigation for product pages, Settings-based expense category configuration, WCAG AA UI baseline, and all financial totals traceable to records.

**Scale/Scope**: First release supports one household with two members, user-created income categories, expense categories, savings goals, transaction CRUD, selected-month transaction lists, monthly summaries, category drill-down transaction lists, and charts. Historical imports from Money Manager or Google Sheets are out of scope.

**Product Context**: WhySpend replaces the current Money Manager plus spreadsheet workflow by consolidating transaction entry, category totals, income, savings, and monthly review into one shared website.

**Design Context**: Product register from PRODUCT.md and Serene Union design system from DESIGN.md. Implementation must use Impeccable product guidance, then run Impeccable shape/craft or audit/polish for user-facing surfaces. Anti-references: generic banking dashboards, gamified guilt patterns, decorative charts, and spreadsheet mimicry as the primary experience.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Household Finance Workflow First**: PASS. The plan centers on account creation, transaction entry, categories, savings goals, income, savings, budgets, and monthly summaries in one website.
- **Specified And Independently Testable Slices**: PASS. US1 transaction entry can ship as the MVP before category management and charts are expanded.
- **Product UI Anti-Slop Gates**: PASS. UI contracts require primary action, states, accessibility, desktop/mobile responsive checks, PWA behavior, hamburger navigation, Settings ownership for configuration, chart purpose, and Impeccable review.
- **Data Integrity And Shared Ownership**: PASS. Data model includes authenticated users, JWT authorization, households, category type/scope, PostgreSQL persistence, user-created categories, and traceable derived totals.
- **Verification Before Done**: PASS. Plan requires frontend, API, contract, data aggregation, rendered UI, and end-to-end checks.

## Project Structure

### Documentation (this feature)

```text
specs/001-household-expense-tracker/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.md
│   └── ui.md
└── tasks.md
```

### Source Code

```text
whyspend/                    # current repository: frontend only
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── categories/
│   │   └── summaries/
│   ├── lib/
│   │   └── api/
│   ├── pwa/
│   └── styles/
└── tests/

../whyspend-api/             # sibling API repository/folder
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── households/
│   │   ├── transactions/
│   │   ├── categories/
│   │   └── summaries/
│   ├── db/
│   │   ├── migrations/
│   └── server/
└── tests/
```

**Structure Decision**: Use a sibling API project instead of a monorepo package inside the frontend repo because the user explicitly requires the API to live in another repo/folder and all DB calls to go through that API. The frontend may contain only API client code, never PostgreSQL client code or migrations.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Separate sibling API project | Required by user and supports strict DB access boundary | A single Vite app with direct DB access violates the API-only database rule |
