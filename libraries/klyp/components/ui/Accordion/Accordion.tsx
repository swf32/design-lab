import './Accordion.scss'

// `ChevronDownBulk` (and the rest of `@klyp/icons/bulk`) is a deprecated
// `noIcon = () => null` shim per the 2026-05-14 bulk-pack removal. Using
// it here silently dropped the chevron from every Accordion in the app
// (found while debugging the pricing FAQ — design lead 2026-05-20). Outline is
// the canonical default everywhere per `.claude/rules/frontend.md`.
import { ChevronDownOutline } from '@klyp/icons/outline'
import type { ReactNode } from 'react'
import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
  Disclosure as RACDisclosure,
  DisclosureGroup as RACDisclosureGroup,
  type DisclosureGroupProps as RACDisclosureGroupProps,
  DisclosurePanel as RACDisclosurePanel,
  type DisclosurePanelProps as RACDisclosurePanelProps,
  type DisclosureProps as RACDisclosureProps,
  Heading as RACHeading,
} from 'react-aria-components'

// =====================================================================
// Accordion — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// RAC mapping:
//   Accordion        -> RAC DisclosureGroup
//   AccordionItem    -> RAC Disclosure
//   AccordionTrigger -> RAC Heading > RAC Button slot="trigger" + ChevronDown
//   AccordionContent -> RAC DisclosurePanel + inner padding wrapper
//
// State styling via RAC data-attrs:
//   [data-expanded], [data-disabled], [data-hovered], [data-pressed],
//   [data-focus-visible].
//
// Drop-in compat: keeps exported names Accordion / AccordionItem /
// AccordionTrigger / AccordionContent.

// === Accordion (root) ================================================
export interface AccordionProps extends Omit<RACDisclosureGroupProps, 'children'> {
  children?: ReactNode
}

export function Accordion({ className, children, ...props }: AccordionProps) {
  return (
    <RACDisclosureGroup
      {...props}
      className={typeof className === 'string' ? `klyp-Accordion ${className}` : 'klyp-Accordion'}
    >
      {children}
    </RACDisclosureGroup>
  )
}

// === AccordionItem (RAC Disclosure) ==================================
export interface AccordionItemProps extends Omit<RACDisclosureProps, 'children'> {
  children?: ReactNode
}

export function AccordionItem({ className, children, ...props }: AccordionItemProps) {
  return (
    <RACDisclosure
      {...props}
      className={
        typeof className === 'string' ? `klyp-Accordion__item ${className}` : 'klyp-Accordion__item'
      }
    >
      {children}
    </RACDisclosure>
  )
}

// === AccordionTrigger (RAC Heading + Button slot=trigger) ============
export interface AccordionTriggerProps extends Omit<RACButtonProps, 'children'> {
  children?: ReactNode
}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <RACHeading className="klyp-Accordion__heading">
      <RACButton
        {...props}
        slot="trigger"
        className={
          typeof className === 'string'
            ? `klyp-Accordion__trigger ${className}`
            : 'klyp-Accordion__trigger'
        }
      >
        <span className="klyp-Accordion__triggerLabel">{children}</span>
        <ChevronDownOutline aria-hidden="true" className="klyp-Accordion__chevron" />
      </RACButton>
    </RACHeading>
  )
}

// === AccordionContent (RAC DisclosurePanel) ==========================
export interface AccordionContentProps extends Omit<RACDisclosurePanelProps, 'children'> {
  children?: ReactNode
}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <RACDisclosurePanel
      {...props}
      className={
        typeof className === 'string'
          ? `klyp-Accordion__content ${className}`
          : 'klyp-Accordion__content'
      }
    >
      <div className="klyp-Accordion__contentInner">{children}</div>
    </RACDisclosurePanel>
  )
}
