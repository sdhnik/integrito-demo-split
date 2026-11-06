# Step 2.3 — Finalize Theme Switcher

**Status:** Complete  
**Scope:** Polish sun/moon switcher + confirm app-wide theme. No Header redesign. No Hero.

---

## Files changed

| File | Change |
|------|--------|
| `src/components/ThemeIcons.tsx` | New — lightweight sun/moon SVG icons |
| `src/components/Header.tsx` | Wire icons + active option classes; sync from DOM |
| `src/components/Header.css` | Pill options with contrasting active circle; transitions; focus ring |
| `src/theme.ts` | Also set `documentElement.style.colorScheme` |
| `index.html` | Boot script sets `colorScheme` with theme |

**Unchanged:** Header structure, nav placement, grid (`10rem` / `1fr 1.4fr`), editorial heights, stage architecture.

---

## Theme implementation

- **State:** `document.documentElement.dataset.theme` (`light` | `dark`)
- **Persistence:** `localStorage["integrito-theme"]`
- **First visit:** system `prefers-color-scheme`
- **FOUC:** inline boot script before paint
- **Surfaces:** CSS variables in `tokens.css` drive body, main, header, stage, placeholders, text, borders, buttons
- **Accent:** Integrito blue preserved (`--color-brand`)
- **Switcher:** compact pill; sun (light) / moon (dark); active option gets contrasting circular background; inactive muted; CSS transitions; native `<button>` keyboard + `aria-label` / `aria-pressed`

### Logo

| Theme | File |
|-------|------|
| Light | `integrito-logo-black.svg` |
| Dark | `integrito-logo-white.svg` |

Dimensions unchanged (28px desktop / 24px mobile). No CSS invert.

---

## Screenshots

| File | Description |
|------|-------------|
| `artifacts/step-02-3/1440x900-light.png` | Desktop light |
| `artifacts/step-02-3/1440x900-dark.png` | Desktop dark |
| `artifacts/step-02-3/390x844-light.png` | Mobile light |
| `artifacts/step-02-3/390x844-dark.png` | Mobile dark |
| `artifacts/step-02-3/switcher-*-light.png` | Switcher crop light |
| `artifacts/step-02-3/switcher-*-dark.png` | Switcher crop dark |

Raw: `artifacts/step-02-3/measurements.json`

---

## Test results

### 1440 × 900

| Check | Light | Dark |
|-------|-------|------|
| Theme / logo | light / black | dark / white |
| Active option | sun | moon |
| Body / stage / header update | yes | yes |
| Gap / tracks | 160 / 480·672 | unchanged |
| Overflow | none | none |
| Header height shift | — | **Δ 0** |
| Persist after reload | — | dark + white logo + moon active |

### 390 × 844

Same theme/logo/active behavior; header height **114px** stable across themes; no overflow; stacked grid.

---

## Checklist

1. Theme changes entire page — **pass**  
2. Correct logo — **pass**  
3. Persists after refresh — **pass**  
4. Switcher active state correct — **pass**  
5. No layout shift — **pass** (header Δ 0)  
6. No horizontal overflow — **pass**  
7. Grid geometry unchanged — **pass**

---

## Build

```bash
npx tsc -b && npx vite build
```

**Result:** pass

---

## Stop

Step 2.3 complete. **Do not implement Hero without explicit approval.**
