# Integrito Split — Typography System Audit (Step 3.2.4)

**Status:** Audit only — no CSS/implementation changes.  
**Date:** 2026-11-13  
**Root font-size assumption:** browser default **16px** (no `html { font-size }` override).  
**Excluded:** SVG logo artwork; future decorative spiral type.

---

## 1. Executive summary

The page uses **two families only** (DM Sans + IBM Plex Mono), which is correct. The token set already mixes **4px-aligned** sizes (`12`, `16`, `20`, `24`, `32`) with **off-scale** sizes (`14`, `18` via `--text-sm` / `--text-lg`).

The largest violations come from:

1. **`--text-sm` (14px)** — used widely in Header and (on small screens) Hero lede.  
2. **Hardcoded `14px`** on composer Paste / Clear / Detect.  
3. **Fluid H1 `clamp()`** — endpoints are rem-based, but **intermediate computed sizes are often not ÷4** (e.g. 61.2px @ 1440, 54.4px @ 1280, 33.15px @ 390).  
4. **Line-height ratios** that yield non-÷4 absolute leading (e.g. 1.65 × 16 = 26.4px; 1.5 × 12 = 18px).

**Recommendation (not implemented):** adopt a small semantic token set on a strict 4px font-size scale; prefer **16px** for interactive UI that is currently 14px; keep **12px** for meta/helpers; replace continuous H1 fluid clamp with **stepped** sizes (or accept fluid midpoints consciously).

---

## 2. Font families

| Role | Family | Source |
|------|--------|--------|
| Primary UI / editorial | **DM Sans** (400, 600, 700 loaded) | `index.html` Google Fonts + `--font-sans` |
| Technical / mono | **IBM Plex Mono** (400, 600 loaded) | `index.html` + `--font-mono` |
| Fallbacks | Liberation / DejaVu / system / ui-monospace | `tokens.css` |

**No additional product font families** are in use. Theme switcher is **icon-only** (no visible text). Favicon SVG uses `system-ui` at 14px — out of product UI scope.

**Loaded but unused in CSS:** DM Sans **700** (`--weight-bold`); IBM Plex Mono **600** (no mono rule uses 600).

---

## 3. Typography-related tokens (`tokens.css`)

### Font size tokens (declared)

| Token | Value | @16px root | ÷4? | Used in UI today? |
|-------|-------|------------|-----|-------------------|
| `--text-xs` | `0.75rem` | **12px** | Yes | Header mobile; unused Hero eyebrow CSS |
| `--text-sm` | `0.875rem` | **14px** | **No** | Header nav / login / signup; Hero lede ≤599px |
| `--text-base` | `1rem` | **16px** | Yes | Body; Hero lede desktop; textarea |
| `--text-lg` | `1.125rem` | **18px** | **No** | **Unused** |
| `--text-xl` | `1.25rem` | **20px** | Yes | **Unused** |
| `--text-2xl` | `1.5rem` | **24px** | Yes | **Unused** |
| `--text-3xl` | `2rem` | **32px** | Yes | **Unused** |

### Weight tokens

| Token | Value | Notes |
|-------|-------|-------|
| `--weight-regular` | 400 | Body, helpers, nav inactive, login |
| `--weight-medium` | **600** | Alias — real Medium (500) not loaded |
| `--weight-semibold` | 600 | H1, active nav, signup, composer controls |
| `--weight-bold` | 700 | Declared; **not used** in styles |

### Line-height tokens (unitless)

| Token | Value | Example absolute @16px | ÷4 absolute? |
|-------|-------|------------------------|--------------|
| `--leading-tight` | 1.25 | 20px @16; **17.5px @14** | Mixed |
| `--leading-normal` | 1.5 | 24px @16; 18px @12 | Mixed |
| `--leading-relaxed` | 1.65 | **26.4px @16** | **No** |

---

## 4. Current typography inventory (declarations)

### Global / body

| Element | File | Family | Size | Weight | Line-height | Tracking |
|---------|------|--------|------|--------|-------------|----------|
| `body` | `global.css` | sans | `--text-base` (16) | 400 | inherits `reset` → 1.5 | — |
| `html`/`body` reset | `reset.css` | — | browser/default → body sets size | — | `--leading-normal` (1.5) | — |

### Header

| Element | File | Family | Size | Weight | Line-height | Tracking |
|---------|------|--------|------|--------|-------------|----------|
| Product nav link | `Header.css` | sans | `--text-sm` (**14**) → mobile `--text-xs` (**12**) | 400 / **600** active | `--leading-tight` (1.25) | — |
| Log in | `Header.css` | sans | 14 → mobile 12 | 400 | (inherit ~normal) | — |
| Sign up | `Header.css` | sans | 14 → mobile 12 | 600 | (inherit) | — |
| Theme switcher | `ThemeSwitcher` | — | **no text** | — | — | — |

### Hero (editorial)

| Element | File | Family | Size | Weight | Line-height | Tracking |
|---------|------|--------|------|--------|-------------|----------|
| H1 `.hero-copy__title` | `Hero.css` | sans | **clamp(2.3rem, 4.25vw, 4rem)**; ≤1199: `clamp(2rem, 7vw, 2.75rem)`; ≤599: `clamp(1.875rem, 8.5vw, 2.25rem)` | 600 | 1.15 (≤599: 1.18) | −0.035em |
| Lede `.hero-copy__lede` | `Hero.css` | sans | `--text-base` (16); ≤599: `--text-sm` (**14**) | 400 | `--leading-relaxed` (1.65) | −0.01em |
| Eyebrow (CSS only) | `Hero.css` | mono | `--text-xs` (12) | 400 | tight 1.25 | 0.1em |
| **Note:** eyebrow is **not rendered** in current `Hero.tsx` (Reference 01 copy has no eyebrow). Dead CSS. |

### Composer

| Element | File | Family | Size | Weight | Line-height | Tracking |
|---------|------|--------|------|--------|-------------|----------|
| Helper label + footnote status | `DetectorComposer.css` `.detector-composer__helper` | sans | **12px** hardcoded | 400 | **1.5** | normal |
| Textarea + placeholder | `DetectorComposer.css` | sans | **16px** | 400 | **24px** | — |
| Paste / Clear / Detect | `DetectorComposer.css` | sans | **14px** hardcoded | 600 | (auto) | — |
| Detect arrow glyph | `DetectorComposer.css` | inherit | **16px** | — | 1 | — |
| Word / page counter | `DetectorComposer.css` | mono | **12px** | 400 (600 over-limit) | **20px** | — |
| Shortcut | `DetectorComposer.css` | mono | **12px** | 400 | (auto) | — |

### Other

| Element | File | Notes |
|---------|------|-------|
| Layout placeholder (removed from Hero path; CSS remains) | `StorytellingStage.css` | mono, `--text-sm` (14), weight medium=600, tracking 0.04em — debug remnant |

---

## 5. Computed styles (browser)

Root: default **16px**. Captured light theme. Raw data: `artifacts/step-03-typography-audit/computed.json`.

### Key elements by viewport

| Element | 1920×1080 | 1440×900 | 1280×720 | 768×1024 | 390×844 | ÷4 at all? |
|---------|-----------|----------|----------|----------|---------|------------|
| Hero H1 | **64px** | **61.2px** | **54.4px** | **44px** | **33.15px** | **No** (fluid middles) |
| Hero lede | 16 | 16 | 16 | 16 | **14** | No @390 |
| Nav / Login / Signup | 14 | 14 | 14 | **12** | **12** | 14 violates |
| Composer helpers | 12 | 12 | 12 | 12 | 12 | Yes |
| Textarea | 16 / lh 24 | same | same | same | same | Yes |
| Paste / Detect | 14 | 14 | 14 | 14 | 14 | **No** |
| Counter / shortcut | 12 / lh 20 | same | same | same | same | Size yes; lh 20 yes |

### H1 fluid math (desktop clamp)

`font-size: clamp(2.3rem, 4.25vw, 4rem)` → endpoints **36.8px** / **64px**.  
Preferred fluid term `4.25vw` is ÷4 only when viewport width is a multiple of `400/4.25`≈94.12… — **not** at standard widths 1440 / 1280.

Tablet/mobile clamps similarly produce clean caps (44 / 36) but fractional preferred values (e.g. 33.15 @ 390).

---

## 6. Inconsistency report

### 6.1 Font sizes not divisible by 4

| Size | Where |
|------|--------|
| **14px** | `--text-sm`; Header desktop nav/login/signup; composer Paste/Clear/Detect; Hero lede @ ≤599px |
| **18px** | `--text-lg` (unused token) |
| **36.8px** | H1 clamp **minimum** (`2.3rem`) — endpoint itself off-scale |
| **61.2 / 54.4 / 33.15…** | H1 computed intermediates |

### 6.2 Similar UI, different sizes

| Pair | Issue |
|------|--------|
| Header Sign up vs Detect AI | Same role (primary CTA); both **14px** today — OK match, but both off-scale |
| Composer helpers (12) vs composer Paste (14) | Adjacent chrome; different sizes |
| Hero lede (16 desktop) vs Header nav (14) | Body vs chrome; intentional hierarchy, but 14 is off-scale |
| Helper status (12) vs former footnote (was 13 before 3.2.3) | Already unified — good |

### 6.3 Duplicate / parallel declarations

- Composer **14px** hardcoded three times (paste, clear, detect) instead of a shared `--text-*` / control token.  
- Helper typography correctly centralized in `.detector-composer__helper` (good).  
- `--weight-medium` and `--weight-semibold` both **600** — duplicate semantics.  
- Focus accent colors duplicated between composer-local vars and global `--color-brand` (color, not type — noted only).

### 6.4 Hardcoded vs tokens

| Hardcoded | Should map to |
|-----------|----------------|
| Composer `12px` helpers | `--text-xs` or new `--text-meta` |
| Composer `14px` controls | shared UI token (propose 16) |
| Composer `16px` / `24px` lh textarea | `--text-base` + absolute lh token |
| H1 clamps | display tokens / stepped scale |

### 6.5 Unnecessary weights

- **700** loaded and tokenized but unused.  
- Mono **600** loaded but unused.  
- Over-limit counter bumps to **600** — fine; keep one “emphasis” weight (600).

### 6.6 Conflicting / overlapping responsive type

- H1: **three** nested clamps (default / ≤1199 / ≤599) — hard to reason; midpoints rarely ÷4.  
- Header: ≤899 shrinks nav/auth to 12px while composer controls stay 14px on the same phone width → **chrome inconsistency**.  
- Hero lede drops to 14px only ≤599 while composer body text stays 16px.

### 6.7 Inconsistent line heights

| Context | LH | Absolute example | ÷4? |
|---------|----|------------------|-----|
| Textarea | 24px | 24 | Yes |
| Counter | 20px | 20 | Yes |
| Helpers | 1.5 × 12 | **18** | **No** |
| Hero lede | 1.65 × 16 | **26.4** | **No** |
| H1 | 1.15 × fluid | varies (often fractional) | Usually **No** |
| Nav | 1.25 × 14 | **17.5** | **No** |

### 6.8 Browser-default inheritance

- `button` inherits `font: inherit` from reset → sizes come from component rules (OK).  
- Login/signup do not set line-height explicitly → inherit body **1.5** while nav uses **1.25** — subtle inconsistency.  
- No global `h1` reset beyond component class (good — avoids browser 2em H1).

---

## 7. Proposed typography tokens (4px scale)

**Families (unchanged):** DM Sans / IBM Plex Mono.

### Recommended semantic font-size tokens

| Token | Size | Role |
|-------|------|------|
| `--text-meta` | **12px** (`0.75rem`) | Helpers, counters, shortcuts, mobile dense chrome |
| `--text-body` | **16px** (`1rem`) | Body, textarea, Hero lede, primary UI controls |
| `--text-ui` | **16px** | Alias of body for buttons/nav (or keep one token) |
| `--text-title-sm` | **32px** | Optional small titles (future sections) |
| `--text-title-md` | **40px** | Stepped display |
| `--text-title-lg` | **48px** | Stepped display |
| `--text-title-xl` | **56px** | Stepped display |
| `--text-display` | **64px** | Max Hero H1 desktop |

Optional if needed later: `20`, `24`, `28`, `36`, `60`, `68`, `72`, `80` — **do not mint until a component needs them**.

**Deprecate / avoid:** `--text-sm` (14), `--text-lg` (18) unless remapped onto the scale.

### Weights (keep minimal)

| Token | Value | Use |
|-------|-------|-----|
| `--weight-regular` | 400 | Body, meta, inactive |
| `--weight-semibold` | 600 | H1, active nav, primary buttons |
| Drop or stop loading | 700 | Until a true bold need appears |
| Collapse | `--weight-medium` | Point at 600 or remove |

### Line-height guidance (absolute preferred for ÷4)

| Token | Value | Notes |
|-------|-------|-------|
| `--leading-meta` | **16px** or **20px** | 12×1.5→18 is off-scale; prefer **16px** (tighter) or **20px** (roomier) |
| `--leading-body` | **24px** | 16×1.5 — matches textarea today |
| `--leading-display` | **1.15** → prefer **fixed steps** e.g. 64→72, 48→56, 40→48 (÷4) |

**Risk if forcing meta to 16px lh:** slightly taller footnote/label block; may nudge vertical centering by a few pixels.  
**Risk if forcing lede to 24px lh from 26.4:** text block gets ~9% shorter — Hero vertical balance shifts slightly (usually acceptable).

---

## 8. Current → recommended mapping

| Element | Font | Current size | Proposed size | Weight | Current LH | Proposed LH |
|---------|------|--------------|---------------|--------|------------|-------------|
| Body | DM Sans | 16 | **16** (keep) | 400 | 1.5 (24) | **24px** |
| Nav link | DM Sans | 14 / 12 | **16** desktop / **12** mobile densify OK | 400/600 | 1.25 (~17.5) | **20px** or 1.25×16=20 |
| Log in | DM Sans | 14 / 12 | **16** / **12** | 400 | ~1.5 | match nav |
| Sign up | DM Sans | 14 / 12 | **16** / **12** | 600 | ~1.5 | **20–24px** |
| Theme switcher | — | — | — | — | — | n/a (icons) |
| Hero H1 @1920 | DM Sans | 64 | **64** | 600 | 1.15 | **72px** (or 64×1.125=72) |
| Hero H1 @1440 | DM Sans | 61.2 | **60** or **64** stepped | 600 | ~70.4 | match step |
| Hero H1 @1280 | DM Sans | 54.4 | **52** or **56** stepped | 600 | ~62.6 | match step |
| Hero H1 @768 | DM Sans | 44 | **44→44 keep** or **40/48** | 600 | ~50.6 | **48–52** |
| Hero H1 @390 | DM Sans | 33.15 | **32** or **36** | 600 | ~39.1 | **40–44** |
| Hero lede | DM Sans | 16 / 14 | **16** all breakpoints | 400 | 1.65 (26.4) | **24px** |
| Composer helper (above/below) | DM Sans | 12 | **12** | 400 | 1.5 (18) | **16px** or **20px** |
| Textarea | DM Sans | 16 | **16** | 400 | 24px | **24px** |
| Paste / Clear | DM Sans | 14 | **16** | 600 | auto | **20–24px** |
| Detect AI | DM Sans | 14 | **16** | 600 | auto | **20–24px** |
| Word/page counter | IBM Plex Mono | 12 | **12** | 400 | 20px | **20px** |
| Shortcut | IBM Plex Mono | 12 | **12** | 400 | auto | **16–20px** |
| Unused eyebrow CSS | Mono | 12 | delete or keep for future | 400 | 1.25 | — |

---

## 9. Responsive typography recommendations

1. **Replace continuous H1 `clamp(…vw…)`** with **stepped media queries** (or container queries) using only ÷4 sizes, e.g.:

   | Min width | H1 size |
   |-----------|---------|
   | ≥1440 | 64px |
   | ≥1280 | 56px |
   | ≥1024 | 48px |
   | ≥768 | 40px |
   | ≥480 | 36px |
   | default | 32px |

   This guarantees ÷4 **computed** sizes. Tradeoff: less “smooth” scaling between breakpoints (usually imperceptible).

2. If fluid clamp is retained for feel, **document that midpoints violate the 4px rule**, and constrain endpoints to ÷4 rem (`2.25rem`–`4rem` = 36–64) knowing intermediates remain fractional.

3. **Unify mobile chrome:** Header at 12px meta + composer controls at 16px body — avoid 14px island.

4. **Do not shrink readable 14px → 12px** for Paste/Detect/nav on desktop; move **14 → 16**.

5. Future editorial sections (How it works / Trust) should consume `--text-meta` / `--text-body` / title steps only — no new ad-hoc px.

---

## 10. Potential visual / layout risks (if recommendations are applied later)

| Change | Risk |
|--------|------|
| Nav/Login/Signup 14→16 | Header grows ~2px text; may wrap nav earlier on mid widths; `--header-height` / first-section calc shifts slightly |
| Paste/Clear/Detect 14→16 | Toolbar denser; on 390px, Detect + tools may wrap more (already wraps) |
| H1 stepped vs fluid | At 1440, 61.2→60/64 changes line breaks of “honest writing.” — verify two-line composition |
| Lede LH 26.4→24 | Left column block shorter; vertical centering vs composer may look slightly top-heavy |
| Helper LH 18→16 or 20 | Footnote/`min-height: 2.6em` may need retune to avoid jump |
| Removing unused 700/mono 600 from font URL | Tiny load win; no visual change if unused |

---

## 11. Summary table (canonical @1440×900 light)

| Element | Font | Current Size | Proposed Size | Weight | Current Line-height | Proposed Line-height |
|---------|------|--------------|---------------|--------|---------------------|----------------------|
| Body | DM Sans | 16px | 16px | 400 | 1.5 (24px) | 24px |
| Product nav | DM Sans | 14px | 16px | 400/600 | 1.25 (~17.5px) | 20px |
| Log in | DM Sans | 14px | 16px | 400 | ~1.5 | 20–24px |
| Sign up | DM Sans | 14px | 16px | 600 | ~1.5 | 20–24px |
| Theme switcher | — | — | — | — | — | — |
| Hero H1 | DM Sans | 61.2px | 60px or 64px | 600 | ~70.4px | 68–72px |
| Hero lede | DM Sans | 16px | 16px | 400 | 1.65 (26.4px) | 24px |
| Composer label | DM Sans | 12px | 12px | 400 | 1.5 (18px) | 16px or 20px |
| Composer footnote | DM Sans | 12px | 12px | 400 | 1.5 (18px) | 16px or 20px |
| Textarea | DM Sans | 16px | 16px | 400 | 24px | 24px |
| Paste text | DM Sans | 14px | 16px | 600 | auto | 20–24px |
| Clear | DM Sans | 14px | 16px | 600 | auto | 20–24px |
| Word/page counter | IBM Plex Mono | 12px | 12px | 400 | 20px | 20px |
| Detect AI | DM Sans | 14px | 16px | 600 | auto | 20–24px |
| Shortcut | IBM Plex Mono | 12px | 12px | 400 | auto | 16–20px |

---

## 12. Next step

**Do not implement yet.** Await approval before:

1. Remapping tokens (`--text-sm` / unused sizes).  
2. Stepping H1.  
3. Promoting composer/header controls to 16px.  
4. Aligning line-heights to ÷4 absolutes.

---

## Appendix — artifacts

- Computed capture: `artifacts/step-03-typography-audit/computed.json`  
- Viewports tested: 1920×1080, 1440×900, 1280×720, 768×1024, 390×844
