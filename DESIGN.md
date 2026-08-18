# Design System — ZuGov

## Product Context

- **What this is:** Governance infrastructure for pop-up-city communities — communities are the core wedge (identity, structure, joining); governance tooling (MACI today) is a pluggable layer underneath, not the product's identity.
- **Who it's for:** Pop-up-city residents and community organizers, currently piloting live at Zukas 2026 (Sept 9-20, 2026) — a small real event, not a hypothetical audience.
- **Space/industry:** Civic tech / community governance. Explicitly NOT positioning as crypto/DAO tooling, even though MACI (the underlying voting protocol) is on-chain.
- **Project type:** Web app (React/Vite, apps/zugov-frontend).

## Aesthetic Direction

- **Direction:** Industrial/Utilitarian — function-first, data-dense, muted palette, monospace accents.
- **Decoration level:** Minimal — typography and spacing carry the design, no gradients, no texture, no decorative shadows.
- **Mood:** Serious civic infrastructure, not a crypto app. The memorable-thing goal (2026-08-18 consultation): someone should walk away thinking "this is real governance tooling," not "another DAO dashboard."
- **Reference sites:** [designsystem.digital.gov](https://designsystem.digital.gov) (USWDS — the actual civic-software reference: light, high-contrast, minimal color, unglamorous) vs. [civichalls.com](https://civichalls.com) (a civic-tech competitor whose dark-mode/blue-accent/card-grid marketing page reads as crypto/DAO-tooling convention, not civic-institutional). ZuGov's direction deliberately keeps the dark base (already ~90% of the app, no reason to repaint) but drops purple for a desaturated, civic-toned accent family to move away from the DAO-tooling visual signature.

**Eureka (logged 2026-08-18):** the app's prior dark+purple theme was culturally coded as crypto/DAO tooling (matches Snapshot/Tally-style conventions) — directly contradicting the "serious civic infrastructure, not a crypto app" goal. The theme covering more of the app's existing surface area was not automatically the theme serving the stated brand goal; those are different questions and this system resolves for the second one.

## Typography

- **Display/Hero:** IBM Plex Sans — institutional/civic pedigree, distinct from body copy without introducing a decorative typeface.
- **Body:** Inter — kept as-is (already in use, no churn value in swapping three weeks before a live event).
- **UI/Labels:** same as body (Inter).
- **Data/Tables/addresses:** IBM Plex Mono — upgrade from the current bare `font-mono` utility (no explicit family declared today). Must support `tabular-nums` for member/poll counts.
- **Code:** IBM Plex Mono.
- **Loading:** Google Fonts — `family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600`.
- **Scale:** hero/display 40px, section heading 20px, subsection 15px, body 16px, small/meta 13px, micro/mono-data 11-12px.

## Color

- **Approach:** Restrained — one accent family + neutrals, color rare and meaningful.
- **System note:** accent, success, and error are NOT independently-picked colors — they're the same HSL formula (saturation ~32%, lightness 54%/64% base/hover) with only hue rotating (blue 207° / green 152° / red 358°). This is deliberate: it's what makes the palette read as one coherent system instead of four separately-chosen colors bolted together.
- **Primary (accent):** `#648DAF` (hover `#86A6C1`) — interactive elements, links, primary buttons, active states. Replaces the prior `purple-600` — steel-blue reads civic/institutional, not crypto-native.
- **Success:** `#64AF8C` (hover `#86C1A5`)
- **Error:** `#AF6467` (hover `#C18688`)
- **Neutrals (dark, default):**
  - `--color-bg`: `#0a0a0c`
  - `--color-surface`: `#16161a`
  - `--color-surface-raised`: `#1e1e24`
  - `--color-border`: `#2c2c33`
  - `--color-text-primary`: `#f4f4f5`
  - `--color-text-secondary`: `#a1a1aa`
- **Neutrals (light, toggle):**
  - `--color-bg`: `#f7f7f5`
  - `--color-surface`: `#ffffff`
  - `--color-surface-raised`: `#f0f0ee`
  - `--color-border`: `#d9d9d6`
  - `--color-text-primary`: `#171717`
  - `--color-text-secondary`: `#5a5a5a`
  - `--color-accent`: `#2D5F8A` (deepened for contrast on white)
- **Dark mode:** dark is the default/primary posture (matches ~90% of the app's existing surface area); light mode exists as a toggle, not a repaint target for this pass.

## Spacing

- **Base unit:** 4px (Tailwind default — already in use throughout, formalizing not changing).
- **Density:** Comfortable — matches existing `p-6` card padding, `space-y-4`/`space-y-6` patterns already in the codebase.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout

- **Approach:** Grid-disciplined — predictable card alignment, no asymmetry or overlap. Matches civic-software conventions (legible over clever) over DAO-tooling's more marketing-page-style layouts.
- **Max content width:** `max-w-4xl` (existing convention on community detail page) for content pages; `max-w-7xl` for nav-heavy shells (existing Header convention).
- **Border radius:** Tightened from the prior `rounded-xl` (12px) default — sm: 6px (buttons/inputs), md: 8px (mini-cards, badges), lg: 10px (top-level cards). Less soft/rounded than DAO-tooling convention, echoes flat-rectangle civic-software patterns (USWDS reference).

## Motion

- **Approach:** Minimal-functional — only transitions that aid comprehension (existing `animate-pulse` loading states, `transition-colors` hovers). No new choreography introduced.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out).
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms).

## Decisions Log

| Date       | Decision                                                                              | Rationale                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-18 | Initial design system created                                                         | Created by `/design-consultation`, triggered mid-`/plan-design-review` after finding the app ran two unreconciled themes (light/indigo `Header.tsx` vs. dark/purple everywhere else) with no shared tokens. |
| 2026-08-18 | Dark base kept, purple dropped for civic steel-blue                                   | Founder's explicit call after the crypto-vs-civic-coding eureka: keep the majority-surface-area theme (dark), but the accent color specifically needed to stop reading as DAO tooling.                      |
| 2026-08-18 | Success/error rebuilt as one HSL-derived family with accent, not independently picked | Founder feedback across 3 preview rounds — colors needed to share a formula (same saturation/lightness, hue-only rotation), not just be individually "muted."                                               |
