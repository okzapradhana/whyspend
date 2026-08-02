# API Contract: Household Expense Tracker

All frontend persistence and data reads go through the sibling API service in `../whyspend-api`. The frontend must not connect to PostgreSQL directly.

Base path: `/api`

Response format:
- Successful responses return JSON objects.
- Validation errors return field-level messages.
- Authentication errors return a generic unauthenticated response without exposing account details.

Authentication:
- Registration and login accept a raw password only for that request.
- Successful registration/login returns a JWT.
- All protected API calls must send `Authorization: Bearer <jwt>`.
- The API authorizes household resources from JWT identity and household membership.

## Authentication

### POST `/auth/register`

Creates a user account and returns a JWT.

Request:

```json
{
  "email": "user@example.com",
  "password": "private password",
  "displayName": "Okza"
}
```

Response:

```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "displayName": "Okza"
  }
}
```

### POST `/auth/login`

Authenticates an existing user and returns a JWT.

Request:

```json
{
  "email": "user@example.com",
  "password": "private password"
}
```

Response:

```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "displayName": "Okza"
  }
}
```

### POST `/auth/logout`

Clears the current client authentication state.

Response:

```json
{
  "ok": true
}
```

### GET `/auth/me`

Returns the current authenticated user and household memberships using the JWT.

Response:

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "displayName": "Okza"
  },
  "households": [
    {
      "id": "household_id",
      "name": "Home",
      "role": "owner"
    }
  ]
}
```

## Households

### POST `/households`

Creates the first household workspace.

Request:

```json
{
  "name": "Home"
}
```

Response:

```json
{
  "id": "household_id",
  "name": "Home"
}
```

### GET `/households/:householdId`

Returns household details and members.

Response:

```json
{
  "id": "household_id",
  "name": "Home",
  "members": [
    {
      "userId": "user_id",
      "displayName": "Okza",
      "role": "owner"
    }
  ]
}
```

## Categories

### GET `/households/:householdId/categories`

Returns active and archived categories for a household.

Query:
- `type`: optional `income`, `expense`, or `savings`
- `includeArchived`: optional boolean

Response:

```json
{
  "categories": [
    {
      "id": "category_id",
      "name": "Subscription",
      "type": "expense",
      "scope": "member",
      "isArchived": false
    }
  ]
}
```

### POST `/households/:householdId/categories`

Creates a category.

Request:

```json
{
  "name": "Books",
  "type": "expense",
  "scope": "member"
}
```

Response:

```json
{
  "id": "category_id",
  "name": "Books",
  "type": "expense",
  "scope": "member",
  "isArchived": false
}
```

### PATCH `/households/:householdId/categories/:categoryId`

Updates category display properties.

Request:

```json
{
  "name": "Books and learning",
  "scope": "member",
  "isArchived": false
}
```

Response:

```json
{
  "id": "category_id",
  "name": "Books and learning",
  "type": "expense",
  "scope": "member",
  "isArchived": false
}
```

### DELETE `/households/:householdId/categories/:categoryId`

Deletes an unused category or rejects deletion when records exist.

Response:

```json
{
  "ok": true
}
```

Conflict response:

```json
{
  "error": "category_in_use",
  "message": "This category is used by transactions. Archive it or reassign records first."
}
```

## Transactions

### GET `/households/:householdId/transactions`

Returns transactions for a month.

Query:
- `month`: required `YYYY-MM`
- `type`: optional `income`, `expense`, or `savings`
- `ownerUserId`: optional user id
- `categoryId`: optional category id. Used by the expense summary category drill-down to list transactions bound to a category.

Response:

```json
{
  "transactions": [
    {
      "id": "record_id",
      "type": "expense",
      "amount": 281000,
      "occurredOn": "2026-01-10",
      "month": "2026-01",
      "scope": "member",
      "note": "Monthly subscription",
      "owner": {
        "userId": "user_id",
        "displayName": "Okza"
      },
      "category": {
        "id": "category_id",
        "name": "Subscription",
        "type": "expense"
      }
    }
  ]
}
```

### POST `/households/:householdId/transactions`

Creates a transaction.

Request:

```json
{
  "type": "expense",
  "amount": 281000,
  "occurredOn": "2026-01-10",
  "categoryId": "category_id",
  "ownerUserId": "user_id",
  "scope": "member",
  "note": "Monthly subscription"
}
```

Response: created transaction object.

### PATCH `/households/:householdId/transactions/:transactionId`

Updates a transaction.

Request:

```json
{
  "amount": 300000,
  "categoryId": "category_id",
  "occurredOn": "2026-01-11",
  "scope": "member",
  "note": "Updated note"
}
```

Response: updated transaction object.

### DELETE `/households/:householdId/transactions/:transactionId`

Deletes a transaction.

Response:

```json
{
  "ok": true
}
```

## Summaries

### GET `/households/:householdId/summaries/monthly`

Returns monthly totals and chart data derived from transactions.

Query:
- `month`: required `YYYY-MM`

Response:

```json
{
  "month": "2026-01",
  "totals": {
    "income": 0,
    "expenses": 3896000,
    "savings": 6000000,
    "remainingDifference": -9896000
  },
  "byCategory": [
    {
      "categoryId": "category_id",
      "categoryName": "Subscription",
      "type": "expense",
      "amount": 397000,
      "transactionCount": 2
    }
  ],
  "byMember": [
    {
      "userId": "user_id",
      "displayName": "Okza",
      "income": 0,
      "expenses": 4821000,
      "savings": 0
    }
  ],
  "byScope": {
    "household": {
      "expenses": 3030000,
      "savings": 0,
      "income": 0
    },
    "member": {
      "expenses": 5687000,
      "savings": 6000000,
      "income": 0
    }
  }
}
```
