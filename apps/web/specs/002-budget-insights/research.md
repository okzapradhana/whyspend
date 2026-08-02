# Research: Category Budgets And Dashboard Trends

## Decision: Use Tailwind CSS with project-owned Serene Union components

**Decision**: Use Tailwind CSS as the implementation layer for the Serene Union design system. Build or refactor project-owned components for hamburger navigation, forms, tables, cards, settings rows, dialogs, skeletons, chart frames, and status states. Do not introduce shadcn/ui components for this feature.

**Rationale**: `DESIGN.md` is strict and specific about Serene Union colors, 24px containers, borderless cards, soft beige inputs, ambient shadows, Soft Blue focus glow, spacing, and tone. Tailwind can encode these tokens directly while keeping component ownership in the repo. This avoids fighting default component-library aesthetics during implementation.

**Alternatives considered**:
- Continue with only custom CSS: lowest dependency risk, but harder to keep token use consistent across Settings, dashboard charts, tables, and responsive states.
- Adopt shadcn/ui wholesale or selectively: rejected for this feature because too many defaults conflict with `DESIGN.md` and would require substantial restyling before use.

## Decision: shadcn/ui is not adopted for this feature

**Decision**: Do not install or generate shadcn/ui components for this feature.

Identified gaps:
- Default aesthetics do not encode Serene Union's warm-sand surfaces, Sage Green/Soft Blue roles, 24px card/navigation radii, borderless cards, ambient sage-tinted shadows, or soft beige borderless inputs.
- Default Card and Table patterns commonly lean on borders, while `DESIGN.md` requires tonal layering and ambient depth.
- Default Input styling uses visible borders, while WhySpend inputs require soft beige backgrounds with Soft Blue focus glow.
- Chart wrappers still require WhySpend-specific legends, non-color labels, exact numeric summaries, empty states, and drill-down behavior.
- shadcn does not provide budget validation, budget rollover defaults, trend aggregation, transaction drill-down, JWT authorization, PostgreSQL persistence, or calm insight copy.
- Adding shadcn would increase migration scope beyond Tailwind token setup by adding generated components and extra primitive dependencies that still need heavy customization.

**Rationale**: The evaluated gaps are large enough that shadcn would not materially reduce implementation risk for this feature. Tailwind plus project-owned components keeps the system closer to `DESIGN.md`.

**Alternatives considered**:
- Use shadcn only for Sheet/Dialog primitives: rejected for now to avoid mixed component vocabulary and generated-component drift.
- Convert `DESIGN.md` to default shadcn tokens: rejected because `DESIGN.md` is the requested source of truth.

## Decision: Serene Union token mapping is mandatory in Tailwind

**Decision**: Map `DESIGN.md` tokens into CSS variables and Tailwind theme values before building feature UI. Do not build budget/dashboard components against default Tailwind neutral palettes.

**Rationale**: The design system requires specific color roles, typography, spacing, radii, and elevation. Token mapping prevents drift between custom CSS and generated components.

**Alternatives considered**:
- Style individual components ad hoc without Tailwind tokens: rejected because it invites inconsistent component vocabulary.
- Use the recent dark shell redesign as the base: rejected because it conflicts with DESIGN.md's Soft Minimalism, warm surfaces, and sanctuary-like tone.

## Decision: Store category budgets by household, expense category, and month

**Decision**: Add persisted CategoryBudget records keyed by household, expense category, and month. Budgets apply only to expense categories. For a month without an explicit budget, the API should expose the latest previous budget as the default candidate while clearly distinguishing explicit saved values from inherited defaults.

**Rationale**: The spec requires month-specific comparisons and latest-budget defaults for new months. Persisting budgets separately from categories preserves historical review when categories are renamed or archived.

**Alternatives considered**:
- Store budget directly on Category: rejected because budgets need month-specific history.
- Store only monthly dashboard snapshots: rejected because budget edits and transaction changes must remain traceable to source records.

## Decision: Extend monthly summary and add bounded historical trend contract

**Decision**: Extend the existing monthly summary contract with budget status, selected-month chart series, and insight stories. Add a separate historical income-vs-expenses endpoint with explicit `fromMonth` and `toMonth` query bounds.

**Rationale**: Selected-month dashboard data belongs with the existing monthly summary because it shares month filtering and traceability. Historical trends span multiple months and need explicit bounds to avoid unbounded API work.

**Alternatives considered**:
- One dashboard endpoint for everything: simpler frontend call, but mixes selected-month and historical concerns and makes cache/test boundaries weaker.
- Compute chart data entirely on the frontend: rejected because derived finance totals should be reproducible and contract-tested at the API boundary.

## Decision: Settings owns budget configuration

**Decision**: Put expense category list management and expense category budget configuration under Settings. The dashboard may link to budget editing but should not make dashboard review the primary editing surface.

**Rationale**: PRODUCT.md says Settings owns household configuration that should not interrupt fast transaction entry. This also keeps transaction forms small and repeated monthly review calm.

**Alternatives considered**:
- Inline budget editing on every dashboard row: convenient, but risks turning monthly review into spreadsheet-like editing.
- Budget fields in transaction entry: rejected because it makes fast entry heavier.

## Decision: Chart values must be readable without geometry interpretation

**Decision**: Pie, bar, and line charts must always sit beside numeric summaries, legends, or accessible alternatives. Color cannot be the only distinction between income/expense, spending/budget, or categories.

**Rationale**: Constitution and DESIGN.md require charts that clarify decisions and meet WCAG AA, including non-color meaning.

**Alternatives considered**:
- Chart-only dashboard cards: rejected because exact finance values must be readable and traceable.

## Sources

- Tailwind CSS Vite guide: https://tailwindcss.com/docs/installation/using-vite
- shadcn/ui Vite installation evaluated for gap analysis: https://ui.shadcn.com/docs/installation/vite
- shadcn/ui chart docs evaluated for gap analysis: https://ui.shadcn.com/docs/components/chart
