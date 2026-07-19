#!/usr/bin/env node
import {
  CONTEXT_KINDS,
  buildContextCatalog,
  getContextEntity,
  searchContext,
  writeContextIndex,
} from '../server/services/contextGateway.mjs'
import { listSources } from '../server/services/projectRegistry.mjs'

const args = process.argv.slice(2)
const command = args[0] ?? 'help'

function option(name) {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : null
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
  npm run designlab -- get <entity-ref> [--source <source-id>]
  npm run designlab -- get --index <number> --source <source-id>
  npm run designlab -- index --source <source-id>

Search intentionally returns descriptions and opaque refs, not entity names.
Call get with a ref to reveal the verified name, import, props, variants, docs, and paths.
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
    const locator = args[1]
    print(
      await getContextEntity({
        ref: locator && !locator.startsWith('--') ? locator : null,
        index: option('--index'),
        sourceId: option('--source'),
        kinds: selectedKinds(),
      }),
    )
  } else if (command === 'index') {
    print(await writeContextIndex({ sourceId: option('--source') }))
  } else {
    help()
  }
} catch (error) {
  process.stderr.write(`Design Lab: ${error.message}\n`)
  process.exitCode = 1
}
