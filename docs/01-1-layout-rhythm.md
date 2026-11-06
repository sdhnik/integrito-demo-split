# Step 1.1 — Grid Gap & Vertical Rhythm

**Status:** Complete  
**Scope:** Gap token update + editorial `min-height: 100svh` convention only  
**Does not include:** Header, copy, form, spiral, sticky, Trust, or multiple empty sections

---

## Changes

### 1. Grid gap

| Token | Before | After |
|-------|--------|-------|
| `--split-gap` | `18rem` (288px) | **`10rem` (160px)** |

- Defined in `src/styles/tokens.css`
- `grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr)` **unchanged**
- No positioning hacks

### 2. Editorial section pattern

New file: `src/styles/editorial.css` (imported from `global.css`)

```css
.editorial-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100svh; /* grows if content is taller */
}
```

Future Hero note (not applied yet):

```css
min-height: calc(100svh - var(--header-height));
```

`--header-height: 0px` reserved in tokens until Header exists.

### 3. Storytelling structure (convention only)

```text
StorytellingStage          ← height = sum of editorial sections (NOT 100svh)
├── SpiralLayer            ← deferred; full-width stage peer
└── ContentContainer
    ├── Hero               ← .editorial-section (future)
    ├── Introduction       ← .editorial-section (future)
    ├── How It Works 01    ← .editorial-section (future)
    ├── How It Works 02    ← .editorial-section (future)
    └── How It Works 03    ← .editorial-section (future)

TrustSection               ← OUTSIDE stage (deferred)
```

**Current DOM:** one debug `.editorial-section` wrapping the existing SplitGrid placeholders (to verify centering). No extra empty viewport sections.

`.storytelling-stage` no longer sets `min-height: 100vh` / `100svh`.

---

## Measurements

Source: Playwright Chromium · `artifacts/step-01-1/measurements.json`

### 1440 × 900

| Metric | Value |
|--------|-------|
| `--split-gap` token | `10rem` |
| `column-gap` computed | **160px** |
| Measured gap | **160px** |
| Left width | 479.98px |
| Right width | 672px |
| Tracks | `479.984px 672px` (1fr / 1.4fr) |
| Columns overlap | **No** |
| Horizontal overflow | **No** |
| `.storytelling-stage` min-height | `0` (content-driven) |
| `.editorial-section` min-height | **900px** (`100svh`) |
| Vertical center (gap above/below grid) | **354 / 354** (δ = 0) |

### 1280 × 720

| Metric | Value |
|--------|-------|
| Column gap | **160px** |
| Left / right | 413.33 / 578.66 |
| Overlap / overflow | **No / No** |
| Vertical center | **264 / 264** (δ = 0) |

### 1024 × 768 · 390 × 844

| Viewport | Layout | Overflow | Vertical center |
|----------|--------|----------|-----------------|
| 1024 × 768 | Stacked | None | δ = 0 |
| 390 × 844 | Stacked | None | δ = 0 |

---

## Screenshots

| File | Viewport |
|------|----------|
| `artifacts/step-01-1/viewport-1440x900.png` | 1440 × 900 |
| `artifacts/step-01-1/viewport-1280x720.png` | 1280 × 720 |
| `artifacts/step-01-1/viewport-1024x768.png` | 1024 × 768 |
| `artifacts/step-01-1/viewport-390x844.png` | 390 × 844 |

---

## Checklist

1. Desktop column gap is `10rem` (160px) — **pass**  
2. Grid columns do not overlap — **pass**  
3. No horizontal overflow — **pass**  
4. Debug content vertically centered in `100svh` section — **pass**  
5. Stage compatible with future sticky + full-width spiral — **pass** (no stage `100svh`; no overflow clipping; spiral slot remains stage-level peer)

---

## Build

```bash
npx tsc -b && npx vite build
```

**Result:** pass

---

## Stop

Step 1.1 complete. **Do not implement Header / Step 2 without explicit approval.**
