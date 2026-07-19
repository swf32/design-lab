type InspectableValue =
  | string
  | number
  | boolean
  | null
  | readonly InspectableValue[]
  | { readonly [key: string]: InspectableValue }

function sanitizeInspectableValue(value: unknown, depth = 0): InspectableValue | undefined {
  if (value == null || typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'boolean') return value
  if (depth >= 3) return undefined
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeInspectableValue(item, depth + 1))
      .filter((item): item is InspectableValue => item !== undefined)
  }
  if (typeof value === 'object') {
    const sanitized = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, sanitizeInspectableValue(item, depth + 1)] as const)
      .filter((entry): entry is readonly [string, InspectableValue] => entry[1] !== undefined)
    return Object.fromEntries(sanitized)
  }
  return undefined
}

export function inspectionAttributes(
  component: string,
  publicProps: Record<string, unknown>,
): {
  'data-dl-component': string
  'data-dl-props': string
} {
  return {
    'data-dl-component': component,
    'data-dl-props': JSON.stringify(sanitizeInspectableValue(publicProps) ?? {}),
  }
}
