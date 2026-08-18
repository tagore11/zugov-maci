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

- **Approach:** Restrained — one accent + a warm-neutral scale, color rare and meaningful. Named Tailwind theme tokens (`bg-accent`, `text-accent-hover`, `bg-gray-900`, `border-gray-700`, etc. — the standard gray scale is itself overridden with these warm values), not arbitrary hex utilities (`bg-[#...]`). DESIGN.md's hex values here are the source of truth for `apps/zugov-frontend/app/globals.css`'s `@theme` block — update both together.
- **Primary (accent) — "Adobe":** `#C1633B` (hover `#DD8355`) dark / `#9C4A28` (hover `#7D3A1F`) light — warm terracotta/clay. Replaces the prior steel-blue (`#648DAF`). Steel-blue solved the 2026-08-18 crypto-vs-civic problem but read as generic cool-SaaS, not distinctive; terracotta keeps the "not crypto-coded" property (no fintech-blue, no crypto-green, no purple) while adding the thing steel-blue lacked — it reads as an actual _place_ (clay, adobe walls, a courtyards material), which fits "pop-up city / community / home" better than an institutional-plaque color would. Researched against a sibling project's design system (nomkeep, warm brass/gold on warm-neutral) for the general "warm > cool" direction, then deliberately diverged on hue — brass/gold carries nomkeep's own trading/vault metaphor; terracotta doesn't borrow that vocabulary and keeps the two apps visually distinct.
- **Success:** `#64AF8C` (hover `#86C1A5`) dark / `#3F7A5A` (hover `#558F6B`) light — unchanged, already warm-adjacent enough to sit on either neutral scale without clashing.
- **Error:** `#AF6467` (hover `#C18688`) dark / `#8C3F42` (hover `#A65458`) light — unchanged, same reasoning as Success.
- **Neutrals — warm-neutral scale (brown-black, not blue-black), theme-reactive:**

  | Token                         | Dark (default)        | Light (system/explicit) | Tailwind role                         |
  | ----------------------------- | --------------------- | ----------------------- | ------------------------------------- |
  | `--gray-950` / `--background` | `#17130F`             | `#EDE4D6`               | page bg                               |
  | `--gray-900`                  | `#211A14`             | `#F7F1E7`               | card/surface bg                       |
  | `--gray-800`                  | `#2A2118`             | `#FFFFFF`               | raised surface, inputs, hover bg      |
  | `--gray-700`                  | `#3D2F21`             | `#DDD0BC`               | borders (most common)                 |
  | `--gray-600`                  | `#55432F`             | `#C7B89E`               | stronger border / hover-border        |
  | `--gray-500`                  | `#7A6B54`             | `#8F7F65`               | muted icon / placeholder              |
  | `--gray-400`                  | `#ABA08C`             | `#6B5D48`               | secondary/muted text (most common)    |
  | `--gray-300`                  | `#C7BEA9`             | `#4A3F30`               | emphasized muted text (hover, labels) |
  | `--gray-200`                  | `#DED6C4`             | `#3A2F22`               | rare, near-full-contrast accents      |
  | `--gray-100` / `--gray-50`    | `#EEE7D9` / `#F7F2E8` | `#2C2318` / `#241A10`   | rare                                  |
  | `--foreground`                | `#F5EEE4`             | `#241A10`               | primary text                          |

  Same role, inverted lightness — `gray-950` is always "the bg-role color," near-black in dark mode and near-white in light, exactly like `--background`/`--foreground` already worked. Not a naive invert: hue stays warm-consistent across every step in both directions, same principle nomkeep used for its own light/dark pair.

- **Dark mode:** dark is the default/primary posture. **System preference now actually wires up** (previously aspirational — `[data-theme="light"]` existed in CSS but nothing ever set it): bare `:root` carries the dark tokens, `@media (prefers-color-scheme: light)` swaps in light tokens for OS-light users, `[data-theme="light"]`/`[data-theme="dark"]` stay available as an explicit override once a manual toggle UI exists (none does yet). Because the entire `gray-*` scale is now theme-reactive (not just the page shell), every existing `bg-gray-900`/`border-gray-700`/etc. usage across the app inherits real light-mode support automatically, with zero component file changes — this is what "formalize DESIGN.md tokens into Tailwind theme config" ultimately bought: a color change here is a values-only diff in `globals.css`'s `@theme` block, not a repo-wide component sweep, going forward.

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

| Date       | Decision                                                                                                                                                                | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-18 | Initial design system created                                                                                                                                           | Created by `/design-consultation`, triggered mid-`/plan-design-review` after finding the app ran two unreconciled themes (light/indigo `Header.tsx` vs. dark/purple everywhere else) with no shared tokens.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-08-18 | Dark base kept, purple dropped for civic steel-blue                                                                                                                     | Founder's explicit call after the crypto-vs-civic-coding eureka: keep the majority-surface-area theme (dark), but the accent color specifically needed to stop reading as DAO tooling.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-08-18 | Success/error rebuilt as one HSL-derived family with accent, not independently picked                                                                                   | Founder feedback across 3 preview rounds — colors needed to share a formula (same saturation/lightness, hue-only rotation), not just be individually "muted."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-08-18 | Steel-blue accent + cool neutrals replaced with terracotta ("Adobe") accent + warm-neutral scale; `gray-*` scale made theme-reactive for real system-preference support | Founder felt the app didn't read as warm/welcoming — steel-blue fixed the crypto-vs-civic problem but landed generic-SaaS. Compared against sibling project nomkeep's warm brass/gold system for the general direction, then diverged on hue (terracotta, not brass) to avoid inheriting nomkeep's trading/vault metaphor and to keep the two apps visually distinct. Previewed 3 accent variants (Adobe/Ember/Amber) on a live community-detail mockup with working light/dark/system toggle; Adobe (the most restrained of the three) was chosen. Also closes the "Formalize DESIGN.md tokens into Tailwind theme config" and delivers real (not aspirational) dark-first system-preference support in the same pass. |
