# Implementation Plan: Category Budgets And Dashboard Trends

**Branch**: `002-budget-insights` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-budget-insights/spec.md`

**Note**: User instruction for this plan: strictly follow `DESIGN.md`; shadcn/ui was evaluated and is not adopted for this feature because the gaps against Serene Union are too large. Use Tailwind CSS as the styling foundation for implementation.

## Summary

Add Settings-owned monthly expense category budgets and expand the dashboard with budget comparisons, selected-month category spending, selected-month income vs expenses, month-over-month income vs expenses, and calm monthly insight stories. Implementation extends the existing separated frontend/API architecture: the frontend remains a React TSX + Vite PWA, the sibling API remains the sole persistence boundary, PostgreSQL stores budget data, and dashboard values remain traceable to category budgets and financial records.

UI implementation must follow the Serene Union design system in `DESIGN.md`. Use Tailwind CSS utilities and project-owned components to implement the design tokens, spacing, radii, elevation, forms, navigation, tables, and chart composition. Do not introduce shadcn/ui components for this feature.

## Technical Context

**Language/Version**: TypeScript for frontend and API. Frontend uses React TSX + Vite; API uses TypeScript with Fastify. Exact runtime versions remain those installed in the project during implementation.

**Primary Dependencies**: Existing frontend dependencies: React, Vite, React Router, Recharts, lucide-react, Vitest, Playwright. Planned frontend styling addition: Tailwind CSS with `@tailwindcss/vite`, configured from Serene Union tokens in `DESIGN.md`. Candidate utility additions only if needed: `clsx` and `tailwind-merge` for class composition. Existing API dependencies: Fastify, Zod, jose JWT handling, PostgreSQL client, password hashing, Vitest.

**Storage**: PostgreSQL for users, households, categories, financial records, category budgets, and derived dashboard summaries. The in-memory API store must be extended for local no-database runs and tests.

**Testing**: Frontend Vitest component/unit tests, API Vitest contract/integration tests, Playwright responsive/PWA smoke checks, deterministic budget aggregation tests, chart data tests, JWT authorization tests, keyboard/focus checks, and rendered desktop/mobile inspection.

**Target Platform**: Responsive desktop/mobile PWA browser website backed by a separate HTTP API service.

**Project Type**: Web application with separated frontend and API projects.

**Performance Goals**: Budget save and dashboard refresh should feel immediate. Dashboard budget status, charts, and insight stories should update within one second for normal two-person household data volumes: up to 2 members, 50 categories, 500 selected-month records, and a 24-month historical trend range.

**Constraints**: Must follow `DESIGN.md` Serene Union guidelines strictly. JWT-authenticated household access, PostgreSQL persistence, no frontend database access, API-only persistence boundary, responsive hamburger navigation for desktop and mobile, WCAG AA, PWA behavior, reduced motion, no clipped text, and all budget/chart/insight totals traceable to records or budgets.

**Scale/Scope**: Household of two members, user-managed income categories, expense categories, savings goals, category budgets, selected-month dashboard charts, historical income/expense line chart, and insight stories. Historical imports and multi-household management are out of scope.

**Product Context**: Supports PRODUCT.md workflows for category budgets, Settings-based household configuration, dashboard monthly review, income/expense/savings tracking, and replacement of Money Manager plus spreadsheet handoff.

**Design Context**: DESIGN.md exists and is binding. The implementation must use Serene Union: Soft Minimalism, off-white/warm-sand surfaces, Sage Green primary, Soft Blue secondary, 8px spacing unit, 24px card/navigation radii, ambient shadows, borderless cards, soft beige inputs, 2px Soft Blue focus glow, accessible chart legends/labels, and calm copy. Impeccable product register still applies, but DESIGN.md overrides the recent darker shell direction where they conflict. Anti-references remain generic banking dashboards, gamified guilt, decorative charts, spreadsheet mimicry, vague card grids, weak contrast, and inconsistent component vocabulary.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Household Finance Workflow First**: PASS. Budgets, dashboard charts, and insight stories reduce the Money Manager to spreadsheet handoff by showing category limits, actual spending, income, expenses, and trends in one shared app.
- **Specified And Independently Testable Slices**: PASS. P1 Settings budgets can ship and be validated independently before dashboard bar charts, trend charts, and insight stories are added.
- **Product UI Anti-Slop Gates**: PASS. Primary actions are budget configuration in Settings and monthly review on Dashboard. Required states include loading, empty, validation error, save success/failure, long category names, mobile, desktop, focus, and chart overflow. `DESIGN.md` and Impeccable product register define the design contract and anti-references.
- **Data Integrity And Shared Ownership**: PASS. Budgets attach to household expense categories and months; summaries derive from authenticated household financial records; income, expenses, savings, budgets, actuals, remaining, and exceeded amounts remain explicitly labeled and traceable.
- **Verification Before Done**: PASS. Plan requires API and frontend tests, contract checks, aggregation checks, chart data checks, rendered mobile/desktop checks, keyboard/focus checks, contrast checks, and Playwright smoke coverage.

## Project Structure

### Documentation (this feature)

```text
specs/002-budget-insights/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.md
│   └── ui.md
└── tasks.md
```

### Source Code (repository root)

```text
whyspend/
├── src/
│   ├── app/
│   │   └── router.tsx
│   ├── components/
│   │   └── design-system/
│   ├── features/
│   │   ├── settings/
│   │   ├── summaries/
│   │   ├── transactions/
│   │   └── categories/
│   ├── lib/
│   │   └── api/
│   ├── pwa/
│   └── styles/
└── tests/
    ├── e2e/
    └── *.test.tsx

../whyspend-api/
├── src/
│   ├── modules/
│   │   ├── budgets/
│   │   ├── categories/
│   │   ├── summaries/
│   │   └── transactions/
│   ├── db/
│   │   └── migrations/
│   └── server/
└── tests/
    ├── contract/
    └── integration/
```

**Structure Decision**: Keep the current split frontend/API structure. Add a frontend `settings` feature for category and budget configuration, extend `summaries` for dashboard charts and stories, and add an API `budgets` module plus summary extensions. Tailwind configuration and global token mapping belong in the frontend styling setup, while WhySpend-specific Serene Union components belong under `src/components/design-system/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Tailwind adoption adds a utility styling layer beside existing CSS custom properties | Needed to implement Serene Union consistently across new Settings, dashboard, chart, and responsive surfaces | Continuing with only ad hoc CSS would make token, spacing, and component consistency harder to enforce across this larger UI slice |
| Dashboard adds multiple chart types | Required by PRODUCT.md and the feature spec for pie, bar, and line charts | Numeric-only summaries would fail the requested dashboard chart workflows |

## Phase 0 Research Summary

See [research.md](./research.md).

Key decisions:
- Use Tailwind CSS with project-owned Serene Union components.
- Do not adopt shadcn/ui for this feature after evaluating its gaps against `DESIGN.md`.
- Keep Serene Union from `DESIGN.md` as the source of truth.
- Store category budgets as household/category/month records.
- Extend monthly summary contracts instead of inventing unrelated dashboard endpoints for selected-month data.
- Add a bounded historical trend endpoint for income vs expenses.

## Phase 1 Design Summary

See [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md), [contracts/ui.md](./contracts/ui.md), and [quickstart.md](./quickstart.md).

Post-design constitution re-check:
- **Household Finance Workflow First**: PASS. Settings budgets and dashboard trend contracts directly support category aggregation and monthly review.
- **Specified And Independently Testable Slices**: PASS. Contracts separate P1 budget CRUD, P2 budget comparison, P3 selected-month charts, P4 historical chart, and P5 stories.
- **Product UI Anti-Slop Gates**: PASS. UI contract binds implementation to DESIGN.md, hamburger navigation, explicit states, chart legends, non-color labels, accessibility, and rendered verification.
- **Data Integrity And Shared Ownership**: PASS. Data model and API contracts preserve household authorization, category/month budget identity, transaction traceability, and derived summary reproducibility.
- **Verification Before Done**: PASS. Quickstart lists API, frontend, build, Playwright, rendered UI, and design-system checks.
