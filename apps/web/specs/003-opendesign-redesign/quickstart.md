# Quickstart: OpenDesign Website Redesign

## Source References

Open the primary design source package before implementation:

```text
/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0
```

Primary files to compare:

```text
brand-spec.md
assets/app.css
screens/dashboard.html
screens/transactions.html
screens/settings.html
screens/savings-goals.html
screens/login.html
screens/signup.html
index.html
```

## Implementation Order

1. For each source screen, open the matching OpenDesign `screens/*.html` and identify its layout wrappers, class vocabulary, `data-od-id` sections, controls, cards, tables, charts, dialogs, and responsive shell behavior.
2. Port OpenDesign `assets/app.css` into the project styling layer, preserving selectors and behavior where practical. Tailwind may support the port, but must not replace source behavior with prior WhySpend styling assumptions.
3. Convert the shared app shell directly from OpenDesign: `drawer-backdrop`, `mobile-bar`, `app-shell`, `sidebar`, `brand`, `nav-group`, `nav-item`, `top-actions`, `account-pill`, and `avatar-stack`.
4. Convert Dashboard from `screens/dashboard.html`: page head, metrics, spending chart, budget health, cash-flow trend, legends, and month picker.
5. Convert Transactions from `screens/transactions.html`: page head, month picker, search, type filters, ledger rows, floating add action, reusable form, row actions, and responsive overflow behavior.
6. Convert Settings from `screens/settings.html`: category/budget tables, category groups, household access, row actions, and editable states.
7. Convert Savings Goals from `screens/savings-goals.html`: progress summary, goal cards, menus, add/edit forms, delete confirmation, and progress bars.
8. Convert Auth screens from `screens/signup.html` and `screens/login.html` while preserving Display Name, Email, Password, validation, password visibility, and status feedback.
9. Replace static OpenDesign sample content with live WhySpend data only after the TSX structure matches the source layout.
10. Run source-structure, visual, accessibility, responsive, and PWA verification against this plan and `contracts/ui.md`.

## Direct Port Checklist

For each converted screen, record:

- Source file used, for example `screens/dashboard.html`.
- Source sections and classes ported, including top-level wrappers and repeated component classes.
- React files updated.
- Static sample content replaced by live data.
- Source classes retained directly or mapped to one-to-one aliases.
- Deviations from the source, with product, accessibility, routing, PWA, or data-integrity rationale.
- Screenshot evidence and source-structure review result.

## Development Commands

Install dependencies if needed:

```bash
pnpm install
```

Start the API:

```bash
pnpm --dir ../whyspend-api dev
```

Start the frontend:

```bash
pnpm dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

API URL:

```text
http://127.0.0.1:4174/api
```

## Verification Commands

Run frontend tests:

```bash
pnpm test
```

Run frontend build:

```bash
pnpm run build
```

Run Playwright smoke checks:

```bash
pnpm exec playwright test
```

Run OpenDesign token parity:

```bash
pnpm test:tokens
```

Run OpenDesign visual regression checks:

```bash
pnpm test:visual
```

Run OpenDesign source-structure checks:

```bash
pnpm test:structure
```

Run the CI-style OpenDesign gate:

```bash
pnpm check:opendesign
```

Run API tests if UI conversion exposes or depends on API behavior:

```bash
pnpm --dir ../whyspend-api test
```

Run API build if API code changes are introduced:

```bash
pnpm --dir ../whyspend-api run build
```

## Visual QA Artifacts

Store generated evidence under:

```text
specs/003-opendesign-redesign/artifacts/
```

Use this folder for desktop/mobile screenshots, OpenDesign reference captures, visual diff output, token parity logs, source-structure mapping notes, timing evidence, usability notes, and Impeccable audit or polish output. Keep committed notes in this quickstart and leave large generated images/logs out of version control if they are better stored as local evidence.

## Automated Thresholds

- Token parity fails on any missing required Serene Union token value across OpenDesign `assets/app.css`, `DESIGN.md`, and `src/styles/app.css`.
- Visual regression uses Playwright screenshot thresholds with `maxDiffPixelRatio: 0.25` for converted app routes, with a fixed 1440 by 1000 desktop viewport, animations disabled, and date/month inputs masked.
- Source-structure review fails if a screen keeps prior WhySpend layout/component structure where the matching OpenDesign HTML provides a different layout/component structure and no documented rationale exists.
- CSS parity review fails if OpenDesign selector behavior for shell, navigation, buttons, cards, fields, tables, charts, dialogs, or progress is replaced by old project styling without a documented accessibility or React compatibility reason.
- Navigation timing target: primary route changes should remain below 10 seconds in Playwright timing annotations.
- Monthly workflow target: dashboard review, transaction entry, Settings budget review/update path, and savings goal review should remain below 5 minutes in Playwright timing annotations.

## Latest Verification Evidence

- `pnpm test`: passed 18 files and 22 tests on 2026-06-07 after the direct-port selector pass.
- `pnpm run build`: passed on 2026-06-07. Vite reported the existing large JavaScript chunk warning for `dist/assets/index-eUHNsqlQ.js` at 754.68 kB before gzip.
- `pnpm test:structure`: passed on 2026-06-07. The script checked shared shell, Dashboard, Transactions, Settings, Savings Goals, and Auth against OpenDesign source files and required implementation selectors.
- `pnpm check:opendesign`: passed on 2026-06-07. Token parity checked 18 OpenDesign tokens, source-structure comparison passed for 6 surfaces, and visual regression passed 2 Chromium tests.
- `pnpm exec playwright test`: passed 12 Chromium tests on 2026-06-07. Coverage includes desktop load, mobile load, legacy household workflow, JWT authorization, OpenDesign route vocabulary, auth layouts, timing, monthly workflow, keyboard/focus/reduced-motion/mobile overflow, PWA shell assets, and visual regression.
- `node .agents/skills/impeccable/scripts/detect.mjs --json src/styles/app.css src/app/router.tsx src/features/summaries/SummaryPage.tsx src/features/transactions/TransactionsPage.tsx src/features/settings/SettingsPage.tsx src/features/savings-goals/SavingsGoalsPage.tsx src/features/auth/AuthPage.tsx`: returned `[]`, so no blocking Impeccable detector findings were reported for the redesigned UI files.
- `git diff --check`: passed with no whitespace errors. `git status --short` shows the broad OpenDesign implementation surface plus existing spec/runtime drift in the working tree; no destructive cleanup was performed.

## Accessibility And Quality Evidence

- Keyboard/focus: `tests/e2e/opendesign-redesign.spec.ts` opens the mobile hamburger with keyboard, closes it with Escape, and verifies focus returns to the menu button.
- Reduced motion: the same Playwright file emulates `prefers-reduced-motion: reduce` before exercising the mobile drawer and Savings Goals route.
- Mobile overflow: the same Playwright file verifies `document.documentElement.scrollWidth` does not exceed `clientWidth` after mobile navigation.
- PWA: the same Playwright file verifies the manifest link, `/manifest.webmanifest` response, `display: standalone`, app name, and `/service-worker.js` response.
- Contrast: calculated token pairs pass AA for checked text roles: foreground on background 16.27:1, secondary foreground on background 8.85:1, white on accent 6.47:1, danger on danger-soft 5.00:1, secondary on secondary-soft 5.00:1, and sidebar-muted on sidebar 8.42:1. The raw OpenDesign muted token remains in CSS for parity, but normal text uses the darker `--muted-strong` alias because the raw token was 4.27:1 on the page background.
- Visual stability: `playwright.config.ts` runs E2E with one worker and a 60-second per-test timeout because the suite shares one local frontend/API pair and includes account creation plus visual captures.

## Usability, Timing, And Copy Review

- First-pass usability validation was completed as internal proxy walkthroughs, not external human participant testing. Proxy P1 located income, expenses, savings, budgets, actuals, and differences from Dashboard and Settings without route ambiguity. Proxy P2 completed transaction entry, category creation, budget review, and savings-goal review through Transactions, Settings, and Savings Goals. Proxy P3 validated the mobile hamburger path to Dashboard, Transactions, Savings Goals, Settings, and Support.
- Timing evidence: the Playwright navigation timing test completed in the latest full run under the 10-second target. The monthly workflow test completed in the latest full run under the 5-minute target.
- UX copy review: `src/app/router.tsx`, `src/features/summaries/SummaryPage.tsx`, `src/features/transactions/TransactionsPage.tsx`, `src/features/settings/SettingsPage.tsx`, `src/features/savings-goals/SavingsGoalsPage.tsx`, and `src/features/auth/AuthPage.tsx` use calm product wording. Dashboard replaces stale user-facing Summary labels, savings transactions use Goal wording, Settings owns categories and budgets, and auth preserves Display Name, Email, and Password.

## Manual Acceptance Checklist

- Confirm each screen was ported from its source HTML structure before live data binding.
- Confirm source class vocabulary is retained or mapped one-to-one for shell, navigation, buttons, cards, fields, tables, chart/progress modules, dialogs, and menus.
- Confirm old WhySpend layout decisions were not preserved unless they already match the OpenDesign source or have a documented rationale.
- Compare desktop Dashboard against `screens/dashboard.html`.
- Compare mobile Dashboard/hamburger behavior against OpenDesign mobile screenshots and `screens/dashboard.html`.
- Compare Transactions against `screens/transactions.html`, including month picker, filters, table overflow, and transaction form.
- Compare Settings against `screens/settings.html`, including editable rows, category groups, and household access.
- Compare Savings Goals against `screens/savings-goals.html`, including menus, add/edit forms, delete confirmation, and progress bars.
- Compare signup/login against `screens/signup.html` and `screens/login.html`.
- Confirm user-facing labels use authenticated household data, not Person A/Person B or sample-only data.
- Confirm budget configuration remains in Settings.
- Confirm Dashboard wording replaces stale monthly-summary wording where user-facing.
- Confirm all screens pass mobile, tablet, desktop, keyboard, focus, reduced-motion, and WCAG AA contrast checks.
- Record intentional OpenDesign differences with product, accessibility, or data-integrity rationale.

## Rendered Reference Notes

- App shell: desktop uses the OpenDesign left rail; mobile uses a sticky top bar and toggleable drawer. The drawer returns focus to the menu button on close.
- Dashboard: user-facing route and heading use Dashboard language instead of the older Summary wording while preserving month selection, metrics, category spending, budget status, and history modules.
- Transactions: OpenDesign controls are represented by month picker, search, type filters, ledger rows, and a floating add action. Savings entries use Goal wording.
- Settings: budget and category management intentionally live together because PRODUCT.md assigns expense category budgets, income categories, and savings goal categories to Settings.
- Savings Goals: current route uses local UI data for visual conversion until a persisted savings-goal API exists. Progress bars include visible percentage text and accessible labels.
- Auth: social sign-in placeholders are intentionally omitted because the implemented product contract is Display Name, Email, Password, and JWT auth.
- Quality states: component coverage now includes long labels, high Rp values, loading, empty, error, success, disabled/loading buttons, and mobile reduced-motion/overflow e2e checks.
