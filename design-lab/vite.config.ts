import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { designLabInspectionPlugin } from './scripts/inspectionTransform.mjs'
import { resolveActiveInterface } from './server/services/interfacePacks.mjs'

const designLabPort = Number.parseInt(process.env.DESIGN_LAB_PORT ?? '5317', 10)
const designLabApiPort = Number.parseInt(process.env.DESIGN_LAB_API_PORT ?? '4173', 10)

export default defineConfig(async () => {
  const activeInterface = await resolveActiveInterface()
  const entrypoints = activeInterface.system.entrypoints

  return {
    plugins: [designLabInspectionPlugin(resolve(import.meta.dirname, '..')), react()],
    resolve: {
      alias: [
        { find: '@design-lab/system/components', replacement: entrypoints.components },
        { find: '@design-lab/system/icons', replacement: entrypoints.icons },
        { find: '@design-lab/system/i18n', replacement: entrypoints.i18n },
        { find: '@design-lab/system/inspection', replacement: entrypoints.inspection },
        { find: '@design-lab/system/playground', replacement: entrypoints.playground },
        { find: '@design-lab/system/pages', replacement: entrypoints.pages },
        { find: '@design-lab/system/wireframes', replacement: entrypoints.wireframes },
        { find: '@design-lab/system/tokens.css', replacement: entrypoints.tokens },
        {
          find: /^@design-lab\/system\/assets\/(.*)$/,
          replacement: `${entrypoints.assets}/$1`,
        },
        { find: '@design-lab/active-skin.css', replacement: activeInterface.skinStyle },
      ],
    },
    server: {
      port: designLabPort,
      strictPort: true,
      proxy: {
        '/api': `http://127.0.0.1:${designLabApiPort}`,
      },
    },
  }
})
