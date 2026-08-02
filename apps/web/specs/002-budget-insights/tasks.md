# Tasks: Category Budgets And Dashboard Trends

**Input**: Design documents from `/specs/002-budget-insights/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, contracts/ui.md, quickstart.md
**Tests**: Included because the feature plan and quickstart require API, frontend, Playwright, rendered UI, aggregation, chart, authorization, and accessibility verification.
**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or has no dependency on incomplete tasks.
- **[Story]**: User story label for story phases only.
- Every task includes exact file paths.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the styling foundation, folders, and shared project shape required before budget and dashboard work starts.

- [X] T001 Add Tailwind CSS and `@tailwindcss/vite` dependencies in `package.json` and `pnpm-lock.yaml`
- [X] T002 Configure the Tailwind Vite plugin in `vite.config.ts`
- [X] T003 [P] Map Serene Union CSS variables and Tailwind entry styles in `src/styles/app.css`
- [X] T004 [P] Create project-owned design-system barrel and component folder in `src/components/design-system/index.ts`
- [X] T005 [P] Create Settings feature folder with placeholder exports in `src/features/settings/index.ts`
- [X] T006 [P] Create API budgets module folder with placeholder exports in `../whyspend-api/src/modules/budgets/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared contracts, persistence surfaces, and client types that all user stories depend on.

**Critical**: No user story work should start until this phase is complete.

- [X] T007 Extend shared API domain types for `CategoryBudget`, `BudgetStatus`, `MonthlyInsightStory`, and `HistoricalIncomeExpensePoint` in `../whyspend-api/src/modules/shared/types.ts`
- [X] T008 Add reusable budget, money, and month schemas in `../whyspend-api/src/modules/shared/schemas.ts`
- [X] T009 Create PostgreSQL migration for `category_budgets` with household/category/month uniqueness in `../whyspend-api/src/db/migrations/002_category_budgets.sql`
- [X] T010 Extend the Store interface with category budget and bounded history methods in `../whyspend-api/src/db/store.ts`
- [X] T011 Implement in-memory category budget storage and inherited default lookup in `../whyspend-api/src/db/store.ts`
- [X] T012 Implement PostgreSQL category budget persistence, inherited default lookup, and bounded monthly history queries in `../whyspend-api/src/db/store.ts`
- [X] T013 Register the budgets route module in `../whyspend-api/src/server/routes.ts`
- [X] T014 Extend frontend API types for budget statuses, chart series, income-vs-expense history, and insight stories in `src/lib/api/types.ts`
- [X] T015 [P] Create frontend category budget API client functions in `src/lib/api/budgets.ts`
- [X] T016 [P] Extend frontend summary API client functions for monthly dashboard and income-expense history in `src/lib/api/summaries.ts`
- [X] T017 [P] Add shared frontend month and Rp formatting helpers in `src/lib/finance.ts`

**Checkpoint**: Foundation ready. User story implementation can now proceed in priority order or in parallel by separate owners.

---

## Phase 3: User Story 1 - Set Expense Category Budgets In Settings (Priority: P1) MVP

**Goal**: Authenticated household members can set, edit, remove, and review monthly expense category budgets from Settings.

**Independent Test**: Open Settings, create expense categories, set budgets for a selected month, edit one amount, remove one budget, and confirm the selected month shows the expected saved or not-budgeted values.

### Tests for User Story 1

- [X] T018 [P] [US1] Add contract tests for GET/PUT/DELETE category budget endpoints in `../whyspend-api/tests/contract/budgets.contract.test.ts`
- [X] T019 [P] [US1] Add integration tests for budget validation, expense-only categories, inherited defaults, deletion, and JWT household authorization in `../whyspend-api/tests/integration/budgets.integration.test.ts`
- [X] T020 [P] [US1] Add Settings budget component tests for loading, empty, validation, save success, save failure, removal, and long category names in `tests/settings-budgets.test.tsx`

### Implementation for User Story 1

- [X] T021 [US1] Implement category budget service operations in `../whyspend-api/src/modules/budgets/budgetService.ts`
- [X] T022 [US1] Implement category budget Fastify routes for GET, PUT, and DELETE in `../whyspend-api/src/modules/budgets/budgetRoutes.ts`
- [X] T023 [US1] Wire budget route exports through `../whyspend-api/src/modules/budgets/index.ts`
- [X] T024 [US1] Add a Settings route and hamburger navigation label in `src/app/router.tsx`
- [X] T025 [P] [US1] Create the budget month selector component in `src/features/settings/BudgetMonthSelector.tsx`
- [X] T026 [P] [US1] Create the expense category budget row component in `src/features/settings/CategoryBudgetRow.tsx`
- [X] T027 [US1] Create the expense category budget settings panel in `src/features/settings/CategoryBudgetSettings.tsx`
- [X] T028 [US1] Compose category management and category budgets into the Settings page in `src/features/settings/SettingsPage.tsx`
- [X] T029 [US1] Apply Serene Union Tailwind styling for Settings budget states in `src/features/settings/settings.css`

**Checkpoint**: User Story 1 is functional and testable independently as the MVP.

---

## Phase 4: User Story 2 - Compare Spending Against Budgets (Priority: P2)

**Goal**: The dashboard shows actual category spending against budgets with readable totals, status labels, and a spending-vs-budget bar chart.

**Independent Test**: Enter expenses in budgeted and unbudgeted categories for one month, then confirm the dashboard shows actual spending, budget, remaining or exceeded amount, status, and bar chart values for each category.

### Tests for User Story 2

- [X] T030 [P] [US2] Extend monthly summary contract tests for budget overview and budget status fields in `../whyspend-api/tests/contract/summaries.contract.test.ts`
- [X] T031 [P] [US2] Add integration tests for under-budget, at-budget, over-budget, not-budgeted, and budgeted-no-expense states in `../whyspend-api/tests/integration/summaries.integration.test.ts`
- [X] T032 [P] [US2] Add dashboard budget overview, status list, and bar chart component tests in `tests/summary-budgets.test.tsx`

### Implementation for User Story 2

- [X] T033 [US2] Extend monthly summary aggregation with selected-month `BudgetStatus` rows in `../whyspend-api/src/modules/summaries/summaryService.ts`
- [X] T034 [US2] Add monthly budget overview totals to the summary response in `../whyspend-api/src/modules/summaries/summaryService.ts`
- [X] T035 [P] [US2] Create the budget overview component in `src/features/summaries/BudgetOverview.tsx`
- [X] T036 [P] [US2] Create the budget status list with transaction drill-down triggers in `src/features/summaries/BudgetStatusList.tsx`
- [X] T037 [P] [US2] Create the spending-vs-budget bar chart component in `src/features/summaries/SpendingVsBudgetChart.tsx`
- [X] T038 [US2] Integrate budget overview, budget status list, and spending-vs-budget chart into `src/features/summaries/SummaryPage.tsx`
- [X] T039 [US2] Add Serene Union chart, status, and budget variance styling in `src/features/summaries/summaries.css`

**Checkpoint**: User Stories 1 and 2 work independently, and budget comparisons remain traceable to selected-month expense records.

---

## Phase 5: User Story 3 - Read Selected-Month Dashboard Charts (Priority: P3)

**Goal**: The dashboard shows selected-month spending by category and income vs expenses with exact numeric summaries and accessible chart meaning.

**Independent Test**: Create a selected month with income and expense transactions across categories, then confirm the pie chart, category totals, and income-vs-expense values match source records.

### Tests for User Story 3

- [X] T040 [P] [US3] Add API integration tests for spending-by-category and selected-month income-vs-expenses totals in `../whyspend-api/tests/integration/summaries.integration.test.ts`
- [X] T041 [P] [US3] Add frontend tests for spending pie labels, numeric list, income-vs-expense values, and no-expense empty state in `tests/summary-charts.test.tsx`

### Implementation for User Story 3

- [X] T042 [US3] Extend monthly summary aggregation with `spendingByCategory` and `incomeVsExpenses` data in `../whyspend-api/src/modules/summaries/summaryService.ts`
- [X] T043 [US3] Preserve backward-compatible `byCategory`, `byMember`, and `byScope` fields while adding chart fields in `../whyspend-api/src/modules/summaries/summaryService.ts`
- [X] T044 [US3] Refactor the category chart into an accessible spending-by-category pie chart with legend and numeric list in `src/features/summaries/CategoryChart.tsx`
- [X] T045 [P] [US3] Create selected-month income-vs-expenses component in `src/features/summaries/IncomeExpenseSummary.tsx`
- [X] T046 [US3] Integrate spending-by-category and income-vs-expenses surfaces into `src/features/summaries/SummaryPage.tsx`
- [X] T047 [US3] Add chart empty-state, label wrapping, and tabular currency styling in `src/features/summaries/summaries.css`

**Checkpoint**: User Story 3 is independently testable with selected-month source records.

---

## Phase 6: User Story 4 - Compare Income And Expenses Over Time (Priority: P4)

**Goal**: The dashboard shows bounded month-over-month income and expense trends with legends, labels, gaps, and one-month states handled clearly.

**Independent Test**: Create records across multiple months, include a missing month, and confirm the line chart includes every requested month with correct income, expense, and net values.

### Tests for User Story 4

- [X] T048 [P] [US4] Add contract tests for GET income-expenses-history query validation and response shape in `../whyspend-api/tests/contract/summaries.contract.test.ts`
- [X] T049 [P] [US4] Add integration tests for bounded ranges, missing months, one-month range, and zero income or expense values in `../whyspend-api/tests/integration/summaries.integration.test.ts`
- [X] T050 [P] [US4] Add frontend tests for historical line chart legends, labels, missing-month data, and one-month state in `tests/summary-history.test.tsx`

### Implementation for User Story 4

- [X] T051 [US4] Implement bounded monthly income-expense history aggregation in `../whyspend-api/src/modules/summaries/summaryService.ts`
- [X] T052 [US4] Add the income-expenses-history route and query validation in `../whyspend-api/src/modules/summaries/summaryRoutes.ts`
- [X] T053 [US4] Add frontend `getIncomeExpenseHistory` API client support in `src/lib/api/summaries.ts`
- [X] T054 [P] [US4] Create the historical income-vs-expenses line chart component in `src/features/summaries/HistoricalIncomeExpenseChart.tsx`
- [X] T055 [US4] Integrate historical range loading, missing-month handling, and one-month state into `src/features/summaries/SummaryPage.tsx`
- [X] T056 [US4] Add responsive line chart legend and non-color indicator styling in `src/features/summaries/summaries.css`

**Checkpoint**: User Story 4 is independently testable with historical source records.

---

## Phase 7: User Story 5 - Read Monthly Spending Stories (Priority: P5)

**Goal**: The dashboard gives calm, short, plain-language stories for highest spending, lowest non-zero spending, over-budget attention, and no-over-budget or no-expense context.

**Independent Test**: Create a month with multiple categories and budgets, then confirm stories cite the correct category, amount, share, budget variance, and source data without guilt-driven language.

### Tests for User Story 5

- [X] T057 [P] [US5] Add API integration tests for highest-spending, lowest-nonzero, over-budget, under-budget, no-over-budget, no-expense, and tie-breaker story rules in `../whyspend-api/tests/integration/summaries.integration.test.ts`
- [X] T058 [P] [US5] Add frontend tests for insight story rendering, calm copy, source drill-down, and empty states in `tests/summary-insights.test.tsx`

### Implementation for User Story 5

- [X] T059 [US5] Implement deterministic monthly insight story derivation in `../whyspend-api/src/modules/summaries/insightService.ts`
- [X] T060 [US5] Add `insightStories` with `sourceRefs` to the monthly summary response in `../whyspend-api/src/modules/summaries/summaryService.ts`
- [X] T061 [P] [US5] Create the dashboard insight stories component in `src/features/summaries/InsightStories.tsx`
- [X] T062 [US5] Integrate insight story source drill-down with category transactions in `src/features/summaries/SummaryPage.tsx`
- [X] T063 [US5] Add story copy variants for calm attention, positive, neutral, and no-expense states in `src/features/summaries/InsightStories.tsx`
- [X] T064 [US5] Add Serene Union insight story layout and long-text wrapping in `src/features/summaries/summaries.css`

**Checkpoint**: User Story 5 is independently testable after selected-month budget and chart data exist.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Complete docs, verification, accessibility, performance, and anti-slop review across all selected stories.

- [X] T065 [P] Update feature setup, commands, and verification notes in `README.md`
- [X] T066 [P] Update quickstart verification evidence after implementation in `specs/002-budget-insights/quickstart.md`
- [X] T067 Run API test suite and record results in `specs/002-budget-insights/quickstart.md` using `pnpm --dir ../whyspend-api test`
- [X] T068 Run API build and record results in `specs/002-budget-insights/quickstart.md` using `pnpm --dir ../whyspend-api run build`
- [X] T069 Run frontend Vitest suite and record results in `specs/002-budget-insights/quickstart.md` using `pnpm test`
- [X] T070 Run frontend build and record results in `specs/002-budget-insights/quickstart.md` using `pnpm run build`
- [X] T071 Run Playwright responsive and PWA smoke checks and record results in `specs/002-budget-insights/quickstart.md` using `pnpm exec playwright test`
- [X] T072 Verify rendered desktop and mobile dashboard and Settings states against `DESIGN.md` and record findings in `specs/002-budget-insights/quickstart.md`
- [X] T073 Verify keyboard navigation, visible focus, WCAG AA contrast, reduced motion, chart alternatives, and long-label overflow in `src/features/settings/settings.css` and `src/features/summaries/summaries.css`
- [X] T074 Verify no shadcn/ui generated files or dependencies were introduced in `package.json` and `src/components/design-system/index.ts`
- [X] T075 Review unresolved items from `specs/002-budget-insights/checklists/requirements-quality.md` and update requirements or implementation notes before completion

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and budget persistence from US1 for complete end-to-end value.
- **User Story 3 (Phase 5)**: Depends on Foundational and can be built after or beside US2 if summary contracts are stable.
- **User Story 4 (Phase 6)**: Depends on Foundational and can be built independently from budget persistence.
- **User Story 5 (Phase 7)**: Depends on selected-month summary data from US2 and US3.
- **Polish (Phase 8)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 Set Expense Category Budgets**: Start after Phase 2. No dependency on other stories.
- **US2 Compare Spending Against Budgets**: Start after Phase 2, but complete end-to-end validation uses US1 budget data.
- **US3 Read Selected-Month Dashboard Charts**: Start after Phase 2. Independent from US1 budget editing except shared monthly summary response.
- **US4 Compare Income And Expenses Over Time**: Start after Phase 2. Independent from budgets and selected-month budget comparisons.
- **US5 Read Monthly Spending Stories**: Start after US2 and US3 data contracts exist because stories use budget status, category totals, and monthly totals.

### Within Each User Story

- Tests first, then API service and routes, then frontend API client and components, then page integration.
- Data model and Store changes before API route implementation.
- API contract and integration tests before frontend integration that depends on the response shape.
- Component tests before page-level integration.
- Story checkpoint before moving to the next priority when delivering sequentially.

---

## Parallel Execution Examples

### User Story 1

```text
Parallel tests:
- T018 Contract tests in ../whyspend-api/tests/contract/budgets.contract.test.ts
- T019 Integration tests in ../whyspend-api/tests/integration/budgets.integration.test.ts
- T020 Component tests in tests/settings-budgets.test.tsx

Parallel UI work after API contract is stable:
- T025 BudgetMonthSelector in src/features/settings/BudgetMonthSelector.tsx
- T026 CategoryBudgetRow in src/features/settings/CategoryBudgetRow.tsx
```

### User Story 2

```text
Parallel tests:
- T030 Contract tests in ../whyspend-api/tests/contract/summaries.contract.test.ts
- T031 Integration tests in ../whyspend-api/tests/integration/summaries.integration.test.ts
- T032 Component tests in tests/summary-budgets.test.tsx

Parallel components after summary fields are typed:
- T035 BudgetOverview in src/features/summaries/BudgetOverview.tsx
- T036 BudgetStatusList in src/features/summaries/BudgetStatusList.tsx
- T037 SpendingVsBudgetChart in src/features/summaries/SpendingVsBudgetChart.tsx
```

### User Story 3

```text
Parallel tests:
- T040 API chart-total integration tests in ../whyspend-api/tests/integration/summaries.integration.test.ts
- T041 Frontend chart tests in tests/summary-charts.test.tsx

Parallel component work:
- T044 CategoryChart refactor in src/features/summaries/CategoryChart.tsx
- T045 IncomeExpenseSummary in src/features/summaries/IncomeExpenseSummary.tsx
```

### User Story 4

```text
Parallel tests:
- T048 History contract tests in ../whyspend-api/tests/contract/summaries.contract.test.ts
- T049 History integration tests in ../whyspend-api/tests/integration/summaries.integration.test.ts
- T050 Frontend history tests in tests/summary-history.test.tsx

Parallel work:
- T052 History route in ../whyspend-api/src/modules/summaries/summaryRoutes.ts
- T054 HistoricalIncomeExpenseChart in src/features/summaries/HistoricalIncomeExpenseChart.tsx
```

### User Story 5

```text
Parallel tests:
- T057 Story-rule integration tests in ../whyspend-api/tests/integration/summaries.integration.test.ts
- T058 Story rendering tests in tests/summary-insights.test.tsx

Parallel work:
- T059 Insight derivation in ../whyspend-api/src/modules/summaries/insightService.ts
- T061 InsightStories component in src/features/summaries/InsightStories.tsx
```

---

## Implementation Strategy

### MVP First

Deliver **US1 Set Expense Category Budgets In Settings** first. This gives the household real monthly category budgets and creates the required data foundation for dashboard comparisons.

### Incremental Delivery

1. Complete Phase 1 and Phase 2.
2. Deliver US1 and verify Settings budget CRUD independently.
3. Deliver US2 so budgets become visible as monthly spending status.
4. Deliver US3 so the selected month is understandable without manual calculation.
5. Deliver US4 to add historical income-vs-expense trend context.
6. Deliver US5 once the selected-month budget and chart data are reliable.
7. Run Phase 8 verification before reporting completion.

### Validation Requirements

- All task lines use checkbox, task ID, optional `[P]`, story label where required, and exact file paths.
- Tests are included before implementation tasks for each user story.
- Every user story has an independent test criterion and checkpoint.
- API-only persistence is preserved; the frontend uses HTTP clients only.
- Tailwind is used as the styling foundation; shadcn/ui is not introduced.
