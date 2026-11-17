import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages project sites need base `/<repo>/`.
 * Local/dev and root hosts stay `/`.
 * Set VITE_BASE in CI (e.g. from configure-pages) — do not hardcode the repo name in app code.
 */
function resolveBase(): string {
  const fromEnv = process.env.VITE_BASE
  if (fromEnv === undefined) return '/'
  if (fromEnv === '' || fromEnv === '/') return '/'
  return fromEnv.endsWith('/') ? fromEnv : `${fromEnv}/`
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: resolveBase(),
})
