import { readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { getSource } from './projectRegistry.mjs'

const manifestByModule = {
  pages: 'page.json',
  wireframes: 'wireframe.json',
}

export async function patchEntityManifest(sourceId, moduleId, directory, patch) {
  const manifestName = manifestByModule[moduleId]
  if (!manifestName)
    throw Object.assign(new Error(`Unsupported manifest module "${moduleId}".`), {
      code: 'MANIFEST_MODULE_UNSUPPORTED',
      status: 400,
    })

  const source = await getSource(sourceId)
  const manifestPath = join(source.path, moduleId, directory, manifestName)
  let manifest
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT')
      throw Object.assign(new Error(`${manifestName} was not found for "${directory}".`), {
        code: 'MANIFEST_NOT_FOUND',
        status: 404,
      })
    throw error
  }

  if (patch.flow?.nodes) {
    const patchById = new Map(patch.flow.nodes.map((node) => [node.id, node]))
    const nodes = manifest.flow?.nodes ?? []
    manifest.flow = {
      ...(manifest.flow ?? {}),
      nodes: nodes.map((node) => {
        const next = patchById.get(node.id)
        if (!next) return node
        return {
          ...node,
          x: next.x,
          y: next.y,
        }
      }),
    }
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  return {
    moduleId,
    directory,
    file: basename(manifestPath),
    manifest,
  }
}
