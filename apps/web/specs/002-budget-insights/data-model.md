# Data Model: Category Budgets And Dashboard Trends

## CategoryBudget

Represents a maximum planned expense amount for one household expense category in one month.

Fields:
- `id`: unique identifier
- `householdId`
- `categoryId`: must reference an expense Category
- `month`: `YYYY-MM`
- `amount`: positive integer money amount in Rp
- `source`: explicit saved budget or inherited latest budget candidate
- `createdByUserId`
- `updatedByUserId`
- `createdAt`
- `updatedAt`

Relationships:
- Belongs to one Household
- Belongs to one expense Category
- Created and updated by household members
- Used by MonthlyDashboardSummary to derive budget status

Validation:
- Household member authorization is required for all reads and writes.
- Category must belong to the same household.
- Category type must be `expense`.
- Amount must be greater than zero when saved.
- Only one explicit budget may exist for the same household, category, and month.
- Removing a budget deletes the explicit monthly budget. If an earlier category budget exists and inherited defaults are requested, the category may show that earlier amount as an inherited candidate; otherwise it is not budgeted for the selected month.

State transitions:
- No budget -> inherited latest budget candidate for a new month
- Inherited candidate -> explicit saved monthly budget
- Explicit saved budget -> edited explicit saved budget
- Explicit saved budget -> removed budget

## BudgetStatus

Represents the selected-month comparison between actual expense records and a category budget.

Fields:
- `categoryId`
- `categoryName`
- `month`
- `actualAmount`
- `budgetAmount`: nullable when not budgeted
- `remainingAmount`: positive or zero when under/at budget
- `exceededAmount`: positive when over budget
- `varianceAmount`: budget minus actual when budget exists
- `status`: `under_budget`, `at_budget`, `over_budget`, or `not_budgeted`
- `transactionCount`
- `isBudgetInherited`: whether budget value came from a latest previous budget candidate

Relationships:
- Derived from FinancialRecords and CategoryBudget for the selected household and month
- Supports drill-down to transactions for the same category and month

Validation:
- Must include expense records only.
- Must not mix income, savings, other months, or unauthorized household data.
- Must remain reproducible from persisted records and budgets.

## MonthlyDashboardSummary

Represents all selected-month dashboard data for budget review and charts.

Fields:
- `householdId`
- `month`
- `totals`: income, expenses, savings, remaining difference, total budgeted expenses, budgeted actual expenses, remaining budget, exceeded budget
- `budgetStatuses`: ordered list of BudgetStatus rows
- `spendingByCategory`: pie chart data with category id, label, amount, percent, transaction count
- `spendingVsBudget`: bar chart data with category id, label, actual amount, budget amount, variance, and status
- `incomeVsExpenses`: selected-month income and expenses comparison
- `insightStories`: monthly stories
- `byMember`
- `byScope`

Relationships:
- Derived from FinancialRecords, Categories, HouseholdMembers, and CategoryBudgets

Validation:
- All chart series totals must match numeric summary totals.
- Empty months must return stable empty arrays and zero totals, not misleading chart data.
- Category labels must remain understandable for archived or renamed categories that still have historical records.

## HistoricalIncomeExpensePoint

Represents one month in the historical income-vs-expenses line chart.

Fields:
- `month`
- `incomeAmount`
- `expenseAmount`
- `netAmount`
- `hasRecords`

Relationships:
- Derived from FinancialRecords within a requested month range

Validation:
- Missing income or expense values for a month are represented as zero.
- Months in the requested range must not disappear solely because they have no records.
- Query range must be bounded.

## MonthlyInsightStory

Represents one plain-language dashboard insight derived from selected-month data.

Fields:
- `id`
- `type`: `highest_spending`, `lowest_nonzero_spending`, `over_budget`, `under_budget`, `no_expense_activity`, or `income_expense_context`
- `priority`
- `title`
- `body`
- `categoryId`: nullable
- `amount`: nullable
- `comparisonAmount`: nullable
- `percentOfExpenses`: nullable
- `severity`: `neutral`, `attention`, or `positive`
- `sourceRefs`: category ids, budget ids, or transaction ids used to derive the story

Relationships:
- Derived from MonthlyDashboardSummary, CategoryBudgets, and FinancialRecords
- May link to category drill-down transactions

Validation:
- Copy must be calm, specific, and non-guilt-driven.
- Stories must not invent comparisons when no data exists.
- Story amounts and categories must match selected-month source data.

## Existing Entities Extended

### Category

New behavior:
- Expense categories may have CategoryBudget records.
- Settings owns expense categories, income categories, and savings goals.
- Archived categories remain usable for historical budget and transaction display.

### FinancialRecord

New behavior:
- Expense records contribute to budget status, spending-by-category pie chart, spending-vs-budget bar chart, and insight stories.
- Income and expense records contribute to selected-month income-vs-expenses and historical trend charts.

### MonthlySummary

New behavior:
- Evolves into or backs MonthlyDashboardSummary while preserving traceability to FinancialRecords and CategoryBudgets.
