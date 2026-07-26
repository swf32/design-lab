import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { designLabInspectionPlugin } from './scripts/inspectionTransform.mjs'

const designLabPort = Number.parseInt(process.env.DESIGN_LAB_PORT ?? '5317', 10)
const designLabApiPort = Number.parseInt(process.env.DESIGN_LAB_API_PORT ?? '4173', 10)

export default defineConfig({
  plugins: [designLabInspectionPlugin(resolve(import.meta.dirname, '..')), react()],
  server: {
    port: designLabPort,
    strictPort: true,
    proxy: {
      '/api': `http://127.0.0.1:${designLabApiPort}`,
    },
  },
})
