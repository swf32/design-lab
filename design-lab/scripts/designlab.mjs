#!/usr/bin/env node
import {
  CONTEXT_KINDS,
  browseSource,
  buildContextCatalog,
  getContextEntities,
  getContextEntity,
  searchContext,
  writeContextIndex,
} from '../server/services/contextGateway.mjs'
import { listSources } from '../server/services/projectRegistry.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import {
  closeComponentCaptureRuntime,
  getComponentCaptureInfo,
  renderComponentCapture,
} from '../server/services/componentCapture.mjs'

const args = process.argv.slice(2)
const command = args[0] ?? 'help'

const VALUED_FLAGS = new Set([
  '--source',
  '--kind',
  '--kinds',
  '--limit',
  '--index',
  '--path',
  '--depth',
  '--capture',
  '--story',
  '--source-mode',
  '--interface-theme',
  '--output',
])

function option(name) {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : null
}

// Positional args (the command word plus anything that is not a known flag or a known flag's
// value) — needed once `get` accepts a variable number of refs, so a flag's own value (e.g. the
// "token" in "--kind token") is never mistaken for another ref.
function positionalArgs() {
  const positionals = []
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index]
    if (VALUED_FLAGS.has(arg)) {
      index += 1
      continue
    }
    if (arg.startsWith('--')) continue
    positionals.push(arg)
  }
  return positionals
}

function selectedKinds() {
  const raw = option('--kind') ?? option('--kinds')
  return raw
    ? raw
        .split(',')
        .map((kind) => kind.trim())
        .filter(Boolean)
    : CONTEXT_KINDS
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

function help() {
  process.stdout.write(`Design Lab AI context CLI

Usage:
  npm run designlab -- sources
  npm run designlab -- catalog --source <source-id> [--kind component,token]
  npm run designlab -- search "<intent>" --source <source-id> [--kind component] [--limit 8]
  npm run designlab -- get <entity-ref> [<entity-ref> ...] [--source <source-id>]
  npm run designlab -- get --index <number> --source <source-id>
  npm run designlab -- browse --source <source-id> --kind token [--path color.accent] [--depth 2]
  npm run designlab -- capture <component-ref> [--capture info|preview|story] [--story sizes]
    [--source-mode <mode>] [--interface-theme dark|light] [--output capture.png]
  npm run designlab -- index --source <source-id>

Search intentionally returns descriptions and opaque refs, not entity names.
Call get with a ref to reveal the verified name, import, props, variants, docs, and paths; pass
several refs to resolve them in one call. Call browse to walk canonical component/token/asset/
wireframe/page folders one path segment at a time instead of guessing an id.
`)
}

try {
  if (command === 'sources') {
    const result = await listSources()
    print(result.sources.map(({ id, name, kind, available }) => ({ id, name, kind, available })))
  } else if (command === 'catalog') {
    const catalog = await buildContextCatalog({
      sourceId: option('--source'),
      kinds: selectedKinds(),
    })
    print({
      schemaVersion: catalog.schemaVersion,
      sources: catalog.sources,
      entities: catalog.entities.map(({ index, ref, kind, source, description }) => ({
        index,
        ref,
        kind,
        source,
        description,
      })),
    })
  } else if (command === 'search') {
    const query = args[1]
    if (!query || query.startsWith('--')) throw new Error('search requires an intent query')
    print(
      await searchContext({
        query,
        sourceId: option('--source'),
        kinds: selectedKinds(),
        limit: Number(option('--limit') ?? 8),
      }),
    )
  } else if (command === 'get') {
    const refs = positionalArgs()
    const indexOption = option('--index')
    if (refs.length > 1) {
      print(
        await getContextEntities({
          refs,
          sourceId: option('--source'),
          kinds: selectedKinds(),
        }),
      )
    } else {
      print(
        await getContextEntity({
          ref: refs[0] ?? null,
          index: indexOption,
          sourceId: option('--source'),
          kinds: selectedKinds(),
        }),
      )
    }
  } else if (command === 'browse') {
    print(
      await browseSource({
        sourceId: option('--source'),
        kind: option('--kind'),
        path: option('--path'),
        depth: option('--depth') ? Number(option('--depth')) : undefined,
      }),
    )
  } else if (command === 'capture') {
    const ref = positionalArgs()[0]
    if (!ref) throw new Error('capture requires a Component ref')
    const capture = option('--capture') ?? 'info'
    const interfaceTheme = option('--interface-theme') ?? 'dark'
    try {
      if (capture === 'info') {
        print(await getComponentCaptureInfo(ref, interfaceTheme))
      } else {
        const result = await renderComponentCapture({
          ref,
          capture,
          storyId: option('--story'),
          sourceMode: option('--source-mode'),
          interfaceTheme,
        })
        const safeName = [
          result.metadata.component.id,
          capture,
          result.metadata.storyId,
          result.metadata.sourceMode,
          result.metadata.interfaceTheme,
          '@2x',
        ]
          .filter(Boolean)
          .join('-')
          .replace(/[^a-zA-Z0-9@._-]+/g, '-')
        const outputPath = resolve(option('--output') ?? `.designlab/renders/${safeName}.png`)
        await mkdir(dirname(outputPath), { recursive: true })
        await writeFile(outputPath, result.png)
        print({ ...result.metadata, outputPath })
      }
    } finally {
      await closeComponentCaptureRuntime()
    }
  } else if (command === 'index') {
    print(await writeContextIndex({ sourceId: option('--source') }))
  } else {
    help()
  }
} catch (error) {
  process.stderr.write(`Design Lab: ${error.message}\n`)
  process.exitCode = 1
}
