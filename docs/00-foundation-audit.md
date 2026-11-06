# Integrito Split — Foundation Audit (Step 0)

**Status:** Audit only. No application code modified.  
**Date:** 2026-11-06  
**Next:** Wait for explicit approval before Step 1.

---

## 1. Repository status

### Stack (confirmed)

| Layer | Choice |
|--------|--------|
| UI | React **18.3** |
| Language | TypeScript **~5.6** |
| Bundler | Vite **5.4** (`@vitejs/plugin-react`) |
| Styles | Plain CSS (no Tailwind / CSS-in-JS) |
| Fonts | **DM Sans** + **IBM Plex Mono** (Google Fonts in `index.html`) |

### Dependencies

**Runtime:** `react`, `react-dom`  
**Dev:** `vite`, `@vitejs/plugin-react`, `typescript`, React types, ESLint toolchain  

No layout, animation, state, or form libraries. Correct for a minimal foundation.

### Current source layout

```
src/
  assets/          integrito-logo-black.svg, integrito-logo-white.svg
  components/      empty (.gitkeep)
  sections/        empty (.gitkeep)
  styles/          reset.css, tokens.css, global.css
  App.tsx          minimal placeholder shell
  App.css          shell-only styles
  main.tsx
```

### Configuration

- `vite.config.ts` — React plugin only  
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` — project references, strict  
- Theme tokens exist as CSS variables (`:root` light + `[data-theme="dark"]`)  
- **No Split layout, form, spiral, sticky, or scrollytelling implemented**

### Token mismatch vs references (important)

Current tokens use a **warm off-white + green accent**.  
Both design references (and the logo SVGs) use a **cool near-white + blue accent**.

| Token area | Current scaffold | References / logo asset |
|------------|------------------|-------------------------|
| Background | `#f7f6f3` | ~`#F8F8F7` measured on Ref 01 corners |
| Accent | `#0f6e56` (green) | Button avg ~`rgb(76, 93, 255)`; logo SVG `#3366FF` |

Do **not** treat current tokens as brand-final. Aligning tokens should be an explicit later step.

---

## 2. Reference images found

| File | Size | Role |
|------|------|------|
| `references/Reference 01 — Split Page.png` | 4320 × 14196 | **Main Split layout reference** |
| `references/Reference 02 — Integrito Original.png` | 5370 × 12288 | **Integrito brand / original product reference** |

### Brand assets (not full-page refs)

| File | Role |
|------|------|
| `src/assets/integrito-logo-black.svg` | Wordmark + blue bars icon (light UI) |
| `src/assets/integrito-logo-white.svg` | Wordmark for dark surfaces |

### Role assignment

1. **Split reference → Reference 01**  
   Defines page composition for *this* project: header, hero split (copy + detector card), brand intro, how-it-works, trust rows, spiral watermark.

2. **Brand reference → Reference 02**  
   Defines Integrito product chrome and brand language: logo treatment, broader nav + auth actions, spiral motif, typography hierarchy, blue accent system, section storytelling patterns. Use for brand consistency; **do not copy its full page architecture** into Split unless explicitly requested.

---

## 3. Reference analysis (Reference 01 — Split Page)

### 3.1 Overall page composition

Vertical marketing page, top → bottom:

1. **Site header** — logo left; product tabs right; bottom hairline  
2. **Hero (split)** — left copy / right detector card; spiral watermark behind  
3. **Brand intro** — large “Integrito.” + short supporting sentence  
4. **How it works** — mono eyebrow + heading + three numbered steps with hairline rules  
5. **Why trust** — mono eyebrow + heading + three feature rows (number · title · body)

Large vertical whitespace between blocks. Desktop artboard only — **no mobile breakpoints visible**.

### 3.2 Left / right column proportions

**Hero (visual):** roughly **40/60 → 45/55** (copy | form). **Estimate.**

**Measured ink (Ref 01 px, hero):**

| Region | Approx. X range (ref px) | Notes |
|--------|--------------------------|--------|
| Left headline ink | ~150 – 1222 | Dark text bbox |
| Form interior cues | toolbar ink ~2416+; placeholder ~2504+; CTA ~3690 – 4066 | |
| Form right edge | ~4124 | Pure-white plateau end |

Exact form **left outer edge** is hard to isolate (spiral + soft shadow). Shadow probe suggests chrome near **~2200**; interior chrome near **~2416**. **Estimate.**

**How it works:** content occupies roughly the **left half**; right half is empty whitespace (likely reserved for a later sticky visual). **Estimate ~50/50 page split; content only on left.**

**Trust rows:** three-part horizontal rhythm — large number | title | long body (body heavier on the right). Closer to a **narrow | mid | wide** row grid than a simple 50/50. **Estimate.**

### 3.3 Container width

Artboard width = **4320 px**.

Exact CSS `max-width` **cannot be proven** from the PNG alone (export scale unknown).

| Assumption | Scale | Implied CSS viewport |
|------------|-------|----------------------|
| 3× export | 3.0 | **1440 CSS px** |
| 2× export | 2.0 | **2160 CSS px** |

**Working hypothesis (estimate):** designed around a **~1440 CSS-px** desktop frame (clean 3×). Confirm in Step 1 by matching visual density, not by treating 4320 as CSS pixels.

Content does **not** span edge-to-edge for primary UI; header/nav and columns sit in a padded content band. Spiral watermark **does** bleed more widely behind the hero.

### 3.4 Horizontal padding

Left content / logo ink starts near **x ≈ 150–190** ref px.  
Rightmost header ink ~**3870**; form card right ~**4124**.

| Scale hypothesis | Left pad (est.) | Right pad to card (est.) |
|------------------|-----------------|---------------------------|
| 3× → 1440 CSS | ~50–63 px | ~65 px |
| 2× → 2160 CSS | ~75–95 px | ~98 px |

These measured edge insets look **tighter** than the visual “generous padding” impression (spiral and full-bleed header line affect perception). Treat as **estimates**; refine by eye in implementation — do not hard-code ref-px math as final tokens yet.

### 3.5 Column gap (hero)

Gap between left headline ink end (~1222) and form interior (~2416) ≈ **~1190 ref px**.  
Gap to earlier white/shadow boundary (~2200) ≈ **~980 ref px**.

| Scale hypothesis | Gap (est.) |
|------------------|------------|
| 3× | ~270–400 CSS px |
| 2× | ~490–600 CSS px |

Visually: a **wide gutter**, on the order of “about one headline word” — not a tight 16–24 px gap. **Estimate.**

### 3.6 Header placement

- Full-width bar at top; **bottom hairline** separator  
- **Left:** Integrito mark (blue bars + “integrito” + small tagline)  
- **Right cluster:** product tabs — “AI Text Detection” **active** (blue underline / active color); “AI Image Detection” and “Plagiarism Check” with small **COMING SOON** mono labels  
- Unlike Ref 02, Ref 01 header shows **no Log in / Sign up / theme toggle** in the inspected crop  

Header is **in normal document flow** in the static mock (sticky behavior **not evidenced** in the PNG).

### 3.7 Form placement

- **Right column of the hero**, vertically aligned with the left headline block  
- White elevated **card** (rounded corners, soft shadow)  
- Small caption **above** the card (“A clearer picture starts with your text.”)  
- Inside: placeholder textarea, bottom utility row (paste · word count · pages), primary blue CTA (“Detect AI”)  
- Small privacy note **below** the card  
- Spiral appears behind the card visually, but architecturally it is a **full-width stage layer**, not part of the form column (see §5)

Form is presentational in the reference; **no working detector** is in scope until explicitly requested.

### 3.8 Vertical section structure

| Order | Section | Layout pattern |
|-------|---------|----------------|
| 0 | Header | Logo \| product nav |
| 1 | Hero | 2-col split + spiral backdrop |
| 2 | Brand intro | Left-weighted stacked type |
| 3 | How it works | Eyebrow + H2; stacked steps with left-column rules; open right column |
| 4 | Why trust | Eyebrow + H2; numbered rows with title + body columns |

Section eyebrows use **IBM Plex Mono** (`03 / HOW IT WORKS`, `04 / WHY TRUST INTEGRITO`).  
Headings / body use **DM Sans**.  
Accent numerals and CTA use **blue**.

### 3.9 Brand notes from Reference 02 (for identity only)

- Same logo language and blue accent family  
- Richer header (auth + theme control) — **not** required by Ref 01 Split chrome  
- Asymmetric “label left / content right” storytelling appears throughout Ref 02  
- Use Ref 02 to keep brand recognizable; **Split composition follows Ref 01**

---

## 4. Proposed component structure (simplest)

Keep hierarchy shallow. No shared “design system” package yet.

**Critical:** the typography spiral is **not** a child of the right column.  
It belongs to a full-width **storytelling stage** decorative layer (see §5).

```
App
├── SiteHeader
│     ├── Logo
│     └── ProductNav                 (static links / coming-soon labels)
└── main
      └── StorytellingStage          (sticky boundary owner; full-width)
            ├── StageBackground      (layer 1 — flat/surface only)
            ├── TypographySpiral     (layer 2 — full-bleed decorative; DEFERRED)
            └── StageContent         (layers 3–4; width-constrained shell)
                  └── SplitGrid      (CSS Grid — independent of spiral)
                        ├── EditorialColumn          (layer 3)
                        │     ├── HeroCopy
                        │     ├── BrandIntroSection
                        │     ├── HowItWorksSection
                        │     │     └── StepRow × 3
                        │     └── TrustSection (or post-stage — TBD)
                        │           └── TrustRow × 3
                        └── InteractiveColumn        (layer 4)
                              └── DetectorCard       (sticky sibling of spiral; DEFERRED)
```

**Architectural invariants**

- `TypographySpiral` is a **sibling** of `StageContent`, never nested under `InteractiveColumn` / Detector.  
- `SplitGrid` column widths must not constrain spiral geometry.  
- Detector expand/collapse must not reposition the spiral.

**Deferred (not in early steps):**  
`TypographySpiral` rendering, sticky behavior, form state/API, animations, theme toggle, auth controls, footer (not clearly required by Ref 01 ending).

**File placement suggestion:**

- `src/components/` — `SiteHeader`, presentational pieces, later `TypographySpiral`  
- `src/sections/` — `StorytellingStage`, editorial sections, detector shell when requested  

---

## 5. Critical architecture — full-width typography spiral

> **Do not implement the spiral yet.**  
> This section locks the approach for later approval/implementation.

### 5.1 What the spiral is (and is not)

| Is | Is not |
|----|--------|
| Full-width decorative layer of the **entire storytelling stage** | A background of the right grid column |
| Positioned vs **viewport / stage** width | Sized by the detector card or `max-width` content shell |
| Geometrically independent from Detector / Report | Coupled to form height, expand, or collapse |
| Behind **both** content columns | Above editorial text or interactive controls |
| `pointer-events: none` | A hit-target or scroll container |

### 5.2 Hard requirements

1. Positioned relative to the **full viewport / stage** width.  
2. Extends **beyond the right edge** of the viewport.  
3. Initial visual width target: **~140–150vw** (**estimate / target**, not final art).  
4. Visual **center shifted toward the right**.  
5. Renders **behind both** editorial and interactive columns.  
6. Remains **stationary** while editorial content scrolls (sticky with the stage, not scrolling with left copy).  
7. **Stops being sticky** at the **same storytelling boundary** as the form/detector.  
8. Must **never** introduce horizontal scrolling (`overflow-x` clipped on the stage, not on sticky ancestors incorrectly).  
9. Must **never** intercept pointer events.  
10. Must remain **geometrically independent** from Detector and Report.

### 5.3 Layer order (back → front)

```
1. Storytelling background          (stage surface)
2. Full-width typography spiral     (decorative)
3. Editorial content                (left column / scrolling narrative)
4. Interactive detector / report    (right column)
```

The spiral may show through behind the left column, but opacity/contrast must preserve editorial readability. Spiral position must **not** change when the form expands or collapses.

### 5.4 DOM / CSS structure (conceptual — not implementing)

```text
.storytelling-stage          /* sticky BOUNDARY; tall scroll range */
  .stage-background          /* layer 1 */
  .typography-spiral         /* layer 2: position sticky|absolute within stage */
  .stage-content             /* width-constrained; layers 3–4 */
    .split-grid              /* CSS Grid — independent of spiral */
      .editorial-column      /* scrolls naturally */
      .interactive-column    /* sticky detector/report */
```

**Forbidden nesting**

```text
.split-grid > .interactive-column > .typography-spiral   ❌
.stage-content.max-width > .typography-spiral            ❌  (width-constrained)
```

**Required nesting**

```text
.storytelling-stage > .typography-spiral                 ✅  (full-width peer)
.storytelling-stage > .stage-content > .split-grid       ✅
```

### 5.5 Shared sticky boundary (spiral + detector)

Both the **spiral** and the **right-column detector/report** must pin and unpin together.

**Mechanism**

1. One ancestor — `StorytellingStage` — defines the sticky **containing block / sticky limit**.  
2. Its block size = the full storytelling scroll distance (editorial height drives stage height).  
3. Inside the stage:
   - Spiral uses `position: sticky; top: …` (or an equivalent sticky viewport layer pinned for the stage’s life) so it stays fixed in the viewport while the stage is in view, then **releases when the stage ends**.  
   - Detector column uses `position: sticky; top: …` with the **same stage ancestor** as its sticky limit.  
4. When the bottom of `StorytellingStage` scrolls up past the sticky offset, **both** spiral and detector stop sticking — one shared boundary, no separate JS timelines required for the unpin event.

**Why one stage ancestor matters**

CSS `position: sticky` is limited by the nearest scroll ancestor and by the sticky element’s containing block height. If the spiral were inside the right column, it would:

- inherit the column’s width constraint, and/or  
- unpin when the column’s box ends, which may **not** match the full storytelling length.

A stage-level peer keeps spiral geometry at **viewport scale** while still sharing the stage’s sticky end edge with the detector.

### 5.6 Overflow rules (sticky-safe)

Sticky breaks when any ancestor between the sticky element and the scrollport has `overflow: hidden|auto|scroll` (other than visible) on the relevant axis.

| Element | Allowed | Forbidden (for sticky path) |
|---------|---------|------------------------------|
| `html` / `body` | default visible overflow | making either the app scroll container with nested overflow traps without planning |
| `.storytelling-stage` | `overflow-x: clip` **if** required to hide 140–150vw bleed **and** verified not to break sticky in target browsers; prefer clipping on a **non-sticky decorative wrapper** | `overflow: hidden` on stage if it prevents sticky for spiral/detector |
| `.stage-content` / `.split-grid` | visible | `overflow: hidden` wrapping sticky detector |
| `.typography-spiral` | `pointer-events: none`; may be oversized | creating page-level horizontal scroll |

**Preferred anti-scroll approach**

- Size spiral to ~140–150vw with `right`-biased positioning (`left` / `translate` / transform origin shifted right).  
- Clip horizontal bleed with `overflow-x: clip` on a dedicated **full-width decorative frame** that does **not** sit as an overflow-hidden ancestor of the sticky detector — or clip at `body`/`main` only after verifying sticky still works.  
- Never use `overflow-x: auto` on the page for this.

Exact clip element choice is an implementation detail to validate in the spiral step; the audit rule is: **do not fix bleed in a way that breaks sticky**.

### 5.7 Independence from Detector / Report

- Spiral width, center, and top offset are tokens/props of the **stage**, not derived from card width.  
- Form expand/collapse changes only layer 4 layout; layer 2 transforms stay constant.  
- Report view swaps interactive content inside `InteractiveColumn`; spiral remains untouched.

### 5.8 Revised component note for Step 1 readiness

Step 1 may introduce an empty `StorytellingStage` wrapper + `SplitGrid` **without** mounting `TypographySpiral`, so later spiral/sticky work does not require a DOM rewrite.  
Step 1 must still **not** implement spiral art, sticky pinning, or overflow clipping experiments unless explicitly requested.

---

## 6. Proposed CSS layout strategy

### Principles

1. **Plain CSS** + existing token files (tokens to be corrected in a dedicated step).  
2. **Stage (full-bleed) vs content shell (max-width)** are separate concerns.  
3. **CSS Grid** for the two content columns only; spiral is **outside** that grid.  
4. Flex only for simple inline clusters (header, card toolbar).  
5. **No sticky / spiral / scroll animation** until those steps are requested — but **do not** structure markup in ways that forbid the §5 model.  
6. Prefer named regions over magic margins.

### Storytelling stage vs split grid

```css
/* Conceptual — not implementing now */

.storytelling-stage {
  position: relative; /* sticky boundary box; height from editorial flow */
  width: 100%;
  /* avoid overflow:hidden here unless proven sticky-safe */
}

.typography-spiral {
  /* DEFERRED */
  position: sticky; /* shared unpin with detector via stage height */
  top: 0;
  width: 140vw; /* initial target; estimate 140–150vw */
  /* center biased to the right; pointer-events: none */
  z-index: 2; /* layer 2 — behind content */
}

.stage-content {
  position: relative;
  z-index: 3; /* editorial + interactive above spiral */
  max-width: var(--content-max); /* estimate */
  margin-inline: auto;
  padding-inline: var(--shell-pad-x); /* estimate */
}

.split-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); /* ratio estimate */
  column-gap: var(--hero-gap); /* estimate; tune visually */
  align-items: start;
}

.interactive-column {
  /* later: position: sticky; top: …; z-index above spiral */
}
```

### How it works / trust (editorial interior)

Editorial subsections remain **inside** `EditorialColumn` (or continued stage content), still independent of spiral width:

```css
.how {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); /* estimate */
}
```

Trust rows (if inside or after stage — finalize when section boundaries are approved):

```css
.trust-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, 2fr); /* estimate */
  align-items: start;
}
```

### Header

```css
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

Hairline border-bottom. Product nav as a horizontal flex group with active underline.  
Header sits **outside** `StorytellingStage` (not part of the sticky spiral/detector boundary).

### Why Grid over Flex for page splits

- Stable two-track proportions without nested wrapper hacks  
- Empty right column remains a first-class track for the future sticky detector  
- Spiral stays a stage-level peer — grid tracks never become spiral parents  

---

## 7. Potential layout risks

| Risk | Why it matters | Mitigation |
|------|----------------|------------|
| **Unknown export scale** | px math from 4320-wide PNG may be wrong | Tune by eye; treat measured CSS conversions as estimates |
| **Spiral nested in right column** | Constrains width; wrong sticky end; couples to form | Stage-level peer only (§5) |
| **overflow:hidden on stage** | Breaks `position: sticky` for spiral and/or detector | Prefer `overflow-x: clip` on a carefully chosen frame; verify sticky |
| **Separate sticky ancestors** | Spiral and form unpin at different times | One `StorytellingStage` boundary for both |
| **Horizontal scroll from 140–150vw** | Breaks UX | Clip bleed without trapping sticky; `pointer-events: none` |
| **Spiral above editorial** | Harms readability / blocks clicks | Layer order §5.3; low contrast behind left column |
| **Form-driven spiral layout** | Expand/collapse shifts decoration | Spiral tokens independent of detector box |
| **Token / brand drift** | Scaffold green ≠ reference blue | Explicit token alignment step before polishing UI |
| **Hero gap sensitivity** | Wide gutter defines the “Split” look | Lock gap as a named token; avoid collapsing on mid widths |
| **Empty right column (how-it-works)** | Easy to accidentally full-bleed left content | Keep 2-col grid even when right is empty |
| **Form card complexity** | Internal toolbar can distort card height | Build card shell first; internals later |
| **No mobile reference** | Guessing breakpoints invents design | Desktop-first until specified |
| **Header variance Ref01 vs Ref02** | Auth/theme creep | Follow Ref 01 chrome unless asked |
| **Trust row alignment** | Number/title/body easy to misalign | Shared row grid + consistent padding |
| **Trust inside vs outside stage** | Affects when spiral/detector unpin | Decide stage end boundary before sticky/spiral implementation |

---

## 8. Exact scope of Step 1

**Goal:** First visible Split **structure** only — prove the page grid, not the product.

### In scope

1. Replace the placeholder `App` shell with a **static page frame** driven by Ref 01.  
2. Implement **`SiteHeader`** (logo asset + static product nav labels; active state styling for “AI Text Detection”; coming-soon labels).  
3. Introduce a **`StorytellingStage` shell** (structure only) so later spiral/sticky work need not re-parent the grid.  
4. Implement **`SplitGrid` / hero** as a **two-column CSS Grid** with:
   - left: headline + lede **text only**
   - right: **empty placeholder panel** (or inert card outline) — **no form controls, no submit behavior**
5. Establish content **max-width + horizontal padding** tokens as **explicit estimates**, documented in CSS comments.  
6. Optional: empty section stubs (brand / how / trust) as labeled placeholders **only if needed** to preserve vertical rhythm — no polished content required.  
7. Keep fonts and plain CSS; **no new dependencies**.

### Explicitly out of scope for Step 1

- Typography spiral (any rendering, SVG, canvas, or CSS art)  
- Sticky behavior for spiral or detector  
- Overflow clipping strategies for 140–150vw bleed  
- Working detector / form logic  
- Animations / scrollytelling  
- How-it-works & trust final content styling (beyond optional stubs)  
- Theme switching  
- Backend / API  
- Copying components from any other Integrito repo  
- Responsive redesign  
- Installing packages  

### Exit criteria for Step 1

- Desktop layout shows header + hero split roughly matching Ref 01 proportions  
- Markup leaves a clear stage-level slot for a future full-width spiral peer (even if empty)  
- `npx tsc -b && npx vite build` still passes  
- No behavior beyond static markup/CSS  

---

## Stop

Audit complete — including spiral architecture decision (§5).  

**Do not implement the spiral.**  
**Do not implement Step 1 until explicitly approved.**
