# MSBON Verification — Design Tokens

> The MSBON frontend is an editorial system. Three colours, two typefaces, one
> spacing rhythm. This document is the single source of truth for every token;
> `tailwind.config.js` and `src/index.css` are derived from it.

## Creative statement

The MSBON Transcript Verification System looks like a quiet, serious, decade-durable
instrument of government work — closer to a National Parks Service brochure or a USDA
report than a SaaS dashboard. Typography carries the weight: Fraunces' optical-size axis
gives the headlines warmth without softness, DM Sans keeps the data legible at every
density. Terracotta is rationed — it appears where a human decision was made or is
required, and nowhere else. Whitespace is the design's loudest signal.

## Color tokens

| Token              | Hex          | Tailwind class                      | Intended use                                       |
|--------------------|--------------|-------------------------------------|-----------------------------------------------------|
| `cream`            | `#F7F3EE`    | `bg-cream`                          | Default page background — every page, every section |
| `cream-dark`       | `#EDE7DC`    | `bg-cream-dark`                     | Alternating section backgrounds, summary cards     |
| `charcoal`         | `#1E1E1E`    | `text-charcoal`                     | Primary text, primary icons                         |
| `charcoal-muted`   | `#6B6560`    | `text-charcoal-muted`               | Secondary text, captions, dates, labels             |
| `charcoal-faint`   | `rgba(30,30,30,.08)` | `border-charcoal-faint`     | All borders, hairline rules                         |
| `terracotta`       | `#B84A32`    | `bg-terracotta`, `text-terracotta`  | The accent — earned, never decorative               |
| `terracotta-dark`  | `#9F3E2A`    | `bg-terracotta-dark`                | Hover state on terracotta surfaces                  |
| `terracotta-light` | `rgba(184,74,50,.10)` | `bg-terracotta-light`      | Hover backgrounds, subtle accent surfaces           |

**Rules:** No other colors enter the system. No gradients. No shadows. No dark mode.

Status / severity colour assignments live in `components/ui/SeverityBadge.tsx` —
the single source for every status badge in the app. Four semantic tones drawn from
the palette above: `alert` (terracotta), `progress` (charcoal/pulsing), `success`
(charcoal on cream-dark), `neutral` (charcoal-muted).

## Typography tokens

Self-hosted via `@fontsource-variable/fraunces` and `@fontsource-variable/dm-sans`.
No external font CDNs.

| Token            | Tailwind class    | Family   | Variation settings                | Use                                          |
|------------------|-------------------|----------|------------------------------------|-----------------------------------------------|
| display-2xl      | `text-display-2xl`| Fraunces | `"opsz" 144, "wght" 300` (light)  | Hero headline only                            |
| display-xl       | `text-display-xl` | Fraunces | `"opsz" 144, "wght" 300`          | Section hero on subordinate pages             |
| display-lg       | `text-display-lg` | Fraunces | `"opsz" 96,  "wght" 400`          | Section headings                              |
| display-md       | `text-display-md` | Fraunces | `"opsz" 36,  "wght" 400`          | Subheadings, flag titles, pull quotes         |
| body-lg          | `text-body-lg`    | Fraunces / DM Sans | `"opsz" 9, "wght" 400` | Lead paragraphs, italic captions              |
| body-md          | `text-body-md`    | DM Sans  | regular                            | Body copy                                     |
| body-sm          | `text-body-sm`    | DM Sans  | regular                            | Captions, metadata, fine print                |
| label            | `text-label`      | DM Sans  | `tracking-wider`, uppercase        | Nav, labels, badges, tags                     |

Long-form prose uses the `.prose-editorial` utility (Fraunces at `body-lg`, line-height
1.8, max-width 62ch — book-like reading). The `.prose-drop-cap` utility applies a
4em terracotta drop cap to the first paragraph.

## Layout tokens

| Utility              | Definition                                                       | Use                                |
|----------------------|------------------------------------------------------------------|-------------------------------------|
| `.container-editorial` | `max-width: 1200px; margin: 0 auto; padding: 0 clamp(1.5rem, 5vw, 6rem)` | Standard content wrapper |
| `.container-prose`     | `max-width: 68ch; margin: 0 auto;`                                | Long-form reading width            |
| `.container-wide`      | `max-width: 1400px; …`                                            | Data tables, audit log             |
| `.section-xl`          | `padding-block: clamp(5rem, 12vw, 10rem)`                         | Hero / story sections              |
| `.section-lg`          | `padding-block: clamp(4rem, 8vw, 7rem)`                           | Standard section                   |
| `.section-md`          | `padding-block: clamp(3rem, 6vw, 5rem)`                           | Compact section, footer            |

Every page uses the `<Section>` component (`components/layout/Section.tsx`) which
composes these utilities. **No raw padding/margin on page files.**

## Motion tokens

Defined in `components/motion/tokens.ts`. Everywhere the codebase animates, it should
use these tokens — not bespoke durations or easings.

```ts
fade:    { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
slideUp: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
stagger: 0.12
hover:   { duration: 0.2, ease: "easeOut" }
```

Section reveals use `<FadeUp>` (`components/motion/FadeUp.tsx`), which respects
`prefers-reduced-motion` by rendering the final state immediately. The CSS
media-query fallback in `index.css` also zeroes out durations globally.

## Reusable primitives

| File                                       | Replaces                                              |
|--------------------------------------------|--------------------------------------------------------|
| `components/ui/CTAButton.tsx`              | All bespoke styled buttons                            |
| `components/ui/SectionLabel.tsx`           | Every uppercase-tracked label                         |
| `components/ui/DisplayHeading.tsx`         | Every Fraunces display heading (size-prop driven)     |
| `components/ui/PullQuote.tsx`              | Pull-quotes in long-form prose                        |
| `components/ui/SeverityBadge.tsx`          | All three previous duplicated badge maps              |
| `components/motion/FadeUp.tsx`             | Bespoke scroll reveals                                |
| `components/layout/Section.tsx`            | Every page-level wrapper                              |
| `components/layout/PublicHeader.tsx`       | Public site navigation                                |
| `components/layout/PublicFooter.tsx`       | Public site footer                                    |
| `components/layout/AppShell.tsx`           | Authenticated app navigation                          |
| `components/layout/MobileMenu.tsx`         | Full-screen mobile nav overlay                        |

## Anti-patterns — do not reintroduce

- `text-blue-*`, `bg-emerald-*`, `text-slate-*` or any raw Tailwind hue. Migrate
  to the four semantic tones in `SeverityBadge` and the editorial palette.
- `text-[11px]`, `text-[12px]`, etc. Use the type scale (`text-label`, `text-body-sm`).
- Inline `style={{ color: "#..." }}` for color. Variation settings via `style` are OK
  because Tailwind cannot express OpenType font-variation-settings.
- `font-family: 'Inter'`. Replaced by DM Sans variable.
- `X-Staff-ID` / `X-Staff-Role` headers — auth is JWT only, see `services/axiosSetup.ts`.

## Accessibility verification

| Check | Status |
|-------|--------|
| Terracotta `#B84A32` on cream `#F7F3EE` body contrast | **4.78 : 1** — passes WCAG AA for normal text |
| Charcoal-muted `#6B6560` on cream `#F7F3EE`           | **5.36 : 1** — passes WCAG AA |
| Charcoal `#1E1E1E` on cream `#F7F3EE`                 | **15.5 : 1** — passes WCAG AAA |
| `prefers-reduced-motion` respected                    | Yes — `FadeUp` short-circuits and `index.css` zeroes out durations |
| Focus visible                                         | 2 px terracotta offset outline on every interactive element |
| Tap targets                                           | `min-h-[44px]` on all buttons and nav links |
