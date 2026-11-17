# Step 3.1 — Hero Content & Typography

**Status:** Complete  
**Scope:** Left-column Hero copy only. Detector, spiral, sticky, SEO sections deferred.

---

## Files

| File | Change |
|------|--------|
| `src/sections/Hero.tsx` | Eyebrow + H1 + lede |
| `src/sections/Hero.css` | Editorial hierarchy (DM Sans / IBM Plex Mono) |
| `src/sections/StorytellingStage.tsx` | Left column renders `<Hero />` |
| `src/sections/StorytellingStage.css` | Vertical center left/right columns |
| `src/App.tsx` | Comment |

**Unchanged:** Header, theme switcher, grid (`10rem` / `1fr 1.4fr`), right placeholder, tokens, theme architecture.

---

## Content

- **Eyebrow:** `AI TEXT DETECTOR` (mono, uppercase, muted)
- **H1:** Detect AI‑generated / content with confidence. (intentional 2-line break; non-breaking hyphen)
- **Lede:** Analyze… intuitive workspace.

## Typography

- Title: `clamp(2.125rem, 3vw, 2.75rem)`, weight 600, tracking −0.035em, line-height 1.15
- Lede: `text-base`, muted, max-width 34ch
- Colors from existing tokens only

---

## Verification (1440 / 390)

| Check | Result |
|-------|--------|
| H1 fits left column (desktop) | 2 lines; second line 470px ≤ 480px track |
| Vertically centered (desktop) | delta 0 vs first-section mid |
| No horizontal overflow | pass |
| Header height | 64px desktop / 119px mobile (unchanged pattern) |
| Themes | light + dark OK |

Screenshots: `artifacts/step-03-1/{1440x900,390x844}-{light,dark}.png`

`npx tsc -b && npx vite build` — pass.
