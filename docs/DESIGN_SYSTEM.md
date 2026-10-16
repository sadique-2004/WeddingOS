# WeddingOS — Design System & UI Standards

## 1. Objective

Establish and maintain one consistent, premium visual identity across the entire WeddingOS application.

WeddingOS is a modern wedding-management platform. Its interface should feel elegant, warm, trustworthy, polished, and easy to use.

Every new page, component, feature, and UI refinement must follow this design system. Do not create a separate visual style for individual modules.

## 2. Mandatory Brand Colors

Use only these approved brand colors unless the project owner explicitly approves a change.

- Deep Wine: `#4b030e`
- Primary Burgundy: `#6f0617`
- Accent Burgundy: `#a5172a`
- Champagne: `#e6bd81`
- Antique Gold: `#b88444`
- White: `#ffffff`
- Black: `#000000`

### Semantic color usage

- Primary actions: `#6f0617` with white text.
- Hover and selected states: use a darker or lighter approved burgundy, ensuring adequate contrast.
- Brand emphasis and decorative accents: `#a5172a`.
- Premium highlights, dividers and small decorative details: `#e6bd81` and `#b88444`.
- Main application surfaces: white.
- Alternative page sections: use white or a subtle neutral derived from the approved palette only when necessary.
- Main text: black or deep wine, selected according to contrast and hierarchy.
- Secondary text: use a sufficiently contrasting dark tone. Do not use low-contrast gold for small text.
- Champagne and gold buttons must use dark text where needed for accessibility.

Do not introduce unapproved blues, greens, purples, gradients, or unrelated accent colors. Functional error, success, and warning states must remain distinguishable and accessible; document any semantic colors required beyond the brand palette before introducing them.

## 3. Typography

Use two font families:

- Display and editorial headings: Cormorant Garamond.
- Product interface and body text: Inter.

Apply Cormorant Garamond to the landing-page hero, major marketing headings, wedding names, and selected editorial sections.

Apply Inter to navigation, dashboard headings, body text, forms, buttons, tables, metadata, guest management, and all functional UI.

Define font families centrally. Do not load fonts separately inside individual pages.

### Type scale

- Hero heading: 56–72 px desktop; 36–44 px mobile.
- Page heading: 32–40 px desktop; 26–32 px mobile.
- Section heading: 24–28 px.
- Card heading: 18–20 px.
- Body text: 14–16 px.
- Form labels and metadata: 12–14 px.
- Buttons and navigation: 14–16 px.

Use a line height of 1.1–1.2 for large headings and 1.5–1.7 for body text. Define reusable typography tokens rather than choosing arbitrary sizes.

## 4. Spacing and Layout

Use a 4 px spacing base.

Standard spacing values:
- 4 px: compact details.
- 8 px: closely related elements.
- 12 px: compact component spacing.
- 16 px: standard internal spacing.
- 24 px: card and section spacing.
- 32 px: page subsection spacing.
- 48 px and above: major section separation.

Use consistent content widths, page gutters, alignment, and vertical rhythm.

Keep dashboard content structured and information-dense without feeling crowded. Marketing pages may use more whitespace and larger editorial headings.

## 5. Components

Create and reuse shared components for:
- Buttons and links.
- Form inputs, textareas, selects, checkboxes and radio controls.
- Cards and statistic summaries.
- Page headings and section headings.
- Badges and status indicators.
- Dialogs and confirmation prompts.
- Toasts and feedback messages.
- Tables, pagination and empty states.
- Loading states and error states.
- Navigation, sidebars and responsive mobile menus.

### Component styling

- Cards: white background, subtle border, restrained shadow, 12–16 px radius.
- Inputs: approximately 44–48 px high, clear labels, consistent padding and visible focus states.
- Buttons: consistent heights, padding, typography, border radius, hover states, disabled states and loading states.
- Shadows: subtle and purposeful; avoid heavy shadows.
- Borders: understated and consistent.
- Icons: use Lucide consistently, with uniform stroke weight and sizing.
- Motion: use restrained transitions, typically 150–250 ms.

Do not duplicate component styles across pages when a shared component or token can be reused.

## 6. Page and Module Consistency

Apply the same design system to:
- Public landing and wedding website pages.
- Authentication and onboarding.
- Organizer dashboard.
- Wedding events.
- Family and guest management.
- RSVP and invitation workflows.
- Preparation checklist and tasks.
- Budget, expenses and vendor contacts.
- Wedding website customization.
- Photo gallery and moderation.
- Family check-in.
- Livestream information.
- Organizer and permission management.

Public wedding websites may have their own selected theme, but they must use the approved WeddingOS foundation and accessible design principles. Keep theme-specific styling separate from the main application design tokens.

## 7. Responsive Design

Support mobile, tablet and desktop.

- Start with responsive layouts, not fixed desktop-only widths.
- Stack cards and form fields appropriately on smaller screens.
- Make navigation usable on mobile.
- Prevent horizontal overflow.
- Provide a usable mobile treatment for tables and data-heavy interfaces.
- Keep touch targets comfortably sized.
- Test representative pages at mobile, tablet and desktop widths.

## 8. Accessibility and UI States

Every interactive component must have:
- Visible keyboard focus.
- Appropriate semantic HTML and accessible names.
- Sufficient text and control contrast.
- Clear disabled and loading states.
- Clear validation and error feedback.
- Appropriate empty states.
- Useful success or confirmation feedback when an action completes.

Do not rely on color alone to communicate status.

## 9. Engineering Requirements

Before implementing or changing UI:

1. Inspect the existing frontend structure, routing, installed packages, and Tailwind configuration.
2. Reuse the current stack and existing conventions.
3. Define centralized color, typography, spacing, radius, shadow, and component tokens.
4. Use the existing Tailwind setup and extend its configuration appropriately.
5. If the project uses CSS variables, define the shared design tokens there as well.
6. Avoid unnecessary dependencies, duplicate CSS, inline style proliferation, and page-specific design systems.
7. Do not replace the frontend architecture or rebuild unrelated pages when implementing a design-system change.
8. Preserve existing functionality, routing, API contracts, and documented product requirements.

## 10. Required Workflow for Every UI Task

For every new page or UI change:

1. Read this document first.
2. Inspect the relevant page and shared components.
3. Implement using existing design tokens and reusable components.
4. Check desktop, tablet and mobile layouts.
5. Check contrast, keyboard focus, forms, loading, empty, error and disabled states where applicable.
6. Run the relevant project checks and build.
7. Report the files changed, checks performed, any remaining issues, and any design-system exception.

Do not silently change brand colors, fonts, global spacing, shared components, or architecture.

## 11. Definition of Done

A UI task is complete only when:
- It follows this design system.
- It is visually consistent with existing WeddingOS pages.
- It works at relevant responsive sizes.
- It preserves required product behavior.
- It has appropriate interaction and feedback states.
- Relevant checks and builds pass.
- Any unavoidable exception is documented and explained.

**Golden rule:** Every WeddingOS page should look like it belongs to the same premium product, not like a separately generated template.