# Step 3.2.5 — Typography System Normalization

**Status:** Complete  
**Scope:** Typography tokens + Header / Hero / Composer type only. No spiral, sticky, detection, or new sections.

---

## 1. Changes implemented

| Area | Change |
|------|--------|
| `tokens.css` | Semantic 4px scale; absolute leading tokens; dropped 14/18 and unused weight aliases |
| `index.html` | Dropped unused DM Sans **700** from font load (kept Mono 600 for over-limit counter) |
| `Header.css` | Desktop nav/login/signup **16/20**; mobile nav **12/20**; login/signup stay **16** |
| `Hero.css` | Stepped H1 sizes/LH per approved breakpoints; lede **16/28** all breakpoints |
| `DetectorComposer.css` | Controls **16/20**; helpers/counter/shortcut **12/20**; textarea **16/24** |
| `StorytellingStage.css` | Removed dead `.layout-placeholder*` typography |
| `Hero.css` | Removed unused `.hero-copy__eyebrow` |
| `global.css` | Body uses `--text-body` |

---

## 2. Final typography tokens

**Families:** `--font-sans` (DM Sans), `--font-mono` (IBM Plex Mono)

| Token | Value | Role |
|-------|-------|------|
| `--text-meta` | 0.75rem (12px) | Helpers, counters, compact nav |
| `--text-body` | 1rem (16px) | Body + interactive UI |
| `--text-title-sm` | 1.5rem (24px) | Reserved small titles |
| `--text-title-md` | 2rem (32px) | Reserved / H1 floor |
| `--text-title-lg` | 2.5rem (40px) | Reserved large titles |
| `--leading-meta` | 20px | Meta / UI chrome |
| `--leading-ui` | 20px | Buttons / nav |
| `--leading-body` | 24px | Textarea |
| `--leading-editorial` | 28px | Hero lede (approved exception to “tight” body) |
| `--weight-regular` | 400 | |
| `--weight-semibold` | 600 | |

**H1 stepped display (not tokenized — component media queries):**

| Min width | Size | Line-height |
|-----------|------|-------------|
| default | 32 | 40 |
| 480 | 36 | 44 |
| 768 | 44 | 52 |
| 1024 | 48 | 56 |
| 1200 | 56 | 64 |
| 1366 | 60 | 68 |
| 1600 | 64 | 72 |

---

## 3. Removed obsolete declarations

- `--text-xs/sm/lg/xl/2xl/3xl` (replaced by semantic set; **14px / 18px gone**)
- `--leading-tight` / `--leading-relaxed`
- `--weight-medium` / `--weight-bold`
- `.hero-copy__eyebrow` (no consumer)
- `.layout-placeholder*` (no consumer)
- Google Fonts weight **700** for DM Sans

---

## 4. Before → after (font-size @ light)

| Element | Before (1440) | After (1440) |
|---------|---------------|--------------|
| Nav / Login / Signup | 14px | **16px** |
| Hero H1 | 61.2px (fluid) | **60px** |
| Hero lede | 16px | **16px** (LH 26.4 → **28px**) |
| Composer helpers | 12px / LH 18 | **12px / 20px** |
| Paste / Clear / Detect | 14px | **16px / 20px** |
| Counter / shortcut | 12px | **12px / 20px** |
| Textarea | 16/24 | **16/24** (unchanged) |

Mobile (390): H1 33.15 → **32**; lede 14 → **16**; nav stays **12**.

---

## 5. Responsive verification

| Viewport | H1 | Nav | Prompt H | Overflow | H1 lines |
|----------|-----|-----|----------|----------|----------|
| 1920×1080 | 64/72 | 16 | 540 | no | 2 |
| 1440×900 | 60/68 | 16 | 468 | no | 2 |
| 1280×720 | 56/64 | 16 | 374.4 | no | 2 |
| 768×1024 | 44/52 | 12 | 420 | no | 2 |
| 390×844 | 32/40 | 12 | 320.7 | no | 2 |
| 1199 | 48/56 | 16 | — | no | 2 |
| 1200 | 56/64 | 16 | — | no | 2 |
| 1365 | 56/64 | 16 | — | no | 2 |
| 1366 | 60/68 | 16 | — | no | 2 |
| 1599 | 60/68 | 16 | — | no | 2 |
| 1600 | 64/72 | 16 | — | no | 2 |

All active UI font sizes ÷4 — **no issues** (`artifacts/step-03-2-5/after/issues.json` empty).

Light + Dark screenshots: `artifacts/step-03-2-5/{before,after}/`.

---

## 6. Remaining exceptions

| Item | Note |
|------|------|
| `--leading-editorial: 28px` | Approved spacious Hero lede (÷4) |
| `--leading-normal: 1.5` | Body reset ratio only |
| Detect arrow glyph `font-size: 16px` | Optical; ÷4 |
| Letter-spacing on H1/lede | Optical; exempt |
| Logo SVG | Exempt |

---

## 7. Layout regression results

| Metric | Expected type-driven? | Result |
|--------|----------------------|--------|
| Editor `prompt` height | No change | **Unchanged** all main viewports |
| Desktop `headerH` | Minimal | **64 → 64** |
| Tablet/mobile `headerH` | Slight grow (auth stays 16px) | **87→92** @768; **119→124** @390 |
| Nav overlap / overflow | None | **None** |
| Toolbar / editor architecture | Preserve | **Preserved** |

**Documented conflict (no redesign):** Keeping Sign up / Log in at **16px** on ≤899px increases header height by **~5px** vs baseline. Compact **12px** retained only for product nav row. No structural Header redesign applied.

---

## 8. Build status

`npx tsc -b && npx vite build` — **pass**
