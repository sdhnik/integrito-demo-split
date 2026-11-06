# Step 2.4 — Restore Original Theme Switcher

**Status:** Complete  
**Scope:** Match Reference 02 switcher visuals only. Theme logic, Header layout, grid, and stage unchanged.

---

## Files changed

| File | Change |
|------|--------|
| `src/components/ThemeIcons.tsx` | Outline sun (hollow circle + 8 rays) and tilted outline crescent moon |
| `src/components/Header.css` | Capsule size/padding/track color; mid-gray icons; dark-mode contrast |
| `src/components/Header.tsx` | Comment only |

**Unchanged:** `theme.ts`, tokens architecture, logo swap, nav, auth buttons, SplitGrid, StorytellingStage.

---

## Visual match (Reference 02)

- Capsule ≈ 55×29 CSS-px, thin border, header-colored track
- Active thumb: contrasting circle (`var(--color-text)`)
- Icons: stroke SVGs, shared mid-gray; active prominence from thumb only
- Moon: outline crescent, opening toward upper-right (~−38°)
- Subtle `background-color` transition on the thumb

---

## Screenshots

| File | Description |
|------|-------------|
| `artifacts/step-02-4/switcher-closeup-light.png` | Switcher close-up, light |
| `artifacts/step-02-4/switcher-closeup-dark.png` | Switcher close-up, dark |
| `artifacts/step-02-4/switcher-1440x900-light.png` | Actions crop, light |
| `artifacts/step-02-4/switcher-1440x900-dark.png` | Actions crop, dark |

---

## Verification

- Theme toggle updates `dataset.theme`, logo, and `localStorage["integrito-theme"]`
- Keyboard / `aria-label` / `aria-pressed` preserved
- `npx tsc -b && npx vite build` — pass
