# Implementation Plan: OpenDesign Website Redesign

**Branch**: `003-opendesign-redesign` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-opendesign-redesign/spec.md`

**Note**: User instruction for this plan: use the current WhySpend tech stack even though the reference designs are HTML and CSS. Strictly adhere to the OpenDesign reference and convert the reference HTML/CSS into the existing React TSX, Vite, TypeScript, Tailwind, CSS custom property, React Router, lucide-react, and Recharts frontend.

**Alignment Update 2026-06-07**: The implementation MUST be a direct design port from the OpenDesign HTML and CSS, not an adjustment of the prior WhySpend UI. Each screen conversion starts by translating the matching `screens/*.html` structure, class vocabulary, layout hierarchy, button patterns, cards, forms, navigation, and CSS behavior into React TSX and project CSS/Tailwind. Existing WhySpend components may be reused only when they can render the OpenDesign structure and visual behavior without preserving old layout decisions. The static HTML files are design source files, not runtime pages.

## Summary

Revamp the WhySpend product UI by directly porting the Google Stitch to OpenDesign HTML/CSS reference package into the current React/Vite frontend. The implementation keeps the separated frontend/API architecture, preserves all household finance workflows, and replaces the prior WhySpend layout with the Serene Union reference direction from the OpenDesign `screens/` HTML files, `assets/app.css`, `brand-spec.md`, and `DESIGN.md`.

The redesign scope covers the app shell, dashboard, transactions, savings goals, Settings, sign-up, login, and a local prototype launcher/reference review surface when useful for implementation QA. The reference files are source-of-truth visual and structural material; production code must remain in the existing application stack and data model. The prior implementation pass is treated as partial groundwork only where it already matches the OpenDesign HTML/CSS structure.

## Technical Context

**Language/Version**: TypeScript. Frontend uses React TSX with React 19, React Router 7, and Vite. The sibling API remains TypeScript/Fastify and is not redesigned unless an existing UI contract requires already-planned data.

**Primary Dependencies**: Existing frontend dependencies: React, React DOM, React Router, Vite, Tailwind CSS 4 with `@tailwindcss/vite`, lucide-react, Recharts, Vitest, Testing Library, Playwright, and existing project CSS custom properties. No shadcn/ui adoption and no static HTML runtime.

**Storage**: PostgreSQL remains the persistence layer for users, households, categories, budgets, financial records, savings goals, and dashboard summaries through the sibling API. This feature does not introduce new persistence.

**Testing**: Vitest and Testing Library for component behavior, Playwright for desktop/mobile/PWA rendered checks, existing API tests only if the redesign exposes a data-contract gap, automated visual comparison against OpenDesign reference screenshots/HTML with explicit thresholds, token parity checks against OpenDesign CSS and `DESIGN.md`, keyboard/focus checks, reduced-motion checks, and contrast review.

**Target Platform**: Responsive desktop/mobile PWA browser website backed by the existing HTTP API.

**Project Type**: Web application with separated frontend and API projects.

**Performance Goals**: Initial authenticated product shell and screen transitions should feel immediate for normal two-person household data. Navigation, dialogs, menus, filters, and chart interactions should respond within 250 ms after data is loaded. Dashboard and transaction screens should avoid layout shifts after loading states resolve.

**Constraints**: Must follow current WhySpend tech stack. Must directly port OpenDesign HTML/CSS into React TSX components and project-owned CSS/Tailwind styling. Must follow the OpenDesign source package strictly where it does not conflict with PRODUCT.md, `DESIGN.md`, accessibility, data integrity, or the constitution. The conversion must not keep an old WhySpend layout, old component shape, or old button/card/form vocabulary merely because it already exists. Must preserve JWT-authenticated household access, API-only persistence, PostgreSQL-backed data, desktop/mobile hamburger navigation, PWA behavior, WCAG AA, reduced motion, and explicit financial labels.

**Scale/Scope**: Household of two members, the existing WhySpend frontend, one shared app shell, auth screens, dashboard, transaction ledger and form, Settings categories and budgets, savings goals, support navigation target, realistic category overflow, high Rp amounts, and responsive mobile/tablet/desktop layouts.

**Product Context**: Supports PRODUCT.md workflows for account creation, selected-month dashboard review, transaction entry, category and budget management in Settings, income tracking, expense tracking, savings tracking, savings goal management, and replacement of Money Manager plus spreadsheet handoff.

**Design Context**: Impeccable product register applies as a quality gate, not as permission to reinterpret the OpenDesign reference. `DESIGN.md`, the OpenDesign `brand-spec.md`, `assets/app.css`, and current files under the OpenDesign `screens/` directory are binding design references. Use the Serene Union direction exactly as represented in the source HTML/CSS: off-white surfaces, sage primary actions, soft blue secondary accents, warm sand tonal surfaces, Inter, tabular Rp amounts, pill-shaped primary controls, 24px cards/panels, ambient shadows, 8px spacing rhythm, desktop left rail, mobile hamburger drawer, and explicit chart legends. Anti-references remain generic banking dashboards, gamified guilt, decorative charts, spreadsheet mimicry as the primary experience, vague card grids, weak contrast, text overflow, and inconsistent component vocabulary.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Household Finance Workflow First**: PASS. The redesign keeps transaction entry, category aggregation, income tracking, savings tracking, budget comparison, and monthly dashboard review visible in one shared product, reducing the Money Manager to spreadsheet handoff rather than replacing it with decorative screens.
- **Specified And Independently Testable Slices**: PASS. P1 app shell/navigation can be built and validated independently before deeper dashboard, transaction, Settings, savings, and auth conversions.
- **Product UI Anti-Slop Gates**: PASS. Primary actions are monthly review, record entry, category/budget management, and savings goal progress. Required states include loading, empty, error, success, long labels, high amounts, desktop/mobile navigation, dialogs, focus, reduced motion, and chart overflow. Impeccable product register, PRODUCT.md, DESIGN.md, and OpenDesign references define the design contract. This gate constrains accessibility and product quality but does not justify preserving prior WhySpend layout decisions when the OpenDesign HTML/CSS differs.
- **Data Integrity And Shared Ownership**: PASS. The plan preserves authenticated users, household membership, household/shared scope, category, month, amount, type, notes, budgets, actuals, differences, and savings goal meanings. The redesign changes presentation only and keeps PostgreSQL/API ownership rules intact.
- **Verification Before Done**: PASS. Plan requires component tests, browser checks, rendered desktop/mobile review, keyboard/focus checks, contrast checks, reduced-motion checks, PWA smoke checks, and reference comparison against OpenDesign screens.

## Project Structure

### Documentation (this feature)

```text
specs/003-opendesign-redesign/
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
│   ├── modules/
│   ├── db/
│   └── server/
└── tests/
```

**Structure Decision**: Keep the current frontend/API split. Directly port OpenDesign reference screens into React route components and shared product components. Start from the source HTML hierarchy and class vocabulary, then replace static content with live React data and state handling. Use `src/styles/app.css`, Tailwind utilities where appropriate, and `src/components/design-system/` for reusable Serene Union primitives only when they preserve the source structure. Do not copy static HTML pages into the app as runtime screens.

## Complexity Tracking

No constitution violations are required for this plan.

## Phase 0 Research Summary

See [research.md](./research.md).

Key decisions:
- Keep the current React/Vite/TypeScript/Tailwind stack and directly port OpenDesign HTML/CSS into the existing app.
- Treat OpenDesign `screens/` and `assets/app.css` as the primary reference source when older generated variants conflict.
- Preserve existing API contracts and data ownership; redesign only presentation unless an already-planned UI needs existing API data.
- Use project-owned Serene Union components and tokens, not shadcn/ui or a new component framework. Existing components should be reshaped or replaced when they block HTML/CSS parity.
- Verify with rendered browser checks and direct reference comparison, not code-only inspection.

## Phase 1 Design Summary

See [data-model.md](./data-model.md), [contracts/ui.md](./contracts/ui.md), and [quickstart.md](./quickstart.md).

Post-design constitution re-check:
- **Household Finance Workflow First**: PASS. UI contracts map each OpenDesign screen to household finance workflows and keep dashboard, transaction, Settings, and savings work task-first.
- **Specified And Independently Testable Slices**: PASS. Data model and UI contract separate app shell, dashboard, transactions, Settings, savings goals, and auth into independently testable slices.
- **Product UI Anti-Slop Gates**: PASS. UI contract binds screens to OpenDesign references, product register rules, required states, responsive behavior, focus, contrast, reduced motion, and anti-references. Impeccable quality gates may require accessibility or semantics fixes, but they do not permit layout reinterpretation when the source HTML/CSS can be ported.
- **Data Integrity And Shared Ownership**: PASS. Data model preserves user, household, category, goal, financial record, and dashboard summary meanings while treating the redesign as presentation and interaction conversion.
- **Verification Before Done**: PASS. Quickstart lists spec checks, unit/component tests, builds, Playwright, desktop/mobile rendered inspection, contrast, keyboard/focus, reduced motion, and OpenDesign reference review.

## Agent Context Update

The expected Spec Kit agent update script is not present in this installation, so `AGENTS.md` was updated manually to point the SPECKIT context block at this plan.
