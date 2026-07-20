// Ambient shims so tsup's dts pass (plain tsc, no vite/client) type-checks the
// Vite features this package touches. The consumer's Vite provides the real
// implementations.
declare module '*.scss'

interface ImportMeta {
  readonly env: {
    readonly DEV: boolean
    readonly PROD: boolean
    readonly [key: string]: unknown
  }
}
