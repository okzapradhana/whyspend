# Tasks: Household Expense Tracker

**Input**: Design documents from `specs/001-household-expense-tracker/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api.md`, `contracts/ui.md`, `quickstart.md`

**Tests**: Included because the implementation plan requires frontend, API, contract, JWT authorization, aggregation, PWA/responsive, and end-to-end smoke checks.

**Organization**: Tasks are grouped by user story to keep each story independently implementable and testable.

**Refactor Note 2026-06-01**: These checked tasks describe the completed pre-refactor implementation breakdown. The current spec now clarifies account creation fields, hamburger navigation, Settings-based category configuration, savings goals, and selected-month transaction lists. Regenerate or extend tasks before implementing those refactor requirements.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other `[P]` tasks in the same phase
- **[Story]**: User story label, used only in user story phases
- Every task includes a concrete file path

## Phase 1: Setup

**Purpose**: Initialize the frontend repository and sibling API project with shared conventions.

- [X] T001 Create Vite React TypeScript frontend package manifest in `package.json`
- [X] T002 Create frontend TypeScript, Vite, and PWA config files in `tsconfig.json`, `vite.config.ts`, and `src/pwa/registerServiceWorker.ts`
- [X] T003 Create frontend app shell directories in `src/app/`, `src/components/`, `src/features/`, `src/lib/api/`, `src/pwa/`, `src/styles/`, and `tests/`
- [X] T004 Create sibling API project manifest in `../whyspend-api/package.json`
- [X] T005 Create API TypeScript config and source directories in `../whyspend-api/tsconfig.json`, `../whyspend-api/src/server/`, `../whyspend-api/src/modules/`, `../whyspend-api/src/db/`, and `../whyspend-api/tests/`
- [X] T006 Configure shared environment examples in `.env.example` and `../whyspend-api/.env.example`
- [X] T007 Create frontend API base client scaffold in `src/lib/api/client.ts`
- [X] T008 Create API server entrypoint scaffold in `../whyspend-api/src/server/index.ts`

---

## Phase 2: Foundational

**Purpose**: Build the cross-cutting API, persistence, auth, routing, and design foundations that block all user stories.

**Critical**: No user story work starts until this phase is complete.

- [X] T009 Create PostgreSQL migration runner in `../whyspend-api/src/db/migrate.ts`
- [X] T010 Create initial PostgreSQL schema migration for users, households, household_members, categories, financial_records, and indexes in `../whyspend-api/src/db/migrations/001_initial_schema.sql`
- [X] T011 Create PostgreSQL connection pool in `../whyspend-api/src/db/pool.ts`
- [X] T012 Create shared API error and response helpers in `../whyspend-api/src/server/http.ts`
- [X] T013 Create JWT signing and verification helpers in `../whyspend-api/src/modules/auth/jwt.ts`
- [X] T014 Create password hashing helpers using the `password` field in `../whyspend-api/src/modules/auth/password.ts`
- [X] T015 Create auth middleware that authorizes household access from JWT claims in `../whyspend-api/src/modules/auth/authMiddleware.ts`
- [X] T016 Create shared validation schemas for IDs, dates, money, record types, and scopes in `../whyspend-api/src/modules/shared/schemas.ts`
- [X] T017 Register Fastify routes and global error handling in `../whyspend-api/src/server/routes.ts`
- [X] T018 Create frontend auth token storage and authorization header handling in `src/lib/api/authToken.ts`
- [X] T019 Create frontend router and protected-route shell in `src/app/router.tsx`
- [X] T020 Create frontend layout, navigation, and responsive shell in `src/app/App.tsx` and `src/styles/app.css`
- [X] T021 Create baseline accessible UI primitives in `src/components/Button.tsx`, `src/components/Input.tsx`, `src/components/Select.tsx`, `src/components/Dialog.tsx`, and `src/components/StatusMessage.tsx`
- [X] T022 Create PWA manifest and service worker registration assets in `public/manifest.webmanifest`, `public/icons/`, and `src/pwa/registerServiceWorker.ts`
- [X] T023 Create frontend test setup in `tests/setup.ts` and `vitest.config.ts`
- [X] T024 Create API test setup with isolated database helpers in `../whyspend-api/tests/setup.ts`

**Checkpoint**: API can start, frontend can start, migrations can run, JWT middleware exists, and UI shell can render without direct DB access from frontend.

---

## Phase 3: User Story 1 - Record Household Transactions (Priority: P1) MVP

**Goal**: A signed-in household member can create a household, create basic categories, and add/edit/delete income, expense, and savings transactions for a selected month.

**Independent Test**: Register/login, create household, create at least one category, add/edit/delete a transaction, and verify the transaction list updates without needing charts or category management polish.

### Tests for User Story 1

- [X] T025 [P] [US1] Add API auth contract tests for register, login, JWT `/auth/me`, and protected request rejection in `../whyspend-api/tests/contract/auth.contract.test.ts`
- [X] T026 [P] [US1] Add API transaction contract tests for create, list, update, and delete transaction endpoints in `../whyspend-api/tests/contract/transactions.contract.test.ts`
- [X] T027 [P] [US1] Add API integration tests for transaction ownership, household authorization, and invalid amount/date/category rejection in `../whyspend-api/tests/integration/transactions.integration.test.ts`
- [X] T028 [P] [US1] Add frontend auth and transaction form tests in `tests/auth-and-transactions.test.tsx`

### Implementation for User Story 1

- [X] T029 [US1] Implement user registration, login, logout, and `/auth/me` repository/service logic in `../whyspend-api/src/modules/auth/authService.ts`
- [X] T030 [US1] Implement auth API routes in `../whyspend-api/src/modules/auth/authRoutes.ts`
- [X] T031 [US1] Implement household create/read service logic in `../whyspend-api/src/modules/households/householdService.ts`
- [X] T032 [US1] Implement household API routes in `../whyspend-api/src/modules/households/householdRoutes.ts`
- [X] T033 [US1] Implement minimal category create/list service required for transaction entry in `../whyspend-api/src/modules/categories/categoryService.ts`
- [X] T034 [US1] Implement minimal category create/list API routes in `../whyspend-api/src/modules/categories/categoryRoutes.ts`
- [X] T035 [US1] Implement transaction CRUD service with month derivation and category type validation in `../whyspend-api/src/modules/transactions/transactionService.ts`
- [X] T036 [US1] Implement transaction CRUD API routes in `../whyspend-api/src/modules/transactions/transactionRoutes.ts`
- [X] T037 [US1] Wire auth, household, category, and transaction routes into API server in `../whyspend-api/src/server/routes.ts`
- [X] T038 [US1] Implement frontend auth API methods in `src/lib/api/auth.ts`
- [X] T039 [US1] Implement frontend household API methods in `src/lib/api/households.ts`
- [X] T040 [US1] Implement frontend category API methods needed by transaction form in `src/lib/api/categories.ts`
- [X] T041 [US1] Implement frontend transaction API methods in `src/lib/api/transactions.ts`
- [X] T042 [US1] Build sign-in and registration screen in `src/features/auth/AuthPage.tsx`
- [X] T043 [US1] Build household setup screen in `src/features/auth/HouseholdSetupPage.tsx`
- [X] T044 [US1] Build transaction form with type, amount, date, category, owner, scope, and note fields in `src/features/transactions/TransactionForm.tsx`
- [X] T045 [US1] Build monthly transaction list with edit/delete actions in `src/features/transactions/TransactionList.tsx`
- [X] T046 [US1] Build transaction page that combines month selection, form, and list in `src/features/transactions/TransactionsPage.tsx`
- [X] T047 [US1] Add route wiring for auth, household setup, and transactions in `src/app/router.tsx`
- [X] T048 [US1] Add US1 empty, loading, error, success, long text, and focus states in `src/features/transactions/transactions.css`

**Checkpoint**: MVP is usable independently: a household member can authenticate, create household/category data, and manage transactions for a month.

---

## Phase 4: User Story 2 - Manage Household Categories (Priority: P2)

**Goal**: A household member can create, rename, archive/delete, and safely manage income, expense, and savings categories from scratch.

**Independent Test**: Create a category, use it on a transaction, rename it, attempt deletion while in use, then archive or delete only when safe.

### Tests for User Story 2

- [X] T049 [P] [US2] Add API category contract tests for list, create, update, archive/delete, duplicate rejection, and in-use deletion conflict in `../whyspend-api/tests/contract/categories.contract.test.ts`
- [X] T050 [P] [US2] Add API integration tests for category type/scope constraints and transaction-history preservation in `../whyspend-api/tests/integration/categories.integration.test.ts`
- [X] T051 [P] [US2] Add frontend category management tests for create, rename, delete conflict, and archive states in `tests/categories.test.tsx`

### Implementation for User Story 2

- [X] T052 [US2] Extend category service with update, archive/delete, duplicate detection, and in-use checks in `../whyspend-api/src/modules/categories/categoryService.ts`
- [X] T053 [US2] Extend category API routes for PATCH and DELETE behavior in `../whyspend-api/src/modules/categories/categoryRoutes.ts`
- [X] T054 [US2] Extend frontend category API methods for update and delete/archive behavior in `src/lib/api/categories.ts`
- [X] T055 [US2] Build category management page with type/scope filters in `src/features/categories/CategoriesPage.tsx`
- [X] T056 [US2] Build category form and edit dialog in `src/features/categories/CategoryForm.tsx`
- [X] T057 [US2] Build category list with delete conflict and archive messaging in `src/features/categories/CategoryList.tsx`
- [X] T058 [US2] Add category management route and navigation item in `src/app/router.tsx` and `src/app/App.tsx`
- [X] T059 [US2] Add responsive and long-category-name category styles in `src/features/categories/categories.css`

**Checkpoint**: Category management is usable independently and protects existing transaction history.

---

## Phase 5: User Story 3 - Review Monthly Summaries And Charts (Priority: P3)

**Goal**: A household member can review monthly income, expense, savings, category totals, charts, member/shared breakdowns, and category drill-down transactions.

**Independent Test**: With transactions across categories and members, open the selected month summary, verify totals/charts match records, switch months, and select an expense category to see contributing transactions.

### Tests for User Story 3

- [X] T060 [P] [US3] Add API monthly summary contract tests for totals, byCategory transactionCount, byMember, and byScope response shape in `../whyspend-api/tests/contract/summaries.contract.test.ts`
- [X] T061 [P] [US3] Add API aggregation integration tests for month filtering, category totals, member/shared separation, and category drill-down consistency in `../whyspend-api/tests/integration/summaries.integration.test.ts`
- [X] T062 [P] [US3] Add frontend monthly summary and category drill-down tests in `tests/summaries.test.tsx`
- [X] T063 [P] [US3] Add responsive chart and summary layout tests in `tests/responsive-summary.test.tsx`

### Implementation for User Story 3

- [X] T064 [US3] Implement monthly summary aggregation service in `../whyspend-api/src/modules/summaries/summaryService.ts`
- [X] T065 [US3] Implement monthly summary API route in `../whyspend-api/src/modules/summaries/summaryRoutes.ts`
- [X] T066 [US3] Extend transaction listing API support for category drill-down filtering in `../whyspend-api/src/modules/transactions/transactionRoutes.ts`
- [X] T067 [US3] Wire summary routes into API server in `../whyspend-api/src/server/routes.ts`
- [X] T068 [US3] Implement frontend summary API methods in `src/lib/api/summaries.ts`
- [X] T069 [US3] Build monthly summary page with month selector and numeric totals in `src/features/summaries/SummaryPage.tsx`
- [X] T070 [US3] Build accessible category chart component in `src/features/summaries/CategoryChart.tsx`
- [X] T071 [US3] Build member/shared breakdown component in `src/features/summaries/MemberBreakdown.tsx`
- [X] T072 [US3] Build expense category drill-down transaction panel in `src/features/summaries/CategoryDrilldown.tsx`
- [X] T073 [US3] Add summary route and dashboard navigation in `src/app/router.tsx` and `src/app/App.tsx`
- [X] T074 [US3] Add responsive desktop/mobile summary and chart styles in `src/features/summaries/summaries.css`

**Checkpoint**: Monthly review is complete and traceable from chart totals to source transactions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate design quality, PWA behavior, API boundaries, and end-to-end acceptance.

- [X] T075 Run quickstart smoke test flow against both projects and record results in `specs/001-household-expense-tracker/quickstart.md`
- [X] T076 Add Playwright end-to-end smoke test for register/login, household setup, category creation, transaction CRUD, summary, and drill-down in `tests/e2e/household-expense-tracker.spec.ts`
- [X] T077 Verify frontend contains no PostgreSQL client, migration, or DB credential imports in `src/lib/api/client.ts`
- [X] T078 Verify JWT is attached to protected frontend API calls and rejected when missing in `tests/e2e/jwt-authorization.spec.ts`
- [X] T079 Verify PWA manifest, service worker registration, and home-screen launch metadata in `public/manifest.webmanifest` and `src/pwa/registerServiceWorker.ts`
- [X] T080 Verify mobile viewport layout at 390px width in `tests/e2e/mobile-layout.spec.ts`
- [X] T081 Verify desktop viewport layout at 1440px width in `tests/e2e/desktop-layout.spec.ts`
- [X] T082 Run Impeccable audit or polish for auth, transactions, categories, and summary surfaces and document blocking fixes in `specs/001-household-expense-tracker/quickstart.md`
- [X] T083 Fix accessibility, contrast, focus, reduced-motion, text overflow, and loading/empty/error/success issues found by UI verification in `src/styles/app.css`
- [X] T084 Run API test suite from `../whyspend-api/tests/` and frontend test suite from `tests/`
- [X] T085 Update implementation notes and accepted deviations in `specs/001-household-expense-tracker/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 Setup has no dependencies.
- Phase 2 Foundational depends on Phase 1 and blocks all user stories.
- Phase 3 US1 depends on Phase 2 and is the MVP.
- Phase 4 US2 depends on Phase 3 because category protection must preserve transaction history.
- Phase 5 US3 depends on Phase 3 for transaction data and benefits from Phase 4 category management.
- Phase 6 Polish depends on selected user stories being complete.

### User Story Dependencies

- US1 Record household transactions: required first MVP.
- US2 Manage household categories: builds on transaction/category foundations from US1.
- US3 Review monthly summaries and charts: requires transactions and categories to produce meaningful summaries.

### Parallel Opportunities

- Setup tasks T001-T008 can be split between frontend and API after repository structure is clear.
- Foundational API tasks T009-T017 can proceed in parallel with frontend shell tasks T018-T024 after package setup.
- US1 test tasks T025-T028 can run in parallel before implementation.
- US2 test tasks T049-T051 can run in parallel before category implementation.
- US3 test tasks T060-T063 can run in parallel before summary implementation.
- Within each user story, API implementation can proceed in parallel with frontend API client and component work after contracts are stable.

## Parallel Example: User Story 1

```text
Task: T025 Add API auth contract tests in ../whyspend-api/tests/contract/auth.contract.test.ts
Task: T026 Add API transaction contract tests in ../whyspend-api/tests/contract/transactions.contract.test.ts
Task: T027 Add API integration tests in ../whyspend-api/tests/integration/transactions.integration.test.ts
Task: T028 Add frontend auth and transaction form tests in tests/auth-and-transactions.test.tsx
```

## Parallel Example: User Story 2

```text
Task: T049 Add API category contract tests in ../whyspend-api/tests/contract/categories.contract.test.ts
Task: T050 Add API integration tests in ../whyspend-api/tests/integration/categories.integration.test.ts
Task: T051 Add frontend category management tests in tests/categories.test.tsx
```

## Parallel Example: User Story 3

```text
Task: T060 Add API monthly summary contract tests in ../whyspend-api/tests/contract/summaries.contract.test.ts
Task: T061 Add API aggregation integration tests in ../whyspend-api/tests/integration/summaries.integration.test.ts
Task: T062 Add frontend monthly summary and category drill-down tests in tests/summaries.test.tsx
Task: T063 Add responsive chart and summary layout tests in tests/responsive-summary.test.tsx
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete Phase 3 US1 only.
4. Validate that a signed-in household member can create a household, create basic categories, and manage transactions.

### Incremental Delivery

1. Deliver US1 transaction entry and list.
2. Add US2 full category management.
3. Add US3 monthly summaries, charts, and category drill-down.
4. Finish PWA, responsive, accessibility, and Impeccable polish gates.

### Validation Rules

- The frontend must never call PostgreSQL directly.
- All protected API calls must use JWT authorization.
- Category data starts from user-created categories; spreadsheet categories are examples only.
- Monthly summary totals must be reproducible from transaction records.
- Desktop and mobile layouts must not have broken UI, clipped controls, or text overflow.
- PWA behavior must be verified before completion.
