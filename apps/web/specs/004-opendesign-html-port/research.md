# Research: OpenDesign HTML Port

## Decision: Target visual parity, not strict DOM parity

**Rationale**: The clarified branch goal is to delete or replace current TSX-rendered screens and rebuild new TSX routes from OpenDesign screens. The implementation should match the rendered layout, vocabulary, hierarchy, and behavior of the source screens, but may use different internal TSX structure when accessibility, live data, routing, or state handling requires it.

**Alternatives considered**:
- Strict DOM/class parity: rejected because it would over-constrain React component structure and could make accessibility or state handling brittle.
- Loose inspiration-only redesign: rejected because it would preserve too much room for the old UI to survive.

## Decision: Keep the existing React/Vite/TypeScript stack

**Rationale**: The repository already uses React 19, React Router 7, Vite, TypeScript, Tailwind CSS 4, lucide-react, Recharts, Vitest, Testing Library, and Playwright. The user explicitly wants new TSX screens and routes, not static HTML runtime pages.

**Alternatives considered**:
- Serve OpenDesign HTML directly: rejected because it would bypass live household data, routing, API state, auth, and product tests.
- Adopt a new component framework: rejected because the source visual contract and existing design system are sufficient.

## Decision: Use `screens/` and `assets/app.css` as primary OpenDesign sources

**Rationale**: The source package contains generated variants and current screen files. The current `screens/*.html` files represent route-level source screens, and `assets/app.css` contains shared tokens, shell, auth, card, table, chart, dialog, and responsive behavior.

**Alternatives considered**:
- Use older root-level generated HTML files: rejected except as historical reference because route matching is less direct.
- Use screenshots only: rejected because HTML and CSS expose source vocabulary and interaction structure.

## Decision: Rebuild covered route screens in place

**Rationale**: Current app routes already map to `/dashboard`, `/transactions`, `/savings-goals`, `/settings`, `/auth`, and `/support`. Rebuilding in place keeps user-facing URLs stable while deleting or replacing the old TSX screen layouts.

**Alternatives considered**:
- Create parallel preview routes first: rejected as the main implementation path because it risks shipping duplicate layouts and delaying replacement.
- Rename all routes: rejected because no product requirement needs route churn.

## Decision: Keep API and data model behavior stable

**Rationale**: This is a frontend rebuild. PRODUCT.md and prior specs already define JWT authentication, PostgreSQL persistence, categories, budgets, records, summaries, and savings goals. The plan should bind source layouts to existing data instead of expanding backend scope.

**Alternatives considered**:
- Introduce backend redesign tasks: rejected unless implementation discovers an existing UI binding cannot be supported by current planned API data.
- Use mock-only data for route parity: rejected because live household data binding is a P2 requirement.

## Decision: Make acceptance evidence route-level

**Rationale**: The feature needs proof that each route started from the matching source file, old TSX screen layout was removed or replaced, static samples were bound to live values, and intentional rendered differences were documented. Route-level evidence keeps implementation review concrete and prevents vague "inspired by OpenDesign" claims.

**Alternatives considered**:
- Rely only on screenshots: rejected because screenshots do not show which old screens were replaced or which data substitutions were made.
- Rely only on code review: rejected because visual parity needs rendered evidence.

## Decision: Keep structure comparison useful but not absolute

**Rationale**: Existing `pnpm test:structure` checks source vocabulary tokens in implementation files. It remains useful as a drift detector, but this branch's clarified standard is visual parity. The structure check should verify important source terms without requiring exact DOM parity.

**Alternatives considered**:
- Remove source-structure checks: rejected because they catch accidental loss of source vocabulary.
- Expand checks to exact DOM snapshots: rejected because that conflicts with the visual-parity clarification.
