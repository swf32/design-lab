import { basename, extname } from 'node:path'

export function componentSymbol(manifest = {}, directory = '') {
  const entry = typeof manifest.entry === 'string' ? manifest.entry.trim() : ''
  const source = entry || basename(directory)
  return basename(source, extname(source))
}

export function humanizeComponentSymbol(symbol) {
  return String(symbol)
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function componentDisplayName(manifest = {}, directory = '') {
  const authored = typeof manifest.name === 'string' ? manifest.name.trim() : ''
  return authored || humanizeComponentSymbol(componentSymbol(manifest, directory))
}
