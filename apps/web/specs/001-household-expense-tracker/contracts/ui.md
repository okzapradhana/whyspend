# UI Contract: Household Expense Tracker

The frontend is a React TSX + Vite product UI in the current `whyspend` repository. It talks only to the sibling API and never imports database clients or migrations.

## Product Register

- Register: product
- Tone: calm, clear, practical
- Avoid: generic banking dashboard, gamified guilt, decorative charts, spreadsheet mimicry as primary experience
- Accessibility: WCAG AA, keyboard navigation, visible focus, reduced motion, non-color chart meaning
- Platform: responsive desktop/mobile PWA with no broken layout, clipped controls, or text overflow

## Primary Screens

### Hamburger Navigation

Primary action:
- Open or close the main menu and move between product areas.

States:
- Closed
- Open
- Current page highlighted
- Keyboard focus moving through menu items
- Mobile safe-area layout

Requirements:
- Dashboard, transactions, and Settings must be reachable from the toggleable hamburger menu on desktop and mobile.
- The menu button must have an accessible name and visible focus state.
- Navigation must not rely on hidden desktop-only sidebars or mobile-only links that leave pages unreachable.

### Sign In / Register

Primary action:
- Sign in or create account.

Required registration fields:
- Display Name
- Email
- Password

States:
- Default form
- Loading while submitting
- Field validation errors
- Authentication failure
- Success redirect to household setup or dashboard

Requirements:
- Must not expose whether an account exists through overly specific failure copy.
- Must use clear labels, not placeholder-only inputs.
- Must use JWT returned by the API for later API calls; raw password is only used for registration/login.

### Household Setup

Primary action:
- Create or enter the shared household workspace.

States:
- First household empty state
- Loading
- Error
- Success

Requirements:
- Must use real display names for members.
- Must not show Person A or Person B as product labels.

### Transaction Entry

Primary action:
- Add a transaction quickly.

Required visible fields:
- Expense: Date defaulting to today, Amount in Rp, Category, optional Notes
- Savings: Date defaulting to today, Amount in Rp, Goal, optional Notes
- Income: Date defaulting to today, Amount in Rp, Category, optional Notes

States:
- Default form
- Loading categories
- Submitting
- Success confirmation
- Validation errors
- Long category names and notes

Requirements:
- Transaction entry must be reachable from the main signed-in experience.
- The form must support keyboard use and visible focus.
- Income, expenses, and savings must be explicitly labeled.
- The form should stay visually consistent across transaction types, with savings using Goal where expense and income use Category.
- Authenticated owner and household scope may be inferred or handled outside the primary form when required for data integrity.

### Transaction List

Primary action:
- Review, edit, or delete transactions for a selected month.

States:
- Populated list
- Empty month
- Loading
- Error
- Many transactions
- Delete confirmation

Requirements:
- List rows must show amount, date, category, owner/member, scope, and type.
- Deleting a transaction must visibly update totals after success.

### Category Management

Primary action:
- Add or update categories.

States:
- Default category list
- Custom category creation
- Editing
- Category in-use deletion conflict
- Archived category
- Empty custom categories

Requirements:
- Users must be able to start from scratch and create their own categories.
- Category deletion must explain archive/reassign behavior when records exist.
- Expense categories, income categories, and savings goals should be configured from Settings.

### Settings

Primary action:
- Configure household finance lists and expense category budgets.

States:
- Default settings sections
- Empty category or goal list
- Editing category, goal, or budget
- Validation error
- Save success
- Save failure
- Category or goal in-use deletion conflict

Requirements:
- Settings must contain expense category list management.
- Settings must contain expense category budget configuration.
- Settings should also expose income category and savings goal management so transaction forms use configured choices.
- Settings must remain usable from the hamburger menu on desktop and mobile.

### Monthly Summary

Primary action:
- Understand the selected month's income, expenses, savings, category breakdowns, budget comparisons, and member/shared distribution.

States:
- Populated summary
- Empty month
- Loading
- Error
- Charts with small/large category counts
- Spending by category pie chart
- Spending vs budget bar chart
- Income vs expenses comparison
- Historical income vs expenses line chart with legends
- Category drill-down transaction list
- Mobile and desktop layouts

Requirements:
- Numeric totals must be readable without interpreting a chart.
- Charts must use labels and accessible alternatives.
- Month switching must be obvious and update summaries predictably.
- Selecting an expense category must show the transactions contributing to that category total for the selected month.
- Pie, bar, and line charts must include legends or non-color labels so category, budget, income, and expense meaning remains clear.
- Historical income-vs-expenses must show month-over-month values without implying trends when only one month exists.

## Responsive Requirements

- Mobile: transaction entry and month summary must be usable in one-column layouts.
- Desktop: summary, charts, and transaction list may be arranged in a denser dashboard layout.
- Text must not overflow buttons, cards, tables, form controls, or chart labels.
- PWA: installed/mobile home-screen launch must preserve navigation, safe areas, and readable layout.

## Impeccable Verification

Before implementation is considered complete:
- Run or apply `$impeccable shape` or `$impeccable craft` for the main UI surface.
- Run `$impeccable audit` or `$impeccable polish` after implementation.
- Inspect rendered mobile and desktop states.
- Verify loading, empty, error, success, overflow, focus, and contrast states.
