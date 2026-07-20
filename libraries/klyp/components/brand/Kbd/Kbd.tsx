import './Kbd.scss'

import type { ComponentProps, ReactNode } from 'react'

// =====================================================================
// Kbd — Klyp brand atom (keyboard shortcut display)
// =====================================================================
//
// Renders a single keycap or a chord like "cmd+k" → "⌘ K".
// One of 3 places where `font-mono` IS allowed (per .claude/rules/styles.md):
// Kbd, Script Editor (screenplay), <pre>/<code> blocks.

const SYMBOLS: Record<string, string> = {
  cmd: '⌘',
  // Text, not the mac-only '⌃' caret — Windows/Linux users read "Ctrl";
  // the caret was mistaken for an arrow (Val 2026-07-02).
  ctrl: 'Ctrl',
  alt: '⌥',
  opt: '⌥',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  tab: '⇥',
  esc: 'Esc',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  backspace: '⌫',
  delete: '⌦',
  space: '␣',
}

function tokenize(combo: string): string[] {
  return combo
    .toLowerCase()
    .split(/\s*\+\s*/)
    .map((k) => SYMBOLS[k] ?? k.toUpperCase())
}

export type KbdSize = 'sm' | 'md'

export type KbdProps = ComponentProps<'kbd'> & {
  /** Combo like "cmd+k" or "shift+enter". Children take precedence if present. */
  combo?: string
  size?: KbdSize
  children?: ReactNode
}

export function Kbd({ combo, size = 'sm', className, children, ...props }: KbdProps) {
  const content = children ?? (combo ? tokenize(combo).join(' ') : null)
  return (
    <kbd
      data-slot="kbd"
      data-size={size}
      className={typeof className === 'string' ? `klyp-Kbd ${className}` : 'klyp-Kbd'}
      {...props}
    >
      {content}
    </kbd>
  )
}
