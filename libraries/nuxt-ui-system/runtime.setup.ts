import nuxtUi from '@nuxt/ui/vue-plugin'
import { createHead } from '@unhead/vue/client'
import type { App } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

export function setup(app: App) {
  app.use(createHead())
  app.use(
    createRouter({
      history: createMemoryHistory(),
      routes: [],
    }),
  )
  app.use(nuxtUi)
}
