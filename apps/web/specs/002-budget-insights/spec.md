# Feature Specification: Category Budgets And Dashboard Trends

**Feature Branch**: `002-budget-insights`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Allow users to set budgets for expense categories through Settings, compare category spending to budget, show selected-month spending by category in a pie chart, show spending vs budget per category in a bar chart, show income vs expenses for the selected month, and show historical income vs expenses month over month in a line chart with legends."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Expense Category Budgets In Settings (Priority: P1)

As an authenticated household member, I want to set a maximum monthly budget for each expense category from Settings so the household has clear category-level spending targets before or during the month.

**Why this priority**: Category budgets are the foundation for knowing whether spending has exceeded the intended maximum. Without this, the dashboard cannot give reliable budget status.

**Independent Test**: Can be fully tested by opening Settings, creating expense categories, setting monthly budget amounts for them, changing one amount, removing one budget, and confirming the selected month shows the saved budget values.

**Acceptance Scenarios**:

1. **Given** a household has expense categories, **When** a member opens Settings and sets maximum monthly budgets for those categories, **Then** each category shows its saved budget for the selected month.
2. **Given** a category already has a monthly budget, **When** a member edits the amount, **Then** the category uses the updated amount for budget comparisons in that month.
3. **Given** a category has a budget that is no longer wanted, **When** a member removes the budget, **Then** that category is shown as having no budget and is excluded from budget variance totals.

---

### User Story 2 - Compare Spending Against Budgets (Priority: P2)

As a household member reviewing a month, I want to see actual category spending compared with each category budget in both readable totals and a bar chart so I can quickly identify categories that are over, under, or near their monthly limit.

**Why this priority**: This turns budgets into useful monthly feedback and directly answers whether a category has exceeded its maximum.

**Independent Test**: Can be fully tested by entering expenses in budgeted categories for one month and confirming the dashboard shows actual spending, budget, remaining or exceeded amount, status, and a spending-vs-budget bar chart for each category.

**Acceptance Scenarios**:

1. **Given** a category has a monthly budget and expenses below that amount, **When** the member views the dashboard, **Then** the category is marked under budget with the remaining amount.
2. **Given** a category has expenses exactly equal to its monthly budget, **When** the member views the dashboard, **Then** the category is marked at budget with zero remaining.
3. **Given** a category has expenses above its monthly budget, **When** the member views the dashboard, **Then** the category is marked over budget with the exceeded amount.
4. **Given** a category has no budget, **When** the member views the dashboard, **Then** the category still shows actual spending and is clearly labeled as not budgeted.
5. **Given** multiple categories have expenses and budgets, **When** the member views the bar chart, **Then** each category's spending and budget are represented with labels and readable numeric values.

---

### User Story 3 - Read Selected-Month Dashboard Charts (Priority: P3)

As a household member reviewing a selected month, I want dashboard charts for spending by category and income vs expenses so I can understand the month without manually calculating totals.

**Why this priority**: The dashboard is the primary monthly review surface and must answer both where spending went and how expenses compare to income.

**Independent Test**: Can be fully tested by creating a selected month with income and expense transactions across categories, then confirming the pie chart, category totals, and income-vs-expense totals match the source records.

**Acceptance Scenarios**:

1. **Given** a selected month has expense activity across categories, **When** the member opens the dashboard, **Then** the pie chart shows spending by category with labels that match readable numeric totals.
2. **Given** a selected month has income and expenses, **When** the member reviews the dashboard, **Then** they can see total income vs total expenses for that month.
3. **Given** a selected month has no expenses, **When** the member opens the dashboard, **Then** the pie chart area shows a clear empty state instead of a misleading chart.

---

### User Story 4 - Compare Income And Expenses Over Time (Priority: P4)

As a household member reviewing household history, I want a month-over-month line chart of income vs expenses with legends so I can see whether the household trend is improving or getting tighter over time.

**Why this priority**: Historical trend review helps the owner and spouse understand recurring patterns beyond the selected month.

**Independent Test**: Can be fully tested by creating transactions across multiple months and confirming the line chart plots income and expenses for each month with legends and values that match monthly totals.

**Acceptance Scenarios**:

1. **Given** transactions exist across multiple months, **When** the member opens the historical trend chart, **Then** income and expenses are shown month over month as separate labeled lines.
2. **Given** a month has income but no expenses, or expenses but no income, **When** the trend chart renders, **Then** the missing side is shown as zero or empty according to the chart legend without hiding the month.
3. **Given** the member reads the chart without relying on color, **When** they inspect the chart legend and labels, **Then** they can distinguish income from expenses.

---

### User Story 5 - Read Monthly Spending Stories (Priority: P5)

As a household member reviewing the selected month, I want short plain-language insight stories on the dashboard so I can understand what we spent most on, spent least on, and where the month needs attention without manually interpreting every chart or table.

**Why this priority**: Insight stories make the monthly review faster and calmer once the underlying budget, spending, and chart totals are available.

**Independent Test**: Can be fully tested by creating a month with multiple expense categories and confirming the dashboard produces accurate insight stories for highest spending, lowest non-zero spending, over-budget categories, and meaningful under-budget categories.

**Acceptance Scenarios**:

1. **Given** a month has expense activity in multiple categories, **When** the member opens the dashboard, **Then** the page shows a highest-spending story with the category name, actual amount, and share of monthly expenses.
2. **Given** a month has at least two categories with non-zero spending, **When** the member opens the dashboard, **Then** the page shows a lowest-spending story based on non-zero expense activity.
3. **Given** one or more categories are over budget, **When** the member opens the dashboard, **Then** the page shows the most important over-budget story using calm, specific language and the exceeded amount.
4. **Given** no category is over budget, **When** the member opens the dashboard, **Then** the page shows a useful positive budget story without using gamified rewards or guilt-driven messaging.

### Edge Cases

- If a category has expenses but no budget, the dashboard must not imply it is under budget.
- If a category has a budget but no expenses in the selected month, it must show the full budget as remaining.
- If there are no expenses in the selected month, insight stories must use an empty state instead of inventing comparisons.
- If there is only one month of data, the historical income-vs-expense line chart must still be readable and must not imply a trend that does not exist.
- If the selected range has months with no records, the historical chart must handle the gaps consistently without hiding the month labels.
- If two categories tie for highest spending, lowest non-zero spending, or budget variance, the system must sort by the tied amount first and then by category name alphabetically so results stay deterministic and amounts remain clear.
- If a budgeted category is renamed, archived, or deleted according to existing category rules, historical budget comparisons must remain understandable for months where the category had budget or expense activity.
- If an entered expense changes month, category, amount, owner, or household/shared scope, the affected monthly budget comparisons and insight stories must update accordingly.
- If very long category names are used, budget rows, story text, and chart labels must remain readable on desktop and mobile without clipped text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to set, edit, and remove a maximum monthly budget amount for each expense category available to their household through Settings.
- **FR-002**: Budget amounts MUST be associated with a month and expense category, and the selected month MUST determine which budget values are shown and compared.
- **FR-003**: When a new month starts, the system MUST make the household's latest category budget targets available as the default for that month while allowing the household to adjust individual category budgets for the selected month.
- **FR-004**: Budget amounts MUST accept valid positive money values and MUST prevent missing, negative, or non-money values from being saved as category budgets.
- **FR-005**: The dashboard MUST show, for each expense category with activity or a budget, the actual expense amount, budget amount when present, remaining or exceeded amount, and status: over budget, at budget, under budget, or not budgeted.
- **FR-006**: The dashboard MUST calculate category budget status from the selected month's expense records only, without mixing income, savings, or other months into expense budget comparisons.
- **FR-007**: The dashboard MUST show a household-level budget overview for the selected month, including total budgeted expenses, total actual expenses for budgeted categories, total remaining budget, and total exceeded budget.
- **FR-008**: Users MUST be able to identify which transaction records contributed to a category's actual spending when reviewing a budget status or insight story.
- **FR-009**: The dashboard MUST show spending by category for the selected month in a pie chart with readable labels and matching numeric totals.
- **FR-010**: Insight stories MUST include the category name, relevant amount, and comparison context needed to understand the story without reading the full chart first.
- **FR-011**: Insight stories MUST use calm, plainspoken language that informs household decisions without shame, alarmist framing, badges, streaks, or reward mechanics.
- **FR-012**: Budget comparisons and insight stories MUST respect household membership and authenticated access so only household members can view or change the household's budgets and dashboard details.
- **FR-013**: Budget data and derived monthly budget comparisons MUST remain available across sessions and must be traceable to the category budgets and expense records that produced them.
- **FR-014**: The feature MUST provide clear loading, empty, validation, error, and success feedback for budget editing and dashboard review.
- **FR-015**: The dashboard MUST show spending vs budget per expense category in a bar chart for the selected month.
- **FR-016**: The dashboard MUST show selected-month income vs expenses using totals derived from all income and expense categories.
- **FR-017**: The dashboard MUST show historical income vs expenses month over month in a line chart with legends.
- **FR-018**: The dashboard MUST provide monthly insight stories for the selected month, including highest expense category, lowest non-zero expense category when available, category over-budget attention when present, and meaningful under-budget or no-over-budget context when no category exceeds budget.

### User Experience & Design Requirements *(mandatory for UI features)*

- **UX-001**: The primary user action is setting or adjusting category monthly budgets from Settings without forcing spreadsheet-style data entry.
- **UX-002**: The dashboard's primary review action is understanding which categories need attention this month, then tracing the story or budget status back to category totals and transactions.
- **UX-003**: UI MUST support default, loading, empty, validation error, save success, save failure, and realistic long-category-name states.
- **UX-004**: UI MUST show household, authenticated member, and shared-versus-personal meaning clearly wherever budget status is shown alongside expense totals.
- **UX-005**: UI MUST distinguish budget, actual expenses, remaining amount, and exceeded amount with explicit labels and non-color indicators.
- **UX-006**: UI MUST avoid generic banking-dashboard styling, gamified guilt patterns, decorative charts, vague card grids, and spreadsheet mimicry as the primary experience.
- **UX-007**: UI MUST meet WCAG AA contrast, keyboard navigation, visible focus, responsive desktop/mobile layout, PWA behavior, and reduced-motion expectations.
- **UX-008**: Insight story text MUST be specific, short, and actionable enough for repeated monthly use, without marketing-style copy or guilt-driven wording.
- **UX-009**: Pie, bar, and line charts MUST include legends, labels, or accessible alternatives so color is not the only way to understand category, budget, income, or expense meaning.
- **UX-010**: Dashboard charts MUST sit beside readable numeric summaries; users must not need to interpret chart geometry to know the exact amounts.

### Key Entities *(include if feature involves data)*

- **Category Budget**: A maximum planned expense amount for a household expense category in a specific month, including the category, month, amount, and audit information needed to understand changes.
- **Budget Status**: The comparison for one category in one month, including budget amount when present, actual expense amount, remaining or exceeded amount, and status label.
- **Monthly Insight Story**: A plain-language summary derived from the selected month's spending and budgets, such as highest expense category, lowest non-zero expense category, over-budget attention, or under-budget context.
- **Dashboard Chart**: A visual summary for selected-month category spending, spending-vs-budget comparison, selected-month income-vs-expenses, or month-over-month income-vs-expenses trend.
- **Expense Category**: A household-created expense category used to classify expense records and group monthly budget comparisons.
- **Expense Record**: A financial record with owner, household scope, category, date/month, amount, and notes that contributes to actual category spending.
- **Household**: Shared finance workspace whose members can review and manage category budgets and dashboard summaries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A household member can set or update budgets for at least 10 expense categories for a selected month in under 3 minutes during usability testing.
- **SC-002**: 100% of tested category budget comparisons correctly identify under-budget, at-budget, over-budget, and not-budgeted states for the selected month.
- **SC-003**: Dashboard budget status updates are visible to users within 1 second after normal transaction or budget changes are saved for typical household data volumes of up to 2 members, 50 categories, 500 records in the selected month, and a 24-month historical trend range.
- **SC-004**: At least 90% of usability test participants can identify the highest-spending category and any over-budget category from the dashboard without opening the transaction list first.
- **SC-005**: 100% of insight stories in test scenarios cite the correct category and amount for the selected month.
- **SC-006**: Users can trace any budget status or insight story back to its contributing category totals or transaction records in no more than 2 interactions.
- **SC-007**: Desktop and mobile checks show no clipped budget amounts, overflowing category names, or unreadable insight story text at common viewport sizes.
- **SC-008**: Dashboard pie chart, bar chart, and income-vs-expense line chart values match source monthly totals in 100% of chart test scenarios.
- **SC-009**: A household member can identify selected-month income, selected-month expenses, and whether expenses exceed income within 10 seconds.

## Assumptions

- Budgets apply to expense categories only because the user need is to know when category expenses exceed a maximum budget.
- Budgets are monthly targets. The latest available category budget set becomes the default candidate for a new month, and users may adjust category budgets for any selected month. Removing a selected month's explicit budget removes only that explicit value; if an earlier budget exists, the UI may show it as an inherited candidate and must label it as inherited rather than saved for the selected month.
- Categories without budgets remain valid and visible in summaries as not budgeted.
- Insight stories are generated for the selected month, with the dashboard defaulting to the current month.
- Existing household membership, authentication, category, transaction, and monthly summary concepts remain in scope and are reused by this feature.
- Budget history should remain understandable for past months even when category names or availability change later.
