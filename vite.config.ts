import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Must match the repository name exactly. This is a project page served from
  // https://kapsca.github.io/Diosesmon-Crianza/, so without this base Vite emits
  // root-absolute asset URLs (/assets/index-*.js) that resolve to
  // https://kapsca.github.io/assets/... and 404. Renaming the repository means
  // updating this value; there is no way to derive it that survives a rename.
  base: '/Diosesmon-Crianza/',
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './tests/setup.ts',
    css: true,
    exclude: [...configDefaults.exclude, '.github/**'],
  },
})
