# WhySpend

WhySpend is a household money tracker for couples. It replaces the split workflow of recording transactions in a mobile money app, copying monthly category totals into a spreadsheet, and manually comparing spending against shared goals.

The app supports account sign-up, shared household setup, household invitations, income and expense categories, savings goals, transaction entry, monthly summaries, budgets, category drill-downs, and responsive desktop/mobile navigation.

## Tech Stack

- **Monorepo:** pnpm workspaces with Turborepo
- **Web:** React 19, Vite, TypeScript, Tailwind CSS, React Router, Recharts, lucide-react
- **Auth and direct data access:** Supabase Auth plus `@supabase/supabase-js` in `apps/web`
- **API and schema package:** Fastify, Prisma, PostgreSQL, Zod, jose JWT helpers in `apps/api`
- **Testing:** Vitest, Testing Library, Playwright, Testcontainers

## Repository Layout

```text
whyspend/
|-- apps/
|   |-- api/          # Fastify API, Prisma schema, migrations, seed data, API tests
|   `-- web/          # React/Vite app, Supabase client, routes, features, UI tests
|-- packages/
|   |-- config/       # Shared TypeScript configuration
|   `-- contracts/    # Shared contract types
|-- scripts/          # Local PostgreSQL helper scripts
|-- docker-compose.yml
|-- package.json
|-- pnpm-workspace.yaml
`-- turbo.json
```

Important project references:

- Product context: `apps/web/PRODUCT.md`
- Web design system: `apps/web/DESIGN.md`
- Web feature specs: `apps/web/specs/`
- Agent rules and project lessons: `AGENTS.md` and `LESSONS.md`

## Prerequisites

- Node.js 20 or newer
- pnpm 10.33.2
- Docker, for the `docker-compose.yml` PostgreSQL service and API integration tests
- A Supabase project when running the current web app against Supabase Auth and the Supabase Data API

The local PostgreSQL helper in `scripts/local-postgres.mjs` can also use a local PostgreSQL install if `PG_BIN` points to a directory containing `pg_ctl`, `initdb`, `createdb`, and `pg_isready`.

## Environment

Create local env files from the examples:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

`apps/web/.env`:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
VITE_API_BASE_URL=http://127.0.0.1:4174/api
```

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required by `apps/web/src/lib/supabaseClient.ts`. Use only the public anon or publishable client key in the browser. Never put a Supabase `service_role` key in `apps/web`.

### Password reset redirect configuration

The web client sends password-reset emails to the current browser origin followed by `/update-password`. This keeps local, production, and Tailscale preview origins out of the source code and does not require an additional secret.

In Supabase Dashboard → Authentication → URL Configuration, set the production Site URL and add the actual app origins used for development and preview to Redirect URLs. The current local and Tailscale preview setup should allow the update-password path for URLs such as:

```text
http://127.0.0.1:5174/update-password
http://localhost:5174/update-password
https://azko-macbook.taild86cad.ts.net/update-password
```

If the preview hostname changes, add the replacement HTTPS origin (or a narrowly scoped `/**` pattern) in Supabase instead of changing the client code. The URL must be allow-listed for `redirectTo` to take effect.

`apps/api/.env`:

```dotenv
PORT=4174
DATABASE_URL=postgres://whyspend:whyspend@127.0.0.1:54329/whyspend
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=2h
CORS_ORIGIN=http://127.0.0.1:5173
```

## Install

```bash
pnpm install
```

## Database

Start PostgreSQL with Docker:

```bash
pnpm db:start:docker
```

Or use the local PostgreSQL helper:

```bash
pnpm db:start
```

Apply Prisma migrations:

```bash
pnpm db:migrate
```

Generate Prisma client:

```bash
pnpm db:generate
```

Seed demo API data:

```bash
pnpm db:seed
```

The Prisma schema lives at `apps/api/prisma/schema.prisma`. Existing migrations enable RLS and include fixes for the `HouseholdMember` recursion policy and initial household creation policy. The household member identity migration adds a household-scoped `household_member_identity` projection containing only `householdId`, `userId`, and `displayName`; it does not broaden direct `User` row access.

## Development

Start everything through Turborepo:

```bash
pnpm dev
```

Or run each app separately:

```bash
pnpm dev:api
pnpm dev:web
```

Default local URLs:

- Web: `http://127.0.0.1:5173`
- API health check: `http://127.0.0.1:4174/health`
- API routes: `http://127.0.0.1:4174/api`

The current web app uses Supabase Auth and direct Supabase table operations for the main product flows. Some web API utilities and the Fastify API package remain in the repo for HTTP/JWT workflows and test coverage, so keep `VITE_API_BASE_URL` configured when exercising those paths.

## Common Commands

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm test:unit
pnpm test:e2e
```

Package-specific commands:

```bash
pnpm --filter @whyspend/web test
pnpm --filter @whyspend/web e2e
pnpm --filter @whyspend/web check:opendesign
pnpm --filter @whyspend/api test
pnpm --filter @whyspend/api build
```

Database commands:

```bash
pnpm db:start
pnpm db:stop
pnpm db:status
pnpm db:start:docker
pnpm db:stop:docker
pnpm db:migrate
pnpm db:push
pnpm db:seed
```

## Feature Areas

- Auth: sign up, sign in, sign out, Supabase session refresh
- Household setup: create a shared household, invite another member, keep pending invitation links available in Settings, and accept invitation links
- Dashboard: monthly income, expenses, savings, budgets, charts, category drill-downs
- Transactions: create, edit, delete, and list income, expense, and savings records. Household transaction owners are resolved through a minimal household-scoped identity projection, while transaction visibility remains controlled by RLS.
- Categories: manage income, expense, and savings categories
- Budgets: set monthly category budgets and compare actual spending against budget
- Savings goals: track target amount, starting amount, target date, and savings transactions
- PWA shell: manifest, service worker assets, desktop sidebar, mobile drawer

## Data Model

Core tables are defined in Prisma:

- `User`
- `Household`
- `HouseholdMember`
- `HouseholdInvitation`
- `Category`
- `CategoryBudget`
- `SavingsGoal`
- `Transaction`

Financial records are scoped by household and owner. Categories distinguish `income`, `expense`, and `savings`; transactions store amount, date, month, scope, category, creator, updater, and audit timestamps.

## Supabase And RLS Notes

The frontend performs direct Supabase table inserts and updates. Because Prisma `@default(uuid())` and `@updatedAt` are application-layer behaviors, direct Supabase writes must provide IDs and `updatedAt` values explicitly unless the database has defaults/triggers for that table.

When changing schema or policies:

- Enable RLS on tables exposed through the Supabase Data API.
- Use `TO authenticated` with ownership or household membership checks.
- Do not use user-editable metadata for authorization decisions.
- Do not use deprecated `auth.role()` checks.
- Do not put `service_role` or secret keys in `apps/web`.
- Preserve the non-recursive `HouseholdMember` access pattern and the initial `Household` insert path.
- Keep household member identity lookups limited to the projection's minimal fields and household membership boundary; do not expose private `User` fields through the view.

See `LESSONS.md` before making schema or data-access changes.

## Testing Notes

API integration tests use Testcontainers when `DATABASE_URL` is not set. If Docker is unavailable, DB-backed integration tests are skipped by the global setup.

Playwright tests in `apps/web` start a local API and web server using `PLAYWRIGHT_API_PORT` and `PLAYWRIGHT_WEB_PORT`, defaulting to ports `4175` and `5174`.

OpenDesign parity checks are available from the web package:

```bash
pnpm --filter @whyspend/web test:tokens
pnpm --filter @whyspend/web test:structure
pnpm --filter @whyspend/web test:visual
pnpm --filter @whyspend/web check:opendesign
```

## Maintenance

Keep this README current when setup steps, environment variables, runtime architecture, routes, feature behavior, schema constraints, or verification commands change.
