import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@klyp/ui/Accordion'
import type { ReactNode } from 'react'

import './BouncyAccordion.scss'

// =====================================================================
// BouncyAccordion — branded, data-driven disclosure list
// =====================================================================
// Unified onto the ONE accordion engine (2026-06-18): this is now a thin
// data-driven skin over the `@klyp/ui` Accordion (RAC DisclosureGroup).
// It no longer hand-rolls open-state / keyboard / aria / Motion — all of
// that comes from RAC, and the smooth open/close height animation comes
// from the ui Accordion's CSS (`--disclosure-panel-height` transition).
//
// What this layer adds (pure CSS, see .scss): the "separated card" look —
// an open row pushes a gap above/below itself and rounds its corners; the
// rows flanking it round their adjacent corners too (via `:has()` +
// sibling selectors off RAC's `[data-expanded]`). Plus 18px medium title
// and the 5% hairline.
//
// Single-expand by default; `allowMultiple` → multi-open. The `items` API
// is unchanged so existing call-sites (PricingFaq) keep working.
//
// NOTE: RAC headers use Tab to move between rows (not Up/Down arrow roving
// the old hand-rolled version had — the ui Accordion never had it either).

export interface BouncyAccordionItem {
  /** Stable id — used as the RAC Disclosure key + React key. */
  id?: string
  title: string
  description: ReactNode
}

export interface BouncyAccordionProps {
  items: BouncyAccordionItem[]
  /** Index open on mount. `null` = all collapsed. Default: `null`. */
  defaultActiveIndex?: number | null
  /** List width — number → px, string → passed through. Default `'100%'`. */
  width?: number | string
  /** Collapsed row height (px). Default `64`. */
  itemHeight?: number
  /** Allow more than one row open at a time. Default `false` (single-expand). */
  allowMultiple?: boolean
}

const DEFAULT_ITEM_HEIGHT = 64

const keyFor = (item: BouncyAccordionItem, index: number) => item.id ?? String(index)

export function BouncyAccordion({
  items,
  defaultActiveIndex = null,
  width = '100%',
  itemHeight = DEFAULT_ITEM_HEIGHT,
  allowMultiple = false,
}: BouncyAccordionProps) {
  if (items.length === 0) return null

  const defaultExpandedKeys =
    defaultActiveIndex == null || defaultActiveIndex < 0 || defaultActiveIndex >= items.length
      ? undefined
      : [keyFor(items[defaultActiveIndex], defaultActiveIndex)]

  return (
    <div
      className="klyp-BouncyAccordion"
      style={{ '--bouncy-item-h': `${itemHeight}px` } as React.CSSProperties}
    >
      <Accordion
        className="klyp-BouncyAccordion__list"
        allowsMultipleExpanded={allowMultiple}
        defaultExpandedKeys={defaultExpandedKeys}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
      >
        {items.map((item, index) => {
          const key = keyFor(item, index)
          return (
            <AccordionItem key={key} id={key} className="klyp-BouncyAccordion__item">
              <AccordionTrigger className="klyp-BouncyAccordion__trigger">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="klyp-BouncyAccordion__panel">
                {item.description}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

export default BouncyAccordion
