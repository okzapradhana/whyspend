# Lessons Learned

## 2026-06-20

### Database Schema & ORM Migration Constraints: Prisma to Supabase Client Migration (`id` and `updatedAt` Constraint Violation)
* **Problem:** Direct database insertions/updates using Supabase client (e.g. `supabase.from('User').insert(...)` or `Household` table insertions) failed with Postgres error `23502` (`null value in column "id"` or `null value in column "updatedAt"` violates not-null constraint).
* **Root Cause:** Prisma defines primary keys (`@id @default(uuid())`) and `@updatedAt` columns as `NOT NULL` without database-level defaults because Prisma Client handles generating UUIDs and updating timestamps on the application layer. Direct Supabase SDK calls bypass Prisma Client and omit these fields, triggering database constraint failures.
* **Resolution:** 
  1. Generate UUIDs (`window.crypto.randomUUID()`) on the client side and supply them in the `id` field for new inserts.
  2. Set database-level default values (`DEFAULT now()`) on the `updatedAt` columns of all tables.
  3. Implement database triggers to automatically update `updatedAt` columns `BEFORE UPDATE`.
  4. Explicitly pass `updatedAt: new Date().toISOString()` in frontend insert/update payloads for client-side resilience.


### Supabase Row Level Security (RLS): Infinite Recursion on Join Tables
* **Problem:** Querying the `HouseholdMember` table returned Postgres error `42P17` (`infinite recursion detected in policy for relation "HouseholdMember"`).
* **Root Cause:** The RLS policy for `HouseholdMember` checked if the row's `householdId` was in a subquery querying `HouseholdMember` itself (`SELECT "householdId" FROM "HouseholdMember" WHERE "userId" = auth.uid()`). Since RLS was enabled on `HouseholdMember`, the subquery triggered the RLS policy checks recursively, causing an infinite recursive loop.
* **Resolution:** 
  1. Create a helper function with `SECURITY DEFINER` (e.g. `public.get_user_households()`) to query the table. This function executes with database owner privileges, bypassing RLS inside the function body and avoiding recursion.
  2. Update the `HouseholdMember` RLS policy to check `"householdId" IN (SELECT public.get_user_households())` instead of querying the table directly.

### Supabase Row Level Security (RLS): Catch-22 on Table Inserts (Household Creation Violation)
* **Problem:** Creating a new household workspace from the client-side API failed with Postgres error `42501` (`new row violates row-level security policy for table "Household"`).
* **Root Cause:** The RLS policy for `Household` was defined as `FOR ALL` checking membership in `HouseholdMember`. Because a `HouseholdMember` cannot be created before the `Household` exists (due to foreign key constraints), inserting a new household always violated the membership check, making household creation impossible.
* **Resolution:** Re-defined the RLS policy on `Household` to permit operations (`FOR ALL`) if the user is a member OR if the household currently has no entries in `HouseholdMember` (i.e. is newly created/unowned). This resolves both the initial `INSERT` RLS check and the immediate post-insert `SELECT` (`RETURNING` clause) executed by the Supabase client to fetch the new household's ID.


## 2026-06-21

### Recurring Prisma-to-Supabase Migration: Missing `id` and `updatedAt` in All Direct-Client API Modules
* **Problem:** Saving a budget from the Settings page failed with Postgres error `23502` (`null value in column "id" of relation "CategoryBudget" violates not-null constraint`). Investigation revealed the same class of bug existed in multiple API modules beyond the initially fixed `households.ts`.
* **Root Cause:** The original fix (2026-06-20) for missing `id`/`updatedAt` was only applied to `households.ts`. Other API modules (`budgets.ts`, `categories.ts`, `savingsGoals.ts`, `transactions.ts`) were still performing inserts/upserts without client-generated UUIDs or `updatedAt` timestamps, relying on Prisma's application-level defaults that don't exist at the database level.
* **Affected Functions:**
  - `budgets.ts` → `saveCategoryBudget()`: upsert missing `id` and `updatedAt`
  - `categories.ts` → `createCategory()`: insert missing `id` and `updatedAt` for both Category and auto-initialized SavingsGoal
  - `categories.ts` → `updateCategory()`: update missing `updatedAt`
  - `savingsGoals.ts` → `createSavingsGoal()`: insert missing `id` and `updatedAt` for both Category and SavingsGoal
  - `savingsGoals.ts` → `updateSavingsGoal()`: update missing `updatedAt` for both Category and SavingsGoal
  - `transactions.ts` → `createTransaction()`: insert missing `id` and `updatedAt`
  - `transactions.ts` → `updateTransaction()`: update missing `updatedAt`
* **Resolution:** Added `id: window.crypto.randomUUID()` to all insert/upsert payloads and `updatedAt: new Date().toISOString()` to all insert/update/upsert payloads across all API modules. For upserts (budget), the existing record's `id` is reused when found.
* **Takeaway:** When migrating from Prisma Client to direct Supabase SDK calls, **every** insert and update call across the entire codebase must be audited — not just the first one that fails. Prisma `@default(uuid())` and `@updatedAt` have **no database-level defaults**; they are purely application-layer concerns.

## 2026-08-02

### Password Recovery Must Gate Every Mutable Auth Route
* **Problem:** A `PASSWORD_RECOVERY` session was routed away from dashboard and auth-only routes but could still reach standalone household setup or invitation acceptance routes.
* **Root Cause:** Those routes were siblings of the existing auth guards, so their page components could render and start mutations without checking the recovery state.
* **Resolution:** Wrap household setup and invitation acceptance in a shared recovery route guard that redirects to `/update-password` before either page mounts; keep the guard inactive for normal sessions.
