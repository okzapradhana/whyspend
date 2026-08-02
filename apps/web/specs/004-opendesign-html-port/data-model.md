# Data Model: OpenDesign HTML Port

This feature does not introduce new persistent backend entities. It defines frontend planning entities and acceptance evidence needed to rebuild route screens from OpenDesign visual sources while preserving existing WhySpend household finance data meanings.

## OpenDesign Source Package

Represents the external design source used for route rebuild decisions.

Fields:
- `rootPath`: Absolute path to the OpenDesign package.
- `screenFiles`: Current route source files under `screens/`.
- `sharedCss`: Shared CSS asset path, primarily `assets/app.css`.
- `brandSpec`: Brand guidance path, `brand-spec.md`.
- `generatedVariants`: Older root-level generated HTML or screenshot files used only as secondary reference.

Validation rules:
- `rootPath` must exist before implementation starts.
- `screenFiles` must include dashboard, transactions, savings goals, settings, login, and signup.
- `screens/` and `assets/app.css` are primary when generated variants conflict.

## Source Screen

Represents a route-specific OpenDesign HTML file.

Fields:
- `routeName`: Dashboard, Transactions, Savings Goals, Settings, Login, or Signup.
- `sourceFile`: Matching `screens/*.html` path.
- `sourceHeadings`: Primary h1/h2/h3 labels visible in the source.
- `sourceSections`: Main source sections or `data-od-id` landmarks.
- `visualVocabulary`: Relevant class/control vocabulary used for rendered parity.
- `sampleData`: Static labels, names, amounts, dates, and rows to replace with live values.

Relationships:
- Belongs to one OpenDesign Source Package.
- Maps to one Rebuilt Route.

Validation rules:
- Each covered route must have exactly one primary Source Screen.
- Source sample data must not be treated as product truth.

## Rebuilt Route

Represents a live WhySpend route implemented as TSX and visually rebuilt from a Source Screen.

Fields:
- `routePath`: Live route path, such as `/dashboard`.
- `sourceScreen`: Primary Source Screen.
- `tsxEntry`: Route component or feature entry file.
- `stateCoverage`: Default, loading, empty, error, success, disabled, hover, focus, active, dialog/menu open, long-text, high-amount, and mobile overflow.
- `dataBindings`: Live data used in place of OpenDesign sample data.
- `intentionalRenderedDifferences`: Documented product, accessibility, routing, state, or responsive differences from the source.

Relationships:
- Maps one Source Screen to live User, Household, Financial Record, Category, Budget, Savings Goal, or Dashboard Summary data as needed.
- Produces one Acceptance Record.

Validation rules:
- The prior TSX-rendered screen implementation for the route must be deleted or replaced.
- Internal TSX structure may differ from the source HTML when rendered parity and product behavior hold.
- The route must preserve source visual hierarchy and product vocabulary.

## User

Existing product entity representing an authenticated household member.

Fields surfaced by this feature:
- `id`
- `displayName`
- `email`
- `password` only during signup/login input

Relationships:
- Belongs to Household membership.
- Owns or reviews Financial Records, Categories, Budgets, and Savings Goals.

Validation rules:
- Signup requires Display Name, Email, and Password.
- Login requires Email and Password.
- Password is never shown outside authentication forms.

## Household

Existing product entity representing the shared finance workspace.

Fields surfaced by this feature:
- `id`
- `name`
- `members`
- `activeMonth`

Relationships:
- Has Users, Financial Records, Categories, Budgets, Savings Goals, and Dashboard Summaries.

Validation rules:
- Household identity must be visible where source shell or account areas show household context.
- Person A and Person B spreadsheet placeholders must not replace authenticated identity.

## Financial Record

Existing product entity for income, expense, or savings entry.

Fields surfaced by this feature:
- `id`
- `type`: Expense, Income, or Savings.
- `date`
- `month`
- `amountRp`
- `categoryId` for income or expense.
- `goalId` for savings.
- `ownerUserId`
- `householdScope`
- `notes`

Relationships:
- Belongs to User and Household.
- References Category or Savings Goal based on type.
- Feeds Dashboard Summary.

Validation rules:
- Transaction form fields remain Date, Amount in Rp, Category or Goal, and optional Notes.
- Savings records are not expenses.
- Rp amounts use tabular formatting and high-amount overflow checks.

## Category

Existing product entity for user-managed income or expense categories.

Fields surfaced by this feature:
- `id`
- `name`
- `type`: Income or Expense.
- `scope`
- `budgetRp` for expense categories.
- `status`

Relationships:
- Belongs to Household.
- Expense categories may have Budgets.
- Used by Financial Records and Dashboard Summary.

Validation rules:
- Expense categories and expense budgets are managed through Settings.
- Income categories are managed through Settings.
- Long category names must not break rebuilt source layouts.

## Budget

Existing product entity for expense category budget comparison.

Fields surfaced by this feature:
- `id`
- `categoryId`
- `month`
- `budgetRp`
- `actualRp`
- `differenceRp`
- `status`

Relationships:
- Belongs to Expense Category and Household.
- Feeds Dashboard budget health and Settings category budget rows.

Validation rules:
- Budget, actual, and difference values must be explicitly labeled.
- Color cannot be the only signal for over/under budget status.

## Savings Goal

Existing product entity for savings target progress.

Fields surfaced by this feature:
- `id`
- `name`
- `targetRp`
- `currentRp`
- `targetDate`
- `progressPercent`
- `status`

Relationships:
- Belongs to Household.
- Receives Savings Financial Records.
- Appears in Savings Goals route and transaction goal selector.

Validation rules:
- Goal progress must use explicit values and accessible labels.
- Add, edit, and delete flows must preserve source modal/menu visual intent.

## Dashboard Summary

Existing derived view of household finance records for a selected month and historical trend.

Fields surfaced by this feature:
- `month`
- `incomeRp`
- `expensesRp`
- `savingsRp`
- `remainingRp`
- `categorySpending`
- `budgetHealth`
- `cashFlowTrend`
- `insightStories`

Relationships:
- Derived from Financial Records, Categories, Budgets, and Savings Goals.
- Powers Dashboard source sections.

Validation rules:
- Income, expenses, savings, budgets, actuals, differences, and trends must be explicitly labeled.
- Derived totals must remain traceable to their source records or categories.

## Acceptance Record

Frontend planning artifact proving route rebuild quality.

Fields:
- `routePath`
- `sourceFile`
- `oldTsxRemovedOrReplaced`
- `liveDataSubstitutions`
- `stateCoverage`
- `visualReviewEvidence`
- `intentionalRenderedDifferences`
- `verificationCommands`

Relationships:
- Belongs to one Rebuilt Route.
- References one Source Screen.

Validation rules:
- One Acceptance Record is required per covered route.
- Any source deviation must cite product, accessibility, routing, state, or responsive rationale.
- Acceptance evidence should be created during implementation and checked before completion.
