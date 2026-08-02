# Data Model: OpenDesign Website Redesign

This feature does not introduce new persistent product data. The model below defines the design and UI-state entities required to directly port the OpenDesign HTML/CSS reference into the current WhySpend app while preserving existing financial data meanings.

## OpenDesign Source Package

**Purpose**: External design reference used for planning, implementation, and acceptance review.

**Fields**:
- `rootPath`: `/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0`
- `primaryHtmlFiles`: `screens/dashboard.html`, `screens/transactions.html`, `screens/settings.html`, `screens/savings-goals.html`, `screens/login.html`, `screens/signup.html`, `index.html`
- `primaryStyleFiles`: `assets/app.css`, `brand-spec.md`, `DESIGN.md`
- `supportingAssets`: generated screenshots, reference images, older generated HTML variants
- `sourcePriority`: current `screens/` files and shared CSS first, older generated variants second

**Validation Rules**:
- Every implemented screen must trace to at least one source reference file.
- Any intentional difference from the source must be documented with product, accessibility, or data-integrity rationale.
- Source HTML structure and source CSS selector vocabulary are binding implementation inputs, not loose inspiration.

## Source Screen Blueprint

**Purpose**: Per-screen conversion record that maps OpenDesign HTML/CSS directly to React TSX and project styling.

**Fields**:
- `sourceHtmlFile`: one of `screens/dashboard.html`, `screens/transactions.html`, `screens/settings.html`, `screens/savings-goals.html`, `screens/login.html`, `screens/signup.html`, or `index.html`
- `sourceCssFile`: `assets/app.css`
- `sourceClassVocabulary`: class names used by the source screen, including shell, navigation, card, metric, button, field, table, chart, dialog, progress, and responsive classes
- `sourceHierarchy`: top-level wrappers and layout order from the HTML, such as `drawer-backdrop`, `mobile-bar`, `app-shell`, `sidebar`, `screen`, `content`, `page-head`, grids, cards, and actions
- `tsxTarget`: React route/component files that render the ported structure
- `dynamicBindings`: places where OpenDesign static sample text, dates, amounts, categories, names, and links are replaced with live WhySpend data or state
- `requiredDeviations`: documented differences required by PRODUCT.md, accessibility, routing, data integrity, or React implementation

**Relationships**:
- A source screen blueprint maps to one route surface.
- A source screen blueprint uses many design token mappings and shared component contracts.
- A source screen blueprint may create or reshape shared React components when multiple OpenDesign screens use the same HTML pattern.

**Validation Rules**:
- The TSX target must preserve the source hierarchy unless a deviation is recorded.
- Source class names or one-to-one React class aliases should be retained where practical to make parity review inspectable.
- Existing WhySpend components may be reused only if they render the source hierarchy and source visual behavior.
- Dynamic data replacement must not move controls, cards, tables, charts, or navigation away from their OpenDesign layout positions.

## Route Surface

**Purpose**: User-facing route or screen in the React app that maps to an OpenDesign reference and its source screen blueprint.

**Fields**:
- `routeName`: dashboard, transactions, savings goals, settings, auth login, auth signup, support or reference launcher
- `currentPath`: current or planned app route path
- `sourceReference`: OpenDesign HTML file used as the primary visual reference
- `primaryAction`: main user task on the route
- `requiredStates`: default, loading, empty, error, success, hover, focus, active, disabled, overflow
- `responsiveModes`: desktop rail, tablet collapse, mobile hamburger drawer
- `dataSources`: existing API client/domain data used by the route
- `sourceBlueprint`: source HTML/CSS mapping record that controls layout and component vocabulary

**Relationships**:
- A route surface uses many design tokens and shared components.
- A route surface may render financial records, dashboard summaries, categories, budgets, savings goals, users, and households.

**Validation Rules**:
- Each route must support keyboard navigation and visible focus.
- Each route must render without clipped controls or overlapping text at mobile, tablet, and desktop widths.
- Each route must preserve authenticated household context and avoid sample-data-only behavior.
- Each route must be reviewed against its source screen blueprint before being considered visually complete.

## Design Token Mapping

**Purpose**: Conversion layer from OpenDesign CSS and Serene Union documentation into project-owned styling primitives while preserving the source CSS behavior.

**Fields**:
- `colorTokens`: background, surface, container, primary sage, soft blue, warm sand, slate text, error, warning, success
- `typographyTokens`: Inter family, body scale, title scale, tabular number styling
- `spacingTokens`: 8px rhythm, mobile margins, desktop content width, card padding
- `shapeTokens`: 8px controls, 16px intermediate surfaces, 24px cards and navigation panels, full-pill buttons
- `elevationTokens`: base canvas and floating interaction layer with ambient shadows
- `focusTokens`: visible Soft Blue focus ring and keyboard focus states
- `motionTokens`: 150-250 ms state transitions and reduced-motion fallbacks
- `selectorMappings`: source selectors that are retained directly or mapped to React/Tailwind-compatible aliases
- `responsiveRules`: OpenDesign desktop rail, tablet, and mobile hamburger rules ported into the app

**Validation Rules**:
- Token values must not create WCAG AA contrast failures.
- Tokens must be shared through app-level styling and reusable components instead of repeated page-only constants.
- Color cannot be the only indicator for status, type, category, chart, or goal meaning.
- CSS changes must be reviewed against `assets/app.css`; accessibility-compatible adjustments must document the source value and replacement.

## Shared Component Contract

**Purpose**: Product UI primitives used to port the source reference into reusable React components.

**Fields**:
- `componentName`: app shell, mobile menu, button, icon button, card, metric, table/list, input, select, dialog, menu, progress, chart legend, status chip, avatar stack
- `sourceSelectors`: OpenDesign selectors or structure used as reference
- `states`: default, hover, focus, active, disabled, loading, error, success
- `accessibility`: labels, roles, focus behavior, keyboard behavior, reduced-motion behavior
- `dataBehavior`: live data field or UI state represented by the component
- `portingStatus`: direct source port, React-compatible alias, accessibility-adjusted, or intentionally replaced

**Validation Rules**:
- Same interaction must use the same component vocabulary across screens.
- Overlays and menus must not be clipped by scroll or overflow containers.
- Buttons and links must have action-specific labels.
- A shared component must not preserve a prior WhySpend layout when the OpenDesign source pattern differs.
- Component APIs should be shaped around source OpenDesign patterns first, then around live data needs.

## Existing Product Entities Preserved

### User
- Fields preserved: display name, email, authenticated identity, household membership.
- Signup fields remain Display Name, Email, and Password.
- Password is accepted only for registration/login.

### Household
- Fields preserved: household identity, members, shared workspace context.
- Must be visible enough for users to understand whose data is being reviewed.

### Category
- Fields preserved: name, type, ownership/reporting scope, budget relevance, active/archive behavior.
- Expense categories and budgets remain Settings-owned.

### Savings Goal
- Fields preserved: goal name, target amount, contribution progress, target date when available, ownership/scope.
- Savings remain separate from expenses.

### Financial Record
- Fields preserved: type, date/month, amount in Rp, category or goal, owner, household/shared scope, notes.
- Transaction form fields remain Date, Amount in Rp, Category or Goal, and optional Notes.

### Dashboard Summary
- Fields preserved: selected month, income total, expense total, savings total, category spending, budget actuals/differences, historical trend values.
- Charts must keep labels, legends, accessible names, and traceability to source records.

## State Transitions

### Mobile Navigation
1. Closed hamburger state.
2. Open drawer state with focus moved into menu.
3. Route selected or close requested.
4. Drawer closes and focus returns to the invoking control.

### Transaction Form
1. Closed state from transaction list.
2. Add/edit form opens with selected type.
3. Type changes between Expense, Savings, and Income.
4. Fields adapt between Category and Goal while preserving Date, Amount, and Notes.
5. Submit shows loading, then success or error.
6. On success, form closes or resets and list/dashboard data updates.

### Savings Goal Dialog/Menu
1. Goal menu opens for a specific goal.
2. Edit or delete selected.
3. Edit form or delete confirmation opens.
4. Save/delete shows loading, then success or error.
5. Goal list and progress update.

### Dashboard Month Review
1. Default selected month loads.
2. Member changes month.
3. Loading skeletons preserve layout.
4. Metrics, charts, budget health, and trends update together.
5. Empty or error states provide next action without losing navigation.
