# API Contract: Category Budgets And Dashboard Trends

All frontend persistence and data reads go through the sibling API service in `../whyspend-api`. The frontend must not connect to PostgreSQL directly.

Base path: `/api`

Authentication:
- All endpoints below require `Authorization: Bearer <jwt>`.
- The API authorizes `householdId` from JWT identity and household membership.
- Unauthorized household access returns an authorization error without exposing household data.

Money:
- All amounts are integer Rp values.
- Months use `YYYY-MM`.

## Category Budgets

### GET `/households/:householdId/budgets/category`

Returns expense category budgets for a selected month. Also returns budgetable expense categories so Settings can show categories without saved budgets.

Query:
- `month`: required `YYYY-MM`
- `includeInherited`: optional boolean, default `true`

Response:

```json
{
  "month": "2026-06",
  "budgets": [
    {
      "id": "budget_id",
      "categoryId": "category_id",
      "categoryName": "Subscription",
      "month": "2026-06",
      "amount": 500000,
      "source": "explicit",
      "isArchivedCategory": false
    }
  ],
  "budgetableCategories": [
    {
      "categoryId": "category_id",
      "categoryName": "Subscription",
      "isArchived": false,
      "budget": {
        "id": "budget_id",
        "amount": 500000,
        "source": "explicit"
      }
    }
  ]
}
```

### PUT `/households/:householdId/budgets/category/:categoryId`

Creates or updates the explicit budget for one expense category and month.

Request:

```json
{
  "month": "2026-06",
  "amount": 500000
}
```

Response:

```json
{
  "id": "budget_id",
  "categoryId": "category_id",
  "categoryName": "Subscription",
  "month": "2026-06",
  "amount": 500000,
  "source": "explicit"
}
```

Validation errors:
- Missing or invalid `month`
- `amount` is missing, non-money, zero, or negative
- Category does not belong to household
- Category is not an expense category

### DELETE `/households/:householdId/budgets/category/:categoryId`

Removes the explicit budget for one expense category and month.

Query:
- `month`: required `YYYY-MM`

Response:

```json
{
  "ok": true
}
```

## Dashboard Summary

### GET `/households/:householdId/summaries/monthly`

Extends the existing monthly summary response with budget and selected-month chart data.

Query:
- `month`: required `YYYY-MM`

Response:

```json
{
  "month": "2026-06",
  "totals": {
    "income": 12000000,
    "expenses": 4300000,
    "savings": 2000000,
    "remainingDifference": 5700000,
    "totalBudgetedExpenses": 5000000,
    "budgetedActualExpenses": 3900000,
    "remainingBudget": 1100000,
    "exceededBudget": 0
  },
  "budgetStatuses": [
    {
      "categoryId": "category_id",
      "categoryName": "Subscription",
      "actualAmount": 397000,
      "budgetAmount": 500000,
      "remainingAmount": 103000,
      "exceededAmount": 0,
      "varianceAmount": 103000,
      "status": "under_budget",
      "transactionCount": 2,
      "isBudgetInherited": false
    }
  ],
  "spendingByCategory": [
    {
      "categoryId": "category_id",
      "label": "Subscription",
      "amount": 397000,
      "percentOfExpenses": 9.23,
      "transactionCount": 2
    }
  ],
  "spendingVsBudget": [
    {
      "categoryId": "category_id",
      "label": "Subscription",
      "actualAmount": 397000,
      "budgetAmount": 500000,
      "status": "under_budget"
    }
  ],
  "incomeVsExpenses": {
    "incomeAmount": 12000000,
    "expenseAmount": 4300000,
    "netAmount": 7700000
  },
  "insightStories": [
    {
      "id": "highest-spending-category_id",
      "type": "highest_spending",
      "priority": 1,
      "title": "Most spending",
      "body": "Subscription is the largest expense this month at IDR 397,000.",
      "categoryId": "category_id",
      "amount": 397000,
      "comparisonAmount": null,
      "percentOfExpenses": 9.23,
      "severity": "neutral",
      "sourceRefs": ["category_id"]
    }
  ],
  "byCategory": [],
  "byMember": [],
  "byScope": {
    "household": { "income": 0, "expenses": 0, "savings": 0 },
    "member": { "income": 12000000, "expenses": 4300000, "savings": 2000000 }
  }
}
```

Requirements:
- Existing fields remain backward-compatible for current frontend behavior until migrated.
- Budget status uses selected-month expense records only.
- Chart data totals must match numeric totals.
- Empty months return zero totals and empty chart arrays.

### GET `/households/:householdId/summaries/income-expenses-history`

Returns bounded month-over-month income and expense points for the line chart.

Query:
- `fromMonth`: required `YYYY-MM`
- `toMonth`: required `YYYY-MM`

Response:

```json
{
  "fromMonth": "2026-01",
  "toMonth": "2026-06",
  "points": [
    {
      "month": "2026-01",
      "incomeAmount": 10000000,
      "expenseAmount": 4200000,
      "netAmount": 5800000,
      "hasRecords": true
    }
  ]
}
```

Validation:
- Range must be valid and bounded.
- Months with no records inside the requested range must still be represented with zero values.

## Drill-Down

Existing `GET /households/:householdId/transactions?month=YYYY-MM&categoryId=...&type=expense` remains the source for tracing a budget status or insight story to contributing transactions.
