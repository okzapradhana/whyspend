# Feature Specification: Design-system consistency redesign

## User stories

### Monthly review stays visually consistent (P1)

As a household member, I can move between dashboard, transactions, savings goals, and settings without relearning typography, controls, surfaces, or actions.

**Independent test:** At desktop and mobile widths, each route uses the same page-title scale, month-control treatment, card radius, focus treatment, and responsive shell without horizontal overflow.

### Forms and state changes stay predictable (P1)

As a household member, I can add or edit financial records with consistent labels, dialogs, loading, empty, error, disabled, and focus states.

**Independent test:** Open transaction, savings, and category dialogs with keyboard controls and verify focus, Escape return, field labels, errors, and action placement.

### Authentication and secondary routes feel connected (P2)

As a household member, authentication, recovery, setup, invitation, support, privacy, and terms screens use the same Serene Union typography and controls as the signed-in product.

## Requirements

- Preserve routes, navigation labels, field names/order, copy meaning, logo, Inter, Lucide, and the light-only Serene Union palette.
- Use the 12/14/16/18/20/24/32/40px type scale, tabular Inter numerals, 8px controls/buttons/filters, 12-16px menus, and 24px cards/dialogs. Reserve fully rounded shapes for navigation selections, statuses, avatars, progress tracks, and compact icon actions such as the mobile FAB.
- Provide one ambient card elevation and one overlay elevation.
- Keep a visible desktop transaction action and the mobile transaction FAB.
- Remove decorative hard-coded household-member initials from savings UI.
- Do not alter APIs, database schemas, finance calculations, or inactive routes/components.

## Success criteria

- Automated design validation reports no undefined variables, duplicate core selectors, unsupported live type/radius values, or feature-level color literals.
- Typecheck, production build, unit/component tests, responsive checks, and 30 matching before/after screenshot pairs complete.
- Keyboard focus, Escape handling, reduced motion, contrast, and 320px horizontal overflow checks pass.

## Assumptions

- Light-only is explicitly approved for this preserve-mode redesign.
- Browser-intercepted fixtures provide deterministic review data without reading or creating remote records. Evidence must contain only the fixture identity `Design review`, household `Review household`, and synthetic financial records.
