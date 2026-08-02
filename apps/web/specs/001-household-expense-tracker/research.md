# Research: Household Expense Tracker

## Decision: React TSX + Vite frontend in current repository

**Rationale**: The user specified React TSX and Vite. Keeping the current `whyspend` folder as frontend-only creates a clear boundary: UI, routing, forms, charts, and API client code live here.

**Alternatives considered**: A full-stack framework was rejected because it would blur the explicit frontend/API separation. A static-only frontend was rejected because authenticated household workflows require dynamic API calls.

## Decision: Sibling API repository/folder at `../whyspend-api`

**Rationale**: The user required the API to be implemented in another repo/folder with the current folder as FE. A sibling folder keeps the boundary visible and allows independent API testing, migrations, and deployment.

**Alternatives considered**: A backend folder inside this repo was rejected because it weakens the "current folder is FE" requirement. Direct frontend database calls were rejected by requirement and by the constitution.

## Decision: PostgreSQL as source of truth, accessed only through API

**Rationale**: The constitution and user require PostgreSQL persistence. All financial records, users, households, categories, and summary inputs must be persisted through API endpoints, keeping credentials and data rules server-side.

**Alternatives considered**: Browser storage was rejected because data must persist across sessions/devices and be shared by two household members. Google Sheets as storage was rejected because the product replaces spreadsheet maintenance.

## Decision: Store transactions as source records and calculate summaries from them

**Rationale**: Monthly summaries and charts must be traceable to underlying transaction records. Storing only summary rows would recreate the current spreadsheet risk where totals can drift from line items.

**Alternatives considered**: Manual monthly totals were rejected because they preserve the painful workflow. Persisting only derived summaries was rejected because edits/deletes would become hard to audit and recalculate.

## Decision: Start from user-created categories, using spreadsheet categories only as references

**Rationale**: The household is comfortable starting fresh. Spreadsheet categories remain useful examples of acceptable expense, income, and savings categories, but the website must not automatically create them. Categories still need type and scope so reporting remains consistent.

**Alternatives considered**: Automatic spreadsheet category setup was rejected because the user does not want to import the current sheet into the website. Free-text category entry on every transaction was rejected because it creates duplicate labels and unreliable charts.

## Decision: JWT-authenticated household model for v1

**Rationale**: The first release needs private access for two household members without enterprise identity complexity. JWTs let the frontend call the API without sending raw passwords after login, and let the API authorize access to household resources. Real authenticated users replace Person A/Person B placeholders.

**Alternatives considered**: No login was rejected because household financial data is private. Complex role/permission systems were rejected as unnecessary for the initial two-person household scope.

## Decision: PWA and responsive desktop/mobile support

**Rationale**: The household will use the product on both desktop and phones. PWA behavior lets the website be launched from a phone home screen, while responsive layouts prevent broken UI, clipped controls, and text overflow.

**Alternatives considered**: Desktop-only layouts were rejected because transaction entry is likely to happen on mobile. A native mobile app was rejected because the requested product is a website.

## Decision: Category summary drill-down

**Rationale**: Monthly expense summaries must not be a dead-end chart. Users need to select a category and inspect the transactions bound to that total so the summary remains traceable and correctable.

**Alternatives considered**: Showing only aggregate category totals was rejected because it does not explain which transactions created the total.

## Decision: Product UI with Impeccable gates

**Rationale**: WhySpend is a repeated-use product tool. The UI should prioritize fast transaction entry, clear monthly summaries, accessible charts, and calm decision-making over decorative finance-dashboard styling.

**Alternatives considered**: Spreadsheet-like editing was rejected because it preserves the old workflow. Marketing-style dashboards and decorative chart cards were rejected by PRODUCT.md and the constitution.
