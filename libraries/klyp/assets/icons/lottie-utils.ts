type RgbaTuple = [number, number, number, number]

function hexToRgbaTuple(hex: string): RgbaTuple {
  const normalized = hex.replace('#', '')
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  return [r, g, b, 1]
}

function resolveCssColor(color: string): string | null {
  if (typeof window === 'undefined') return null
  const match = color.match(/var\((--[^)]+)\)/)
  if (!match) return color.startsWith('#') ? color : null
  const value = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim()
  if (!value) return null
  if (value.startsWith('#')) return value
  const rgb = value.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/)
  if (!rgb) return null
  const toHex = (n: string) => Number(n).toString(16).padStart(2, '0')
  return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`
}

/**
 * Iconsax Lottie-иконки хранят цвет слоёв как [r,g,b,a] в 0..1. Функция обходит
 * layers → shapes → it → c.k и заменяет все непрозрачные цвета на целевой. Для
 * монохромных иконок (Bulk одного тона) даёт эффект currentColor.
 */
export function recolorLottie<T>(data: T, color: string): T {
  const resolved = resolveCssColor(color)
  if (!resolved) return data
  const target = hexToRgbaTuple(resolved)
  const clone = JSON.parse(JSON.stringify(data))

  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (!node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>
    const c = obj.c as { a?: number; k?: unknown } | undefined
    if (
      c &&
      typeof c === 'object' &&
      Array.isArray(c.k) &&
      c.k.length >= 3 &&
      typeof c.k[0] === 'number'
    ) {
      c.k = [target[0], target[1], target[2], (c.k as number[])[3] ?? 1]
    }
    for (const key of Object.keys(obj)) {
      if (key === 'c') continue
      walk(obj[key])
    }
  }

  walk(clone)
  return clone
}
