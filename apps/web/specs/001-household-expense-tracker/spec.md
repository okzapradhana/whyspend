# Feature Specification: Household Expense Tracker

**Feature Branch**: `001-household-expense-tracker`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Build a website to help the owner and spouse track expenses, income, and savings across months. The website should support account creation, selected-month transaction lists, add/update/delete flows for expense, income, and savings transactions, category and savings goal management, monthly dashboard summaries, budget comparisons, and desktop/mobile navigation through a toggleable hamburger menu."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Account And Enter The Household (Priority: P1)

As a new user, I want to create an account with my display name, email, and password, so WhySpend can show real household identities instead of spreadsheet placeholders.

**Why this priority**: All household finance data is private and tied to real household members, so authenticated access must exist before any transaction or dashboard workflow.

**Independent Test**: A user can create an account with display name, email, and password, then reach the household workspace using their authenticated identity.

**Acceptance Scenarios**:

1. **Given** a new user opens registration, **When** they provide display name, email, and password, **Then** the account is created and the product uses the display name in household-facing UI.
2. **Given** an existing user signs in, **When** authentication succeeds, **Then** they can access the household workspace without re-entering their password for normal API requests.
3. **Given** an unauthenticated visitor attempts to open household finance data, **When** they are not signed in, **Then** they are asked to sign in or create an account before seeing private data.

---

### User Story 2 - Record And Review Monthly Transactions (Priority: P1)

As a household member, I want to add, update, delete, and review expense, savings, and income transactions for a selected month, so the monthly totals are built from actual records instead of manual spreadsheet entry.

**Why this priority**: Transaction entry and monthly transaction review replace the Money Manager to spreadsheet handoff and make every summary, chart, and total trustworthy.

**Independent Test**: A signed-in household member can add, edit, delete, and review transactions for a selected month, and the transaction list reflects those changes without depending on charts or category-management screens.

**Acceptance Scenarios**:

1. **Given** a signed-in household member is viewing the current month, **When** they add an expense transaction with date defaulted to today, amount in Rp, category, and optional notes, **Then** the transaction appears in the selected month's transaction list with the correct values.
2. **Given** the member wants to record non-expense savings, **When** they add a savings transaction with date defaulted to today, amount in Rp, goal, and optional notes, **Then** the record is grouped separately from expenses in lists and summaries.
3. **Given** the member wants to record income for a month, **When** they add an income transaction with date defaulted to today, amount in Rp, category, and optional notes, **Then** the record contributes to selected-month income totals.
4. **Given** a transaction was entered with the wrong amount, date, category, goal, or note, **When** the member edits the transaction, **Then** the list and monthly totals use the corrected values.
5. **Given** a duplicate or mistaken transaction exists, **When** the member deletes it, **Then** it is removed from the transaction list and no longer contributes to monthly totals.
6. **Given** the member changes the selected month, **When** the transaction list updates, **Then** it only shows records for that month.

---

### User Story 3 - Manage Categories And Savings Goals (Priority: P2)

As a household member, I want to add, update, or delete my household's own categories, so our real spending patterns are not limited to a preset template.

**Why this priority**: Category and savings goal management keeps monthly totals useful as the household's finances change.

**Independent Test**: A signed-in household member can create income categories, expense categories, and savings goal categories from scratch, use them on matching transactions, rename them, and prevent accidental deletion when they are still in use.

**Acceptance Scenarios**:

1. **Given** the household starts using WhySpend, **When** a member opens Settings, **Then** they can create income categories, expense categories, and savings goals before recording transactions.
2. **Given** the household has a new spending pattern, **When** a member creates a custom category or savings goal, **Then** it is available for matching transactions and summaries.
3. **Given** a category or goal is no longer needed and has no linked records, **When** a member deletes it, **Then** it is removed from transaction choices.
4. **Given** a category or goal has linked transactions, **When** a member tries to delete it, **Then** the website prevents data loss and explains how to reassign or archive it.

---

### User Story 4 - Review Monthly Dashboard Summaries (Priority: P3)

As a household member, I want to view monthly income, expenses, savings, and spending by category in a simple dashboard with charts, so the owner and spouse can understand where money went without calculating totals manually.

**Why this priority**: Summaries and charts are the main replacement for manually reading Money Manager totals and updating the spreadsheet.

**Independent Test**: After transactions exist for at least one month, a member can view monthly totals, category totals, owner/shared breakdowns, and charts that match the underlying records.

**Acceptance Scenarios**:

1. **Given** a month has transaction data, **When** a member opens the dashboard, **Then** they see total income, total expenses, total savings, and remaining difference for that month.
2. **Given** expense transactions exist across multiple categories, **When** the member views the dashboard, **Then** the category spending chart labels and totals match the category summary.
3. **Given** a member changes the selected month, **When** the summary updates, **Then** the totals and charts only include records from that month.
4. **Given** there are personal and shared records, **When** the member reviews the summary, **Then** the website clearly separates household/shared totals from each member's own records.
5. **Given** a category appears on the expense summary, **When** the member selects that category, **Then** they can view the list of transactions that contribute to that category total.

---

### Edge Cases

- A new household has no transactions yet; the website must show an empty state that guides users to add the first transaction.
- A new user submits registration without display name, email, or password; the website must reject the submission with clear field-level messages.
- A month has income but no expenses, expenses but no income, or savings but no income; summaries must still show clear totals without misleading charts.
- A transaction is entered with a negative, zero, missing, or invalid amount; the website must reject it with a clear message.
- A category name is duplicated within the same type and household; the website must prevent ambiguous category choices.
- A long category name or note is entered; the interface must preserve readability without text overflow.
- A user tries to delete or rename a category already used by transactions; the website must protect historical records.
- Two household members update data around the same time; saved summaries must reflect the latest persisted records without double counting.
- A member views a month with many transactions; the list and summary must remain scannable and usable.
- A category summary contains many transactions; the category detail list must remain usable on desktop and mobile.
- A user opens the website from a mobile home screen; the PWA experience must remain clear and usable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create an account with Display Name, Email, and Password.
- **FR-002**: Users MUST be able to belong to a shared household workspace with another member.
- **FR-003**: Users MUST be able to sign in before viewing or changing household finance data.
- **FR-004**: Users MUST be able to view their household transaction list for a selected month.
- **FR-005**: The website MUST persist financial records so they remain available across sessions and devices.
- **FR-006**: Users MUST be able to add, update, and delete expense transactions with Date defaulting to today, Amount in Rp, Category, and optional Notes.
- **FR-007**: Users MUST be able to add, update, and delete savings transactions with Date defaulting to today, Amount in Rp, Goal, and optional Notes.
- **FR-008**: Users MUST be able to add, update, and delete income transactions with Date defaulting to today, Amount in Rp, Category, and optional Notes.
- **FR-009**: Users MUST be able to add, update, and delete income categories, expense categories, and savings goal categories from scratch without relying on automatic spreadsheet import or setup.
- **FR-010**: Expense categories MUST be configurable through Settings.
- **FR-011**: Categories and savings goals MUST have a type that distinguishes income, expense, or savings.
- **FR-012**: Categories and savings goals MUST support household/shared use and member-specific use where relevant.
- **FR-013**: The website MUST calculate monthly totals for income, expenses, savings, and remaining difference from transaction records.
- **FR-014**: The website MUST show category-level totals for the selected month.
- **FR-015**: The website MUST show a clear dashboard chart for selected-month spending by category.
- **FR-016**: Users MUST be able to change the selected month and see transaction lists and summaries update to that month only.
- **FR-017**: The website MUST distinguish authenticated household members by their real account identity rather than Person A or Person B placeholder labels.
- **FR-018**: The website MUST prevent deletion of categories or goals that would make existing transactions ambiguous unless the user first reassigns or archives the affected category or goal.
- **FR-019**: The website MUST validate required transaction fields and show user-friendly errors for invalid input.
- **FR-020**: The website MUST keep derived totals traceable to the transactions, categories, and goals that produced them.
- **FR-021**: Users MUST be able to open a category from the expense summary and view the transactions bound to that category for the selected month.
- **FR-022**: API access MUST use JWT authentication and authorization so requests are authorized without sending raw passwords after login.
- **FR-023**: The website MUST support PWA behavior for mobile home-screen use.
- **FR-024**: Pages and menus MUST be reachable through a toggleable hamburger menu on desktop and mobile.

### User Experience & Design Requirements *(mandatory for UI features)*

- **UX-001**: Primary user action is entering a transaction quickly and confidently from the main signed-in experience.
- **UX-002**: UI MUST support these states: default, loading, empty, error, success, and realistic overflow/long-text cases.
- **UX-003**: UI MUST show household, authenticated member, and shared-expense meaning clearly when the feature touches financial records or totals.
- **UX-004**: UI MUST distinguish income, expenses, savings, budget, actuals, and differences with explicit labels, not color alone.
- **UX-005**: UI MUST avoid the project anti-references from PRODUCT.md and the constitution, including generic banking-dashboard styling, gamified guilt patterns, and spreadsheet mimicry as the primary experience.
- **UX-006**: UI MUST meet WCAG AA contrast, keyboard navigation, visible focus, responsive desktop/mobile layout, PWA behavior, and reduced-motion expectations.
- **UX-007**: UI MUST favor a calm, simple, and polished product interface over dense spreadsheet-like editing.
- **UX-008**: Charts MUST clarify monthly totals and category breakdowns; charts MUST NOT be decorative or replace readable numeric summaries.
- **UX-009**: Desktop and mobile views MUST be clear, responsive, and free of broken layout, clipped controls, and text overflow.
- **UX-010**: Transaction forms MUST remain visually consistent across expense, savings, and income records, with the savings form using Goal where expense and income forms use Category.
- **UX-011**: Settings MUST be the clear place to manage category lists and expense category budget setup.
- **UX-012**: Hamburger navigation MUST be toggleable, keyboard accessible, and understandable without relying on screen width-specific hidden navigation.

### Key Entities *(include if feature involves data)*

- **User**: Authenticated household member who owns income, expense, savings, and category records.
- **Household**: Shared finance workspace containing members, shared records, categories, and monthly summaries.
- **Category**: User-created label for income or expense records, with type and ownership/reporting scope.
- **Savings Goal**: User-created savings destination used to classify savings records.
- **Financial Record**: Income, expense, or savings entry with owner, household scope, category, date/month, amount, and notes.
- **Monthly Summary**: Derived view of totals and chart data for a selected month, grouped by type, category, owner, and household/shared scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A signed-in user can add a complete transaction in under 30 seconds during usability testing.
- **SC-002**: A new user can create an account and reach the household workspace using display name, email, and password without external instructions.
- **SC-003**: Monthly income, expense, savings, and category totals match the underlying transaction records in 100% of test scenarios.
- **SC-004**: A user can switch between months and identify total expenses, total income, total savings, and the largest expense category within 10 seconds.
- **SC-005**: The first-run empty state enables a new household to create its first transaction and view it in the monthly summary without external instructions.
- **SC-006**: The primary transaction, category, and summary views remain usable at mobile and desktop widths without text overflow, broken layout, or inaccessible controls.
- **SC-007**: A user can open a category from the expense summary and see the contributing transactions within 5 seconds.
- **SC-008**: The website can be installed or launched as a PWA and retains clear navigation and layout on mobile.
- **SC-009**: A household member can open the hamburger menu and reach dashboard, transactions, and Settings on both desktop and mobile widths.

## Assumptions

- The first release supports one shared household workspace for the owner and spouse.
- Simple login means a standard JWT-backed web account flow suitable for private household use; advanced enterprise identity is out of scope.
- Spreadsheet categories are reference examples only; the website starts with user-created categories rather than automatic category setup.
- Financial data must be saved persistently and securely according to the project constitution.
- Expense budget setup, spending-vs-budget comparisons, and historical income-vs-expense trends are specified in `specs/002-budget-insights/spec.md`.
- Importing historical data from Money Manager or Google Sheets is out of scope for this feature unless added by a later spec.
