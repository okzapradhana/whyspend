# Implementation Plan: OpenDesign HTML Port

**Branch**: `004-opendesign-html-port` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-opendesign-html-port/spec.md`

**Note**: This plan implements the clarification from 2026-06-07: target visual parity with the OpenDesign source screens, not strict internal DOM/class parity. The covered routes remain TSX routes, but their current TSX-rendered screen implementations are deleted or replaced and rebuilt from the OpenDesign screen references.

## Summary

Rebuild the WhySpend user-facing website routes from the OpenDesign source package at `/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0`. Each covered route starts from the matching `screens/*.html` reference and shared `assets/app.css` visual system, then becomes a new TSX route screen that binds live household data while preserving the rendered layout, interaction vocabulary, and Serene Union design direction.

The implementation replaces the existing TSX-rendered screen layouts for dashboard, transactions, savings goals, settings, login/signup auth, and the shared product shell where needed. Accessibility, routing, API state, loading/empty/error/success states, mobile hamburger behavior, and responsive behavior are applied after source-screen visual structure is established. The plan adds route-level acceptance evidence so implementation can prove which source file was used, what data was bound, which old TSX screen was removed or replaced, and any intentional rendered differences.

## Technical Context

**Language/Version**: TypeScript 5.7 with React 19 TSX.

**Primary Dependencies**: Vite 5, React DOM, React Router 7, Tailwind CSS 4 with `@tailwindcss/vite`, lucide-react, Recharts, project CSS custom properties, and existing HTTP API clients in `src/lib/api/`.

**Storage**: PostgreSQL for users, households, categories, financial records, budgets, savings goals, and derived monthly summaries through the sibling API. This feature does not introduce new persistence.

**Testing**: Vitest, Testing Library, Playwright, OpenDesign token parity (`pnpm test:tokens`), OpenDesign source-structure comparison (`pnpm test:structure`), OpenDesign visual regression (`pnpm test:visual`), and combined gate (`pnpm check:opendesign`).

**Target Platform**: Responsive desktop/mobile PWA browser website backed by the existing HTTP API.

**Project Type**: Frontend web application in this repository, with separated sibling API in `../whyspend-api`.

**Performance Goals**: Route navigation, drawers, dialogs, filters, and form interactions respond within 250 ms after data has loaded. Initial authenticated product shell renders without visible layout shift after loading states resolve. The monthly workflow in the spec remains completable in under 5 minutes.

**Constraints**: Must keep the current React/Vite/TypeScript/Tailwind stack and TSX routes. Must rebuild covered routes from OpenDesign visual references and delete or replace current TSX-rendered screen implementations. Must preserve JWT-authenticated household access, API-only persistence, PostgreSQL-backed financial data, Settings ownership of categories and budgets, desktop rail, mobile hamburger drawer, PWA behavior, WCAG AA, visible focus, reduced motion, and explicit labels for income, expenses, savings, budgets, actuals, differences, and goal progress.

**Scale/Scope**: Six OpenDesign source screens plus the shared shell: `screens/dashboard.html`, `screens/transactions.html`, `screens/savings-goals.html`, `screens/settings.html`, `screens/login.html`, and `screens/signup.html`. Scope includes realistic two-person household data, high Rp amounts, long category names, empty states, API failures, validation errors, dialogs, menus, and mobile overflow.

**Product Context**: Supports PRODUCT.md workflows for account creation, selected-month dashboard review, transaction entry, category and budget management in Settings, income tracking, expense tracking, savings tracking, savings goal management, and replacement of Money Manager plus spreadsheet handoff.

**Design Context**: Impeccable product register applies as a quality gate. `DESIGN.md`, OpenDesign `brand-spec.md`, `assets/app.css`, and current files under OpenDesign `screens/` define the visual contract. The product direction is Serene Union: off-white surfaces, sage primary actions, soft blue secondary accents, warm sand tonal surfaces, Inter typography, tabular Rp amounts, pill-shaped primary controls, 24px cards/panels, ambient shadows, 8px spacing rhythm, desktop left rail, mobile hamburger drawer, and explicit chart legends. Anti-references remain generic banking dashboards, gamified guilt, decorative charts, spreadsheet mimicry as the primary experience, vague card grids, weak contrast, text overflow, and inconsistent component vocabulary.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Household Finance Workflow First**: PASS. The route rebuild preserves the core household workflow: selected-month dashboard review, transaction entry, category/budget management, income tracking, savings tracking, goal progress, and reduced spreadsheet handoff.
- **Specified And Independently Testable Slices**: PASS. P1 visual-source route parity can be built and validated route by route before live data bindings and production state hardening are added. Dashboard, transactions, savings goals, settings, and auth are independently demonstrable.
- **Product UI Anti-Slop Gates**: PASS. Primary action is repeated household finance work. Required states include default, loading, empty, error, success, disabled, hover, focus, active, dialog/menu open, long-text, high-amount, and mobile overflow. Visual source files plus PRODUCT.md, DESIGN.md, constitution, and Impeccable product register define the quality gate.
- **Data Integrity And Shared Ownership**: PASS. The rebuild is presentation-focused and preserves authenticated user, household membership, household/shared scope, category or goal, month/date, amount, type, notes, budget, actual, difference, and goal progress meanings. Existing API/PostgreSQL ownership remains the data boundary.
- **Verification Before Done**: PASS. Verification includes component tests, rendered browser inspection, keyboard/focus checks, contrast checks, responsive checks, reduced-motion checks, source-screen acceptance records, token/structure comparison, Playwright smoke, and visual regression.

## Project Structure

### Documentation (this feature)

```text
specs/004-opendesign-html-port/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui.md
└── tasks.md
```

### Source Code (repository root)

```text
whyspend/
├── package.json
├── scripts/
│   ├── compare-opendesign-structure.mjs
│   └── compare-opendesign-tokens.mjs
├── src/
│   ├── app/
│   │   ├── authState.tsx
│   │   └── router.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── StatusMessage.tsx
│   │   └── design-system/
│   ├── features/
│   │   ├── auth/
│   │   ├── savings-goals/
│   │   ├── settings/
│   │   ├── summaries/
│   │   └── transactions/
│   ├── lib/
│   │   ├── api/
│   │   └── finance.ts
│   ├── pwa/
│   └── styles/
│       └── app.css
└── tests/
    ├── e2e/
    └── *.test.tsx

../whyspend-api/
├── src/
│   ├── db/
│   ├── modules/
│   └── server/
└── tests/
```

**Structure Decision**: Keep the existing frontend/API split. Rebuild route screens in the existing frontend route boundaries and API client layer. Replace old TSX-rendered screen layout files where needed rather than preserving legacy layout structure. Shared components may be retained only when they render the OpenDesign visual contract; otherwise they are reshaped or bypassed for the new route implementation.

## Complexity Tracking

No constitution violations are required for this plan.

## Phase 0 Research Summary

See [research.md](./research.md).

Key decisions:
- Use visual parity as the acceptance standard, not strict DOM parity.
- Keep TSX routes and current stack while deleting or replacing current screen implementations.
- Treat `screens/` and `assets/app.css` as primary source references when generated variants conflict.
- Preserve existing API contracts and data meanings; this feature should not create backend scope unless a current UI binding exposes a missing existing endpoint.
- Use route-level acceptance records plus automated token/structure/visual checks to prevent drift.

## Phase 1 Design Summary

See [data-model.md](./data-model.md), [contracts/ui.md](./contracts/ui.md), and [quickstart.md](./quickstart.md).

Post-design constitution re-check:
- **Household Finance Workflow First**: PASS. The data model and UI contract map every rebuilt route back to dashboard review, transaction entry, Settings-owned configuration, and savings goal progress.
- **Specified And Independently Testable Slices**: PASS. UI contracts split the shell, auth, dashboard, transactions, settings, and savings goals into independently testable route contracts.
- **Product UI Anti-Slop Gates**: PASS. Contracts require OpenDesign visual comparison, realistic household data ranges, all production states, responsive checks, focus, contrast, reduced motion, and explicit finance labels.
- **Data Integrity And Shared Ownership**: PASS. Entities preserve household, user, category, financial record, budget, savings goal, dashboard summary, route source, and acceptance record meanings.
- **Verification Before Done**: PASS. Quickstart defines source review, route implementation order, automated tests, browser checks, OpenDesign gates, and route acceptance evidence.

## Agent Context Update

The expected Spec Kit agent update script is not present in this installation, so `AGENTS.md` was updated manually to point the SPECKIT context block at this plan.
