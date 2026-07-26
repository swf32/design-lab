import { readFile } from 'node:fs/promises'
import { extname, relative, sep } from 'node:path'
import { getModuleEntities } from './moduleEntities.mjs'
import { getSource } from './projectRegistry.mjs'
import { resolveMountedFile } from './sourceMounts.mjs'

const LANGUAGE_BY_EXTENSION = new Map([
  ['.js', 'javascript'],
  ['.jsx', 'jsx'],
  ['.ts', 'typescript'],
  ['.tsx', 'tsx'],
  ['.vue', 'vue'],
  ['.svelte', 'svelte'],
  ['.swift', 'swift'],
  ['.kt', 'kotlin'],
  ['.kts', 'kotlin'],
  ['.html', 'html'],
])

export function handoffLanguage(path) {
  return LANGUAGE_BY_EXTENSION.get(extname(path).toLowerCase()) ?? 'text'
}

export function assertComponentSourcePath(root, target) {
  const relativePath = relative(root, target)
  if (!relativePath || relativePath === '..' || relativePath.startsWith(`..${sep}`))
    throw Object.assign(new Error('Component source path escapes the components directory'), {
      status: 400,
      code: 'COMPONENT_SOURCE_OUTSIDE_SOURCE',
    })
}

export async function getComponentHandoff(sourceId, componentId) {
  const [source, data] = await Promise.all([
    getSource(sourceId),
    getModuleEntities(sourceId, 'components'),
  ])
  const component = data.components.find((candidate) => candidate.id === componentId)
  if (!component)
    throw Object.assign(new Error('Component not found'), {
      status: 404,
      code: 'COMPONENT_NOT_FOUND',
    })
  if (!component.capabilities.includes('handoff'))
    throw Object.assign(new Error('This Component does not expose source handoff'), {
      status: 409,
      code: 'COMPONENT_HANDOFF_UNAVAILABLE',
    })

  const sourcePath = component.sourcePath ?? component.entry
  if (!sourcePath)
    throw Object.assign(new Error('This Component has no source locator'), {
      status: 409,
      code: 'COMPONENT_SOURCE_UNAVAILABLE',
    })
  const relativeSourcePath = component.sourcePath
    ? component.sourcePath
    : `${component.directory}/${sourcePath}`
  let target
  try {
    target = (await resolveMountedFile(source, 'components', relativeSourcePath)).target
  } catch (error) {
    if (error.code === 'ENOENT')
      throw Object.assign(new Error('Component source file not found'), {
        status: 404,
        code: 'COMPONENT_SOURCE_NOT_FOUND',
      })
    if (error.code?.startsWith('SOURCE_'))
      throw Object.assign(
        new Error('Component source path escapes the configured component roots'),
        {
          status: 400,
          code: 'COMPONENT_SOURCE_OUTSIDE_SOURCE',
        },
      )
    throw error
  }
  try {
    return {
      componentId: component.id,
      familyId: component.familyId ?? null,
      platform: component.platform,
      technology: component.technology,
      path: relativeSourcePath,
      language: handoffLanguage(relativeSourcePath),
      source: await readFile(target, 'utf8'),
      provenance: {
        kind: component.generated ? 'generated' : 'authored',
        generated: component.generated ?? null,
      },
      warnings:
        component.platform === 'web'
          ? []
          : [
              'Source handoff is not proof of a successful native build or platform rendering. Run native validation when that capability is available.',
            ],
    }
  } catch (error) {
    if (error.code === 'ENOENT')
      throw Object.assign(new Error('Component source file not found'), {
        status: 404,
        code: 'COMPONENT_SOURCE_NOT_FOUND',
      })
    throw error
  }
}
