# Product

## Register

product

## Users

WhySpend is for a household of two people who currently track monthly finances together. The primary users are the owner and spouse, who need a shared place to enter transactions, review category totals, compare spending against goals and budgets, and understand expenses, income, and savings without moving data between tools.

They currently use Money Manager on mobile to record expenses and category totals, then transfer monthly summaries into a spreadsheet. The app should replace that split workflow with one website both people can use directly.

## Product Purpose

WhySpend consolidates household expense tracking, monthly budget summaries, category aggregation, income tracking, savings tracking, and budget comparison into a single shared website.

Success means the users no longer need to maintain the monthly spreadsheet manually or cross-check category totals from Money Manager. They should be able to enter transactions, classify spending, configure category budgets, see monthly totals by category and person, track income and savings, and understand tradeoffs against shared goals from one place.

## Identity & Data

WhySpend must support real user accounts. Account creation must ask for Display Name, Email, and Password. Person A and Person B from the spreadsheet are placeholder names only; the product should use the authenticated users' actual identities and household membership instead.

Each user's expenses, income, savings, categories, and monthly summaries must be persisted in PostgreSQL. Financial records should preserve who owns the record, whether it belongs to the household/shared scope, the category, month, amount, type, notes, and timestamps needed for auditability.

Authentication and authorization must use JWTs for API calls. Passwords are accepted only during registration/login and stored under the user password field as a protected credential value, not sent with normal API requests.

## Category Reference

The spreadsheet provides acceptable category examples, especially for expenses, but the product should start from scratch rather than automatically importing the sheet into the website. Users must be able to add, update, and delete their own income categories, expense categories, and savings goal categories.

Expense category lists and expense category budgets must be configured through Settings. Transaction entry should use the configured category or savings goal list instead of relying on free-text category entry.

Income category examples:

- Income Total Person A
- Income Total Person B
- Other Income

Shared expense category examples:

- Electricity
- WiFi
- Kebutuhan Dapur
- Gas & Air
- Household
- Home Maintenance

Personal expense category examples:

- Subscription
- Entertainment
- Sedekah
- Paket data
- Transport (member parking)
- Transport (e-money)
- Transport (bensin)
- Skincare
- Shopping
- Treats
- Holiday
- Gift
- Family needs
- Others
- Health
- Kebutuhan Dapur
- Household
- Sport
- WiFi
- Electricity
- Home Maintenance
- Gas & Air

Savings category examples:

- Emas
- Cicilan rumah
- Cicilan Tanah
- Cicilan Handphone

## Brand Personality

Calm, clear, and practical.

The product should reduce the anxiety and friction of household money tracking. It should feel trustworthy and direct, but not like a bank, corporate finance dashboard, or gamified budgeting app. The tone should be plainspoken, supportive, and specific.

## Product Scope

Core workflows:

1. Create an account with display name, email, and password.
2. View the transaction list for a selected month.
3. Add, update, and delete savings goal categories.
4. Add, update, and delete savings transactions that are not expenses.
5. Add, update, and delete expense categories.
6. Add, update, and delete expense transactions.
7. Set a budget for each expense category.
8. Add, update, and delete income categories.
9. Add, update, and delete income transactions.
10. Compare each category's spending against its budget.
11. View a dashboard pie chart of spending by category for a selected month.
12. View a dashboard bar chart comparing spending vs. budget by category.
13. Input income for a selected month.
14. View income vs. expenses for a selected month.
15. View historical income vs. expenses month over month in a line chart with legends.

Transaction forms should stay consistent across record types:

- Expense: Date defaulting to today, Amount in Rp, Category, optional Notes.
- Savings: Date defaulting to today, Amount in Rp, Goal, optional Notes.
- Income: Date defaulting to today, Amount in Rp, Category, optional Notes.

The system may still preserve authenticated owner and household scope behind the scenes where required for data integrity, but the main form should not feel heavier than these user-visible fields.

## Navigation And Settings

Pages and menus must be reachable through a toggleable hamburger menu so the same navigation model works on desktop and mobile. The menu should expose the main product areas: dashboard, transactions, and Settings.

Settings owns household configuration that should not interrupt fast transaction entry, especially expense categories, expense category budgets, income categories, and savings goal categories.

## Anti-references

Avoid generic banking-dashboard styling: navy corporate panels, institutional fintech tone, over-polished wealth-management cues, and decorative charts that do not help users make decisions.

Avoid gamified budgeting patterns: badges, streak pressure, mascot-heavy coaching, or guilt-driven messaging.

Avoid spreadsheet mimicry as the primary experience. Tables are useful for detail, but the product should organize work around household finance tasks, not around copying a sheet layout.

## Design Principles

1. Show the monthly picture first: income, expenses, savings, budgets, and remaining tradeoffs should be visible without manual calculation.
2. Make category work painless: transaction entry, categorization, and monthly category totals should replace the Money Manager to spreadsheet handoff.
3. Support two-person household tracking: the interface should make shared expenses, each authenticated member's records, and household-level totals easy to compare.
4. Prefer calm decisions over shame: highlight tradeoffs, subscriptions, and savings impact without guilt or alarmist language.
5. Keep familiar controls familiar: use standard product UI patterns for hamburger navigation, Settings, forms, tables, filters, charts, and states so the tool feels reliable under repeated monthly use.

## Accessibility & Inclusion

Use WCAG AA as the baseline. Body text, form labels, placeholders, charts, and category colors must meet accessible contrast requirements. The website must support keyboard navigation, visible focus states, reduced-motion preferences, responsive layouts, and clear non-color indicators for chart/category meaning.

The website must work clearly on desktop and mobile, with no broken UI, clipped controls, or text overflow. It should also behave as a PWA so the household can use it from phone home screens with an app-like experience.
