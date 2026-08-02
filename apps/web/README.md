# WhySpend

WhySpend is a household finance tracker for two people who currently record transactions in Money Manager and then copy monthly totals into a spreadsheet. The product consolidates that workflow into one shared website for transaction entry, category and savings goal management, income, expenses, savings, budgets, monthly dashboards, charts, and category drill-down.

This repository is the frontend only. The API and PostgreSQL access live in the sibling folder `../whyspend-api`.

## Current Feature Set

- JWT-backed account registration, sign in, sign out, and current-user lookup.
- Household workspace setup for real authenticated users instead of spreadsheet placeholders.
- Household invitations with owner-created links and a seven-day refresh path for an authenticated invited email when a pending link expires; refreshed links keep the current browser origin.
- User-created income, expense, and savings categories.
- Category rename, archive, delete, duplicate protection, and in-use deletion conflict handling.
- Transaction create, list, edit, and delete with type, amount, date, category or savings goal, owner, scope, and note. The Transactions floating add button opens the OpenDesign source-style dialog, and savings transactions select an existing savings goal instead of creating one inline.
- Dashboard rebuilt directly from the OpenDesign source with three monthly metrics, monthly spending by category, Budget Health, and Cash Flow Trend for income, expenses, and savings.
- Settings-owned category and monthly expense budget management with inherited defaults, validation, edit, and remove flows. Expense, income, and savings-goal categories are configured from Settings and reused by transaction entry.
- Savings Goals route backed by household savings categories, savings-transaction progress, add/edit/delete dialogs, and client-side target/date metadata until a dedicated savings-goal API exists.
- OpenDesign direct-port responsive desktop/mobile UI with source HTML/CSS selector traceability, a light product shell, desktop rail, mobile hamburger drawer, Dashboard, Transactions, Settings, Savings Goals, Support placeholder, accessible forms, tables, visual regression coverage, and PWA manifest and service worker assets.
- API-only persistence boundary: the frontend calls HTTP APIs and does not import PostgreSQL clients, migrations, or database credentials.

## Planned Feature Specs

- Settings-based expense category budgets, spending-vs-budget dashboard charts, income-vs-expense trends, and monthly insight stories: `specs/002-budget-insights/spec.md`
- OpenDesign HTML source-screen direct port rebuild: `specs/004-opendesign-html-port/spec.md`
- OpenDesign HTML source-screen direct port implementation plan and design artifacts: `specs/004-opendesign-html-port/plan.md`
- OpenDesign HTML source-screen direct port implementation tasks: `specs/004-opendesign-html-port/tasks.md`
- OpenDesign-guided website redesign scope: `specs/003-opendesign-redesign/spec.md`
- OpenDesign-guided website redesign implementation plan and design artifacts: `specs/003-opendesign-redesign/plan.md`
- OpenDesign-guided website redesign implementation tasks: `specs/003-opendesign-redesign/tasks.md`
- Budget insights implementation plan and design artifacts: `specs/002-budget-insights/plan.md`
- Budget insights implementation tasks: `specs/002-budget-insights/tasks.md`
- Budget insights requirements-quality checklist: `specs/002-budget-insights/checklists/requirements-quality.md`
- Budget insights verification results: `specs/002-budget-insights/quickstart.md`
- UI component architecture decision: use Tailwind CSS with project-owned Serene Union components; do not adopt shadcn/ui for this feature because the evaluated gaps against `DESIGN.md` are too large.

## Project Layout

```text
codexxx/
├── whyspend/        # React TSX + Vite frontend, this repository
└── whyspend-api/    # Fastify API, JWT auth, PostgreSQL access
```

Key frontend paths:

```text
src/app/             # app shell, routing, auth state
src/components/      # shared UI primitives
src/features/        # auth, transactions, categories, summaries
src/lib/api/         # HTTP API client only
src/pwa/             # service worker registration
src/styles/          # global product UI styles
tests/               # Vitest and Playwright tests
specs/001-household-expense-tracker/
specs/002-budget-insights/
specs/003-opendesign-redesign/
specs/004-opendesign-html-port/
```

Key API paths:

```text
../whyspend-api/src/server/
../whyspend-api/src/modules/
../whyspend-api/src/db/
../whyspend-api/tests/
```

## Requirements

- Node.js compatible with the installed dependencies.
- `pnpm`
- PostgreSQL for persistent API runtime use.

The API uses an in-memory store when `DATABASE_URL` is not set, which is useful for tests and local no-database runs. Set `DATABASE_URL` to use PostgreSQL.

## Setup

Install frontend dependencies:

```bash
pnpm install
```

Install API dependencies:

```bash
pnpm --dir ../whyspend-api install
```

Create frontend environment:

```bash
cp .env.example .env
```

Create API environment:

```bash
cp ../whyspend-api/.env.example ../whyspend-api/.env
```

For PostgreSQL-backed API runtime, set `DATABASE_URL` in `../whyspend-api/.env`, then run:

```bash
pnpm --dir ../whyspend-api db:migrate
```

## Development

Start the API:

```bash
pnpm --dir ../whyspend-api dev
```

Start the frontend:

```bash
pnpm dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

API URL:

```text
http://127.0.0.1:4174/api
```

## Verification

Run frontend tests:

```bash
pnpm test
```

Run frontend build:

```bash
pnpm run build
```

Run API tests:

```bash
pnpm --dir ../whyspend-api test
```

Run API build:

```bash
pnpm --dir ../whyspend-api run build
```

Run browser smoke checks:

```bash
pnpm exec playwright test
```

Run OpenDesign token parity:

```bash
pnpm test:tokens
```

Run OpenDesign visual regression:

```bash
pnpm test:visual
```

Run OpenDesign source-structure comparison:

```bash
pnpm test:structure
```

Run the combined OpenDesign gate:

```bash
pnpm check:opendesign
```

The OpenDesign gate runs token parity, source-structure comparison, and visual regression. The Playwright suite starts both the frontend and sibling API dev servers and verifies the full register-to-dashboard smoke path, JWT client behavior, desktop load, mobile load, OpenDesign route vocabulary, auth layouts, timing targets, monthly workflow, keyboard/focus/reduced-motion/mobile overflow, PWA shell assets, and OpenDesign visual screenshots. Playwright is serialized in `playwright.config.ts` because these tests share one local frontend/API pair and include account creation plus visual captures.

Latest OpenDesign HTML port verification passed with `pnpm test`, `pnpm run build`, `pnpm check:opendesign`, and `pnpm exec playwright test`. The production build still emits Vite's large main chunk warning.

## Product And Spec Sources

- Product context: `PRODUCT.md`
- Design system: `DESIGN.md`
- Constitution: `.specify/memory/constitution.md`
- Feature spec: `specs/001-household-expense-tracker/spec.md`
- Budget insights feature spec: `specs/002-budget-insights/spec.md`
- Budget insights implementation plan: `specs/002-budget-insights/plan.md`
- Budget insights implementation tasks: `specs/002-budget-insights/tasks.md`
- Budget insights requirements-quality checklist: `specs/002-budget-insights/checklists/requirements-quality.md`
- OpenDesign-guided website redesign spec: `specs/003-opendesign-redesign/spec.md`
- OpenDesign-guided website redesign implementation plan: `specs/003-opendesign-redesign/plan.md`
- OpenDesign-guided website redesign research: `specs/003-opendesign-redesign/research.md`
- OpenDesign-guided website redesign data model: `specs/003-opendesign-redesign/data-model.md`
- OpenDesign-guided website redesign UI contract: `specs/003-opendesign-redesign/contracts/ui.md`
- OpenDesign-guided website redesign quickstart: `specs/003-opendesign-redesign/quickstart.md`
- OpenDesign-guided website redesign implementation tasks: `specs/003-opendesign-redesign/tasks.md`
- OpenDesign-guided website redesign requirements-quality checklist: `specs/003-opendesign-redesign/checklists/requirements.md`
- OpenDesign direct-port source blueprints and selector maps: `specs/003-opendesign-redesign/artifacts/`
- OpenDesign HTML source-screen direct port spec: `specs/004-opendesign-html-port/spec.md`
- OpenDesign HTML source-screen direct port implementation plan: `specs/004-opendesign-html-port/plan.md`
- OpenDesign HTML source-screen direct port research: `specs/004-opendesign-html-port/research.md`
- OpenDesign HTML source-screen direct port data model: `specs/004-opendesign-html-port/data-model.md`
- OpenDesign HTML source-screen direct port UI contract: `specs/004-opendesign-html-port/contracts/ui.md`
- OpenDesign HTML source-screen direct port quickstart: `specs/004-opendesign-html-port/quickstart.md`
- OpenDesign HTML source-screen direct port implementation tasks: `specs/004-opendesign-html-port/tasks.md`
- OpenDesign HTML source-screen direct port requirements-quality checklist: `specs/004-opendesign-html-port/checklists/requirements.md`
- OpenDesign HTML source-screen direct port source inventory: `specs/004-opendesign-html-port/artifacts/source-inventory.md`
- OpenDesign HTML source-screen direct port acceptance records: `specs/004-opendesign-html-port/artifacts/acceptance-records.md`
- OpenDesign HTML source-screen direct port replacement map: `specs/004-opendesign-html-port/artifacts/replacement-map.md`
- Budget insights research: `specs/002-budget-insights/research.md`
- Budget insights data model: `specs/002-budget-insights/data-model.md`
- Budget insights contracts: `specs/002-budget-insights/contracts/`
- Implementation plan: `specs/001-household-expense-tracker/plan.md`
- Task list: `specs/001-household-expense-tracker/tasks.md`
- Quickstart and latest verification notes: `specs/001-household-expense-tracker/quickstart.md`

## Maintenance Rule

Update this README whenever a new feature, spec, architecture decision, setup step, command, verification result, or implementation behavior is introduced. The README should remain the current entry point for understanding and running WhySpend.
