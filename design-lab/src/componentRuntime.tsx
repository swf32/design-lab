import { Fragment, isValidElement, type ComponentType, type ReactNode } from 'react'
import type { ModuleData } from './api/projects'
import type { ComponentPlaygroundModule } from '@design-lab/system/playground'
import { printArrayExpression, printJsxElement, printObjectExpression } from './storySourcePrinter'

export type ComponentEntity = Extract<ModuleData, { kind: 'components' }>['components'][number]

type PreviewModule = Record<string, ComponentType>
const previewModules = import.meta.glob<PreviewModule>(
  '../../libraries/*/components/**/*.preview.tsx',
  { eager: true },
)

export type StoryExample = {
  label: string
  props: Record<string, unknown>
  source?: string
  imports?: string[]
}

export type StoryDefinition = {
  id: string
  kind?: 'variant' | 'state' | 'behavior' | 'context' | 'integration' | 'accessibility'
  name: string
  description?: string
  interactive?: boolean
  imports?: string[]
  examples?: StoryExample[]
}

export type StoryModule = {
  stories?: StoryDefinition[]
  renderStoryExample?: (example: StoryExample, story: StoryDefinition) => ReactNode
  __designLabStoryImports?: StoryRuntimeImport[]
}

type StoryRuntimeImport = {
  value: unknown
  symbol: string
  statement: string
}

const storyModules = import.meta.glob<StoryModule>(
  '../../libraries/*/components/**/*.stories.{ts,tsx}',
  { eager: true },
)

const playgroundModules = import.meta.glob<ComponentPlaygroundModule>(
  '../../libraries/*/components/**/*.playground.{ts,tsx}',
  { eager: true },
)

export function previewComponentFor(component: ComponentEntity, sourceId: string) {
  if (component.adapter !== 'react-manifest') return null
  if (!component.preview) return null
  const suffix = `/libraries/${component.sourceId ?? sourceId}/components/${component.directory}/${component.preview}`
  const module = Object.entries(previewModules).find(([path]) => path.endsWith(suffix))?.[1]
  return module && Object.values(module).find((value) => typeof value === 'function')
}

export function storyModuleFor(component: ComponentEntity) {
  if (component.adapter !== 'react-manifest') return null
  if (!component.stories) return null
  const suffix = `/libraries/${component.sourceId}/components/${component.directory}/${component.stories}`
  return Object.entries(storyModules).find(([path]) => path.endsWith(suffix))?.[1] ?? null
}

export function playgroundModuleFor(component: ComponentEntity) {
  if (component.adapter !== 'react-manifest') return null
  if (!component.playground) return null
  const suffix = `/libraries/${component.sourceId}/components/${component.directory}/${component.playground}`
  return Object.entries(playgroundModules).find(([path]) => path.endsWith(suffix))?.[1] ?? null
}

function serializeProp(name: string, value: unknown) {
  if (name === 'children' || value === undefined) return null
  if (value === true) return name
  if (typeof value === 'string') return `${name}=${JSON.stringify(value)}`
  if (typeof value === 'number' || typeof value === 'boolean' || value === null)
    return `${name}={${String(value)}}`
  const serialized = JSON.stringify(value)
  return serialized === undefined ? `${name}={/* provide ${name} */}` : `${name}={${serialized}}`
}

function serializeRequiredProp(name: string, type: string, label: string) {
  const normalized = type.toLowerCase()
  if (normalized.includes('=>') || normalized.includes('function'))
    return `${name}={() => undefined}`
  if (normalized.includes('string') || normalized.includes('reactnode'))
    return `${name}=${JSON.stringify(label)}`
  if (normalized.includes('boolean')) return name
  if (normalized.includes('number')) return `${name}={0}`
  if (normalized.includes('[]') || normalized.includes('array')) return `${name}={[]}`
  return `${name}={/* required ${name} */}`
}

function fallbackExampleSource(component: ComponentEntity, example: StoryExample) {
  const symbol =
    component.import?.symbol ?? component.entry?.replace(/\.[^.]+$/, '') ?? component.name
  const publicProps = component.props ?? {}
  const propLines = Object.entries(example.props)
    .filter(([name]) => name === 'children' || name in publicProps)
    .map(([name, value]) => serializeProp(name, value))
    .filter((value): value is string => Boolean(value))
  for (const [name, definition] of Object.entries(publicProps)) {
    if (
      definition.required &&
      name !== 'children' &&
      example.props[name] === undefined &&
      !propLines.some((prop) => prop === name || prop.startsWith(`${name}=`))
    )
      propLines.push(serializeRequiredProp(name, definition.type, example.label))
  }
  const children = example.props.children
  const childSource =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : children == null
        ? null
        : `{${JSON.stringify(children)}}`
  const resolvedChildren =
    childSource ?? (component.props?.children?.required ? example.label : null)
  return printJsxElement(symbol, propLines, resolvedChildren ?? '')
}

function jsxText(value: string | number) {
  const text = String(value)
  return /[<>{}\n\r]/.test(text) ? `{${JSON.stringify(text)}}` : text
}

function runtimeName(value: unknown) {
  if (typeof value === 'function')
    return (value as { displayName?: string; name?: string }).displayName ?? value.name
  if (typeof value === 'object' && value) return (value as { displayName?: string }).displayName
  return undefined
}

function serializeRuntimeExpression(
  value: unknown,
  imports: StoryRuntimeImport[],
  usedImports: Set<string>,
  depth: number,
  seen: WeakSet<object>,
): string {
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean' || value === null)
    return String(value)
  if (typeof value === 'function') {
    const source = Function.prototype.toString.call(value)
    return source.includes('[native code]') ? '() => undefined' : source
  }
  if (isValidElement(value)) {
    const nested = serializeRuntimeNode(value, imports, usedImports, depth)
    return nested.trim()
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) return '/* circular array */ []'
    seen.add(value)
    const items = value.map((item) =>
      serializeRuntimeExpression(item, imports, usedImports, depth + 1, seen),
    )
    seen.delete(value)
    return printArrayExpression(items)
  }
  if (typeof value === 'object') {
    if (seen.has(value)) return '/* circular object */ {}'
    seen.add(value)
    const entries = Object.entries(value).map(([key, entry]) => {
      const property = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
      return `${property}: ${serializeRuntimeExpression(entry, imports, usedImports, depth + 1, seen)}`
    })
    seen.delete(value)
    return printObjectExpression(entries)
  }
  return 'undefined'
}

function serializeRuntimeValue(
  value: unknown,
  imports: StoryRuntimeImport[],
  usedImports: Set<string>,
  depth: number,
): string | null {
  if (value === undefined) return null
  if (typeof value === 'string') return JSON.stringify(value)
  return `{${serializeRuntimeExpression(value, imports, usedImports, depth, new WeakSet())}}`
}

function serializeRuntimeNode(
  node: ReactNode,
  imports: StoryRuntimeImport[],
  usedImports: Set<string>,
  depth = 0,
): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return jsxText(node)
  if (Array.isArray(node))
    return node
      .map((child) => serializeRuntimeNode(child, imports, usedImports, depth))
      .filter(Boolean)
      .join('\n')
  if (!isValidElement(node)) return '{/* rendered value */}'

  const props = node.props as Record<string, unknown>
  const typeName = runtimeName(node.type)
  if (node.type === Fragment) {
    const fragmentChildren = serializeRuntimeNode(
      props.children as ReactNode,
      imports,
      usedImports,
      depth + 1,
    )
    if (!fragmentChildren) return '<></>'
    if (!fragmentChildren.includes('\n')) return `<>${fragmentChildren}</>`
    return `<>\n${fragmentChildren
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')}\n</>`
  }
  const inspectionDescriptor = props.descriptor as { kind?: unknown; code?: unknown } | undefined
  const isInspectionBoundary =
    inspectionDescriptor != null &&
    typeof inspectionDescriptor === 'object' &&
    ['component', 'slot', 'asset'].includes(String(inspectionDescriptor.kind)) &&
    typeof inspectionDescriptor.code === 'string'
  if (isInspectionBoundary)
    return serializeRuntimeNode(props.children as ReactNode, imports, usedImports, depth)

  const inspectionSource = props.source as { sourceId?: unknown; file?: unknown } | undefined
  const isInspectionHost =
    typeof props.as === 'string' &&
    inspectionSource != null &&
    typeof inspectionSource === 'object' &&
    typeof inspectionSource.sourceId === 'string' &&
    typeof inspectionSource.file === 'string'
  const hostTag =
    typeof node.type === 'string' ? node.type : isInspectionHost ? String(props.as) : null
  const runtimeImport = imports.find((entry) => entry.value === node.type)
  const tag = hostTag ?? runtimeImport?.symbol ?? typeName ?? 'Component'
  if (runtimeImport) usedImports.add(runtimeImport.statement)

  const attributes = Object.entries(props)
    .filter(([name, value]) => {
      if (name === 'children' || name === 'key' || name === 'ref') return false
      if (isInspectionHost && (name === 'as' || name === 'source')) return false
      return value !== undefined
    })
    .map(([name, value]) => {
      if (value === true) return name
      const serialized = serializeRuntimeValue(value, imports, usedImports, depth + 1)
      return serialized ? `${name}=${serialized}` : null
    })
    .filter((value): value is string => Boolean(value))
  const children = props.children as ReactNode
  const childSource = serializeRuntimeNode(children, imports, usedImports, depth + 1)
  return printJsxElement(tag, attributes, childSource)
}

export function storySourceFor(
  component: ComponentEntity,
  story: StoryDefinition,
  renderedExamples: ReactNode[] = [],
  runtimeImports: StoryRuntimeImport[] = [],
) {
  const examples = story.examples ?? []
  if (!component.import?.statement || examples.length === 0) return null
  const usedImports = new Set<string>([
    component.import.statement,
    ...(story.imports ?? []),
    ...examples.flatMap((example) => example.imports ?? []),
  ])
  const usages = examples.map((example, index) => {
    if (example.source?.trim()) return example.source.trim()
    const rendered = renderedExamples[index]
    return rendered == null
      ? fallbackExampleSource(component, example)
      : serializeRuntimeNode(rendered, runtimeImports, usedImports)
  })
  return `${[...usedImports].join('\n')}\n\n${usages.join('\n\n')}`
}
