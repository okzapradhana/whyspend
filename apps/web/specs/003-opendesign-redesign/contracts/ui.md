# UI Contract: OpenDesign Website Redesign

## Design Source Contract

Implementation MUST directly port the OpenDesign reference into the current WhySpend frontend stack. The OpenDesign HTML and CSS files are the design source for layout, DOM hierarchy, selector vocabulary, buttons, cards, forms, navigation, charts, responsive behavior, and visual states.

Primary source package:

```text
/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0
```

Primary source files:

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

Older root-level generated HTML files and screenshots are secondary references. If they conflict with the current `screens/` set, use the current `screens/` set unless a product or accessibility reason says otherwise.

## Direct Port Contract

- Implementation MUST start from each source `screens/*.html` file and translate its structure into React TSX before wiring live data.
- Implementation MUST port `assets/app.css` selector behavior into the project styling layer, preserving source class names or one-to-one aliases where practical.
- Existing WhySpend route components, shared components, and CSS may be reused only when they render the OpenDesign hierarchy, class behavior, layout, and interaction states.
- Existing WhySpend layout, button, card, form, table, chart, or navigation patterns MUST be replaced when they differ from the OpenDesign source.
- Static OpenDesign sample content MUST be replaced with live WhySpend data, but the replacement must stay inside the source layout positions.
- Deviations are allowed only for PRODUCT.md semantics, authenticated data integrity, accessibility, PWA behavior, React Router behavior, or missing backend capability. Each deviation MUST be documented with source file, source selector or section, implementation location, and rationale.
- A screenshot-only match is insufficient. Acceptance review MUST include source-structure review against HTML hierarchy and CSS selector vocabulary.

## Current Stack Contract

- UI MUST be implemented as React TSX route components and shared components.
- Routing MUST remain in React Router.
- Styling MUST use the existing styling foundation: Tailwind CSS 4 where appropriate, CSS custom properties, and `src/styles/app.css`, but the styling source of truth is OpenDesign `assets/app.css`.
- Icons MUST use lucide-react where matching icons exist.
- Charts MUST continue using Recharts or existing chart components unless implementation shows a specific chart cannot meet the visual/accessibility requirements.
- Runtime MUST NOT serve the OpenDesign static HTML files as production app screens.
- The current framework stays React/Vite/TypeScript; the current visual layout does not stay unless it already matches OpenDesign.

## Route Mapping

| Product Surface | Current/Planned App Surface | Primary OpenDesign Reference | Required Outcome |
| --- | --- | --- | --- |
| Prototype launcher/reference review | Optional local reference surface or implementation QA checklist | `index.html` | Every source screen is discoverable during QA or documented in implementation notes. |
| Sign up | Auth registration mode | `screens/signup.html` | Display Name, Email, Password, password visibility, validation, create-account status, terms/privacy copy where product-approved. |
| Login | Auth login mode | `screens/login.html` | Email, Password, password visibility, validation, sign-in status, route to account creation. |
| Product shell | Shared authenticated shell | Shared sidebar/mobile-bar structure in `screens/*.html` | Desktop left rail, mobile hamburger drawer, active state, account pill/avatar, support entry, visible focus. |
| Dashboard | Dashboard or renamed Summary route | `screens/dashboard.html` | Selected-month overview, income/expense/savings metrics, spending by category, budget health, cash-flow trend, accessible legends and labels. |
| Transactions | Transactions route | `screens/transactions.html` | Month picker, search, type filters, ledger rows, floating add action, reusable transaction form for Expense/Savings/Income. |
| Settings | Settings route | `screens/settings.html` | Expense categories and budgets, income categories, savings goal categories, household access, add/delete/edit states. |
| Savings Goals | Savings goals route | `screens/savings-goals.html` | Total savings progress, goal cards, goal menus, add/edit dialogs, delete confirmation, progress semantics. |

## Source Structure Mapping Requirements

| Source Structure | React Port Requirement |
| --- | --- |
| `drawer-backdrop`, `mobile-bar`, `app-shell`, `sidebar`, `screen`, `content` | Preserve the shell wrappers and responsive order in `src/app/router.tsx` or equivalent shell components; wire React Router links and drawer state into the same structure. |
| `brand`, `brand-mark`, `brand-title`, `brand-subtitle`, `nav-group`, `nav-item`, `nav-secondary` | Port navigation classes and active-state behavior directly; replace inline SVGs with lucide-react only when the resulting icon placement, stroke weight, and button/link dimensions remain aligned. |
| `top-actions`, `account-pill`, `avatar-stack`, `avatar` | Port account and action affordances directly while replacing sample initials/names with authenticated household data. |
| `page-head`, `page-title`, `page-kicker`, `actions`, `month-picker` | Preserve page header layout and source class vocabulary; replace static month text with live selected-month state. |
| `grid`, `grid-2`, `grid-3`, `dashboard-chart-pair`, screen-specific grids | Preserve grid layout classes and responsive CSS rather than falling back to previous summary/settings/transactions layouts. |
| `card`, `card-head`, `card-title`, `card-subtitle`, `metric`, `metric-railed`, `metric-*` | Port card and metric structure directly; bind live totals and labels inside source positions. |
| `btn`, `btn-primary`, `btn-secondary`, `icon-button`, `fab-button` | Port button dimensions, pill shape, icon placement, hover/focus/disabled/loading behavior directly into shared React button APIs. |
| `field`, form controls, table inputs, filters, segmented controls | Preserve source labels, wrappers, focus rings, placeholder styling, and validation placement while binding React form state. |
| `data-table`, ledger rows, row actions, menus, dialogs | Preserve table/action structure and overflow behavior; use portals or fixed overlays only when needed to avoid clipping. |
| `pie-chart`, `legend`, `budget-bar`, `bar-track`, `line-chart`, `trend-hotspot`, progress classes | Port visual chart/progress layout while using Recharts or accessible SVG/HTML equivalents only if they preserve source positioning, legends, labels, and hover/focus affordances. |

## Component Conversion Contract

| OpenDesign Pattern | React Conversion Target | Requirements |
| --- | --- | --- |
| `.app-shell`, `.sidebar`, `.mobile-bar`, `.nav-item` | Shared app shell/navigation components | Port source shell wrappers and classes directly; same route vocabulary across desktop and mobile; drawer must trap/return focus appropriately; no clipped menu controls. |
| `.btn`, `.btn-primary`, `.btn-secondary`, `.icon-button`, `.fab-button` | Button/icon button/floating action components | Preserve pill buttons, sage primary, soft-blue secondary, visible focus, loading and disabled states, action-specific labels. |
| `.card`, `.card-soft`, `.card-blue`, `.card-sand`, `.metric` | Card/metric/surface primitives | Preserve source card hierarchy, 24px cards, tonal layers, ambient shadows, no hard decorative borders unless needed for data tables. |
| `.field`, auth inputs, month picker, table inputs | Input/select/form components | Soft container backgrounds, clear labels, validation text, accessible placeholders, focus ring, realistic overflow. |
| Transaction modal and goal modal | Dialog or inline progressive form components | Prefer existing `Dialog` if it meets accessibility; overlays must manage focus, escape/close behavior, loading, error, and success. |
| Goal menu and row actions | Accessible menu or inline actions | Actions must be keyboard reachable and not clipped by overflow containers. |
| Progress bars and budget bars | Progress components | Non-color labels, amount values, percentage text, accessible names, high-contrast text. |
| Pie/bar/line chart patterns | Recharts-based chart components | Legends, labels, tabular Rp amounts, keyboard/accessible summaries, no decorative-only charts. |

## Visual Acceptance Contract

Each converted surface MUST satisfy these checks:

1. Matches the source reference's layout posture, token usage, and component vocabulary.
2. Preserves the source HTML hierarchy and CSS selector vocabulary or records a justified one-to-one replacement.
3. Uses live WhySpend labels and authenticated household data rather than static sample-only content.
4. Preserves Serene Union tokens: off-white canvas, sage primary, soft blue secondary, warm sand containers, slate text, Inter, 8px rhythm, 24px cards, soft focus, and ambient shadows.
5. Provides default, hover, focus, active, disabled, loading, empty, error, success, and overflow states where applicable.
6. Passes mobile, tablet, and desktop rendered checks with no clipped controls, overlapping text, broken charts, or unreachable menu items.
7. Passes WCAG AA contrast for body text, labels, placeholders, buttons, status text, chart labels, and legends.
8. Respects reduced-motion preferences.
9. Records intentional differences from OpenDesign with reason: product data, accessibility, PWA behavior, existing route model, or data integrity.

## Product Semantics Contract

- Dashboard naming may use the current app route naming during implementation, but user-facing copy must align with PRODUCT.md dashboard framing.
- Expense category budgets remain Settings-owned.
- Savings goals are not expense categories and savings transactions are not expenses.
- Transaction form remains lightweight: Date, Amount in Rp, Category or Goal, optional Notes, with owner and household scope preserved behind the scenes.
- Income, expenses, savings, budget, actuals, differences, and goal progress must be explicitly labeled and not encoded by color alone.
- Person A and Person B are not production labels; use authenticated display names and household membership.

## Intentional Differences Recorded During Implementation

- User-facing navigation uses `Dashboard` at `/dashboard`; the prior `/summary` route remains as a compatibility alias only while stale Summary copy is removed from visible shell navigation.
- `Categories` is not a primary shell destination because PRODUCT.md assigns expense categories, income categories, savings goal categories, and budgets to Settings. Existing category management remains embedded in Settings.
- `Support` is implemented as a protected placeholder route so the OpenDesign support entry is reachable without inventing a new backend contact workflow.
- Savings Goals currently uses a UI-local goal list for the visual conversion route until a dedicated persisted savings-goal API contract is introduced; the page keeps savings goals semantically separate from expense categories and savings transactions.
- Auth uses the OpenDesign card posture but omits any visual social sign-in action because PRODUCT.md only defines Display Name, Email, Password, JWT login, and JWT registration. Social placeholders must not appear as clickable controls without a real auth provider.

## Verification Contract

Required evidence before done:

- Component/unit tests for shell navigation, auth mode behavior, transaction form type switching, Settings category/budget interaction, and savings goal dialog/menu behavior.
- Playwright checks for desktop and mobile navigation, auth screen rendering, dashboard rendering, transactions workflow, Settings workflow, savings goals workflow, and PWA load.
- Rendered browser screenshots or equivalent visual inspection notes comparing converted screens to OpenDesign references.
- Automated screenshot comparison between OpenDesign static reference pages and matching React app routes with documented allowed deviations and failure thresholds.
- Source-structure comparison for each route showing that TSX hierarchy, class vocabulary, and layout wrappers come from the matching OpenDesign HTML/CSS rather than the previous app layout.
- Token parity verification comparing OpenDesign `assets/app.css`, `DESIGN.md`, and `src/styles/app.css`.
- Keyboard/focus notes for hamburger drawer, dialogs, menus, forms, and route navigation.
- Contrast review notes for the token set and representative screens.
- Reduced-motion check for drawer, dialog, hover, and chart-related transitions.
