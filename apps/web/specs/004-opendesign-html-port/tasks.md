# Tasks: OpenDesign HTML Port

**Input**: Design documents from `specs/004-opendesign-html-port/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui.md](./contracts/ui.md), [quickstart.md](./quickstart.md)

**Tests**: Test and verification tasks are included because the feature spec and constitution require route-by-route acceptance review, OpenDesign comparison, accessibility checks, responsive checks, and production state coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish source inventory, acceptance evidence location, and shared comparison scaffolding before route work starts.

- [X] T001 Create OpenDesign source inventory for all six screens in specs/004-opendesign-html-port/artifacts/source-inventory.md
- [X] T002 Create route acceptance evidence template from contracts/ui.md in specs/004-opendesign-html-port/artifacts/acceptance-records.md
- [X] T003 [P] Update scripts/compare-opendesign-structure.mjs so checks enforce visual-vocabulary presence without requiring strict DOM parity
- [X] T004 [P] Add or refresh OpenDesign source path constants for visual tests in tests/e2e/opendesign-visual-regression.spec.ts
- [X] T005 [P] Add route contract notes for old TSX removal/replacement in specs/004-opendesign-html-port/artifacts/replacement-map.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared app shell, styles, components, and test harness prerequisites that all route rebuilds depend on.

**CRITICAL**: No user story route rebuild should begin until this phase is complete.

- [X] T006 Rebuild shared product shell from dashboard.html shell patterns in src/app/router.tsx
- [X] T007 Rework global OpenDesign tokens, shell, auth, card, table, dialog, drawer, chart, and responsive styles from assets/app.css in src/styles/app.css
- [X] T008 [P] Audit shared Button component against OpenDesign button vocabulary in src/components/Button.tsx
- [X] T009 [P] Audit shared Dialog component against OpenDesign dialog vocabulary in src/components/Dialog.tsx
- [X] T010 [P] Audit shared Input and Select components against OpenDesign auth/form/soft-input vocabulary in src/components/Input.tsx and src/components/Select.tsx
- [X] T011 Add source-screen route smoke helpers and authenticated household setup utilities in tests/test-utils.tsx
- [X] T012 Update app shell desktop/mobile navigation tests for desktop rail, mobile hamburger drawer, account pill, and support destination in tests/app-shell.test.tsx
- [X] T013 Update mobile shell overflow and keyboard focus checks for drawer behavior in tests/app-shell-mobile.test.tsx
- [X] T014 Run pnpm test:tokens and record any token-drift actions in specs/004-opendesign-html-port/artifacts/acceptance-records.md

**Checkpoint**: Foundation ready. Shared shell and source styling vocabulary exist, and route implementation can proceed.

---

## Phase 3: User Story 1 - Port Every Route From Source Screens (Priority: P1) - MVP

**Goal**: Each covered route visually matches its OpenDesign source screen and old TSX-rendered layouts are deleted or replaced.

**Independent Test**: Compare each live route against its matching `screens/*.html` file and confirm rendered layout, controls, labels, card vocabulary, form vocabulary, navigation model, and visual rhythm match except for documented differences.

### Tests for User Story 1

- [X] T015 [P] [US1] Update auth visual regression coverage for login.html and signup.html in tests/e2e/opendesign-visual-regression.spec.ts
- [X] T016 [P] [US1] Update dashboard visual regression coverage for dashboard.html in tests/e2e/opendesign-visual-regression.spec.ts
- [X] T017 [P] [US1] Update transactions visual regression coverage for transactions.html in tests/e2e/opendesign-visual-regression.spec.ts
- [X] T018 [P] [US1] Update settings visual regression coverage for settings.html in tests/e2e/opendesign-visual-regression.spec.ts
- [X] T019 [P] [US1] Update savings goals visual regression coverage for savings-goals.html in tests/e2e/opendesign-visual-regression.spec.ts
- [X] T020 [P] [US1] Update OpenDesign route vocabulary tests for all rebuilt route landmarks in tests/e2e/opendesign-redesign.spec.ts

### Implementation for User Story 1

- [X] T021 [US1] Rebuild AuthPage login and signup rendered layouts from screens/login.html and screens/signup.html in src/features/auth/AuthPage.tsx
- [X] T022 [US1] Rebuild dashboard route visual layout from screens/dashboard.html in src/features/summaries/SummaryPage.tsx
- [X] T023 [P] [US1] Rebuild dashboard category pie visual shell from dashboard.html in src/features/summaries/CategoryChart.tsx
- [X] T024 [P] [US1] Rebuild dashboard budget health visual shell from dashboard.html in src/features/summaries/BudgetStatusList.tsx
- [X] T025 [P] [US1] Rebuild dashboard cash-flow trend visual shell from dashboard.html in src/features/summaries/HistoricalIncomeExpenseChart.tsx
- [X] T026 [US1] Remove or relocate old dashboard-only sections that do not map to dashboard.html from src/features/summaries/SummaryPage.tsx
- [X] T027 [US1] Rebuild transactions route visual layout and floating add button from screens/transactions.html in src/features/transactions/TransactionsPage.tsx
- [X] T028 [US1] Rebuild transaction dialog visual structure from screens/transactions.html in src/features/transactions/TransactionForm.tsx
- [X] T029 [P] [US1] Rebuild transaction ledger table visual structure from screens/transactions.html in src/features/transactions/TransactionList.tsx
- [X] T030 [US1] Rebuild Settings route visual layout from screens/settings.html in src/features/settings/SettingsPage.tsx
- [X] T031 [P] [US1] Rebuild expense category budget rows to match settings.html in src/features/settings/CategoryBudgetRow.tsx
- [X] T032 [P] [US1] Rebuild category budget settings table structure to match settings.html in src/features/settings/CategoryBudgetSettings.tsx
- [X] T033 [US1] Rebuild Savings Goals route visual layout from screens/savings-goals.html in src/features/savings-goals/SavingsGoalsPage.tsx
- [X] T034 [P] [US1] Rebuild savings goal card visual layout and menu from savings-goals.html in src/features/savings-goals/SavingsGoalCard.tsx
- [X] T035 [P] [US1] Rebuild savings goal add/edit form visual layout from savings-goals.html in src/features/savings-goals/SavingsGoalForm.tsx
- [X] T036 [US1] Remove obsolete category page route usage or document non-route reuse in src/features/categories/CategoriesPage.tsx
- [X] T037 [US1] Record source screen, old TSX replacement, and visual differences for auth, shell, dashboard, transactions, settings, and savings goals in specs/004-opendesign-html-port/artifacts/acceptance-records.md
- [X] T038 [US1] Run pnpm test:structure and pnpm test:visual and record results in specs/004-opendesign-html-port/artifacts/acceptance-records.md

**Checkpoint**: User Story 1 is complete when each route renders from rebuilt TSX and visually maps to the OpenDesign source screens.

---

## Phase 4: User Story 2 - Bind Source Layouts To Real Household Data (Priority: P2)

**Goal**: Replace OpenDesign sample data with live WhySpend auth, household, transaction, category, budget, summary, and savings goal data without changing source-screen visual layouts.

**Independent Test**: Load realistic household data and verify each source-screen section displays live names, categories, months, Rp amounts, records, budgets, and goal progress while retaining the rebuilt visual layout.

### Tests for User Story 2

- [X] T039 [P] [US2] Add auth login/signup field and status behavior tests in tests/auth-opendesign.test.tsx
- [X] T040 [P] [US2] Add dashboard live-data section tests for metrics, category spending, budget health, and cash-flow trend in tests/summary-opendesign.test.tsx
- [X] T041 [P] [US2] Add transaction plus dialog, type toggle, savings goal selector, and edit-prefill tests in tests/transactions-opendesign.test.tsx
- [X] T042 [P] [US2] Add settings live category, budget, income category, savings goal category, and household access tests in tests/settings-opendesign.test.tsx
- [X] T043 [P] [US2] Add savings goal add/edit/delete live behavior tests in tests/savings-goals-opendesign.test.tsx

### Implementation for User Story 2

- [X] T044 [US2] Bind login and signup source layouts to existing auth APIs and status messages in src/features/auth/AuthPage.tsx
- [X] T045 [US2] Bind dashboard month picker, metrics, spending by category, budget health, and cash-flow trend to summary APIs in src/features/summaries/SummaryPage.tsx
- [X] T046 [P] [US2] Bind CategoryChart to live expense category spending while preserving source legend and hover/value behavior in src/features/summaries/CategoryChart.tsx
- [X] T047 [P] [US2] Bind BudgetStatusList to live budget status while preserving source progress rows in src/features/summaries/BudgetStatusList.tsx
- [X] T048 [P] [US2] Bind HistoricalIncomeExpenseChart to live income, expense, and savings trend data in src/features/summaries/HistoricalIncomeExpenseChart.tsx
- [X] T049 [US2] Bind transactions month, search, type filters, ledger rows, and edit actions to transaction APIs in src/features/transactions/TransactionsPage.tsx
- [X] T050 [US2] Replace transaction inline category/goal creation with source transaction type toggle and existing category/goal selectors in src/features/transactions/TransactionForm.tsx
- [X] T051 [US2] Implement transaction edit behavior using the same source-style dialog with prefilled selected record in src/features/transactions/TransactionsPage.tsx and src/features/transactions/TransactionForm.tsx
- [X] T052 [US2] Bind settings expense categories, budgets, income categories, savings goal categories, and household access to existing API clients in src/features/settings/SettingsPage.tsx
- [X] T053 [P] [US2] Bind category budget rows to live budget, actual, difference, and status data in src/features/settings/CategoryBudgetRow.tsx
- [X] T054 [US2] Replace hardcoded savings goals with API-backed household goals in src/features/savings-goals/SavingsGoalsPage.tsx
- [X] T055 [US2] Bind savings goal card menus, add dialog, edit dialog, and delete confirmation to live goal create/update/delete behavior in src/features/savings-goals/SavingsGoalsPage.tsx
- [X] T056 [P] [US2] Update API type definitions for savings goal bindings if required in src/lib/api/types.ts
- [X] T057 [P] [US2] Add or update savings goal API client methods if required in src/lib/api/budgets.ts or src/lib/api/categories.ts
- [X] T058 [US2] Record live data substitutions for every route in specs/004-opendesign-html-port/artifacts/acceptance-records.md

**Checkpoint**: User Story 2 is complete when rebuilt routes use real product data and preserve WhySpend data meanings.

---

## Phase 5: User Story 3 - Preserve Product Quality After The Direct Port (Priority: P3)

**Goal**: Harden all rebuilt routes across accessibility, responsive behavior, production states, realistic data ranges, reduced motion, and route acceptance evidence.

**Independent Test**: Exercise every rebuilt route with keyboard navigation, mobile hamburger navigation, loading, empty, error, success, long text, high Rp amounts, dialogs, menus, and reduced-motion preferences.

### Tests for User Story 3

- [X] T059 [P] [US3] Add route loading, empty, error, and success state tests in tests/opendesign-states.test.tsx
- [X] T060 [P] [US3] Add long category, high Rp amount, long note, and menu overflow tests in tests/opendesign-overflow.test.tsx
- [X] T061 [P] [US3] Add Playwright keyboard, focus, reduced-motion, mobile drawer, and no-clipping checks in tests/e2e/opendesign-redesign.spec.ts
- [X] T062 [P] [US3] Add PWA shell asset smoke coverage for rebuilt routes in tests/e2e/household-expense-tracker.spec.ts

### Implementation for User Story 3

- [X] T063 [US3] Add loading, empty, error, success, and disabled states to auth, dashboard, transactions, settings, and savings goals routes in src/features
- [X] T064 [US3] Add accessible names, aria-live status regions, dialog focus management, menu keyboard behavior, and escape handling in src/app/router.tsx and src/components/Dialog.tsx
- [X] T065 [US3] Add responsive overflow handling for cards, charts, tables, dialogs, drawer, and action menus in src/styles/app.css
- [X] T066 [P] [US3] Add reduced-motion alternatives for drawer, dialog, menu, chart, and hover transitions in src/styles/app.css
- [X] T067 [P] [US3] Verify and adjust WCAG AA contrast for body text, form labels, placeholders, chart labels, buttons, and status text in src/styles/app.css
- [X] T068 [US3] Ensure savings, income, expenses, budget, actual, difference, and goal progress use non-color labels and accessible names in src/features/summaries, src/features/transactions, src/features/settings, and src/features/savings-goals
- [X] T069 [US3] Update OpenDesign visual snapshots after rendered verification in tests/e2e/opendesign-visual-regression.spec.ts-snapshots
- [X] T070 [US3] Run pnpm test, pnpm run build, pnpm exec playwright test, and pnpm check:opendesign, then record results in specs/004-opendesign-html-port/artifacts/acceptance-records.md

**Checkpoint**: User Story 3 is complete when all production states, accessibility, responsive, and verification gates pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, cleanup, and acceptance review across all stories.

- [X] T071 [P] Update README.md with final implementation behavior, commands, and verification results
- [X] T072 [P] Update specs/004-opendesign-html-port/quickstart.md with any implementation-time command or acceptance changes
- [X] T073 Remove obsolete CSS selectors and dead old-layout rules from src/styles/app.css and feature CSS files
- [X] T074 Remove or consolidate obsolete tests that assert old TSX screen layouts in tests
- [X] T075 Run final desktop, tablet, and mobile rendered review and record viewports in specs/004-opendesign-html-port/artifacts/acceptance-records.md
- [X] T076 Run final git diff review for unrelated file churn and document intentional old-layout removals in specs/004-opendesign-html-port/artifacts/replacement-map.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP for visual route parity.
- **User Story 2 (Phase 4)**: Depends on User Story 1 route structures, then binds live data.
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 for complete route/state surfaces.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 - Port Every Route From Source Screens**: First deliverable and MVP. Does not depend on US2 or US3.
- **US2 - Bind Source Layouts To Real Household Data**: Depends on US1 because bindings should attach to rebuilt source-layout routes.
- **US3 - Preserve Product Quality After The Direct Port**: Depends on US1 and US2 because it verifies full production states.

### Within Each User Story

- Tests and comparison checks come before implementation where practical.
- Source visual shell before live data binding.
- Data binding before production-state hardening.
- Acceptance record updates before story checkpoint.

### Parallel Opportunities

- Setup tasks T003, T004, and T005 can run in parallel.
- Foundation audit tasks T008, T009, and T010 can run in parallel.
- US1 visual tests T015-T020 can run in parallel.
- US1 route subcomponent rebuilds T023-T025, T029, T031-T032, and T034-T035 can run in parallel after their parent route task begins.
- US2 tests T039-T043 can run in parallel.
- US2 binding tasks T046-T048, T053, T056-T057 can run in parallel with their parent route binding work.
- US3 tests T059-T062 can run in parallel.
- US3 CSS/accessibility subtasks T066-T067 can run in parallel.
- Polish documentation tasks T071-T072 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Visual regression/test updates can be handled together:
Task: "T015 Update auth visual regression coverage in tests/e2e/opendesign-visual-regression.spec.ts"
Task: "T016 Update dashboard visual regression coverage in tests/e2e/opendesign-visual-regression.spec.ts"
Task: "T017 Update transactions visual regression coverage in tests/e2e/opendesign-visual-regression.spec.ts"
Task: "T018 Update settings visual regression coverage in tests/e2e/opendesign-visual-regression.spec.ts"
Task: "T019 Update savings goals visual regression coverage in tests/e2e/opendesign-visual-regression.spec.ts"

# Independent route component work after shell foundation:
Task: "T023 Rebuild dashboard category pie visual shell in src/features/summaries/CategoryChart.tsx"
Task: "T029 Rebuild transaction ledger table visual structure in src/features/transactions/TransactionList.tsx"
Task: "T034 Rebuild savings goal card visual layout in src/features/savings-goals/SavingsGoalCard.tsx"
```

## Parallel Example: User Story 2

```bash
# Data binding tests can be prepared independently:
Task: "T039 Add auth login/signup field and status behavior tests in tests/auth-opendesign.test.tsx"
Task: "T040 Add dashboard live-data section tests in tests/summary-opendesign.test.tsx"
Task: "T041 Add transaction plus dialog, type toggle, savings goal selector, and edit-prefill tests in tests/transactions-opendesign.test.tsx"
Task: "T042 Add settings live category, budget, income category, savings goal category, and household access tests in tests/settings-opendesign.test.tsx"
Task: "T043 Add savings goal add/edit/delete live behavior tests in tests/savings-goals-opendesign.test.tsx"
```

## Parallel Example: User Story 3

```bash
# Quality gates can be split by concern:
Task: "T059 Add route loading, empty, error, and success state tests in tests/opendesign-states.test.tsx"
Task: "T060 Add long category, high Rp amount, long note, and menu overflow tests in tests/opendesign-overflow.test.tsx"
Task: "T061 Add Playwright keyboard, focus, reduced-motion, mobile drawer, and no-clipping checks in tests/e2e/opendesign-redesign.spec.ts"
Task: "T062 Add PWA shell asset smoke coverage for rebuilt routes in tests/e2e/household-expense-tracker.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational shell, styles, and shared component audit.
3. Complete Phase 3: User Story 1 visual route rebuild.
4. Stop and validate visual parity against all six source screens.
5. Demo route visuals before live data and production-state hardening.

### Incremental Delivery

1. Setup + Foundation: source inventory, shell, shared style vocabulary.
2. US1: route visual rebuild and old TSX screen replacement.
3. US2: live data bindings and correct product behavior.
4. US3: accessibility, responsive behavior, states, and verification.
5. Polish: documentation, acceptance records, cleanup, final checks.

### Team Strategy

With multiple implementers, finish Setup and Foundation first. Then split by route for US1, by data surface for US2, and by quality gate for US3. Keep acceptance records updated as each route is completed.

## Notes

- `[P]` tasks use different files or are independently reviewable.
- `[US1]`, `[US2]`, and `[US3]` labels map to user stories in `spec.md`.
- The main acceptance standard is visual parity plus correct product behavior, not strict source DOM parity.
- Do not preserve old TSX screen layout code just because it exists.
- Savings transactions are created in Transactions against existing savings goals; savings goals are created and edited on the Savings Goals route.
