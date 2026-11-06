# Step 2.1 — Header Refinement & First Viewport Alignment

**Status:** Complete  
**Primary header reference:** `references/Reference 02 — Integrito Original.png`  
**Split layout reference:** Reference 01 (unchanged)

---

## Files modified

| File | Change |
|------|--------|
| `src/components/Header.tsx` | Ref 02 three-region header; ResizeObserver → `--header-height`; visual auth + theme |
| `src/components/Header.css` | Smaller logo; centered nav; actions; compact mobile two-row |
| `src/styles/editorial.css` | `.editorial-section--first` uses `calc(100svh - var(--header-height))` |
| `src/sections/StorytellingStage.tsx` | First debug section gets `--first` class |
| `src/styles/tokens.css` | `--header-height` fallback until measured |

**Unchanged:** `--split-gap: 10rem`, grid `1fr / 1.4fr`, shell padding, stage/spiral architecture.

---

## What changed

1. **Logo** — display height **28px** desktop (`1.75rem`), **24px** mobile; aspect preserved (`max-width: none`).
2. **Header composition (Ref 02)** — brand | **centered** product nav | Log in · Sign up · theme pill.
3. **Coming Soon** — removed entirely.
4. **Product names** — AI Text Detector / AI Image Detector / Plagiarism Checker.
5. **First section** — `min-height: calc(100svh - var(--header-height))` with flex vertical centering.
6. **`--header-height`** — published from live `offsetHeight` via `ResizeObserver` (not a static guess).

Auth/theme controls are visual prototype only (buttons; theme toggles existing `data-theme` tokens). No auth deps or routes.

---

## Measurements (`artifacts/step-02-1/measurements.json`)

### 1440 × 900

| Metric | Value |
|--------|-------|
| Header height (rendered) | **62px** |
| `--header-height` token | **62px** |
| Logo | **123.33 × 28** |
| Nav center delta vs viewport mid | **0** |
| Coming Soon count | **0** |
| First section min-height | **838px** (`900 − 62`) |
| Header + first section | **900** (= viewport) |
| Placeholder vertical center δ | **0** |
| Gap / left / right | **160** / **479.98** / **672** |

### Other viewports

| Viewport | Header h | First section min-h | Fit | Overflow | Nav centered |
|----------|----------|---------------------|-----|----------|--------------|
| 1280 × 720 | 62 | 658 | ✓ | none | ✓ |
| 1024 × 768 | 62 | 706 | ✓ | none | ✓ |
| 390 × 844 | **82** (two-row) | 762 | ✓ | none | scroll row |

### Grid regression @ 1440

| Metric | Step 1.1 / 2 | Step 2.1 |
|--------|--------------|----------|
| `--split-gap` | 10rem / 160px | **unchanged** |
| Tracks | 479.98 / 672 | **unchanged** |

---

## Screenshots

| File | Notes |
|------|-------|
| `artifacts/step-02-1/viewport-1440x900.png` | Desktop first viewport |
| `artifacts/step-02-1/viewport-1280x720.png` | |
| `artifacts/step-02-1/viewport-1024x768.png` | |
| `artifacts/step-02-1/viewport-390x844.png` | Mobile two-row header |
| `artifacts/step-02-1/header-1440x900.png` | Header crop |
| `artifacts/step-02-1/header-390x844.png` | Mobile header crop |

---

## Checklist

1. Header resembles Integrito Original — **pass**  
2. Logo appropriately sized — **pass** (28px / 24px)  
3. Navigation centered on desktop — **pass** (Δ = 0)  
4. Coming Soon absent — **pass**  
5. First-section content centered below Header — **pass**  
6. Header + first section = initial viewport — **pass**  
7. Grid dimensions unchanged — **pass**  
8. No horizontal overflow — **pass**

---

## Build

```bash
npx tsc -b && npx vite build
```

**Result:** pass

---

## Stop

Step 2.1 complete. **Do not implement Hero, form, spiral, sticky, or scrollytelling without approval.**
