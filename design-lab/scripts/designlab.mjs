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
import { applySetupPlan, createSetupPlan } from '../server/services/setupService.mjs'
import {
  createInterfacePack,
  doctorInterfacePacks,
  installInterfacePack,
  listInterfacePacks,
  resetInterfacePack,
  useInterfacePack,
  validateInterfacePack,
} from '../server/services/interfacePacks.mjs'

const args = process.argv.slice(2)
const command = args[0] ?? 'help'

const VALUED_FLAGS = new Set([
  '--source',
  '--kind',
  '--kinds',
  '--limit',
  '--within',
  '--index',
  '--path',
  '--depth',
  '--view',
  '--capture',
  '--story',
  '--source-mode',
  '--interface-theme',
  '--output',
  '--root',
  '--name',
  '--mode',
  '--version',
  '--id',
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
  npm run designlab -- setup [--root <project-folder>] [--mode attach|managed] [--name <name>]
  npm run designlab -- setup --apply --confirm [--root <project-folder>] [--mode attach|managed]
  npm run designlab -- sources
  npm run designlab -- catalog --source <source-id> [--kind component,token]
  npm run designlab -- search "<intent>" --source <source-id> [--kind component] [--within <scope>] [--limit 8]
  npm run designlab -- get <entity-ref> [<entity-ref> ...] [--source <source-id>]
  npm run designlab -- get --index <number> --source <source-id>
  npm run designlab -- browse --source <source-id> --kind token [--view files|paths] [--path <path>] [--depth 2]
  npm run designlab -- capture <component-ref> [--capture info|preview|story] [--story sizes]
    [--source-mode <mode>] [--interface-theme dark|light] [--output capture.png]
  npm run designlab -- index --source <source-id>
  npm run designlab -- theme list|doctor|reset
  npm run designlab -- theme install <local-path|github:owner/repo#tag|npm-package> [--no-use]
  npm run designlab -- theme create <folder> [--name <name>] [--id <id>]
  npm run designlab -- theme use <id> [--version <x.y.z>]
  npm run designlab -- theme validate <folder>
  npm run designlab -- system list|doctor|reset
  npm run designlab -- system install <local-path|github:owner/repo#tag|npm-package> [--no-use]
  npm run designlab -- system create <folder> [--name <name>] [--id <id>]
  npm run designlab -- system use <id> [--version <x.y.z>]
  npm run designlab -- system validate <folder>

Search intentionally returns descriptions and opaque refs, not entity names.
Call get with a ref to reveal the verified name, import, props, variants, docs, and paths; pass
several refs to resolve them in one call. Call browse to walk canonical component/token/asset/
wireframe/page folders one path segment at a time instead of guessing an id.
For Tokens, --view files walks folders and documents before token groups; --view paths walks the
logical dotted token tree. Search --within accepts a filesystem subtree, document, logical token
group, or "document.tokens.json#logical.group".

Setup is read-only unless both --apply and --confirm are present. Before using --confirm, explain
the returned changes in plain language and ask the user to approve them. Setup never moves or
deletes existing product files.

Theme installs a CSS/token Skin over the active System. System installs a complete executable
replacement for Design Lab's interface Library. Install validates compatibility and required
entrypoints before an atomic activation; --no-use keeps the downloaded pack inactive. Reset selects
the bundled default System or removes the active Skin without deleting installed community packs.
`)
}

try {
  if (command === 'setup') {
    const input = {
      root: resolve(option('--root') ?? process.cwd()),
      name: option('--name'),
      mode: option('--mode') ?? 'attach',
    }
    if (args.includes('--apply')) {
      print(
        await applySetupPlan({
          ...input,
          confirmed: args.includes('--confirm'),
        }),
      )
    } else {
      const plan = await createSetupPlan(input)
      print({
        schemaVersion: plan.schemaVersion,
        mode: plan.mode,
        name: plan.name,
        summary: {
          frameworks: plan.scan.frameworks,
          found: plan.scan.found,
          warnings: plan.scan.warnings,
        },
        changes: plan.changes,
        requiresConfirmation: plan.requiresConfirmation,
        nextStep:
          'Explain this plan to the user in plain language. Apply it only after explicit confirmation.',
      })
    }
  } else if (command === 'sources') {
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
        within: option('--within'),
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
        view: option('--view') ?? undefined,
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
  } else if (['theme', 'skin', 'system'].includes(command)) {
    const kind = command === 'system' ? 'system' : 'skin'
    const action = args[1] ?? 'list'
    if (action === 'list') {
      print({ kind, packs: await listInterfacePacks(kind) })
    } else if (action === 'install') {
      const spec = args[2]
      if (!spec || spec.startsWith('--')) throw new Error(`${command} install requires a source`)
      print(
        await installInterfacePack(spec, {
          kind,
          activate: !args.includes('--no-use'),
        }),
      )
    } else if (action === 'create') {
      const path = args[2]
      if (!path || path.startsWith('--')) throw new Error(`${command} create requires a folder`)
      print(
        await createInterfacePack(kind, path, {
          name: option('--name') ?? undefined,
          id: option('--id') ?? undefined,
        }),
      )
    } else if (action === 'use') {
      const id = args[2]
      if (!id || id.startsWith('--')) throw new Error(`${command} use requires a pack id`)
      print(await useInterfacePack(kind, id, { version: option('--version') ?? undefined }))
    } else if (action === 'reset') {
      print(await resetInterfacePack(kind))
    } else if (action === 'doctor') {
      const result = await doctorInterfacePacks()
      print(result)
      if (!result.ok) process.exitCode = 1
    } else if (action === 'validate') {
      const path = args[2]
      if (!path || path.startsWith('--')) throw new Error(`${command} validate requires a folder`)
      const result = await validateInterfacePack(resolve(path), {
        expectedKind: kind,
        typecheckSystem: true,
      })
      print({
        valid: true,
        kind,
        id: result.manifest.id,
        name: result.manifest.name,
        version: result.manifest.version,
        designLabVersion: result.designLabVersion,
      })
    } else {
      throw new Error(`Unknown ${command} action "${action}"`)
    }
  } else {
    help()
  }
} catch (error) {
  process.stderr.write(`Design Lab: ${error.message}\n`)
  process.exitCode = 1
}
