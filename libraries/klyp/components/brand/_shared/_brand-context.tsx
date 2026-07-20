/**
 * Brand runtime context. The design system is brand-AGNOSTIC: it no longer
 * reads `import.meta.env.VITE_BRAND` (that froze the brand at package-build
 * time once shipped). Instead the consuming app injects the brand at runtime
 * via <BrandProvider>, and components read it with useBrand().
 *
 * Prototype usage:
 *   import { BrandProvider } from '@klyp/brand'
 *   <BrandProvider value={{ brandId: brand.id, cdnBase: import.meta.env.VITE_R2_CDN_BASE }}>
 *     <App />
 *   </BrandProvider>
 *
 * Defaults to klyp so a bare render (catalog, tests) works without a provider.
 */

import { createContext, type ReactNode, useContext } from 'react'

export type BrandId = 'klyp' | 'unreals'

export interface BrandConfig {
  brandId: BrandId
  /** R2 CDN base URL (was VITE_R2_CDN_BASE). Empty string if unset. */
  cdnBase: string
}

const DEFAULT_BRAND: BrandConfig = { brandId: 'klyp', cdnBase: '' }

const BrandContext = createContext<BrandConfig>(DEFAULT_BRAND)

export function BrandProvider({
  value,
  children,
}: {
  value: Partial<BrandConfig>
  children: ReactNode
}) {
  return (
    <BrandContext.Provider value={{ ...DEFAULT_BRAND, ...value }}>{children}</BrandContext.Provider>
  )
}

export function useBrand(): BrandConfig {
  return useContext(BrandContext)
}
