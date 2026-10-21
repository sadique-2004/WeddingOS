# WeddingOS — UI Design System & Component Guidelines

> **Document ID:** `DOC-05`  
> **Status:** Production Design Tokens & Component Library  
> **Aesthetic Theme:** Royal Indian Heritage & Modern Elegance  
> **Reference File:** Original `docs/DESIGN_SYSTEM.md` | Core Styles: `apps/web/src/index.css`

---

## 1. Visual Philosophy & Design Principles

WeddingOS balances **opulent Indian regal heritage** (evoking Udaipur palace mandaps, zari embroidery, and ceremonial marigolds) with **ultra-clean modern SaaS productivity** (high-contrast tables, tactile buttons, and micro-animations).

### Core Tenets:
1. **Never Generic:** Avoid plain bootstrap reds, blues, or sterile grays. Use curated jewel tones (Crimson, Zari Gold, Midnight Indigo).
2. **Harmonious Typography:** Pair luxury serif headings (*Cormorant Garamond*) for ceremonial emotion with crisp sans-serif fonts (*Inter / Outfit*) for dense planning data.
3. **Glassmorphism & Depth:** Soft drop shadows (`shadow-xs`, `shadow-2xs`), subtle borders (`border-[#e6bd81]/40`), and warm ivory card surfaces (`bg-[#fdfbf7]`).
4. **Mobile Ergonomics:** Touch targets of at least 44px on mobile phones, bottom action sheets, and sticky CTA bars.

---

## 2. Color Palette & Design Tokens

```
                    WEDDINGOS LUXURY COLOR PALETTE
┌───────────────────┬───────────────────┬───────────────────┐
│   ROYAL CRIMSON   │     ZARI GOLD     │    PEARL IVORY    │
│  Primary Luxury   │  Accent & Borders │  Surface & Card   │
│   #4b030e (Deep)  │   #b88444 (Base)  │   #faf7f2 (Base)  │
│  #6f0617 (Accent) │  #e6bd81 (Light)  │  #fdfbf7 (Light)  │
└───────────────────┴───────────────────┴───────────────────┘
```

### 2.1 Color Tokens Reference
| Token Name | Hex Code | Tailwind Equivalent / Usage |
|---|---|---|
| **Deep Velvet Crimson** | `#4b030e` | Main page headings, dark luxury banners, primary brand accents |
| **Royal Crimson Accent**| `#6f0617` | Primary buttons, active navigation tabs, key CTA badges |
| **Zari Gold Base**      | `#b88444` | Icons, divider borders, subtle text highlights |
| **Zari Gold Shimmer**   | `#e6bd81` | Outer borders, input focus rings, tag outlines |
| **Warm Sand Gold**      | `#85531d` | Category pills, contrast subtitle badges |
| **Pearl Ivory Canvas**  | `#faf7f2` | App background, subtle table row zebra-striping |
| **Warm Silk White**     | `#fdfbf7` | Card surfaces, modal sheets |
| **Charcoal Slate**      | `#1c1917` | High-contrast body copy and form inputs |
| **Emerald Confirmed**   | `#059669` | Confirmed RSVPs, Paid expense badges, Live status |
| **Amber Pending**       | `#d97706` | Pending RSVPs, Advance paid status, Draft badges |
| **Ruby Critical**       | `#dc2626` | Critical priority tasks, Declined RSVPs, Delete alerts |

---

## 3. Typography Hierarchy

### 3.1 Font Families
- **Display & Headings:** `font-cormorant` (*Cormorant Garamond*, 600/700 weight). Used for `h1`, `h2`, ceremony cards, and public website hero sections.
- **Body & Data:** `font-sans` (*Inter / system-ui*). Used for forms, tables, timestamps, button labels, and checklist items.
- **Monospace:** `font-mono`. Used for invitation tokens, URL slugs, and budget calculations.

### 3.2 Scale & Line Heights
- `text-3xl` / `text-4xl` (32px - 40px): Page titles (e.g., "Wedding Website & Themes").
- `text-xl` / `text-2xl` (20px - 24px): Card headers and ceremonial titles.
- `text-sm` (14px): Standard input fields, table data, body text.
- `text-xs` (12px): Subtitles, helper text, and secondary action buttons.
- `text-[10px]` / `text-[11px]`: Uppercase badge pills and timestamp metadata.

---

## 4. Reusable UI Components

### 4.1 Card Container (`Card.tsx`)
```tsx
<div className="bg-white p-5 rounded-3xl border border-[#e6bd81]/40 shadow-xs hover:border-[#b88444]/60 transition-all">
  {children}
</div>
```

### 4.2 Primary Action Button
```tsx
<button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4b030e] to-[#6f0617] hover:from-[#3a0208] hover:to-[#540411] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer">
  <Sparkles className="w-3.5 h-3.5 text-[#e6bd81]" />
  <span>Save Changes</span>
</button>
```

### 4.3 Secondary / Ghost Button
```tsx
<button className="px-3.5 py-2 rounded-xl bg-white border border-[#e6bd81]/60 hover:bg-[#faf4ec] text-[#4b030e] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
  <ExternalLink className="w-3.5 h-3.5 text-[#b88444]" />
  <span>Open Preview</span>
</button>
```

### 4.4 Status Badge Pills
- **Live / Active:** `bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`
- **Draft / Pending:** `bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`
- **Critical / Declined:** `bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`

---

## 5. Public Website Theme Variants

The Website Studio (`/app/website`) supports 3 pre-built design themes that transform the public portal (`/w/:slug`):

1. **Classic Indian Heritage:**
   - Dominant Colors: Royal Crimson (`#4b030e`), Zari Gold (`#b88444`), Pearl Ivory (`#faf7f2`).
   - Mood: Vedic palace, grand mandap, traditional sangeet elegance.
2. **Minimal Elegant:**
   - Dominant Colors: Charcoal Slate (`#1c1917`), Stone Grey (`#78716c`), Warm Silk (`#fcfbf9`).
   - Mood: Editorial, understated luxury, contemporary aesthetic.
3. **Modern Celebration Night:**
   - Dominant Colors: Midnight Navy (`#0b1329`), Starry Champagne Gold (`#e6bd81`), Deep Slate (`#1e293b`).
   - Mood: Cocktail soiree, after-party, dramatic night lighting.

---

## 6. Guidelines for Stitch UI Generation

When using **Google Stitch** or AI tools to generate new screens for WeddingOS, prepend the prompt with this design system context:

> *"Generate a luxury Indian wedding management screen using the WeddingOS Design System. Use Tailwind CSS with royal crimson (`#4b030e`), zari gold (`#b88444`, `#e6bd81`), and pearl ivory (`#faf7f2`, `#fdfbf7`) backgrounds. Use Cormorant Garamond for headings and Inter for body text. All cards should feature rounded-2xl or rounded-3xl borders with subtle gold borders. Touch targets must be at least 44px on mobile."*
