import { readFile } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import { getSource } from './projectRegistry.mjs'

const contentTypes = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function assertSafeAssetPath(root, target) {
  const relativePath = relative(root, target)
  if (!relativePath || relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw Object.assign(new Error('Asset path escapes the source assets directory'), {
      status: 400,
      code: 'ASSET_PATH_OUTSIDE_SOURCE',
    })
  }
}

function sanitizeSvg(svg, { fromTsx = false } = {}) {
  if (!/^<svg\b/i.test(svg.trim()) || !/<\/svg>$/i.test(svg.trim())) {
    throw Object.assign(new Error('Icon preview requires one SVG root'), {
      status: 422,
      code: 'ICON_SVG_ROOT_REQUIRED',
    })
  }
  if (
    /<(?:script|foreignObject|iframe|object|embed|use)\b|\bon[a-z]+\s*=|\b(?:href|xlinkHref)\s*=/i.test(
      svg,
    )
  ) {
    throw Object.assign(new Error('Icon preview contains unsafe SVG content'), {
      status: 422,
      code: 'ICON_PREVIEW_UNSAFE',
    })
  }

  let result = svg
  if (fromTsx) {
    result = result
      .replace(/\{\.\.\.[^}]+\}/g, '')
      .replace(/\b(width|height)=\{[^}]+\}/g, '$1="64"')
      .replace(/\b(fill|stroke)=\{(?:color|props\.color)\}/g, '$1="currentColor"')
      .replace(/\b([a-zA-Z][\w-]*)=\{([0-9.]+)\}/g, '$1="$2"')
      .replace(/\bstrokeWidth=/g, 'stroke-width=')
      .replace(/\bstrokeLinecap=/g, 'stroke-linecap=')
      .replace(/\bstrokeLinejoin=/g, 'stroke-linejoin=')
      .replace(/\bstrokeMiterlimit=/g, 'stroke-miterlimit=')
      .replace(/\bfillRule=/g, 'fill-rule=')
      .replace(/\bclipRule=/g, 'clip-rule=')
      .replace(/\bclassName=/g, 'class=')
  }
  if (/[{}]/.test(result)) {
    throw Object.assign(new Error('Icon preview contains unsupported dynamic JSX'), {
      status: 422,
      code: 'ICON_PREVIEW_DYNAMIC_JSX',
    })
  }
  const rootDefaults = `${/\bxmlns=/.test(result) ? '' : ' xmlns="http://www.w3.org/2000/svg"'}${/\bcolor=/.test(result) ? '' : ' color="#737d78"'}`
  return result.replace(/<svg\b/, `<svg${rootDefaults}`)
}

function renderTsxIcon(source) {
  const svg = source.match(/<svg\b[\s\S]*?<\/svg>/i)?.[0]
  if (!svg)
    throw Object.assign(new Error('TSX icon does not contain an SVG root'), {
      status: 422,
      code: 'ICON_SVG_ROOT_REQUIRED',
    })
  return sanitizeSvg(svg, { fromTsx: true })
}

async function resolveAsset(sourceId, assetPath) {
  const source = await getSource(sourceId)
  const root = resolve(source.path, 'assets')
  const target = resolve(join(root, assetPath))
  assertSafeAssetPath(root, target)
  try {
    return { target, body: await readFile(target) }
  } catch (error) {
    if (error.code === 'ENOENT')
      throw Object.assign(new Error('Asset not found'), { status: 404, code: 'ASSET_NOT_FOUND' })
    throw error
  }
}

export async function getAssetFile(sourceId, assetPath) {
  const { target, body } = await resolveAsset(sourceId, assetPath)
  const contentType = contentTypes[extname(target).toLowerCase()]
  if (!contentType)
    throw Object.assign(new Error('This asset type cannot be previewed'), {
      status: 415,
      code: 'ASSET_PREVIEW_UNSUPPORTED',
    })
  return { body, contentType }
}

export async function getAssetPreview(sourceId, assetPath) {
  const { target, body } = await resolveAsset(sourceId, assetPath)
  const extension = extname(target).toLowerCase()
  if (extension === '.tsx')
    return { body: Buffer.from(renderTsxIcon(body.toString('utf8'))), contentType: 'image/svg+xml' }
  if (extension === '.svg')
    return { body: Buffer.from(sanitizeSvg(body.toString('utf8'))), contentType: 'image/svg+xml' }
  const contentType = contentTypes[extension]
  if (!contentType)
    throw Object.assign(new Error('This asset type cannot be rendered'), {
      status: 415,
      code: 'ASSET_PREVIEW_UNSUPPORTED',
    })
  return { body, contentType }
}
