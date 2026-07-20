import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { designLabInspectionPlugin } from './scripts/inspectionTransform.mjs'

export default defineConfig({
  plugins: [designLabInspectionPlugin(resolve(import.meta.dirname, '..')), react()],
  server: {
    port: 5317,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:4173',
    },
  },
})
