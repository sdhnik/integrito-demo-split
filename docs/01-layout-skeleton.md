# Step 1 — Layout Skeleton

**Status:** Complete  
**Scope:** Structural foundation only (no header, spiral, sticky, form, or Trust Section)

---

## What was implemented

```text
App
└── main
    └── StorytellingStage          (full-width)
        └── ContentContainer       (width-constrained + horizontal padding)
            └── SplitGrid          (CSS Grid)
                ├── LeftColumn     (debug placeholder)
                └── RightColumn    (debug placeholder)
```

**Preserved for later (not rendered):**

- `SpiralLayer` as a full-width sibling of `ContentContainer` under `StorytellingStage`
- `TrustSection` as a sibling **after** `StorytellingStage`

**Files**

- `src/sections/StorytellingStage.tsx`
- `src/sections/StorytellingStage.css`
- `src/App.tsx` / `src/App.css`
- Layout estimate tokens in `src/styles/tokens.css`

---

## Chosen grid dimensions (estimates)

Inferred from Reference 01 assuming ≈1440 CSS-px desktop (3× artboard). Marked as estimates.

| Token | Value | Rationale |
|-------|-------|-----------|
| `--content-max` | `90rem` (1440px) | Cap near the reference desktop frame; stage itself stays full-bleed |
| `--shell-pad-x` | `4rem` (64px) | Outer inset estimate (~50–65px measured band) |
| `--split-gap` | `18rem` (288px) | Wide intentional gutter (audit range ~270–400px); **not** 48px |
| Tracks | `minmax(0, 1fr) minmax(0, 1.4fr)` | Stable fr tracks; right bias targets ~600px detector at 1440 |

```css
.split-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  column-gap: var(--split-gap); /* 288px */
}
```

Narrow viewports (`max-width: 1199px`): single column stack — foundation only, not final mobile design.

No `overflow` clipping on the stage (sticky-safe for later). No transforms / negative margins.

---

## Browser measurements @ 1440 × 900

Source: Playwright Chromium against `http://127.0.0.1:5173/`  
Raw JSON: `artifacts/step-01/measurements.json`

| Element | left (px) | width (px) |
|---------|-----------|------------|
| Viewport | 0 | 1440 |
| `.storytelling-stage` | 0 | **1440** (full-width) |
| `.content-container` | 0 | 1440 |
| `.split-grid` | **64** | **1312** |
| `.left-column` | **64** | **426.66** |
| `.right-column` | **778.66** | **597.34** |

| Metric | Value |
|--------|-------|
| Column gap (computed) | **288px** |
| Measured gap (right.left − left.right) | **288px** |
| Columns overlap | **No** |
| Horizontal overflow | **No** (`scrollWidth` = 1440) |
| Right column ≥ ~600px | **Yes** (597.34px ≈ 600) |

---

## Other viewports

| Viewport | Layout | Overflow | Notes |
|----------|--------|----------|-------|
| 1280 × 720 | Side-by-side | None | Left 360 / gap 288 / right 504 |
| 1024 × 768 | **Stacked** | None | Below 1200px breakpoint |
| 390 × 844 | **Stacked** | None | Mobile foundation stack |

---

## Screenshots

| File | Viewport |
|------|----------|
| `artifacts/step-01/viewport-1440x900.png` | 1440 × 900 |
| `artifacts/step-01/viewport-1280x720.png` | 1280 × 720 |
| `artifacts/step-01/viewport-1024x768.png` | 1024 × 768 |
| `artifacts/step-01/viewport-390x844.png` | 390 × 844 |

---

## Confirmation checklist

1. Columns do not overlap — **pass**  
2. Grid geometry is stable (`minmax(0, fr)` tracks) — **pass**  
3. Right column has sufficient width at 1440 (~600px) — **pass**  
4. No horizontal overflow at tested sizes — **pass**  
5. Structure permits future full-width spiral (stage peer of content) — **pass**

---

## Build

```bash
npx tsc -b && npx vite build
```

**Result:** pass.

---

## Stop

Step 1 complete. **Do not implement Step 2 without explicit approval.**
