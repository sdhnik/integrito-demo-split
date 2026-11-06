# Step 2 — Header

**Status:** Complete  
**Scope:** Reference 01 Header only (logo + product nav). No Hero, form, spiral, sticky, or Trust.

---

## Structure

```text
App
├── Header                 ← NEW (normal document flow)
└── main
    └── StorytellingStage  ← unchanged skeleton
        └── … SplitGrid placeholders
```

Header is a **sibling before** `StorytellingStage`. Not fixed/sticky.

---

## Files changed

| File | Change |
|------|--------|
| `src/components/Header.tsx` | New — logo + product nav |
| `src/components/Header.css` | New — Ref 01 header layout |
| `src/App.tsx` | Mount Header above stage |
| `src/styles/tokens.css` | Brand blue, header tokens, safer font weights/fallbacks |
| `index.html` | Simplified Google Fonts weights (`400;600;700`) |

**Unchanged by design:** `--split-gap: 10rem`, grid `1fr / 1.4fr`, `--shell-pad-x`.

---

## Design notes

- **Left:** `integrito-logo-black.svg` (bars + wordmark + tagline in asset)
- **Right:** AI Text Detection (active, brand blue + underline) · AI Image Detection / Plagiarism Check (`Coming Soon`, IBM Plex Mono)
- Hairline bottom border; shared content alignment via `--content-max` + `--shell-pad-x`
- Brand color: `--color-brand: #4c5dff` (`rgb(76, 93, 255)`)
- No auth buttons, theme toggle, or mobile drawer

Font note: variable-font / weight-500 faces were failing in headless Chromium and collapsing text metrics. Step 2 uses static weights and maps `--weight-medium` → `600`, with Liberation/DejaVu fallbacks.

---

## Measurements

Source: `artifacts/step-02/measurements.json`

### Grid regression (vs Step 1.1) @ 1440 × 900

| Metric | Step 1.1 | Step 2 | Status |
|--------|----------|--------|--------|
| `--split-gap` / computed | 10rem / 160px | 10rem / **160px** | Unchanged |
| Tracks | 479.98 / 672 | **479.98 / 672** | Unchanged |
| Measured gap | 160 | **160** | Unchanged |
| Left / right widths | 479.98 / 672 | **479.98 / 672** | Unchanged |
| Horizontal overflow | none | **none** | Pass |

### Header @ 1440 × 900

| Metric | Value |
|--------|-------|
| Position | `relative` (in flow) |
| Header height | **74px** |
| Nav width | 452.08px |
| Active link width | 113.31px |
| Active color | `rgb(76, 93, 255)` |
| Active label | AI Text Detection |

### Other viewports

| Viewport | Overflow | Notes |
|----------|----------|-------|
| 1280 × 720 | None | Gap 160; tracks 413.33 / 578.66 |
| 1024 × 768 | None | Grid stacked; nav readable |
| 390 × 844 | None | Nav wraps on full-width row under logo |

---

## Screenshots

| File | Description |
|------|-------------|
| `artifacts/step-02/viewport-1440x900.png` | Full desktop |
| `artifacts/step-02/viewport-1280x720.png` | 1280 |
| `artifacts/step-02/viewport-1024x768.png` | 1024 stacked grid |
| `artifacts/step-02/viewport-390x844.png` | Mobile |
| `artifacts/step-02/header-1440x900.png` | Header crop desktop |
| `artifacts/step-02/header-390x844.png` | Header crop mobile |

---

## Build

```bash
npx tsc -b && npx vite build
```

**Result:** pass

---

## Stop

Step 2 complete. **Do not implement Hero / detector / spiral without explicit approval.**
