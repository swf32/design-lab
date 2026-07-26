# Nuxt UI System

This Library is Design Lab's first committed real-world Vue runtime fixture. Its Components are
small Vue SFC wrappers around [Nuxt UI](https://ui.nuxt.com/) and run through the Library's own
Vite config, Vue plugin, source-local lock/install environment, tokens, Stories, and Playgrounds.

It is intentionally not a copied component library. Nuxt UI remains an npm dependency under its
MIT license; the adjacent Design Lab manifests, previews, Stories, and draft Playgrounds are
authored integration examples.

The fixture proves Component discovery, transparent catalog preview, production Playground controls
without iframe reload, separate draft Playground, Story rendering, light/dark token modes, HMR,
preview/Story capture, basic Vue import/usage handoff, and direct relations through the composed
`ActionField`. UI surfaces stay transparent while screenshot capture explicitly requests an opaque
product surface.

It intentionally installs the supported `@nuxt/ui` standalone Vue package instead of copying an
internal component and silently forking its styles/composables. The full `nuxt` package is not a
dependency. This fixture is outside the root npm workspace so its dependency graph remains local.

It does not claim complete Vue parity: events/state telemetry, slots and complex-value source
printing, deep Inspector, font/asset browser assertions, error fixtures, and Vue Wireframe/Page
rendering remain explicit follow-up work.
