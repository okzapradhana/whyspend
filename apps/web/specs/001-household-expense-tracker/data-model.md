# Data Model: Household Expense Tracker

## User

Represents an authenticated household member.

Fields:
- `id`: unique identifier
- `email`: unique login identifier
- `displayName`: member name shown in the UI instead of Person A/Person B
- `password`: protected password credential value; raw passwords are only accepted during registration/login
- `createdAt`
- `updatedAt`

Relationships:
- Belongs to one or more households through HouseholdMember
- Owns financial records
- May create categories

Validation:
- Email must be unique and valid
- Display name is required for household-facing labels

## Household

Represents the shared finance workspace.

Fields:
- `id`: unique identifier
- `name`: household name
- `createdAt`
- `updatedAt`

Relationships:
- Has many HouseholdMembers
- Has many categories
- Has many financial records

Validation:
- Name is required
- v1 assumes one active household for the owner and spouse

## HouseholdMember

Represents a user's membership in a household.

Fields:
- `id`: unique identifier
- `householdId`
- `userId`
- `role`: owner or member
- `joinedAt`

Relationships:
- Belongs to one Household
- Belongs to one User

Validation:
- A user cannot be duplicated in the same household
- Role must be one of the allowed household roles

## Category

Represents a household-created category for income, expense, or savings records. Savings-type categories are presented to users as savings goals.

Fields:
- `id`: unique identifier
- `householdId`
- `name`
- `type`: income, expense, or savings. Savings is presented as Goal in savings transaction workflows.
- `scope`: household, member, or both
- `isArchived`: whether it is hidden from new entry while preserved for history
- `createdByUserId`
- `createdAt`
- `updatedAt`

Relationships:
- Belongs to one Household
- May be linked to many FinancialRecords

Validation:
- Category name is required
- Category type is required
- Duplicate active category names are not allowed within the same household and type
- Categories with linked records cannot be hard-deleted; they must be archived or records must be reassigned first
- Spreadsheet categories may be used as examples, but they are not automatically created for new households
- Expense category lists are configured through Settings

## FinancialRecord

Represents an income, expense, or savings transaction.

Fields:
- `id`: unique identifier
- `householdId`
- `ownerUserId`: authenticated member the record belongs to
- `categoryId`: category for income and expense records, savings goal for savings records
- `type`: income, expense, or savings
- `scope`: household/shared or personal
- `amount`
- `occurredOn`
- `month`: derived year-month used for filtering and summaries
- `note`
- `createdByUserId`
- `updatedByUserId`
- `createdAt`
- `updatedAt`

Relationships:
- Belongs to one Household
- Belongs to one owning User
- Belongs to one Category

Validation:
- Amount must be greater than zero
- Occurred date is required
- Type must match the category type
- Owner must be a member of the household
- Household/shared records must still preserve who created and last updated them
- User-visible forms require Date, Amount in Rp, Category or Goal, and optional Notes; ownership and scope may be inferred or handled outside the primary form while still being persisted

State transitions:
- Draft form input -> saved record
- Saved record -> edited saved record
- Saved record -> deleted record

## MonthlySummary

Represents a derived view, not the primary source of truth.

Fields:
- `householdId`
- `month`
- `totalIncome`
- `totalExpenses`
- `totalSavings`
- `remainingDifference`
- `totalsByCategory`
- `totalsByMember`
- `totalsByScope`
- `transactionsByCategory`: drill-down list or reference for transactions contributing to each category total

Relationships:
- Derived from FinancialRecords for the selected household and month

Validation:
- Must be reproducible from persisted financial records
- Chart data must match numeric summary totals
- Category drill-down transactions must match the selected month and category total

## JWT Access Token

Represents authenticated and authorized API access after login.

Fields:
- `subjectUserId`
- `householdIds` or authorized household claims
- `expiresAt`
- `issuedAt`

Relationships:
- Issued for one User
- Authorizes access only to households where the user is a member

Validation:
- Expired tokens cannot access API resources
- Token subject must be a household member for any household-scoped request
- Raw password is never sent for authenticated API calls after login
