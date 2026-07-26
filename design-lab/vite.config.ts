import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { designLabInspectionPlugin } from './scripts/inspectionTransform.mjs'

const designLabPort = Number.parseInt(process.env.DESIGN_LAB_PORT ?? '5317', 10)
const designLabApiPort = Number.parseInt(process.env.DESIGN_LAB_API_PORT ?? '4173', 10)

export default defineConfig({
  plugins: [designLabInspectionPlugin(resolve(import.meta.dirname, '..')), react()],
  resolve: {
    alias: {
      // Klyp's own `@klyp/icons` package was never published to npm — it's
      // migrated in-place under libraries/klyp/assets/icons. This alias is a
      // narrow, component-scoped stopgap (Button + MeshButton only, per
      // D-056) until the library dependency-resolution strategy is decided.
      '@klyp/icons': resolve(import.meta.dirname, '../libraries/klyp/assets/icons'),
    },
  },
  server: {
    port: designLabPort,
    strictPort: true,
    proxy: {
      '/api': `http://127.0.0.1:${designLabApiPort}`,
    },
  },
})
