import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { configDefaults, defineConfig } from 'vitest/config'

// The release version lives in `package.json`, which release-please bumps in the
// release PR. Reading it here and injecting it as a literal is what makes the
// footer follow every release with no workflow change, no environment plumbing
// and no network call, and it works in `npm run dev` too.
//
// Deliberately NOT `import pkg from './package.json'` inside a component: that
// bundles the whole manifest (scripts, devDependencies, every field) into the
// client bundle. Deliberately NOT an `import.meta.env` variable either: that
// needs env wiring in the workflow and leaves the version empty in dev.
//
// `readFileSync` instead of a JSON import because `tsconfig.node.json` has no
// `resolveJsonModule`, and the type check config was just repaired in #46 — this
// avoids moving it for a footer.
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  // Must match the repository name exactly. This is a project page served from
  // https://kapsca.github.io/Diosesmon-Crianza/, so without this base Vite emits
  // root-absolute asset URLs (/assets/index-*.js) that resolve to
  // https://kapsca.github.io/assets/... and 404. Renaming the repository means
  // updating this value; there is no way to derive it that survives a rename.
  base: '/Diosesmon-Crianza/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './tests/setup.ts',
    css: true,
    exclude: [...configDefaults.exclude, '.github/**'],
  },
})
