# Step 2.2 — Header Navigation & Global Theme

**Status:** Complete  
**Scope:** Left-aligned product nav, app-wide Light/Dark theme, remove `main` min-height.

---

## Files changed

| File | Change |
|------|--------|
| `src/theme.ts` | New — resolve / apply / toggle / persist theme |
| `src/components/Header.tsx` | Left group (logo+nav); theme-aware logo; accessible toggle |
| `src/components/Header.css` | Flex layout; typography active state; mobile two-row |
| `src/App.css` | Theme-aware surfaces; **removed** `.app__main { min-height }` |
| `src/styles/tokens.css` | Explicit `[data-theme="light"]`; debug tokens for dark |
| `src/styles/global.css` | `html` background + `color-scheme` |
| `src/sections/StorytellingStage.css` | Stage/placeholders use theme tokens |
| `index.html` | Inline boot script (FOUC prevention) |

**Unchanged:** `--split-gap: 10rem`, grid `1fr / 1.4fr`, first-section `calc(100svh - var(--header-height))`, stage architecture.

---

## Header layout

Desktop Flexbox:

```text
[ LEFT: logo ──gap≈44px── product nav ]     [ RIGHT: Log in · Sign up · theme ]
```

- Nav sits **next to** the logo (not viewport-centered).
- Measured logo→nav gap @ 1440: **44px** (within 40–48px target).
- Active: brand blue + `font-weight: 600` — **no underline**.
- Inactive: muted + weight 400; hover color transition.

Mobile (`≤899px`): logo + actions on row 1; horizontally scrollable nav on row 2 (via `display: contents` on the left group). No page overflow.

---

## Theme implementation

- Source of truth: `document.documentElement.dataset.theme` (`light` | `dark`)
- Tokens in `tokens.css` drive all surfaces (body, header, stage, placeholders, buttons, borders, text)
- Boot script in `index.html` applies saved or system preference **before** paint
- `localStorage` key: `integrito-theme`
- Toggle updates dataset + storage; switcher uses `aria-pressed` / dynamic `aria-label`

### Logo switching

| Theme | Asset |
|-------|-------|
| Light | `integrito-logo-black.svg` |
| Dark | `integrito-logo-white.svg` |

No CSS invert. Display size unchanged (28px / 24px mobile).

### Persistence check @ 1440

After switching to dark and reloading: `localStorage=dark`, `dataset.theme=dark`, white logo — **pass**.

---

## Main height correction

`.app__main` no longer sets `min-height: 100vh` (computed `0px` / auto).  
First editorial section still uses `min-height: calc(100svh - var(--header-height))` and remains vertically centered. Header + first section = viewport — **pass**.

---

## Measurements @ 1440 × 900 (light)

| Metric | Value |
|--------|-------|
| Header height | 62px |
| Logo | 123.33 × 28 |
| Logo→nav gap | 44px |
| Nav centered? | **No** (as intended) |
| Active color / weight | `rgb(76, 93, 255)` / 600 |
| Active `::after` | `none` |
| Gap / columns | 160px / 479.98 / 672 |
| `main` min-height | `0px` |
| Overflow | none |

Dark: body/stage backgrounds switch; active brand `#7b87ff`; white logo.

---

## Screenshots

| File | Theme / viewport |
|------|------------------|
| `artifacts/step-02-2/theme-1440x900-light.png` | Light desktop |
| `artifacts/step-02-2/theme-1440x900-dark.png` | Dark desktop |
| `artifacts/step-02-2/theme-390x844-light.png` | Light mobile |
| `artifacts/step-02-2/theme-390x844-dark.png` | Dark mobile |
| `artifacts/step-02-2/viewport-*-{light,dark}.png` | Full set |

Raw JSON: `artifacts/step-02-2/measurements.json`

---

## Checklist

1. Nav next to logo — **pass**  
2. No active underline — **pass**  
3. Header balanced — **pass**  
4. Theme affects whole page — **pass**  
5. Correct logos — **pass**  
6. Preference persists — **pass**  
7. Main has no forced viewport min-height — **pass**  
8. First section centered under Header — **pass**  
9. Grid unchanged — **pass**  
10. No horizontal overflow — **pass**  
11. Mobile nav accessible — **pass**

---

## Build

```bash
npx tsc -b && npx vite build
```

**Result:** pass

---

## Stop

Step 2.2 complete. **Do not implement Hero, detector, spiral, sticky, or scrollytelling without approval.**
