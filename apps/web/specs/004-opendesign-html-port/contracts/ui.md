# UI Contract: OpenDesign HTML Port

This contract defines the user-facing route behavior and acceptance evidence for the OpenDesign visual rebuild. Internal TSX structure may differ from source HTML, but rendered output must match the source screen's visual hierarchy, route vocabulary, controls, and product behavior.

## Global Contract

- Source package: `/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0`
- Primary source CSS: `assets/app.css`
- Primary source screens: files under `screens/`
- Runtime model: TSX routes backed by existing WhySpend API state.
- Parity standard: visual parity with documented intentional rendered differences.
- Replacement standard: old TSX-rendered screen implementations for covered routes are deleted or replaced.
- Required route states: default, loading, empty, error, success, disabled, hover, focus, active, dialog/menu open, long-text, high-amount, and mobile overflow.
- Required accessibility: WCAG AA contrast, keyboard navigation, visible focus, reduced motion, explicit labels, and non-color indicators.

## Route Contract Matrix

| Route | Source Screen | Current TSX Area To Replace | Required Rendered Source Areas |
|-------|---------------|-----------------------------|--------------------------------|
| `/dashboard` | `screens/dashboard.html` | `src/features/summaries/` route screen layout | `dashboard-head`, `summary-metrics`, `dashboard-charts`, `budget-and-trend`, selected-month overview, spending chart, budget health, cash-flow trend |
| `/transactions` | `screens/transactions.html` | `src/features/transactions/` route screen layout | `transactions-head`, `transaction-controls`, `transaction-list`, type filters, ledger, floating add action, transaction dialog |
| `/savings-goals` | `screens/savings-goals.html` | `src/features/savings-goals/` route screen layout | `savings-head`, `savings-summary`, `goal-cards`, progress bars, goal menus, add/edit/delete dialogs |
| `/settings` | `screens/settings.html` | `src/features/settings/` route screen layout | `settings-head`, `settings-content`, expense categories and budgets, income categories, savings goal categories, household access |
| `/auth` signup mode | `screens/signup.html` | `src/features/auth/AuthPage.tsx` signup screen | `signup-auth`, auth shell, Display Name, Email, Password, password hint, status, signup action |
| `/auth` login mode | `screens/login.html` | `src/features/auth/AuthPage.tsx` login screen | `login-auth`, auth shell, Email, Password, password visibility, status, sign-in action |
| Product shell | `screens/dashboard.html` shell and shared CSS | `src/app/router.tsx`, `src/styles/app.css`, shared shell components | desktop left rail, mobile bar, drawer backdrop, hamburger drawer, brand lockup, account pill, nav items, support destination |

## Dashboard Contract

Source:
- `screens/dashboard.html`
- `assets/app.css`

Required live data:
- Selected month.
- Household income, expenses, savings, and remaining amount.
- Spending by category.
- Budget health by category.
- Historical income/expense trend.

Required behavior:
- Month changes update all dashboard sections.
- Chart labels, legends, and values identify finance meaning without relying on color alone.
- Empty month shows source-vocabulary empty state with next action.
- Loading and error states occupy the same visual regions as source content.

Acceptance evidence:
- Source file used.
- Prior dashboard TSX screen removed or replaced.
- Static June sample amounts/categories replaced with live summary values.
- Rendered screenshots at desktop and mobile.
- Intentional rendered differences documented.

## Transactions Contract

Source:
- `screens/transactions.html`
- `assets/app.css`

Required live data:
- Selected month.
- Expense, Income, and Savings records.
- Configured expense/income categories and savings goals.

Required behavior:
- Search and type filters update the ledger.
- Add action opens the source-style transaction dialog.
- Transaction form supports Expense, Savings, and Income with Date, Amount in Rp, Category or Goal, and optional Notes.
- Edit and delete affordances remain reachable in long rows and mobile layouts.
- Validation errors appear within the source modal/form vocabulary.

Acceptance evidence:
- Source file used.
- Prior transactions TSX screen removed or replaced.
- Static ledger rows replaced with live records.
- Dialog screenshots for add/edit/error states.
- Mobile overflow review for high Rp amounts and long notes.

## Savings Goals Contract

Source:
- `screens/savings-goals.html`
- `assets/app.css`

Required live data:
- Total savings progress.
- Individual savings goals with target, current amount, date, and progress.

Required behavior:
- Add, edit, and delete flows use source-style dialogs and confirmation.
- Goal action menus are keyboard reachable and not clipped by card overflow.
- Progress bars include explicit current/target values and accessible labels.
- Empty goals state guides the user to add a goal.

Acceptance evidence:
- Source file used.
- Prior savings goals TSX screen removed or replaced.
- Static goal cards replaced with live goals.
- Menu and modal screenshots.
- Reduced-motion and keyboard review.

## Settings Contract

Source:
- `screens/settings.html`
- `assets/app.css`

Required live data:
- Expense categories and budgets.
- Income categories.
- Savings goal categories.
- Household access summary or invite affordance.

Required behavior:
- Settings remains owner of expense categories, expense budgets, income categories, and savings goal categories.
- Budget, actual, and difference values are explicitly labeled.
- Delete and invite actions have clear success/error feedback.
- Long category lists and long category names remain scannable.

Acceptance evidence:
- Source file used.
- Prior settings TSX screen removed or replaced.
- Static categories/budgets replaced with live configuration.
- Long-name and high-amount screenshots.
- Accessibility review for table/actions.

## Auth Contract

Sources:
- `screens/login.html`
- `screens/signup.html`
- `assets/app.css`

Required live data:
- Signup: Display Name, Email, Password.
- Login: Email, Password.
- Auth status and validation feedback.

Required behavior:
- Password visibility controls work and preserve accessible names.
- Signup and login modes visually map to their source screens.
- Auth errors and success messages appear in source-style status regions.
- Google/social placeholders are retained only if product behavior is explicitly supported or documented as unavailable.

Acceptance evidence:
- Source files used.
- Prior auth TSX screen removed or replaced.
- Required fields verified.
- Error and success screenshots.
- Keyboard and focus review.

## Acceptance Record Template

Each covered route must produce an implementation record with this shape:

```markdown
## Route: /example

- Source screen: `screens/example.html`
- Source CSS reviewed: `assets/app.css`
- Prior TSX removed or replaced: yes/no, with file paths
- Live data substitutions:
  - Source sample: ...
  - Product binding: ...
- State coverage verified:
  - Default:
  - Loading:
  - Empty:
  - Error:
  - Success:
  - Overflow:
- Intentional rendered differences:
  - Difference:
  - Rationale:
- Verification:
  - Commands:
  - Browser viewports:
  - Screenshots or notes:
```

## Verification Contract

Required before implementation completion:
- `pnpm test`
- `pnpm run build`
- `pnpm exec playwright test`
- `pnpm test:tokens`
- `pnpm test:structure`
- `pnpm test:visual`
- `pnpm check:opendesign`
- Rendered desktop and mobile inspection in a browser.
- Keyboard/focus checks for nav, forms, dialogs, menus, filters, and action buttons.
- Reduced-motion review.
- Contrast review for text, form labels, placeholders, chart labels, buttons, and status text.
