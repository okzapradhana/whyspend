# Phase 0 Research: OpenDesign Website Redesign

## Decision: Keep The Current React/Vite Stack

**Decision**: Implement the redesign in the existing React TSX + Vite + TypeScript frontend with React Router, Tailwind CSS 4, CSS custom properties, lucide-react, and Recharts, while directly porting the OpenDesign HTML/CSS structure into that stack.

**Rationale**: The user explicitly requested the current tech stack and clarified that the OpenDesign HTML and CSS files are the design to use directly. The product already has authenticated routes, API clients, PWA behavior, chart components, tests, and feature modules. Porting the reference HTML/CSS into TSX preserves application state, authorization, data integrity, and verification coverage without serving static prototype pages.

**Alternatives considered**:
- Ship OpenDesign static HTML directly. Rejected because it would bypass auth, API data, PWA behavior, routing, tests, and real household records.
- Introduce a new component framework. Rejected because the prior budget-insights plan already rejected shadcn/ui for Serene Union gaps, and a new framework would add visual drift.
- Adjust the prior WhySpend UI toward OpenDesign. Rejected because it preserves old layout/component decisions and does not meet the clarified expectation for a direct HTML/CSS design port.

## Decision: Use OpenDesign `screens/` And `assets/app.css` As The Primary Reference

**Decision**: Treat the current OpenDesign `screens/` HTML files, `assets/app.css`, `brand-spec.md`, and generated screenshots as the binding reference set. Earlier root-level generated variants are secondary references. The `screens/*.html` files provide the source layout and component structure; `assets/app.css` provides the source selector vocabulary and visual behavior.

**Rationale**: The package contains multiple generations. The `screens/` directory provides a coherent prototype set for dashboard, transactions, savings goals, Settings, login, and signup with a shared CSS file. Using this as the primary reference prevents mixing incompatible iterations and prevents reinterpretation through older WhySpend layout patterns.

**Alternatives considered**:
- Use every generated HTML file equally. Rejected because it creates conflicts such as old names, old layout experiments, and earlier visual directions.
- Use only `DESIGN.md`. Rejected because the user specifically asked to follow the OpenDesign HTML/CSS references.
- Use screenshot similarity while keeping old markup. Rejected because visual similarity alone can hide layout, spacing, interaction, and component-vocabulary drift from the source HTML/CSS.

## Decision: Directly Port Source Markup Before Wiring Live Data

**Decision**: For each screen, first translate the corresponding OpenDesign HTML into TSX with the same semantic hierarchy, primary class names, layout wrappers, button/card/form/table structures, and responsive navigation model. After the TSX structure matches the source, replace static sample text and values with live WhySpend data, React state, API calls, and accessibility behavior.

**Rationale**: This sequencing keeps the implementation anchored to the actual OpenDesign design instead of the existing WhySpend component tree. It also makes intentional differences easier to review because each difference is visible against a source selector or `data-od-id`.

**Alternatives considered**:
- Start from existing route components and tune CSS until screenshots look closer. Rejected because the prior pass showed that this under-ports layout and component structure.
- Paste static HTML into React routes without adapting it. Rejected because production screens need React state, router links, API data, keyboard behavior, accessible forms, and PWA compatibility.

## Decision: Convert OpenDesign CSS Into The Project Styling Layer

**Decision**: Use OpenDesign `assets/app.css` as the base CSS source for variables, selectors, layout primitives, component classes, responsive rules, and interaction states. Convert it into `src/styles/app.css`, Tailwind utility usage, and reusable design-system primitives only where doing so preserves class behavior and improves maintainability in React.

**Rationale**: The existing app already uses CSS custom properties and Tailwind is installed. Treating OpenDesign CSS as the base implementation vocabulary preserves color, spacing, radius, typography, focus, shadow, layout, and state behavior. Tailwind can support the port, but it must not replace source classes with old project styling assumptions.

**Alternatives considered**:
- Paste OpenDesign CSS wholesale without review. Rejected because React routes still need scoped state behavior, accessibility fixes, and integration with existing global resets.
- Rewrite all styling from scratch. Rejected because it would weaken strict adherence to the reference.
- Keep only token parity and write new selectors. Rejected because token parity alone does not preserve layout, button, card, form, or responsive behavior.

## Decision: Preserve Existing API And Data Contracts

**Decision**: Redesign presentation and interaction only. Use existing auth, household, transaction, category, budget, summary, and PWA client contracts unless the implementation discovers a missing field already required by prior specs.

**Rationale**: The design reference uses sample data, but WhySpend production screens must show authenticated household data and traceable totals. No new storage behavior is required to convert the UI.

**Alternatives considered**:
- Add new API endpoints for the redesign. Rejected unless existing screens cannot display already-defined product data.
- Hard-code reference sample data. Rejected because it would fail product integrity and real household use.

## Decision: App Shell First, Then Screen Conversion

**Decision**: Build and validate the desktop/mobile app shell first by directly porting the shared shell HTML/CSS from `screens/*.html`, then convert Dashboard, Transactions, Settings, Savings Goals, and Auth surfaces screen by screen.

**Rationale**: Navigation, layout, token application, focus behavior, and responsive behavior are shared across every screen. A shell-first slice gives a useful MVP and reduces repeated page-level churn, but it must still start from the OpenDesign shell markup and CSS rather than the prior app shell.

**Alternatives considered**:
- Convert one full page at a time before the shared shell. Rejected because it risks inconsistent component vocabulary and repeated CSS decisions.
- Preserve the current app shell and only update colors/spacing. Rejected because the clarified design target is the OpenDesign shell and layout.

## Decision: Reference Comparison Is A Required Verification Step

**Decision**: Each delivered screen must be compared against the OpenDesign source package, with intentional differences recorded in the UI contract or implementation notes. Verification must include source-structure review, not only screenshot review.

**Rationale**: The user requested strict adherence. Browser screenshots, responsive checks, source selector mapping, and a screen-by-screen reference checklist give concrete evidence beyond subjective review.

**Alternatives considered**:
- Rely only on unit tests and build checks. Rejected because they cannot detect visual drift, contrast problems, or source-reference mismatch.
- Rely only on visual snapshots. Rejected because screenshots can pass while TSX preserves the wrong DOM hierarchy, class vocabulary, or interaction model.
