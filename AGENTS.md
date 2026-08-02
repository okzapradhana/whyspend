# Agent Rules & Instructions

This document governs the rules, project architecture, and coding standards for AI agents working in the WhySpend codebase.

---

## Project Overview
**WhySpend** is a household money-tracker and expense-management application designed for couples. 
* **Frontend:** A React application built with Vite and TailwindCSS (`apps/web`). It performs direct database queries and mutations using the Supabase client SDK (`@supabase/supabase-js`) under a direct-client architecture.
* **Backend & Database:** A PostgreSQL database managed with Prisma ORM (`apps/api`) for migrations and schema definition. Real-time auth and sessions are fully delegated to **Supabase Auth**.

---

## Directory Structure
Here is the layout of the WhySpend monorepo:

```
whyspend/
├── apps/
│   ├── api/                  # Fastify API backend & Prisma database layer
│   └── web/                  # React/Vite web application (Vite + TailwindCSS)
├── packages/
│   ├── config/               # Shared configuration packages (eslint, tsconfig)
│   └── contracts/            # Shared contract types and specifications
├── scripts/                  # Automation, docker, and local postgres helper utilities
└── .agents/                  # Workspace configurations, guidelines, and skills
    ├── AGENTS.md             # Rule file (symlink to root)
    ├── LESSONS.md            # Lessons learned log (symlink to root)
    └── skills/               # Custom workspace agent skills (e.g. supabase, visual-plan)
```

Detailed explanation of each directory:
* **[apps/web](file:///Users/okzapradhana/projects/whyspend/apps/web)**: React/Vite web application. Contains frontend pages, features (auth, dashboard, categories, transactions, savings-goals, settings), components, and the Supabase client initialization.
* **[apps/api](file:///Users/okzapradhana/projects/whyspend/apps/api)**: Fastify API backend and Prisma database layer. Contains database migrations, schema definitions (`prisma/schema.prisma`), local shadow database scripts, and seed data.
* **[packages/config](file:///Users/okzapradhana/projects/whyspend/packages/config)**: Shared configuration packages (eslint, tsconfig) across the monorepo.
* **[packages/contracts](file:///Users/okzapradhana/projects/whyspend/packages/contracts)**: Shared contract types and request/response specifications.
* **[scripts](file:///Users/okzapradhana/projects/whyspend/scripts)**: Automation utilities, including docker-compose triggers, local PostgreSQL management helper scripts, and sandbox configurations.
* **[.agents](file:///Users/okzapradhana/projects/whyspend/.agents)**: Customization folder containing custom workspace agent skills, style guidelines, and rules.

---

## How to Test
Execute tests using the monorepo's workspace commands:
* **Run Unit Tests:** `pnpm test:unit` (runs unit tests for components, utilities, and services, excluding end-to-end browser tests).
* **Run End-to-End Tests:** `pnpm test:e2e` (runs Playwright/Cypress end-to-end integration tests).
* **Run Full Test Suite:** `pnpm test` (runs all unit and e2e tests).
* **Typecheck Codebase:** `pnpm typecheck` (verifies TypeScript compliance across all packages).

## Git Publication
When publishing changes through the `publish-pr` workflow, use `WS` as the branch prefix. Do not ask the user to choose a branch prefix unless this instruction is removed or changed.

---

## Don't do
* **DO NOT expose `service_role` keys:** Never write or use Supabase `service_role` secret keys in client-side code (`apps/web`) or publishable client configs. Use the publishable anonymous key (`VITE_SUPABASE_ANON_KEY`) and secure access via Row Level Security (RLS) policies.
* **DO NOT bypass RLS:** Always ensure Row Level Security is enabled on new database tables exposed to the Data API. Do not write policies using deprecated functions like `auth.role()`; use the `TO authenticated` clause instead combined with ownership checks.
* **DO NOT ignore `updatedAt` constraints:** Do not insert or update records directly via Supabase client without ensuring `updatedAt` is either populated on the client side (`updatedAt: new Date().toISOString()`) or managed by database triggers/defaults.
* **DO NOT use user-modifiable claims for authorization:** Do not use `user_metadata` fields (e.g. `raw_user_meta_data`) for authorization decisions in RLS policies. User metadata can be changed by the user; use `app_metadata` or explicit lookup tables instead.

---

## Lessons Learned
Before writing any code or modifying schemas, you **MUST** consult the lessons learned log:
* **[LESSONS.md](file:///Users/okzapradhana/projects/whyspend/LESSONS.md)**: Workspace log detailing past bugs, architectural pivots, and configuration pitfalls.
* **Update the Log:** Whenever the user reports a valid bug or an implementation oversight that was missed, you are required to document it in `LESSONS.md` explaining the problem, the root cause, and the resolution.

---

## Skill References
Refer to these custom workspace guidelines in [.agents/skills/](file:///Users/okzapradhana/projects/whyspend/.agents/skills) when performing specific tasks:
* **[supabase](file:///Users/okzapradhana/projects/whyspend/.agents/skills/supabase/SKILL.md)**: Rules for authentication, database interaction, security audits, triggers, and migrations.
* **[supabase-postgres-best-practices](file:///Users/okzapradhana/projects/whyspend/.agents/skills/supabase-postgres-best-practices/SKILL.md)**: Performance optimization strategies and schema design guidelines for Postgres.
* **[visual-plan](file:///Users/okzapradhana/.gemini/config/skills/visual-plan/SKILL.md)**: Standard guide for generating and checking visual/interactive plan files.
