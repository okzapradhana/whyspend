# Tasks: OpenDesign Website Redesign

**Input**: Design documents from `specs/003-opendesign-redesign/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui.md](./contracts/ui.md), [quickstart.md](./quickstart.md)

**Tests**: Test tasks are included because `contracts/ui.md` requires component/unit evidence, Playwright evidence, rendered comparison, source-structure comparison, keyboard/focus checks, contrast review, reduced-motion checks, and PWA checks before the redesign is done.

**Regeneration Note 2026-06-07**: The prior checked task list represented the first implementation pass, which adjusted the previous WhySpend UI toward OpenDesign but did not satisfy the clarified direct-port expectation. This regenerated task list is the current source of truth. Treat prior completed work as reusable groundwork only when it already matches the OpenDesign `screens/*.html` hierarchy and `assets/app.css` selector behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or does not depend on incomplete tasks.
- **[Story]**: User-story label for traceability: [US1], [US2], [US3], [US4].
- Every task includes at least one exact file path.

## Phase 1: Setup (Shared Direct-Port Infrastructure)

**Purpose**: Establish traceable OpenDesign source inventories, direct-port artifacts, and verification scaffolding before implementation.

- [X] T001 Create direct-port source blueprint inventory for `screens/dashboard.html`, `screens/transactions.html`, `screens/settings.html`, `screens/savings-goals.html`, `screens/login.html`, `screens/signup.html`, and `index.html` in `specs/003-opendesign-redesign/artifacts/source-screen-blueprints.md`
- [X] T002 [P] Extract OpenDesign shared shell, navigation, card, button, field, table, chart, dialog, goal, and auth selector groups from `assets/app.css` into `specs/003-opendesign-redesign/artifacts/source-selector-map.md`
- [X] T003 [P] Record source HTML section mappings and `data-od-id` anchors for each screen in `specs/003-opendesign-redesign/artifacts/source-section-map.md`
- [X] T004 [P] Record allowed deviations from OpenDesign sample data and social-auth placeholders in `specs/003-opendesign-redesign/contracts/ui.md`
- [X] T005 [P] Update direct-port verification instructions and artifact paths in `specs/003-opendesign-redesign/quickstart.md`
- [X] T006 [P] Update README direct-port implementation note and OpenDesign gate commands in `README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared source CSS, source-structure checks, and React primitives that all direct-port stories depend on.

**Critical**: No user story implementation should begin until this phase is complete.

- [X] T007 Port OpenDesign `assets/app.css` global variables, resets, shell selectors, button selectors, card selectors, field selectors, table selectors, chart selectors, dialog selectors, and responsive rules into `src/styles/app.css`
- [X] T008 [P] Reshape shared design-system primitives around OpenDesign source classes in `src/components/design-system/index.ts`
- [X] T009 [P] Reshape `Button` to render OpenDesign `btn`, `btn-primary`, `btn-secondary`, `btn-small`, `btn-danger`, `icon-button`, `fab-button`, and modal action classes in `src/components/Button.tsx`
- [X] T010 [P] Reshape `Input` and `Select` to render OpenDesign `field`, `auth-field`, `auth-input-wrap`, `soft-input`, `modal-field`, and `goal-field` structures in `src/components/Input.tsx` and `src/components/Select.tsx`
- [X] T011 [P] Reshape `Dialog` for OpenDesign `dialog`, `dialog-panel`, `transaction-modal`, `goal-modal`, `delete-goal-modal`, close controls, focus return, Escape close, and non-clipped overlays in `src/components/Dialog.tsx`
- [X] T012 [P] Add direct-port class assertion helpers for source hierarchy checks in `tests/test-utils.tsx`
- [X] T013 Add OpenDesign source-structure comparison script for required class/section parity in `scripts/compare-opendesign-structure.mjs`
- [X] T014 Add `test:structure` and include it in `check:opendesign` in `package.json`
- [X] T015 Update Playwright visual regression helpers to attach source reference screenshots and direct-port structure evidence in `tests/e2e/opendesign-visual-regression.spec.ts`
- [X] T016 Add shared authenticated household fixtures that cover real display names, category names, budgets, high Rp amounts, savings goals, and empty states in `tests/test-utils.tsx`
- [X] T017 Run source token, selector, and structure baseline commands and record expected thresholds in `specs/003-opendesign-redesign/quickstart.md`

**Checkpoint**: Foundation ready. All user-story phases can begin only after source CSS, reusable direct-port primitives, and structure checks exist.

---

## Phase 3: User Story 1 - Navigate The Redesigned Product Shell (Priority: P1) MVP

**Goal**: The authenticated shell is a direct React port of the OpenDesign `drawer-backdrop`, `mobile-bar`, `app-shell`, `sidebar`, `brand`, `nav-group`, `nav-item`, `nav-secondary`, `screen`, `content`, `top-actions`, `account-pill`, and `avatar-stack` structures while preserving route state, active states, focus, and support navigation.

**Independent Test**: Compare desktop and mobile shell TSX hierarchy and rendered output against shared shell structure in `screens/dashboard.html`, `screens/transactions.html`, `screens/settings.html`, and `screens/savings-goals.html`; verify all destinations are reachable by keyboard and pointer.

### Tests for User Story 1

- [X] T018 [P] [US1] Add component tests for OpenDesign shell class hierarchy, active nav states, support entry, account pill, and avatar stack in `tests/app-shell.test.tsx`
- [X] T019 [P] [US1] Add component tests for mobile `mobile-bar`, `drawer-backdrop`, hamburger open/close, route selection, Escape close, and focus return in `tests/app-shell-mobile.test.tsx`
- [X] T020 [P] [US1] Add Playwright source-structure and desktop/mobile navigation checks for shell wrappers and no horizontal overflow in `tests/e2e/opendesign-redesign.spec.ts`

### Implementation for User Story 1

- [X] T021 [US1] Directly port the OpenDesign shared shell hierarchy into `ShellRoute` with `drawer-backdrop`, `mobile-bar`, `app-shell`, `sidebar`, `screen`, `content`, and `top-actions` in `src/app/router.tsx`
- [X] T022 [US1] Directly port OpenDesign brand, nav groups, nav items, active states, support entry, account pill, and avatar stack into React Router links in `src/app/router.tsx`
- [X] T023 [US1] Wire mobile drawer state, backdrop close, Escape close, route-selection close, focus move, and focus return into the OpenDesign shell structure in `src/app/router.tsx`
- [X] T024 [US1] Replace prior shell/sidebar/mobile styling with OpenDesign shell selectors from `assets/app.css` in `src/styles/app.css`
- [X] T025 [P] [US1] Replace old shell primitive APIs with OpenDesign-compatible brand, nav item, account pill, and avatar stack primitives in `src/components/design-system/index.ts`
- [X] T026 [US1] Preserve `/dashboard`, `/transactions`, `/savings-goals`, `/settings`, and `/support` protected routes while keeping `/summary` as compatibility alias in `src/app/router.tsx`
- [X] T027 [US1] Record shell source classes, implementation files, and any route/support deviations in `specs/003-opendesign-redesign/artifacts/source-screen-blueprints.md`

**Checkpoint**: User Story 1 is independently functional as the MVP direct-port shell.

---

## Phase 4: User Story 2 - Complete Core Household Finance Tasks In The New Design (Priority: P2)

**Goal**: Dashboard, Transactions, Settings, and Savings Goals are direct React ports of their OpenDesign `screens/*.html` structures while preserving live household finance workflows and data meanings.

**Independent Test**: Complete the representative monthly workflow: review dashboard, add an expense, update a category budget, and review a savings goal in under 5 minutes without relying on any old WhySpend layout.

### Tests for User Story 2

- [X] T028 [P] [US2] Add dashboard source-structure component tests for `page-head`, `summary-metrics`, `dashboard-charts`, `budget-and-trend`, `metric-railed`, `pie-chart`, `budget-bar`, and `line-chart` in `tests/summary-opendesign.test.tsx`
- [X] T029 [P] [US2] Add transactions source-structure component tests for `transaction-controls`, `filter-row`, `filter-menu`, `transaction-list`, `data-table`, `fab-button`, `transaction-dialog`, `transaction-toggle`, and `modal-action` in `tests/transactions-opendesign.test.tsx`
- [X] T030 [P] [US2] Add Settings source-structure component tests for `settings-head`, `settings-content`, `grid-main`, editable `data-table`, `card-blue`, `card-sand`, `insight-list`, and household access in `tests/settings-opendesign.test.tsx`
- [X] T031 [P] [US2] Add Savings Goals source-structure component tests for `savings-head`, `savings-summary`, `goal-grid`, `goal-card`, `goal-card-menu`, `goal-dialog`, `goal-modal`, and `delete-goal-modal` in `tests/savings-goals-opendesign.test.tsx`
- [X] T032 [P] [US2] Add Playwright monthly workflow coverage that asserts OpenDesign source classes remain present across Dashboard, Transactions, Settings, and Savings Goals in `tests/e2e/opendesign-redesign.spec.ts`

### Implementation for User Story 2

- [X] T033 [US2] Directly port Dashboard `page-head`, month picker, `grid grid-3`, `metric metric-railed metric-*`, and live income/expense/savings totals into `src/features/summaries/SummaryPage.tsx`
- [X] T034 [US2] Directly port Dashboard spending card, `pie-chart`, `pie-svg`, `pie-slice`, `pie-hover-value`, and `legend legend-only` structures while binding live category totals in `src/features/summaries/CategoryChart.tsx`
- [X] T035 [US2] Directly port Dashboard `Budget Health`, `budget-bar`, `budget-row`, `budget-row-head`, `bar-track`, and `bar-fill` structures while binding live budget actuals and differences in `src/features/summaries/BudgetOverview.tsx`, `src/features/summaries/BudgetStatusList.tsx`, and `src/features/summaries/SpendingVsBudgetChart.tsx`
- [X] T036 [US2] Directly port Dashboard `trend-card`, `trend-legend`, `line-chart detailed-trend`, `trend-hotspot`, and `trend-months` structures while binding historical income/expense/savings data in `src/features/summaries/HistoricalIncomeExpenseChart.tsx` and `src/features/summaries/IncomeExpenseSummary.tsx`
- [X] T037 [US2] Replace prior dashboard layout CSS with OpenDesign dashboard grid, card, metric, pie, budget, and trend selectors in `src/features/summaries/summaries.css`
- [X] T038 [US2] Directly port Transactions `page-head`, `transaction-controls`, `filter-row`, `field`, `filter-menu`, checkbox rows, and live search/type filter state in `src/features/transactions/TransactionsPage.tsx`
- [X] T039 [US2] Directly port Transactions `transaction-list`, `table-wrap`, `data-table`, ledger rows, status chips, owner, note, amount, and edit actions in `src/features/transactions/TransactionList.tsx`
- [X] T040 [US2] Directly port Transactions `fab-button`, `dialog transaction-dialog`, `dialog-panel transaction-modal`, `amount-entry`, `transaction-toggle`, `soft-input`, `modal-field`, and `modal-action` structures in `src/features/transactions/TransactionForm.tsx`
- [X] T041 [US2] Replace prior transactions CSS with OpenDesign transaction controls, ledger, dialog, amount entry, modal field, toggle, and floating-action selectors in `src/features/transactions/transactions.css`
- [X] T042 [US2] Directly port Settings `page-head`, `btn btn-primary`, `grid grid-main`, expense categories/budgets `card`, `table-wrap`, and editable `data-table` layout in `src/features/settings/SettingsPage.tsx`
- [X] T043 [US2] Directly port Settings editable category rows, budget inputs, ownership selects, delete buttons, validation states, and row templates in `src/features/settings/CategoryBudgetSettings.tsx` and `src/features/settings/CategoryBudgetRow.tsx`
- [X] T044 [US2] Directly port Settings `card-blue`, `card-sand`, `insight-list`, income categories, savings goal categories, household access, and invite action in `src/features/settings/SettingsPage.tsx`
- [X] T045 [US2] Replace prior Settings CSS with OpenDesign settings grid, editable table, insight list, blue/sand card, and action selectors in `src/features/settings/settings.css`
- [X] T046 [US2] Directly port Savings Goals `page-head`, add goal button, `card card-soft` savings summary, `metric-value`, and `progress` structure in `src/features/savings-goals/SavingsGoalsPage.tsx`
- [X] T047 [US2] Directly port Savings Goals `goal-grid`, repeated `goal-card`, `goal-card-head`, `row-icon`, `goal-card-actions`, `goal-menu-button`, `goal-card-menu`, `goal-meta-row`, and progress structures in `src/features/savings-goals/SavingsGoalCard.tsx`
- [X] T048 [US2] Directly port Savings Goals add/edit `goal-dialog`, `goal-modal`, `goal-modal-head`, `goal-modal-form`, `goal-field`, `goal-input-wrap`, `goal-amount-grid`, `goal-share-card`, and footer actions in `src/features/savings-goals/SavingsGoalForm.tsx`
- [X] T049 [US2] Directly port Savings Goals delete confirmation `delete-goal-modal`, `delete-goal-head`, `delete-goal-footer`, cancel, and delete button structures in `src/features/savings-goals/SavingsGoalsPage.tsx`
- [X] T050 [US2] Replace prior Savings Goals CSS with OpenDesign goal summary, goal cards, menus, progress bars, goal dialogs, edit/delete modal, and mobile selectors in `src/features/savings-goals/savings-goals.css`
- [X] T051 [US2] Preserve product-backed live data replacements for authenticated users, categories, budgets, records, and savings goals in `src/lib/api/types.ts`, `src/lib/api/summaries.ts`, and `src/lib/finance.ts`
- [X] T052 [US2] Record Dashboard, Transactions, Settings, and Savings Goals source classes, live-data bindings, and intentional deviations in `specs/003-opendesign-redesign/artifacts/source-screen-blueprints.md`

**Checkpoint**: User Story 2 is independently functional as the direct-port core household finance workflow.

---

## Phase 5: User Story 3 - Sign Up And Sign In Through The Redesigned Auth Flow (Priority: P3)

**Goal**: Signup and login screens are direct React ports of `screens/signup.html` and `screens/login.html` while preserving Display Name, Email, Password, validation, password visibility, and auth status feedback.

**Independent Test**: Open signup and login screens, compare source hierarchy and rendered output against OpenDesign references, validate required fields, toggle password visibility, submit success/error paths, and confirm routes between modes.

### Tests for User Story 3

- [X] T053 [P] [US3] Add auth source-structure component tests for `auth-page`, `auth-shell`, `auth-brand`, `auth-card`, `auth-form`, `auth-field`, `auth-input-wrap`, `auth-status`, `auth-submit`, and mode switching in `tests/auth-opendesign.test.tsx`
- [X] T054 [P] [US3] Add Playwright auth rendering checks for login/signup desktop/mobile source classes, password visibility, validation feedback, and no clickable fake social auth in `tests/e2e/opendesign-redesign.spec.ts`

### Implementation for User Story 3

- [X] T055 [US3] Directly port `screens/login.html` and `screens/signup.html` auth shell, brand, card, title, form, fields, password toggle, status, submit, switch, policy, and footer structures in `src/features/auth/AuthPage.tsx`
- [X] T056 [US3] Preserve Display Name, Email, Password, password requirement hint, validation, auth API submit states, JWT routing, and household setup navigation inside the ported auth structure in `src/features/auth/AuthPage.tsx`
- [X] T057 [US3] Port OpenDesign auth selectors for `auth-page`, `auth-shell`, `auth-brand`, `auth-card`, `auth-field`, `auth-input-wrap`, `auth-icon-button`, `auth-divider`, `auth-status`, `auth-submit`, `auth-switch`, and `auth-policy` into `src/styles/app.css`
- [X] T058 [US3] Remove or document social-sign-in visual placeholders so OpenDesign social structure does not create fake auth affordances in `src/features/auth/AuthPage.tsx` and `specs/003-opendesign-redesign/contracts/ui.md`
- [X] T059 [US3] Record login and signup source classes, live auth bindings, and social-auth deviation in `specs/003-opendesign-redesign/artifacts/source-screen-blueprints.md`

**Checkpoint**: User Story 3 is independently functional as the direct-port auth flow.

---

## Phase 6: User Story 4 - Verify Design Quality Across Real States (Priority: P4)

**Goal**: The direct-port UI remains polished across loading, empty, error, success, overflow, reduced-motion, keyboard, contrast, source-structure parity, and realistic data states.

**Independent Test**: Review each redesigned screen with normal data, no data, loading, validation errors, long category names, high Rp amounts, mobile width, desktop width, reduced-motion preferences, and source-structure checks.

### Tests for User Story 4

- [X] T060 [P] [US4] Add long-data and high-currency source-structure tests across Dashboard, Transactions, Settings, and Savings Goals in `tests/opendesign-overflow.test.tsx`
- [X] T061 [P] [US4] Add loading, empty, error, success, disabled, and loading-button state tests that preserve OpenDesign classes in `tests/opendesign-states.test.tsx`
- [X] T062 [P] [US4] Add Playwright keyboard, focus, reduced-motion, mobile overflow, source-class, and PWA checks in `tests/e2e/opendesign-redesign.spec.ts`
- [X] T063 [P] [US4] Add source-structure regression checks for required OpenDesign classes and `data-od-id` sections in `scripts/compare-opendesign-structure.mjs`

### Implementation for User Story 4

- [X] T064 [US4] Add or reshape empty, loading, error, success, status, and overflow primitives so they preserve OpenDesign `card`, `status`, `field`, `btn`, `data-table`, and dialog class behavior in `src/components/design-system/index.ts`
- [X] T065 [US4] Apply overflow protections for long categories, member names, notes, Rp amounts, chart legends, table cells, menus, and dialogs without changing OpenDesign layout positions in `src/styles/app.css`
- [X] T066 [US4] Add reduced-motion alternatives for drawer, dialog, hover, chart, progress, goal menu, and modal transitions in `src/styles/app.css`
- [X] T067 [US4] Ensure chart legends, progress bars, status chips, transaction type labels, and savings goal progress do not rely on color alone in `src/features/summaries/CategoryChart.tsx`, `src/features/summaries/SpendingVsBudgetChart.tsx`, and `src/features/savings-goals/SavingsGoalCard.tsx`
- [X] T068 [US4] Verify WCAG AA token contrast and document any accessibility-compatible substitutions from OpenDesign source values in `specs/003-opendesign-redesign/quickstart.md`
- [X] T069 [US4] Record quality-state source-structure evidence and intentional differences in `specs/003-opendesign-redesign/artifacts/source-screen-blueprints.md`

**Checkpoint**: User Story 4 is independently functional as the direct-port quality-state and accessibility hardening slice.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final direct-port verification, documentation, and cross-story cleanup.

- [X] T070 [P] Run frontend unit tests with `pnpm test` and record refreshed direct-port results in `specs/003-opendesign-redesign/quickstart.md`
- [X] T071 [P] Run frontend build with `pnpm run build` and record refreshed direct-port results in `specs/003-opendesign-redesign/quickstart.md`
- [X] T072 [P] Run Playwright checks with `pnpm exec playwright test` and record desktop/mobile direct-port results in `specs/003-opendesign-redesign/quickstart.md`
- [X] T073 Run OpenDesign token, selector, structure, and visual gates with `pnpm check:opendesign` and record refreshed results in `specs/003-opendesign-redesign/quickstart.md`
- [X] T074 Run source-structure review for every route and confirm TSX hierarchy/class vocabulary comes from OpenDesign HTML/CSS in `specs/003-opendesign-redesign/artifacts/source-screen-blueprints.md`
- [X] T075 Run rendered desktop and mobile visual comparison against OpenDesign references and record screenshot evidence in `specs/003-opendesign-redesign/quickstart.md`
- [X] T076 Run keyboard, focus, contrast, reduced-motion, PWA, overflow, and menu/dialog clipping checks and record evidence in `specs/003-opendesign-redesign/quickstart.md`
- [X] T077 Run Impeccable audit or polish for the direct-port UI and record blocking defects plus resolutions in `specs/003-opendesign-redesign/quickstart.md`
- [X] T078 Run first-pass usability validation for identifying income, expenses, savings, budgets, actuals, differences, and savings goal progress and record outcomes in `specs/003-opendesign-redesign/quickstart.md`
- [X] T079 Capture timing evidence for the 10-second navigation target and 5-minute monthly workflow target in `tests/e2e/opendesign-redesign.spec.ts` and `specs/003-opendesign-redesign/quickstart.md`
- [X] T080 Audit cross-screen UX copy for calm, direct, non-shaming wording after direct port in `src/app/router.tsx`, `src/features/summaries/SummaryPage.tsx`, `src/features/transactions/TransactionsPage.tsx`, `src/features/settings/SettingsPage.tsx`, `src/features/savings-goals/SavingsGoalsPage.tsx`, and `src/features/auth/AuthPage.tsx`
- [X] T081 [P] Update direct-port behavior notes, verification commands, and visual gate descriptions in `README.md`
- [X] T082 [P] Review Dashboard versus Summary compatibility labels and normalize user-facing route copy in `src/app/router.tsx` and `src/features/summaries/SummaryPage.tsx`
- [X] T083 [P] Review all direct-port tasks and mark completed evidence in `specs/003-opendesign-redesign/tasks.md`
- [X] T084 Run final git diff hygiene checks for whitespace and unrelated file drift in `specs/003-opendesign-redesign/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 User Story 1**: Depends on Phase 2 and is the direct-port MVP shell.
- **Phase 4 User Story 2**: Depends on Phase 2 and integrates best after US1 shell route vocabulary exists.
- **Phase 5 User Story 3**: Depends on Phase 2 and can run in parallel with US2 after shared auth/form/button styling exists.
- **Phase 6 User Story 4**: Depends on implemented surfaces from US1, US2, and US3 for full coverage; individual state helpers can start after Phase 2.
- **Phase 7 Polish**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. Suggested MVP.
- **US2 (P2)**: Can start after Phase 2 but should integrate through the direct-port shell from US1.
- **US3 (P3)**: Can start after Phase 2 and is independent of US2 data screens.
- **US4 (P4)**: Depends on the surfaces it hardens; complete after US1-US3 for full acceptance.

### Parallel Opportunities

- Setup tasks T002, T003, T004, T005, and T006 can run in parallel.
- Foundational tasks T008, T009, T010, T011, T012, T015, and T016 can run in parallel after T007 is understood.
- US1 tests T018, T019, and T020 can run in parallel before implementation.
- US2 screen-specific tests and screen conversions can run in parallel by surface after foundational source CSS and primitives are ready.
- US3 tests T053 and T054 can run in parallel with US2.
- US4 tests T060, T061, T062, and T063 can run in parallel after representative surfaces exist.
- Polish verification tasks T070, T071, T072, T081, T082, and T083 can run in parallel where they do not share files.

---

## Parallel Example: User Story 1

```text
Task: "T018 [P] [US1] Add component tests for OpenDesign shell class hierarchy, active nav states, support entry, account pill, and avatar stack in tests/app-shell.test.tsx"
Task: "T019 [P] [US1] Add component tests for mobile mobile-bar, drawer-backdrop, hamburger open/close, route selection, Escape close, and focus return in tests/app-shell-mobile.test.tsx"
Task: "T020 [P] [US1] Add Playwright source-structure and desktop/mobile navigation checks for shell wrappers and no horizontal overflow in tests/e2e/opendesign-redesign.spec.ts"
```

---

## Parallel Example: User Story 2

```text
Task: "T028 [P] [US2] Add dashboard source-structure component tests for page-head, summary-metrics, dashboard-charts, budget-and-trend, metric-railed, pie-chart, budget-bar, and line-chart in tests/summary-opendesign.test.tsx"
Task: "T029 [P] [US2] Add transactions source-structure component tests for transaction-controls, filter-row, filter-menu, transaction-list, data-table, fab-button, transaction-dialog, transaction-toggle, and modal-action in tests/transactions-opendesign.test.tsx"
Task: "T030 [P] [US2] Add Settings source-structure component tests for settings-head, settings-content, grid-main, editable data-table, card-blue, card-sand, insight-list, and household access in tests/settings-opendesign.test.tsx"
Task: "T031 [P] [US2] Add Savings Goals source-structure component tests for savings-head, savings-summary, goal-grid, goal-card, goal-card-menu, goal-dialog, goal-modal, and delete-goal-modal in tests/savings-goals-opendesign.test.tsx"
```

---

## Parallel Example: User Story 3

```text
Task: "T053 [P] [US3] Add auth source-structure component tests for auth-page, auth-shell, auth-brand, auth-card, auth-form, auth-field, auth-input-wrap, auth-status, auth-submit, and mode switching in tests/auth-opendesign.test.tsx"
Task: "T054 [P] [US3] Add Playwright auth rendering checks for login/signup desktop/mobile source classes, password visibility, validation feedback, and no clickable fake social auth in tests/e2e/opendesign-redesign.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: direct-port source inventories.
2. Complete Phase 2: source CSS, direct-port primitives, and structure checks.
3. Complete Phase 3: direct-port shell/navigation.
4. Stop and validate shell source hierarchy, desktop/mobile navigation, focus behavior, and no layout overflow against OpenDesign.

### Incremental Delivery

1. Complete Setup + Foundational, source CSS and structure checks ready.
2. Add US1 shell, test independently, then use it as the stable frame.
3. Add US2 finance screens, one screen at a time, with source-structure tests and visual checks per screen.
4. Add US3 auth screens, with source-structure tests and auth behavior checks.
5. Add US4 real-state hardening, accessibility, motion, overflow, and PWA checks.
6. Complete final verification and documentation refresh.
