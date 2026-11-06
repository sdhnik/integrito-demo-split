# Step 2.5 — Reuse Original Theme Switcher

**Status:** Complete  
**Scope:** Transfer exact `ThemeSwitcher` from `integrito.app`. Wire to Split theme state only.

---

## Original sources

| Original (`integrito.app`) | Role |
|----------------------------|------|
| `src/components/ThemeSwitcher.tsx` | Component + inline SVG sun/moon |
| `src/styles/main.css` (`.theme-switcher` … `.theme-switcher svg`) | Capsule, buttons, active state, icon stroke |

---

## Files in Split

| File | Change |
|------|--------|
| `src/components/ThemeSwitcher.tsx` | Transferred markup/SVGs; `Theme` from local `theme.ts` |
| `src/components/ThemeSwitcher.css` | Transferred rules; original color values scoped on `.theme-switcher` |
| `src/components/Header.tsx` | Renders `<ThemeSwitcher theme onChange>` → `applyTheme` |
| `src/components/Header.css` | Removed prior custom switcher styles |
| `src/components/ThemeIcons.tsx` | Deleted (replaced by original SVGs) |

**Unchanged:** `theme.ts`, Header layout, nav, auth controls, SplitGrid, StorytellingStage.

---

## Adaptations (necessary only)

1. **Theme type** — imported from `src/theme.ts` (single theme state; no second store).
2. **Styles file** — original rules lived in `main.css`; extracted to `ThemeSwitcher.css` with original `--line` / `--muted` / `--text` / `--bg` / `--button-icon-size` / `--button-transition` values scoped under `.theme-switcher` (light + `[data-theme="dark"]`).
3. **`svg { max-width: none }`** — counters Split’s global reset `svg { max-width: 100% }` so icon size stays 16×16.
4. **Focus ring** — uses Split `--color-focus` (same 2px / 3px offset pattern as original).
5. **Formatting** — JSX pretty-printed; DOM and SVG paths identical to original.

---

## Verification

Computed geometry/colors match original at 1440×900, `deviceScaleFactor: 2`:

| Metric | Original | Split |
|--------|----------|-------|
| Track | 75×39, pad 4, gap 3, radius 30 | identical |
| Active button | 31×29 | identical |
| SVG | 16×16, stroke 1.5 | identical |
| Light active | bg `#171717`, color `#f8f8f6` | identical |
| Dark active | bg `#f2f2f2`, color `#0c0d10` | identical |

Screenshots: `artifacts/step-02-5/compare-{light,dark}.png`, `original-switcher-*`, `split-switcher-*`.

`npx tsc -b && npx vite build` — pass.
