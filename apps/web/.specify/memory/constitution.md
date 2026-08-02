<!--
Sync Impact Report
Version change: 1.1.0 -> 1.2.0
Modified principles:
- III. Product UI Anti-Slop Gates: expanded to require responsive desktop/mobile and PWA behavior
- IV. Data Integrity And Shared Ownership: updated to require JWT API authorization, password field naming, PostgreSQL persistence, and user-created categories without spreadsheet import/setup
Added sections:
- None
Removed sections:
- None
Templates requiring updates:
- .specify/templates/spec-template.md: updated
- .specify/templates/plan-template.md: updated
- .specify/templates/tasks-template.md: updated
- .specify/templates/checklist-template.md: updated
- .specify/templates/commands/*.md: not present in this installation
- PRODUCT.md: updated
Follow-up TODOs:
- None
-->
# WhySpend Constitution

## Core Principles

### I. Household Finance Workflow First

Every feature MUST reduce the current two-tool workflow: recording expenses in
Money Manager, reading monthly category totals, and transferring summaries into
a spreadsheet. Features MUST be framed around household finance jobs:
transaction entry, category aggregation, income tracking, savings tracking,
monthly review, shared expenses, and person-specific spending. Features that
only reproduce spreadsheet structure without reducing workflow friction are not
acceptable.

Rationale: WhySpend exists to consolidate a painful household workflow into one
shared website for two people.

### II. Specified And Independently Testable Slices

Every feature spec MUST define prioritized user stories with independent tests,
acceptance scenarios, measurable outcomes, edge cases, and explicit assumptions.
Each implementation plan MUST preserve the ability to build and validate the
highest-priority story as a useful MVP before lower-priority stories are added.

Rationale: The project needs predictable delivery and MUST NOT depend on a
large, ambiguous build before any household value is visible.

### III. Product UI Anti-Slop Gates

Every user-facing feature MUST follow PRODUCT.md and the product register from
Impeccable. Specs and plans for UI work MUST define the primary user action,
required states, realistic data ranges, accessibility expectations, and
anti-references before implementation. Generic banking dashboards, decorative
finance charts, gamified guilt patterns, spreadsheet mimicry as the primary
experience, vague card grids, weak contrast, text overflow, and inconsistent
component vocabulary are blocking defects. The website MUST be responsive for
desktop and mobile, with no broken UI, clipped controls, or text overflow, and
MUST provide PWA behavior for app-like household use on mobile devices.

Rationale: Predictable outcomes require an explicit design contract, not an
implicit hope that implementation will look polished.

### IV. Data Integrity And Shared Ownership

Financial data features MUST preserve clear ownership and meaning for each
record: authenticated user, household membership, household/shared scope,
category, month, amount, type, and notes where applicable. Person A and Person B
are spreadsheet placeholders only; product data MUST use real authenticated
users and household membership. Authentication and authorization MUST use JWTs
for API calls. Passwords MUST only be accepted during registration/login and the
user credential field MUST be named password in the data model while preserving
normal secure password handling. Income, expenses, savings, budgets, actuals,
and differences MUST not be mixed without explicit labels. Derived totals MUST
be traceable back to the records or categories that produced them. Shared
household use MUST avoid ambiguous ownership, accidental double counting, and
silent formula drift.

All expense, income, savings, category, and monthly summary data MUST be
persisted in PostgreSQL. Spreadsheet-derived categories are reference examples,
not automatic setup data; the product MUST allow households to start from scratch and
create, update, and delete their own categories while preserving type, ownership
scope, and reporting behavior.

Rationale: The current spreadsheet already exposes aggregation and formula-risk
problems; the product must make totals trustworthy.

### V. Verification Before Done

No feature is done until its stated acceptance scenarios and quality gates are
verified. UI work MUST include responsive checks, keyboard/focus checks, visible
loading/empty/error states, contrast checks, and inspection in a browser or
equivalent rendered environment. Data work MUST include tests or deterministic
checks for aggregation, category totals, monthly boundaries, and person/shared
expense separation.

Rationale: A finance tool fails if it looks plausible but calculates or behaves
incorrectly.

## Product Constraints

WhySpend is a product application, not a marketing site. Product UI MUST favor
calm, clear, practical interactions over decorative impact. Interfaces SHOULD
use familiar controls for forms, tables, filters, tabs, charts, and settings.
Charts MUST clarify decisions and totals; they MUST NOT exist only as visual
decoration.

The default accessibility baseline is WCAG AA. Color MUST NOT be the only way to
distinguish category, status, income, expense, or savings meaning. Motion MUST
respect reduced-motion preferences and must communicate state rather than
decorate the page.

## Development Workflow And Quality Gates

The required workflow is:

1. Capture product intent in PRODUCT.md before design or implementation work.
2. Use Spec Kit to create or update spec.md, plan.md, and tasks.md for features.
3. For UI features, use Impeccable shape, craft, audit, or polish as appropriate
   before considering implementation complete.
4. Keep user stories independently demonstrable and testable.
5. Run the feature's verification steps before reporting completion.

Constitution Check entries in plan.md MUST explicitly state how the feature
satisfies each core principle. Any violation MUST include a written
justification and a simpler alternative that was rejected.

## Governance

This constitution supersedes informal project habits and generic template
defaults. Any generated spec, plan, task list, checklist, or implementation that
conflicts with this constitution MUST be corrected before work continues.

Amendments require:

1. Updating this file with a Sync Impact Report.
2. Bumping the version using semantic versioning.
3. Updating dependent templates and guidance files in the same change.
4. Recording any intentionally deferred follow-up work in the Sync Impact Report.

Versioning rules:

- MAJOR: incompatible governance changes or removal/redefinition of principles.
- MINOR: new principles, new mandatory gates, or materially expanded scope.
- PATCH: clarifications, wording fixes, or non-semantic corrections.

Compliance is reviewed during specification, planning, task generation, and
implementation completion. Optional automation may assist, but the agent or
engineer performing the work remains responsible for checking compliance.

**Version**: 1.2.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-05-31
