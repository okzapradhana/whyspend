# Implementation Plan: Design-system consistency redesign

## Technical approach

- Consolidate `src/styles/app.css` into one semantic token and shared-component layer, then keep route-specific layout in the existing feature stylesheets.
- Make shared design-system primitives single-purpose and adopt them on the four primary product routes.
- Normalize auth and secondary routes through the global page, control, surface, and dialog contracts without changing application behavior.
- Add a deterministic screenshot harness and a static design-system validator.

## Constitution check

- **Household workflow:** monthly context, totals, transaction entry, savings, budgets, and access remain the focal jobs.
- **Independent slices:** shell/tokens, dashboard, transactions, savings, settings, auth/secondary routes, and verification are separately testable.
- **Anti-slop gates:** explicit type, spacing, radius, elevation, responsive, state, and accessibility contracts replace screen-specific overrides.
- **Data integrity:** no API, persistence, ownership, category, month, or amount semantics change.
- **Verification:** before/after captures, static validation, unit tests, typecheck, build, responsive checks, and browser inspection are required.

## Risks and mitigations

- CSS consolidation can reveal hidden selector dependencies; run targeted component tests and inspect each live route after every batch.
- Remote Supabase state can expose personal data or make captures non-deterministic; intercept authentication and REST requests in the browser and use a synthetic `Design review` fixture without reading or writing remote records.
