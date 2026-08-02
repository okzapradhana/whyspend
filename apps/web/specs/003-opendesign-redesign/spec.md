# Feature Specification: OpenDesign Website Redesign

**Feature Branch**: `003-opendesign-redesign`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "I want to majorly revamp our website design by following all HTML (respect CSS files) too in /Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0. These designs are coming from Google Stitch then passed to OpenDesign to transform the PNG into HTML and CSS files, and finally passing to speckit and impeccable."

**Clarification 2026-06-07**: The OpenDesign HTML and CSS files are the design to port directly into the existing React/TSX/Tailwind stack. The implementation must change layout, buttons, cards, forms, navigation, and screen composition to match the source HTML/CSS instead of adjusting the prior WhySpend UI toward the references.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate The Redesigned Product Shell (Priority: P1)

As an authenticated household member, I need the redesigned website shell to match the OpenDesign reference across desktop and mobile so the app feels cohesive while I move between dashboard, transactions, savings goals, and Settings.

**Why this priority**: The redesign fails if the shared navigation, visual system, and core page structure are inconsistent. This story creates the foundation for every product workflow.

**Independent Test**: Can be tested by reviewing desktop and mobile views of the product shell against the OpenDesign reference package and confirming all primary destinations are reachable from the hamburger/navigation model.

**Acceptance Scenarios**:

1. **Given** an authenticated household member on a desktop viewport, **When** they open the app, **Then** the persistent product shell uses the Serene Union visual direction and exposes Dashboard, Transactions, Savings Goals, Settings, and Support without broken layout or missing active-state feedback.
2. **Given** an authenticated household member on a mobile viewport, **When** they open and close the hamburger menu, **Then** the menu presents the same primary destinations, preserves the current page state, and never clips menu items or page content.
3. **Given** any redesigned product page, **When** the member uses keyboard navigation, **Then** focus order follows the visible layout and all controls show clear focus states.

---

### User Story 2 - Complete Core Household Finance Tasks In The New Design (Priority: P2)

As a household member, I need the redesigned screens to preserve the existing finance workflows so I can review the monthly picture, manage transactions, update categories and budgets, and track savings goals without losing task clarity.

**Why this priority**: A visual revamp must not break the product purpose: replacing Money Manager plus spreadsheet handoff with one household website.

**Independent Test**: Can be tested by completing representative household tasks on the redesigned screens without relying on any old page layout.

**Acceptance Scenarios**:

1. **Given** a selected month with household records, **When** the member opens Dashboard, **Then** they can see income, expenses, savings, category spending, budget health, and cash-flow trend information with explicit labels and Rp amounts.
2. **Given** configured categories and savings goals, **When** the member opens Transactions, **Then** they can search, filter by type, change month, review rows, and open a single entry form for Expense, Savings, and Income.
3. **Given** the member opens Settings, **When** they manage household configuration, **Then** expense categories and budgets, income categories, savings goal categories, and household access remain easy to scan and update.
4. **Given** the member opens Savings Goals, **When** they add, edit, or delete a goal, **Then** the form fields and confirmation flow clearly separate savings from expenses.

---

### User Story 3 - Sign Up And Sign In Through The Redesigned Auth Flow (Priority: P3)

As a new or returning household member, I need account screens that match the redesigned visual system and preserve required identity fields so the app feels trustworthy from first use.

**Why this priority**: Authentication is a smaller surface than the main app shell, but it is the first experience for users and must remain aligned with product data rules.

**Independent Test**: Can be tested by opening sign-up and login screens, validating required fields, toggling password visibility, and confirming clear success/error feedback.

**Acceptance Scenarios**:

1. **Given** a new member on the sign-up screen, **When** they create an account, **Then** the screen asks for Display Name, Email, and Password and explains password requirements plainly.
2. **Given** a returning member on the login screen, **When** they enter Email and Password, **Then** the screen provides clear validation, password visibility control, and a route back to account creation.

---

### User Story 4 - Verify Design Quality Across Real States (Priority: P4)

As the household using WhySpend repeatedly, I need the redesigned interface to remain polished across loading, empty, error, success, and overflow states so it does not collapse when real data varies.

**Why this priority**: The OpenDesign references provide the target look, but production readiness depends on state coverage, accessibility, and realistic household data.

**Independent Test**: Can be tested by reviewing each redesigned screen with normal data, no data, loading, validation errors, long category names, high currency values, mobile width, desktop width, and reduced-motion preferences.

**Acceptance Scenarios**:

1. **Given** any page with financial data, **When** there is no data for the selected month, **Then** the empty state explains the next useful action without decorative filler.
2. **Given** long category names, household member names, notes, or large Rp amounts, **When** the redesigned page renders, **Then** text wraps or truncates deliberately without overlapping or clipping controls.
3. **Given** reduced-motion preferences are enabled, **When** the member navigates or opens overlays, **Then** motion is minimized without losing state clarity.

### Edge Cases

- OpenDesign reference files include both current screen exports and earlier generated variants; the current `screens/` files and shared design CSS are the primary source when variants conflict.
- A referenced OpenDesign screen contains sample names, categories, or amounts that differ from current product data; the redesign must preserve the visual and interaction intent while using real authenticated household data.
- A page has more categories, goals, or transaction rows than the design sample; tables, cards, charts, menus, and forms must support realistic overflow without breaking the visual system.
- A chart or progress module cannot rely on color alone; labels, legends, values, and accessible names must carry the same meaning.
- A mobile user opens the hamburger menu while a form or dialog is active; the interface must prevent confusing focus, hidden controls, or accidental data loss.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The redesign MUST use `/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0` as the required design source package for planning and acceptance review.
- **FR-002**: The redesign MUST account for all visible screens in the OpenDesign package: launcher/prototype index, sign up, login, dashboard, transactions, savings goals, and Settings.
- **FR-003**: The redesign MUST preserve the current WhySpend product scope: household account access, monthly dashboard review, transaction entry and review, category and budget configuration, income tracking, expense tracking, savings tracking, and savings goal management.
- **FR-004**: The navigation model MUST expose Dashboard, Transactions, Savings Goals, Settings, and Support through a desktop product shell and a toggleable mobile hamburger menu.
- **FR-005**: The dashboard MUST present the selected month's income, expenses, savings, spending by category, budget health, and historical cash-flow trend with explicit labels, legends, and Rp-formatted amounts.
- **FR-006**: The transaction experience MUST support month selection, search, type filtering for Expense, Income, and Savings, row review, and a reusable entry form with Date, Amount in Rp, Category or Goal, and optional Notes.
- **FR-007**: Settings MUST remain the owner of expense categories, expense category budgets, income categories, savings goal categories, and household access management.
- **FR-008**: Savings Goals MUST show overall progress, individual goal progress, add/edit forms, and delete confirmation while keeping savings separate from expense totals.
- **FR-009**: Sign-up MUST ask for Display Name, Email, and Password; login MUST ask for Email and Password; both flows MUST include validation, password visibility controls, and clear status feedback.
- **FR-010**: The redesign MUST preserve owner, household/shared scope, category, month, amount, type, notes, budget, actual, difference, and savings goal meanings wherever those values appear.
- **FR-011**: The redesign MUST provide default, hover, focus, active, disabled, loading, empty, error, success, and realistic overflow states for interactive surfaces and data modules.
- **FR-012**: The redesign MUST include an acceptance review that compares each delivered screen against the OpenDesign source package and records any intentional differences with product rationale.

### User Experience & Design Requirements *(mandatory for UI features)*

- **UX-001**: Primary user action is repeated monthly household finance work: review the selected month, enter or edit records, manage categories and budgets, and track savings goals without switching tools.
- **UX-002**: UI MUST follow the Serene Union product direction from the OpenDesign package and `DESIGN.md`: off-white surfaces, sage primary actions, soft blue secondary accents, warm sand tonal surfaces, Inter typography, tabular Rp amounts, pill-shaped primary controls, 24px product cards, ambient shadows, and an 8px spacing rhythm.
- **UX-003**: UI MUST use the OpenDesign shared CSS and screen HTML as direct structural and visual source material, while adapting labels and data to the live WhySpend product model. Source layouts, selectors, button/card/form vocabulary, navigation, and responsive behavior should be ported into React TSX/Tailwind unless a documented product, accessibility, routing, PWA, or data-integrity rationale requires a deviation.
- **UX-004**: UI MUST show household, authenticated member, and shared-expense meaning clearly when the feature touches financial records or totals.
- **UX-005**: UI MUST distinguish income, expenses, savings, budget, actuals, differences, and goal progress with explicit text, values, icons, legends, or accessible names, not color alone.
- **UX-006**: UI MUST avoid the project anti-references from PRODUCT.md and the constitution, including generic banking-dashboard styling, gamified guilt patterns, decorative finance charts, spreadsheet mimicry as the primary experience, vague card grids, weak contrast, and inconsistent component vocabulary.
- **UX-007**: UI MUST meet WCAG AA contrast, keyboard navigation, visible focus, responsive desktop/mobile layout, PWA behavior, and reduced-motion expectations.
- **UX-008**: UI MUST avoid clipped controls, overlapping text, text overflow, broken charts, hidden table actions, and menus trapped inside scroll containers across desktop and mobile.
- **UX-009**: UI copy MUST stay calm, direct, and task-specific; it must not introduce shame, alarmist language, or decorative coaching unrelated to household decisions.

### Key Entities *(include if feature involves data)*

- **OpenDesign Source Package**: The external design reference containing screen HTML, shared CSS, images, and generated variants used to guide the redesign.
- **Redesigned Screen**: A WhySpend user-facing surface that must map to an OpenDesign reference screen and support real product data and states.
- **User**: Authenticated household member who owns income, expense, savings, category, and goal records.
- **Household**: Shared finance workspace containing members, shared records, categories, budgets, savings goals, and monthly summaries.
- **Category**: User-managed label for income or expense records, with type, ownership scope, budget relevance, and reporting behavior.
- **Savings Goal**: User-managed target that collects savings transactions separately from expenses.
- **Financial Record**: Income, expense, or savings entry with owner, household scope, category or goal, month/date, amount, and notes.
- **Dashboard Summary**: Selected-month and historical review data derived from financial records, categories, budgets, and goals.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the OpenDesign source package's current user-facing screens are represented in the redesign scope or documented as intentionally excluded before planning is complete.
- **SC-002**: A household member can reach Dashboard, Transactions, Savings Goals, and Settings from both desktop navigation and mobile hamburger navigation in under 10 seconds without dead ends.
- **SC-003**: A member can complete the representative monthly workflow (review dashboard, add an expense, update a category budget, review a savings goal) in under 5 minutes during acceptance testing.
- **SC-004**: Accessibility review finds zero WCAG AA contrast failures for body text, form labels, placeholders, chart labels, buttons, and status text on redesigned screens.
- **SC-005**: Responsive review at mobile, tablet, and desktop widths finds zero clipped primary controls, overlapping text, unreadable charts, or inaccessible navigation items.
- **SC-006**: Design acceptance review confirms every delivered screen either matches the OpenDesign visual direction or has a documented product reason for the difference.
- **SC-007**: At least 90% of first-pass usability testers can identify income, expenses, savings, budgets, actuals, differences, and savings goal progress without relying on color alone.

## Assumptions

- The OpenDesign `screens/` HTML files and `assets/app.css` are the primary current design references when they conflict with older generated HTML variants in the same package.
- The redesign is a product-application revamp, not a marketing landing-page project.
- Existing WhySpend finance workflows and data meanings remain in scope; the redesign should not remove product capabilities already defined in PRODUCT.md and prior specs.
- OpenDesign sample names, categories, and amounts are illustrative; production screens will use real authenticated household data and the product's configured categories.
- Static OpenDesign files are not served as runtime app pages, but their HTML structure and CSS behavior are required design inputs for the React TSX/Tailwind port.
