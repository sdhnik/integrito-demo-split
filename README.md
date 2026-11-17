# Integrito Split

Independent website prototype — React 18 + TypeScript + Vite.

## Scripts

```bash
npm run dev      # development server (base `/`)
npm run build    # typecheck + production build
npm run preview  # preview production build
```

## GitHub Pages preview

Public preview URL (project site):

`https://sdhnik.github.io/integrito-demo-split/`

Workflow: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)

**Indexing:** The preview ships with `<meta name="robots" content="noindex, nofollow" />` so search engines do not index this demo. This is temporary — remove that meta tag when launching the production website. Do not block crawlers with `robots.txt`; they need to read the HTML to see `noindex`.

### Required repository settings

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions  
2. Ensure the default branch is `main` (workflow triggers on push to `main`).  
3. First successful run creates the `github-pages` environment.

### How deployment works

- Push to `main` runs the workflow automatically.
- Manual run: **Actions → Deploy GitHub Pages → Run workflow**.
- The workflow installs with `npm ci`, builds `dist`, and deploys via official `actions/deploy-pages`.
- Concurrent deploys are serialized (`concurrency.group: pages`).

### Vite base path

Local development uses base `/`.

GitHub Pages project hosting uses `/integrito-demo-split/` (derived at build time from `configure-pages` → `VITE_BASE`, not hardcoded in components). Override locally if needed:

```bash
VITE_BASE=/integrito-demo-split/ npm run build
npm run preview -- --base /integrito-demo-split/
```

### Mock detection on Pages

The Pages build sets `VITE_DETECTION_MODE=mock`. Preview results are simulated and labeled as non-live analysis. No API keys are used in the client build.

Other production builds keep the existing default (`disabled` unless `VITE_DETECTION_MODE` is set).

### Inspecting failures

1. Open **Actions** on the repository.  
2. Open the failed **Deploy GitHub Pages** run.  
3. Check **Build** for TypeScript/Vite errors, or **Deploy** for Pages permission/source issues.  
4. Confirm Pages source is **GitHub Actions** (not “Deploy from a branch”).
