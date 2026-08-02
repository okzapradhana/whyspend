# UI Contract: Category Budgets And Dashboard Trends

## Design Authority

`DESIGN.md` is binding for this feature. The implementation must use Serene Union through Tailwind-backed project components, not default third-party component-library visual styles.

Required Serene Union rules:
- Background: very desaturated off-white/warm paper surface.
- Primary action and growth indicators: Sage Green.
- Collaborative/shared affordances: Soft Blue.
- Containers and cards: 24px radius, no borders, ambient 20px to 40px soft shadows at 5% to 8% opacity with a slight Sage tint.
- Inputs: soft beige backgrounds, no default border, Soft Blue 2px focus glow.
- Buttons: pill or friendly radius, Sage Green primary, soft-tinted secondary, no border-first ghost button styling.
- Typography: Inter, spacious but scannable, tabular numerals for currency.
- Spacing: 8px unit, 20px mobile margins, 40px desktop margins, 16px gutter, 48px section gaps where page rhythm allows.
- Charts: legends, labels, exact numeric summaries, non-color indicators, empty states, and calm copy.

## Tailwind Usage Contract

Tailwind CSS is the styling foundation for this feature. Tailwind configuration and project CSS variables must map directly to `DESIGN.md` tokens before UI implementation proceeds.

Required Tailwind targets:
- Serene Union color roles for background, surface, primary, secondary, tertiary, error, outline, and text.
- Typography utilities for the Inter type scale and tabular currency numerals.
- Radius utilities for 8px controls and 24px containers/navigation panels.
- Shadow utilities for the permitted ambient elevation levels.
- Spacing utilities based on the 8px unit, 16px gutters, 20px mobile margins, and 40px desktop margins.
- Focus utilities for the 2px Soft Blue focus glow.

Component rules:
- Build project-owned components rather than generating shadcn/ui components for this feature.
- Cards must be borderless and use tonal layering plus ambient shadow.
- Inputs must use soft beige backgrounds with no default border.
- Buttons must use Sage Green primary and soft-tinted secondary treatments.
- Charts must add accessible labels, legends, numeric summaries, empty states, and non-color meaning.
- Verify WCAG AA after Tailwind token mapping.

## Navigation

Primary action:
- Open or close the hamburger menu and move between Dashboard, Transactions, and Settings.

States:
- Closed
- Open
- Current page highlighted
- Keyboard focus through trigger and menu items
- Mobile safe-area layout
- Desktop layout with the same navigation model

Requirements:
- Hamburger trigger must have an accessible name.
- Menu must be reachable on desktop and mobile.
- Menu state must not hide routes from keyboard users.
- Navigation styling must follow Serene Union, not a dark institutional sidebar.

## Settings: Expense Category Budgets

Primary action:
- Set, edit, or remove the monthly budget for each expense category.

States:
- Loading categories and budgets
- Empty expense categories
- Category row with no budget
- Category row with inherited latest budget candidate
- Category row with explicit monthly budget
- Editing amount
- Validation error
- Save success
- Save failure
- Removed budget
- Long category names

Requirements:
- Users must not need spreadsheet-style entry.
- Budget fields must use Rp formatting or clear amount labels.
- Categories without budgets must be clearly labeled as not budgeted.
- Removing a budget must not imply the category is under budget.
- Settings should also contain income categories and savings goals, even if budget work is scoped to expense categories.

## Dashboard

Primary action:
- Understand the selected month's spending, budgets, income, expenses, savings, and trend context.

States:
- Loading
- Empty month
- Populated month
- Error
- Long category names
- One category
- Many categories
- Over-budget category
- No over-budget categories
- One historical month
- Multiple historical months
- Missing months in historical range

Required surfaces:
- Month selector
- Income, expenses, savings, and remaining totals
- Budget overview: total budgeted expenses, budgeted actual expenses, remaining budget, exceeded budget
- Spending by category pie chart with legend and numeric list
- Spending vs budget bar chart with category labels and actual/budget values
- Selected-month income vs expenses comparison
- Historical income vs expenses line chart with legends
- Budget status list or table
- Insight stories
- Category drill-down link or interaction

Requirements:
- Numeric summaries must remain readable without chart interpretation.
- Pie, bar, and line charts must not rely on color alone.
- Insight stories must be short, calm, and specific.
- Over-budget copy must avoid shame and alarmist language.
- Selecting a category budget status or story must allow tracing to contributing transactions in no more than two interactions.

## Responsive Requirements

- Mobile uses a single-column flow with 20px side margins.
- Desktop uses a 12-column layout centered within a 1200px max content width.
- Chart legends must wrap or stack without clipping.
- Long labels must wrap cleanly in cards, tables, buttons, form controls, and chart legends.
- PWA installed/mobile launch must preserve safe areas and navigation access.

## Accessibility Requirements

- WCAG AA contrast for body, labels, placeholder text, status text, buttons, charts, and focus rings.
- Keyboard navigation for hamburger menu, Settings editing, tabs, dialogs, and drill-downs.
- Visible focus on all interactive controls.
- Reduced-motion alternatives for transitions.
- `aria-describedby` or equivalent for validation errors.
- Chart summaries exposed in text near chart visuals.

## Impeccable Verification

Before implementation is considered complete:
- Apply Impeccable product register and DESIGN.md together.
- Run a rendered desktop inspection.
- Run a rendered mobile inspection.
- Verify loading, empty, error, success, overflow, focus, and contrast states.
- Confirm no generic banking-dashboard styling, gamified guilt patterns, decorative charts, spreadsheet mimicry, vague card grids, or inconsistent component vocabulary.
