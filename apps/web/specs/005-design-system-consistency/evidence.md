# Design-system redesign evidence

## Capture provenance

- Baseline: isolated worktree at commit `b3ab6389`.
- Redesigned state: current `WS` redesign branch before publication.
- Harness: `tests/e2e/design-system-capture.spec.ts` with browser-intercepted fixtures from `tests/e2e/design-review-fixtures.ts`.
- Fixture identity: `Design review`; fixture household: `Review household`.
- Privacy: no real Supabase session, household, invitation, transaction, category, goal, or address data was read or written.
- Baseline-only compatibility: the capture helper applies `overflow-x: clip` to the baseline document to neutralize the old closed off-canvas drawer's scroll-width bookkeeping. It does not hide a visible overflow offender or alter captured layout.

## Screenshot set

The paired evidence lives in:

- `../../../../docs/screenshots/design-system-redesign/before/`
- `../../../../docs/screenshots/design-system-redesign/after/`

Each directory contains 30 PNG files: desktop 1440x1000 and mobile 390x844 views for login, signup, password recovery request, password update, household setup, invitation, privacy, terms, dashboard, transactions, savings goals, settings, and support; plus desktop account-menu and transaction-dialog states and mobile navigation-drawer and savings-dialog states. There are 60 PNG files total and no JPEG evidence.

## Verification coverage

- Static validator scans 6 stylesheets and 53 TypeScript/TSX source files for token, type, radius, literal-color, selector, and copy-contract violations.
- Browser workflows cover every routed screen at 320px, transaction creation, dialog focus containment and focus return, minimum target sizes, control radii, and loading/empty/error states.
- Unit/component coverage includes dialog Escape handling, Tab wrapping, background inertness, scroll locking, and focus restoration.
- Contact sheets and representative full-resolution screenshots were visually inspected after capture.

## Reproduction commands

```sh
CAPTURE_PHASE=after PLAYWRIGHT_FIXTURE_ONLY=1 PLAYWRIGHT_WEB_PORT=4184 pnpm --filter @whyspend/web exec playwright test tests/e2e/design-system-capture.spec.ts --project=chromium
PLAYWRIGHT_FIXTURE_ONLY=1 PLAYWRIGHT_WEB_PORT=4184 pnpm --filter @whyspend/web exec playwright test tests/e2e/design-system-workflows.spec.ts --project=chromium
pnpm --filter @whyspend/web test:design-system
pnpm --filter @whyspend/web exec tsc --noEmit
pnpm --filter @whyspend/web test
pnpm --filter @whyspend/web build
```
