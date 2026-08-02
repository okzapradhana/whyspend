# Feature Specification: OpenDesign HTML Port

**Feature Branch**: `004-opendesign-html-port`

**Created**: 2026-06-07

**Status**: Draft

**Input**: User description: "I want you to rebuild our website by reading HTML and CSS assets from all screens in: /Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0. Follow this approach in order: 1. For each route, start from the matching screens/*.html. 2. Convert that DOM into TSX almost 1:1. 3. Replace static text/data with live React bindings. 4. Only then adapt for accessibility, routing, API state, and responsive behavior. 5. Delete old screen layout code that does not map to the source HTML. If you are in doubt, start with asking me rather than writing any spec or plan."

## Clarifications

### Session 2026-06-07

- Q: How strict should route-source DOM parity be? -> A: Visual parity is the goal; delete current TSX-rendered screens and rebuild new TSX routes from OpenDesign screens, but internal structure may differ when the rendered result and product behavior match.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Port Every Route From Source Screens (Priority: P1)

As a household member using WhySpend, I need every redesigned route to visibly match its OpenDesign source screen so the website feels like a direct rebuild from the approved reference instead of a modified version of the old layout.

**Why this priority**: The requested rebuild is only successful if source-screen parity drives the work before product data, accessibility, routing, and responsive adaptations are layered in.

**Independent Test**: Can be tested by comparing each live route with its matching OpenDesign `screens/*.html` file and confirming the rendered navigation, cards, forms, controls, labels, and visual hierarchy match the source screen except for documented product or accessibility adaptations.

**Acceptance Scenarios**:

1. **Given** the OpenDesign source package is available, **When** the team reviews the redesign scope, **Then** dashboard, transactions, savings goals, settings, login, and signup each have a named matching source HTML file.
2. **Given** a live redesigned route and its matching source screen, **When** they are compared side by side, **Then** the delivered route preserves the source screen's rendered layout, button vocabulary, card vocabulary, form vocabulary, navigation model, and visual rhythm.
3. **Given** old WhySpend TSX-rendered screen code exists, **When** a route is rebuilt, **Then** the old screen implementation is deleted or replaced with a new TSX route based on the matching OpenDesign source screen.

---

### User Story 2 - Bind Source Layouts To Real Household Data (Priority: P2)

As an authenticated household member, I need the rebuilt screens to show my real household records while keeping the source-screen layouts intact so monthly finance work remains trustworthy and familiar.

**Why this priority**: Static OpenDesign examples are only useful when they become real product surfaces for household records, budgets, categories, and savings goals.

**Independent Test**: Can be tested by loading realistic household data and confirming that source-screen sections are populated with real names, categories, months, Rp amounts, records, budgets, and goal progress without changing the intended layout.

**Acceptance Scenarios**:

1. **Given** a household has records for a selected month, **When** the member opens Dashboard, **Then** source sections for overview, spending by category, budget health, and cash-flow trend show real income, expenses, savings, budgets, and Rp values.
2. **Given** a household has income, expense, and savings records, **When** the member opens Transactions, **Then** the source ledger, filters, and entry form use real records and configured category or goal options.
3. **Given** a household has configured categories, budgets, and goals, **When** the member opens Settings and Savings Goals, **Then** the source management sections display real lists, progress, actions, and status feedback.
4. **Given** a new or returning user opens signup or login, **When** they submit the forms, **Then** the source auth layouts support the required Display Name, Email, and Password or Email and Password flows with live validation and feedback.

---

### User Story 3 - Preserve Product Quality After The Direct Port (Priority: P3)

As a household member using the site repeatedly on desktop and mobile, I need the direct port to remain accessible, responsive, and resilient across real states so it does not break when data, viewport, or interaction state changes.

**Why this priority**: Accessibility, routing, live state, and responsive behavior are required after source parity is established, but they must not become excuses to reinterpret the approved design.

**Independent Test**: Can be tested by exercising every rebuilt route with keyboard navigation, mobile hamburger navigation, loading, empty, error, success, long text, high Rp amounts, dialogs, menus, and reduced-motion preferences.

**Acceptance Scenarios**:

1. **Given** a mobile viewport, **When** the member opens and closes the hamburger menu from any product route, **Then** the menu exposes the same route set as the source shell without clipped controls, lost focus, or hidden content.
2. **Given** any form, dialog, menu, table, chart, or progress module is active, **When** the member uses keyboard navigation, **Then** focus order follows visible structure and controls have clear names and visible focus states.
3. **Given** long category names, long notes, high Rp amounts, or many records, **When** the rebuilt route renders, **Then** text, charts, menus, and actions remain readable without overlap or broken layout.
4. **Given** a route is loading, empty, invalid, successful, or unable to load data, **When** the member views the screen, **Then** the state appears within the source layout vocabulary with clear next actions.

### Edge Cases

- A source screen contains sample names, categories, dates, or amounts that differ from the household's actual data; the delivered route must keep the source structure while replacing samples with live product values.
- A source screen lacks a production state such as loading, empty, error, or overflow; the delivered state must extend the same visual vocabulary rather than borrowing an old WhySpend layout.
- A route has more categories, records, budgets, or savings goals than the source sample; the rebuilt layout must scroll, wrap, paginate, collapse, or summarize deliberately without clipping controls.
- A source interaction uses a static preview behavior; production behavior must preserve the visual placement and intent while connecting to real validation, persistence, status, and navigation outcomes.
- A source visual communicates meaning through color, chart shape, or progress fill; production screens must add or preserve explicit labels, values, legends, or accessible names so color is not the only signal.
- A previous implementation component partially matches a source screen; it may be reused only when the delivered route still maps visibly to the matching source HTML and CSS behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The rebuild MUST use `/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0` as the authoritative OpenDesign source package.
- **FR-002**: Each product or auth route MUST start from its matching current source file: `screens/dashboard.html`, `screens/transactions.html`, `screens/savings-goals.html`, `screens/settings.html`, `screens/login.html`, and `screens/signup.html`.
- **FR-003**: Shared visual behavior MUST be traced to the source package's shared CSS assets, especially `assets/app.css`, before project-specific adaptations are made.
- **FR-004**: The delivered Dashboard route MUST preserve the source dashboard sections for selected-month household overview, monthly spending by category, budget health, and cash-flow trend while using live household summary data.
- **FR-005**: The delivered Transactions route MUST preserve the source transaction shell, month/search/type controls, ledger structure, and add-entry dialog while using live Expense, Savings, and Income records.
- **FR-006**: The delivered Savings Goals route MUST preserve the source progress summary, goal cards, goal action menus, add/edit dialogs, and delete confirmation while using live savings goal data.
- **FR-007**: The delivered Settings route MUST preserve the source sections for expense categories and budgets, income categories, savings goal categories, and household access while using live household configuration data.
- **FR-008**: The delivered Signup route MUST preserve the source auth layout and require Display Name, Email, and Password with clear validation and account-creation feedback.
- **FR-009**: The delivered Login route MUST preserve the source auth layout and require Email and Password with clear validation, password visibility control, and sign-in feedback.
- **FR-010**: Source sample text, sample records, and sample amounts MUST be replaced with live household, user, category, transaction, budget, summary, and savings goal values wherever the product has equivalent data.
- **FR-011**: The rebuild MUST preserve the WhySpend product meanings for authenticated user, household membership, household/shared scope, category or goal, month/date, amount, type, notes, budget, actual, difference, and goal progress.
- **FR-012**: Existing TSX-rendered screen implementations for the covered routes MUST be deleted or replaced with new TSX route screens rebuilt from the matching OpenDesign source screens.
- **FR-013**: Accessibility, routing, live data state, persistence feedback, and responsive behavior MUST be adapted only after the source-screen visual structure has been established for each route.
- **FR-014**: Every route MUST support default, loading, empty, error, success, disabled, focus, hover, active, dialog/menu open, long-text, high-amount, and mobile overflow states.
- **FR-015**: The rebuild MUST include a route-by-route acceptance record that identifies the source file used, live data substitutions made, old TSX screen implementation removed or replaced, and any intentional rendered differences from the source.

### User Experience & Design Requirements *(mandatory for UI features)*

- **UX-001**: Primary user action is repeated household finance work: review the selected month, enter records, manage categories and budgets, and track savings goals without returning to Money Manager plus spreadsheet handoff.
- **UX-002**: UI MUST follow the Serene Union direction from PRODUCT.md, DESIGN.md, `brand-spec.md`, and `assets/app.css`: off-white surfaces, sage primary actions, soft blue secondary accents, warm sand tonal surfaces, Inter typography, tabular Rp amounts, pill-shaped primary controls, 24px cards and panels, ambient shadows, and an 8px spacing rhythm.
- **UX-003**: UI MUST keep a consistent product shell with desktop left rail and mobile hamburger drawer, exposing Dashboard, Transactions, Savings Goals, Settings, and Support where the source shell includes those destinations.
- **UX-004**: UI MUST show income, expenses, savings, budgets, actuals, differences, and goal progress with explicit text, values, icons, legends, or accessible names, not color alone.
- **UX-005**: UI MUST avoid the project anti-references from PRODUCT.md and the constitution: generic banking-dashboard styling, gamified guilt patterns, decorative finance charts, spreadsheet mimicry as the primary experience, vague card grids, weak contrast, text overflow, and inconsistent component vocabulary.
- **UX-006**: UI MUST meet WCAG AA contrast, keyboard navigation, visible focus, responsive desktop/mobile layout, PWA behavior, and reduced-motion expectations.
- **UX-007**: UI copy MUST stay calm, direct, and task-specific; it must not introduce shame, alarmist language, or decorative coaching unrelated to household decisions.
- **UX-008**: UI MUST treat the OpenDesign source as the visual contract; product and accessibility fixes may refine TSX structure, semantics, states, and responsive behavior, but must not introduce a new aesthetic direction.

### Key Entities *(include if feature involves data)*

- **OpenDesign Source Package**: The external design source containing route HTML, shared CSS, brand guidance, screenshots, and generated variants for the redesign.
- **Source Screen**: A current file under `screens/` that provides the route-specific structure, copy posture, controls, and visual hierarchy to port.
- **Rebuilt Route**: A live WhySpend route that maps to one source screen while using live product data and production interaction states.
- **User**: Authenticated household member who owns or reviews income, expense, savings, category, and goal records.
- **Household**: Shared finance workspace containing members, shared records, categories, budgets, savings goals, and monthly summaries.
- **Financial Record**: Income, expense, or savings entry with owner, household scope, category or goal, month/date, amount, type, and notes.
- **Category**: User-managed income or expense label, with budget behavior for expense categories.
- **Savings Goal**: User-managed target that collects savings transactions and progress separately from expenses.
- **Dashboard Summary**: Selected-month and historical review data derived from household records, categories, budgets, and savings goals.
- **Acceptance Record**: Route-level evidence that the implementation started from the matching source screen, replaced static samples with live product values, removed or replaced the prior TSX-rendered screen, and documented intentional rendered differences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of current source screens in `screens/` are mapped to a live route or explicitly documented as intentionally out of scope before planning is complete.
- **SC-002**: For each rebuilt route, acceptance review identifies the matching source file, the live data substitutions, the prior TSX-rendered screen removed or replaced, and every intentional rendered difference from the source.
- **SC-003**: A household member can reach Dashboard, Transactions, Savings Goals, and Settings from both desktop navigation and mobile hamburger navigation in under 10 seconds without dead ends.
- **SC-004**: A member can complete the representative monthly workflow (review Dashboard, add an expense, update a category budget, review a savings goal) in under 5 minutes during acceptance testing.
- **SC-005**: Accessibility review finds zero WCAG AA contrast failures for body text, form labels, placeholders, chart labels, buttons, and status text on rebuilt routes.
- **SC-006**: Responsive review at mobile, tablet, and desktop widths finds zero clipped primary controls, overlapping text, unreadable charts, trapped menus, or inaccessible navigation items.
- **SC-007**: At least 90% of first-pass usability testers can identify income, expenses, savings, budgets, actuals, differences, and savings goal progress without relying on color alone.

## Assumptions

- The current `screens/` files and `assets/app.css` are the primary OpenDesign references when older generated variants in the same package conflict.
- The rebuild is a product-application redesign, not a marketing site or static prototype.
- Existing WhySpend product scope, authentication expectations, household data meanings, and Settings ownership remain in force.
- The OpenDesign sample data is illustrative; production routes will use authenticated household data and configured categories, budgets, and goals.
- Support is a navigation destination in the source shell; the product behavior for Support can remain a placeholder unless a later feature defines support workflows.
- Route-level acceptance evidence will be created during planning or implementation, not embedded inside this specification.
