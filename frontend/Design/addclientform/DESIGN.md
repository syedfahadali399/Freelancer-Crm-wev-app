---
name: DevDesk
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#00113b'
  on-tertiary: '#ffffff'
  tertiary-container: '#002367'
  on-tertiary-container: '#5f8aff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  card-gap: 20px
  sidebar-width: 260px
---

## Brand & Style

This design system is built upon a **Corporate / Modern** aesthetic, tailored specifically for the independent professional. The visual narrative balances the reliability of enterprise-grade software with the agility required by freelancers. The style emphasizes high-density information management without cognitive overload, utilizing generous whitespace and a structured "surface-on-base" architecture.

The interface prioritizes utility and clarity, using a disciplined color application to guide the user's eye toward actionable data. By combining a "Deep Navy" structural foundation with "Actionable Indigo" interactions, the design system evokes a sense of established trust and technical precision.

## Colors

The palette is engineered for professional endurance, reducing eye strain during long working sessions. 

- **Structural Navy (#1E293B):** Reserved for persistent navigational elements like sidebars and top-level headers to provide a grounding frame for the application.
- **Actionable Indigo (#4F46E5):** The primary brand signal used for high-intent actions, primary buttons, and active selection states.
- **Surface Slate (#F8FAFC):** The canvas color, providing a crisp, high-contrast background for content cards.
- **Semantic Accents:** Emerald Green and Amber are used strictly for status indicators (e.g., "Paid," "Overdue") and data visualization to ensure immediate scannability of business health.

## Typography

This design system utilizes **Inter** across all levels to maintain a systematic, utilitarian feel. The hierarchy is established through weight rather than dramatic size shifts, keeping the UI compact and efficient.

- **Headlines:** Set in Semi-Bold (600) with slight negative letter-spacing to appear tighter and more "editorial" in dashboard headers.
- **Body Text:** Standardized at 14px for most data-heavy views to maximize information density while maintaining legibility.
- **Labels:** Used for table headers and form descriptors, often employing a medium weight (500) to distinguish them from user-inputted data.

## Layout & Spacing

The system employs a **Fixed Grid** model for the main content area, centered or constrained to a max-width (typically 1440px) to ensure optimal line lengths for data tables. 

- **Sidebar Navigation:** A fixed 260px left-hand rail manages the 6 core routes.
- **Rhythm:** A 4px baseline grid governs all spatial relationships. 
- **Padding:** Standardized 24px padding for main page containers and 16px to 20px for internal card padding.
- **Grouping:** Related form fields or data points use a 12px (small) or 16px (medium) gap to maintain logical proximity.

## Elevation & Depth

This design system uses **Tonal Layers** combined with **Ambient Shadows** to create a subtle 3D environment. 

1. **Level 0 (Base):** The Background (#F8FAFC).
2. **Level 1 (Card):** White (#FFFFFF) surfaces with a 1px border (#E2E8F0) and a very soft shadow (Y: 1px, Blur: 3px, Opacity: 0.05).
3. **Level 2 (Interaction):** Hover states and dropdowns use a more pronounced shadow (Y: 4px, Blur: 12px, Opacity: 0.1) to indicate they are floating above the grid.

Avoid heavy blacks in shadows; use a navy-tinted shadow color to maintain harmony with the primary palette.

## Shapes

The shape language is consistently **Rounded**, using an 8px (0.5rem) corner radius as the standard for almost all UI components.

- **Standard (8px):** Applied to cards, input fields, and primary buttons.
- **Large (16px):** Reserved for large modal containers or empty-state illustrations.
- **Pill:** Strictly used for status badges (e.g., "Active," "Paid") to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Actionable Indigo (#4F46E5) with white text. 8px radius.
- **Secondary:** White background with a 1px slate border and navy text.
- **Ghost:** No background or border, navy or muted text, used for less frequent actions.

### Cards
- Always use a white background.
- Include a subtle 1px border (#F1F5F9) to define edges against the light grey background.
- Headers within cards should have a thin bottom-border to separate title from content.

### Data Tables
- **Rows:** 56px minimum height for readability.
- **Headers:** Muted slate text, uppercase, 12px Medium.
- **Badges:** Use a "Light" version of the semantic color for the background (e.g., light green) with a "Dark" version for the text to ensure accessibility.

### Forms
- **Inputs:** 1px border (#CBD5E1), 8px radius. 
- **Focus State:** 2px ring of Professional Blue (#2563EB) with an offset.
- **Labels:** Positioned above the field, never inside as placeholders, using the Label-sm typography style.

### Navigation
- **Sidebar:** Deep Navy background. Active states should use a left-edge accent border (4px) in Actionable Indigo and a subtle background highlight.