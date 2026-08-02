# Quickstart: OpenDesign HTML Port

Use this quickstart when implementing or reviewing the route rebuild from OpenDesign source screens.

## 1. Confirm Active Feature

```bash
git branch --show-current
cat .specify/feature.json
```

Expected branch:

```text
004-opendesign-html-port
```

Expected feature directory:

```text
specs/004-opendesign-html-port
```

## 2. Review Sources Before Editing

Read the product and design constraints:

```bash
sed -n '1,220p' PRODUCT.md
sed -n '1,220p' DESIGN.md
sed -n '1,220p' .specify/memory/constitution.md
```

Review OpenDesign source files:

```bash
open-design-root="/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0"
ls "$open-design-root/screens"
sed -n '1,220p' "$open-design-root/assets/app.css"
```

Route source mapping:

```text
/dashboard      -> screens/dashboard.html
/transactions   -> screens/transactions.html
/savings-goals  -> screens/savings-goals.html
/settings       -> screens/settings.html
/auth login     -> screens/login.html
/auth signup    -> screens/signup.html
product shell   -> shared shell patterns in screens/dashboard.html and assets/app.css
```

## 3. Implementation Order

1. Create or refresh a route-source inventory from each `screens/*.html` file.
2. Replace the shared product shell first: desktop rail, mobile bar, drawer backdrop, hamburger drawer, brand, account pill, and route nav.
3. Rebuild auth from `login.html` and `signup.html`.
4. Rebuild Dashboard from `dashboard.html`.
5. Rebuild Transactions from `transactions.html`.
6. Rebuild Settings from `settings.html`.
7. Rebuild Savings Goals from `savings-goals.html`.
8. Replace static OpenDesign samples with live React data bindings.
9. Add loading, empty, error, success, validation, overflow, keyboard, focus, reduced-motion, PWA, and responsive behavior.
10. Create the route-by-route acceptance records from `contracts/ui.md`.

Important implementation rule:

```text
Target visual parity, not strict DOM parity. Delete or replace the old TSX-rendered screens, but allow internal TSX structure to differ when rendered output and product behavior match the OpenDesign source.
```

Implementation behavior notes:
- The Transactions floating add button opens the source-style transaction dialog, defaulting to Add Expense.
- Transaction type is changed with the dialog segmented toggle: Expense, Savings, Income.
- Expense and income transactions select existing categories; savings transactions select existing savings goals.
- Category and savings-goal creation is owned by Settings/Savings Goals, not the transaction dialog.
- Savings goals are backed by household savings categories plus savings transaction totals; target/date metadata is client-side until a dedicated savings-goal API is available.

## 4. Local Development

Start the sibling API:

```bash
pnpm --dir ../whyspend-api dev
```

Start the frontend:

```bash
pnpm dev
```

Open:

```text
http://127.0.0.1:5173
```

## 5. Required Verification

Run component and build checks:

```bash
pnpm test
pnpm run build
```

Run browser checks:

```bash
pnpm exec playwright test
```

Run OpenDesign checks:

```bash
pnpm test:tokens
pnpm test:structure
pnpm test:visual
pnpm check:opendesign
```

Manual browser review:
- Desktop width around 1440 px.
- Tablet width around 768 px.
- Mobile width around 390 px.
- Keyboard navigation through nav, forms, filters, dialogs, menus, and action buttons.
- Reduced-motion preference.
- Long category names, high Rp amounts, many records, empty states, API errors, and validation errors.

## 6. Acceptance Evidence

For each route, record:
- Source screen used.
- Old TSX-rendered screen removed or replaced.
- Static samples replaced with live data.
- State coverage.
- Intentional rendered differences and rationale.
- Commands run.
- Browser viewports checked.

Use the template in [contracts/ui.md](./contracts/ui.md).

Current evidence files:
- [source-inventory.md](./artifacts/source-inventory.md)
- [acceptance-records.md](./artifacts/acceptance-records.md)
- [replacement-map.md](./artifacts/replacement-map.md)

## 7. Done Criteria

The branch is ready for task completion only when:
- Every covered route maps to its OpenDesign source screen.
- Old TSX-rendered screen layouts have been deleted or replaced.
- Live data bindings preserve WhySpend product meanings.
- Route acceptance records exist.
- Automated and rendered checks pass.
- README and Spec Kit artifacts describe any new commands, behavior, or verification outcomes.
