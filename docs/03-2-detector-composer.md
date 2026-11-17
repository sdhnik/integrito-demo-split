# Step 3.2 — AI Text Detector Composer

**Status:** Complete  
**Scope:** Right-column composer only. No spiral, sticky, report UI, or detection workflow.

---

## Sources

| Original (`integrito.app`) | Reused as |
|----------------------------|-----------|
| `src/utils/textMetrics.ts` | `src/utils/textMetrics.ts` |
| `PromptInput.tsx` landing chrome + autosize | `src/components/DetectorComposer.tsx` (simplified) |
| `main.css` `.prompt*` styles | `src/components/DetectorComposer.css` |

---

## Behavior

- Textarea: 2-line min (48px) → 6-line max (144px), then internal scroll
- Counters: `N / 3,000 words · ≈ X pages` (275 words/page)
- Paste + Clear + live counting; no silent truncation
- Detect AI: validation only (empty / over-limit); **no fake result**
- No heading above the composer

---

## Screenshots

`artifacts/step-03-2/` — empty/expanded × light/dark; viewports 1920 / 1440 / 1280 / 390

`npx tsc -b && npx vite build` — pass
