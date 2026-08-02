# Quickstart: Household Expense Tracker

This feature uses two sibling projects:

```text
codexxx/
├── whyspend/       # frontend, this repository
└── whyspend-api/   # API and PostgreSQL access
```

## 1. Frontend Setup

From `whyspend/`:

```bash
pnpm install
pnpm dev
```

Expected frontend responsibilities:
- React TSX + Vite app shell
- PWA manifest/service worker behavior
- Auth screens and household setup UI
- Hamburger navigation for product pages
- Transaction entry, selected-month transaction list, Settings-based category management, and monthly summary screens
- Expense summary category drill-down transaction lists
- API client calls to `../whyspend-api`
- No direct PostgreSQL access

## 2. API Setup

From sibling folder `../whyspend-api/`:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Expected API responsibilities:
- Authentication and JWT issuance/validation
- Household membership
- JWT authentication and authorization
- User-created categories
- Transaction CRUD
- Monthly summary aggregation
- PostgreSQL migrations and data access

## 3. Category Setup

The API must support creating categories from scratch. Spreadsheet categories in PRODUCT.md are reference examples only and are not created automatically.

## 4. Smoke Test Flow

1. Register or sign in.
2. Create the household workspace.
3. Open the hamburger menu and navigate to Settings.
4. Create expense, income, and savings goal categories.
5. Add an expense transaction for the current month with Date, Amount in Rp, Category, and optional Notes.
6. Add an income transaction for the current month with Date, Amount in Rp, Category, and optional Notes.
7. Add a savings transaction for the current month with Date, Amount in Rp, Goal, and optional Notes.
8. Create another category or savings goal and use it on a transaction.
9. Edit one transaction and confirm totals update.
10. Delete one transaction and confirm totals update.
11. Open monthly summary and verify numeric totals match transaction records.
12. Switch months and verify transaction lists and summaries only include the selected month.
13. Open an expense category from the summary and verify its transaction list matches the category total.
14. Verify the hamburger menu, Settings, and core screens on mobile and desktop widths.
15. Verify PWA installability or home-screen launch behavior.

## 5. Acceptance Checks

- Frontend makes no direct DB calls.
- API is the only PostgreSQL access layer.
- Protected API calls use JWT authorization.
- Account creation captures display name, email, and password.
- Monthly totals are derived from transactions.
- Category deletion protects existing records.
- Person A and Person B labels do not appear in product UI.
- Charts have readable labels and numeric summaries.
- Category summary drill-down shows transactions bound to the selected category.
- Hamburger navigation reaches dashboard, transactions, and Settings on mobile and desktop.
- Empty, loading, error, success, long-text, and focus states are visible and usable.
- Desktop/mobile responsive layouts and PWA behavior are verified.

## 6. Implementation Notes

Recorded on 2026-05-31 07:55 WIB.

- Frontend implemented in this repository with React TSX, Vite, React Router, PWA manifest/service worker assets, responsive product shell, auth, household setup, transactions, categories, summaries, charts, and category drill-down.
- API implemented in sibling `../whyspend-api` with Fastify, JWT auth, password hashing, PostgreSQL migration files, PostgreSQL-backed runtime store when `DATABASE_URL` is set, auth/household/category/transaction/summary routes, and contract/integration tests.
- The API service layer uses a testable store boundary. Tests and no-DB local runs use an in-memory store, while configured environments use PostgreSQL through `DATABASE_URL`.
- Impeccable product guidance was applied during implementation: restrained OKLCH palette, no spreadsheet mimicry as the primary interface, no generic banking-dashboard treatment, accessible focus states, responsive desktop/mobile layout, and explicit empty/loading/error/success states.

## 7. Verification Results

These verification results were recorded before the 2026-06-01 documentation refactor that added hamburger navigation and Settings-specific category configuration requirements.

- `pnpm test` in `whyspend/`: passed, 4 files and 6 tests.
- `pnpm run build` in `whyspend/`: passed. Vite reported one bundle-size warning for the main JS chunk.
- `pnpm test` in `../whyspend-api/`: passed, 7 files and 7 tests.
- `pnpm run build` in `../whyspend-api/`: passed.
- `pnpm exec playwright test` in `whyspend/`: passed, 4 browser tests covering full smoke path, JWT client check, mobile layout load, and desktop layout load.
- Frontend DB-boundary check: no PostgreSQL, `pg`, `DATABASE_URL`, migration, or pool imports found under `src`, `tests`, or frontend `package.json`.
- Git whitespace check: `git diff --check` passed.
