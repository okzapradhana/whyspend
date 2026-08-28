# WhySpend Design System

WhySpend uses the Serene Union design system. This document is the human-readable source of truth for palette, typography, spacing, radii, elevation, and core component styling. OpenDesign screens are historical baseline evidence, but they do not override this token and accessibility contract. The live frontend implementation maps design tokens through CSS custom properties in `src/styles/app.css`.

## Token Reference

```yaml
name: Serene Union
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#424941'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#727970'
  outline-variant: '#c2c8be'
  surface-tint: '#416743'
  primary: '#416743'
  on-primary: '#ffffff'
  primary-container: '#7da67d'
  on-primary-container: '#153b1c'
  inverse-primary: '#a7d1a5'
  secondary: '#406373'
  on-secondary: '#ffffff'
  secondary-container: '#c3e8fb'
  on-secondary-container: '#466979'
  tertiary: '#615e57'
  on-tertiary: '#ffffff'
  tertiary-container: '#a09b93'
  on-tertiary-container: '#36332d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c2eec0'
  primary-fixed-dim: '#a7d1a5'
  on-primary-fixed: '#002107'
  on-primary-fixed-variant: '#294f2d'
  secondary-fixed: '#c3e8fb'
  secondary-fixed-dim: '#a7ccde'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#274b5b'
  tertiary-fixed: '#e8e2d9'
  tertiary-fixed-dim: '#cbc6bd'
  on-tertiary-fixed: '#1d1b16'
  on-tertiary-fixed-variant: '#494640'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin-mobile: 20px
  container-margin-desktop: 40px
  gutter: 16px
  stack-gap: 12px
  section-gap: 48px
```

## Brand And Style

The brand personality is rooted in harmony, transparency, and mutual support. Designed for couples navigating their financial journey together, the UI must feel like a shared sanctuary rather than a rigid accounting ledger.

The design style is Soft Minimalism. It prioritizes clarity and calm by using generous whitespace, a restricted but warm palette, and organic shapes. By removing aggressive borders and high-contrast tension, the design system reduces the financial anxiety often associated with money management. The emotional response should be shared clarity and gentle encouragement.

## Colors

The palette is inspired by natural, calming elements that support growth and stability.

- Primary, Sage Green: used for growth indicators, positive balances, and primary actions. It represents prosperity and calm.
- Secondary, Soft Blue: used for collaborative features, shared goals, and secondary interactive elements. It evokes trust and communication.
- Tertiary, Warm Sand: used as the primary surface color for containers and card backgrounds, providing a softer alternative to pure white to reduce eye strain.
- Neutral, Slate: reserved for typography and subtle iconography to ensure legibility without breaking the soft aesthetic.

Backgrounds should primarily use a very desaturated off-white, `#F9F8F6`, to maintain a paper-like warmth.

## Typography

Inter is selected for its legibility and modern, friendly proportions. The type scale is intentionally spacious to prevent information density from feeling overwhelming.

- Headlines use semi-bold weights to anchor the page.
- Body text uses standard weight with generous line heights so financial data is easy to scan.
- Numerical data uses Inter with tabular lining figures enabled so currency amounts align vertically in lists and tables.

## Layout And Spacing

The layout follows a fluid grid model with significant emphasis on safe zones, areas of inactivity that give content room to breathe.

- Mobile: 4-column grid with 20px side margins. Elements are mostly stacked vertically to maintain a simple, single-column focus.
- Desktop: 12-column grid centered within a maximum width of 1200px.
- Rhythm: all spacing is derived from an 8px base unit. Component internal padding should be generous, typically 24px or 32px, to reinforce the soft feel.

## Elevation And Depth

This design system avoids harsh shadows and high-contrast borders. Instead, it uses ambient shadows and tonal layering.

- Surfaces: main backgrounds are the lightest value. Cards and containers use Warm Sand or pure white.
- Shadows: use a long and soft approach with 20px to 40px blur, 5% to 8% opacity, and a slight tint of Primary Sage Green.
- Depth: only two levels of elevation are permitted, the base canvas and the floating interaction layer for cards and modals.

## Shapes

Shapes use high-radius corners to communicate safety and approachability.

- Standard elements: buttons and input fields use `0.5rem` or 8px radius.
- Containers: content cards and main navigation panels use `rounded-xl`, 1.5rem or 24px, to create friendly framing for data.
- Icons: rounded with `stroke-linecap: round` and `stroke-linejoin: round`, using a medium stroke weight to match the typography.

## Components

- Buttons: primary buttons use an 8px corner radius with a Sage Green background. Text is white or high-contrast slate. Avoid ghost buttons with borders; use soft-tinted backgrounds for secondary actions instead.
- Cards: the central component. Cards use a 24px corner radius and an ambient shadow. Do not use borders.
- Input fields: soft beige backgrounds with no borders in their default state. On focus, show a Soft Blue 2px glow rather than a hard stroke.
- Progress bars: used for savings goals. Use 12px height with fully rounded caps. Tracks use a very pale Primary color, and indicators use full Sage Green.
- Shared avatars: for the couple's profile, use overlapping circles with a 2px white cutout border to signify union and collaboration.
- Lists: transaction lists use 16px vertical padding per row and subtle horizontal dividers in a very light neutral tone.

## Consistency Contract

- Live product typography uses only 12, 14, 16, 18, 20, 24, 32, and 40px. Page titles are 32/40 on desktop and 24/32 on mobile.
- Financial values use Inter with tabular figures. Monospace is not used for currency.
- Controls, buttons, and filters use 8px corners; menus use 12-16px corners; cards and dialogs use 24px corners. Fully rounded shapes are reserved for navigation selections, statuses, avatars, progress tracks, and compact icon actions such as the mobile FAB.
- `PageHeader`, `Surface`, `Toolbar`, `TableFrame`, `EmptyState`, `LoadingState`, and `StatusChip` own shared geometry. Feature styles may arrange these primitives but must not redefine their core contract.
- Run `pnpm test:design-system` before completing UI work. The focused redesign spec and screenshot evidence live in `specs/005-design-system-consistency/` and `../../docs/screenshots/design-system-redesign/`.
