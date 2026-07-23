import { readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { transformAsync } from '@babel/core'
import { componentDisplayName, componentSymbol } from '../shared/componentIdentity.mjs'

const SCRIPT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

function filesNamed(root, name, result = []) {
  let entries = []
  try {
    entries = readdirSync(root, { withFileTypes: true })
  } catch {
    return result
  }
  for (const entry of entries) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) filesNamed(path, name, result)
    else if (entry.name === name) result.push(path)
  }
  return result
}

function filesUnder(root, predicate, current = root, result = []) {
  let entries = []
  try {
    entries = readdirSync(current, { withFileTypes: true })
  } catch {
    return result
  }
  for (const entry of entries) {
    const path = join(current, entry.name)
    if (entry.isDirectory()) filesUnder(root, predicate, path, result)
    else if (predicate(entry.name, path)) result.push(path)
  }
  return result
}

function sourceForFile(file, librariesRoot) {
  const path = resolve(file)
  if (path.startsWith(`${librariesRoot}${sep}`)) {
    const [sourceId] = relative(librariesRoot, path).split(sep)
    const sourceRoot = join(librariesRoot, sourceId)
    return {
      id: sourceId,
      root: sourceRoot,
      file: relative(sourceRoot, path).split(sep).join('/'),
    }
  }
  return null
}

function existingScript(candidate) {
  const candidates = extname(candidate)
    ? [candidate]
    : [
        candidate,
        ...SCRIPT_EXTENSIONS.map((extension) => `${candidate}${extension}`),
        ...SCRIPT_EXTENSIONS.map((extension) => join(candidate, `index${extension}`)),
      ]
  for (const path of candidates)
    try {
      readFileSync(path)
      return resolve(path)
    } catch {}
  return null
}

function readContracts(librariesRoot) {
  const byImport = new Map()
  const byEntry = new Map()
  const assetByImport = new Map() // importRoot => Set<exportedSymbolName>
  for (const manifestPath of filesNamed(librariesRoot, 'library.json')) {
    const sourceRoot = dirname(manifestPath)
    const library = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const componentImport =
      library.componentImport ?? (library.packageName ? `${library.packageName}/components` : null)

    // Code-native TSX icons are discovered as Asset entities and exported as named exports
    // from the library's canonical `iconImport` root.
    if (library.iconImport) {
      const iconsRoot = join(sourceRoot, 'assets', 'icons')
      const iconFiles = filesUnder(
        iconsRoot,
        (name, filePath) =>
          name.endsWith('.tsx') &&
          name !== 'index.ts' &&
          name !== 'index.tsx' &&
          !name.endsWith('.d.ts'),
      )
      const symbols = new Set(iconFiles.map((filePath) => basename(filePath, extname(filePath))))
      assetByImport.set(library.iconImport, symbols)
    }

    for (const componentPath of filesNamed(join(sourceRoot, 'components'), 'component.json')) {
      const component = JSON.parse(readFileSync(componentPath, 'utf8'))
      if (!component.entry) continue
      const symbol = componentSymbol(component, dirname(componentPath))
      const contract = {
        name: componentDisplayName(component, dirname(componentPath)),
        slots: new Set(
          Object.entries(component.props ?? {})
            .filter(([, definition]) => definition?.type === 'slot' || definition?.slot === true)
            .map(([name, definition]) =>
              typeof definition.slot === 'string' ? definition.slot : name,
            ),
        ),
      }
      byEntry.set(resolve(dirname(componentPath), component.entry), contract)
      if (componentImport) {
        if (!byImport.has(componentImport)) byImport.set(componentImport, new Map())
        byImport.get(componentImport).set(symbol, contract)
      }
    }
  }
  return { byImport, byEntry, assetByImport }
}

function importedName(specifier) {
  if (specifier.type === 'ImportDefaultSpecifier') return 'default'
  if (specifier.type !== 'ImportSpecifier') return null
  return specifier.imported.type === 'Identifier'
    ? specifier.imported.name
    : specifier.imported.value
}

function referencedImports(sourceFragment, imports) {
  return imports
    .filter(({ local }) => new RegExp(`\\b${local}\\b`).test(sourceFragment))
    .map(({ statement }) => statement)
    .filter((statement, index, statements) => statements.indexOf(statement) === index)
    .join('\n')
}

function importsForFragment(sourceFragment, imports, forcedLocals = []) {
  const forcedSet = new Set(forcedLocals)
  return imports
    .filter(
      ({ local }) => forcedSet.has(local) || new RegExp(`\\b${local}\\b`).test(sourceFragment),
    )
    .map(({ statement }) => statement)
    .filter((statement, index, statements) => statements.indexOf(statement) === index)
    .join('\n')
}

function sourceCode(fragment, imports) {
  const prelude = referencedImports(fragment, imports)
  return prelude ? `${prelude}\n\n${fragment}` : fragment
}

// Host attributes that plausibly hold a resolved asset import (raster image, video, or an SVG
// `<use>` reference) rather than a literal string URL. Generic by design, same as the rest of the
// transform: no icon/image distinction in the manifest, just "does this attribute's expression
// reference a local import binding".
const ASSET_ATTRIBUTES = new Set(['src', 'poster', 'href'])

// Mirrors the slot/component handoff (`sourceCode`) for host elements that were never declared as
// a manifest slot — e.g. a bare `<img src={heroImage} />` in a Page. Only attributes that actually
// resolve to a local import produce a result, so a plain string URL or a CSS `url()` value stays
// silent rather than producing a misleading empty handoff.
function assetHandoffCode(openingNode, source, imports) {
  const usages = []
  for (const attribute of openingNode.attributes) {
    if (
      attribute.type !== 'JSXAttribute' ||
      attribute.name.type !== 'JSXIdentifier' ||
      !ASSET_ATTRIBUTES.has(attribute.name.name) ||
      attribute.value?.type !== 'JSXExpressionContainer' ||
      attribute.value.expression.type === 'JSXEmptyExpression'
    )
      continue
    const expression = attribute.value.expression
    const fragment = source.slice(expression.start, expression.end)
    if (!referencedImports(fragment, imports)) continue
    usages.push({ attribute: attribute.name.name, fragment })
  }
  if (!usages.length) return null
  const prelude = referencedImports(usages.map((usage) => usage.fragment).join(' '), imports)
  const combined = usages.map((usage) => `${usage.attribute}={${usage.fragment}}`).join('\n')
  return prelude ? `${prelude}\n\n${combined}` : combined
}

function descriptorNode(t, descriptor) {
  return t.objectExpression(
    Object.entries(descriptor).map(([key, value]) =>
      t.objectProperty(t.identifier(key), t.valueToNode(value)),
    ),
  )
}

function boundaryElement(t, descriptor, child) {
  const name = t.jsxIdentifier('__DLInspectionBoundary')
  return t.jsxElement(
    t.jsxOpeningElement(
      name,
      [
        t.jsxAttribute(
          t.jsxIdentifier('descriptor'),
          t.jsxExpressionContainer(descriptorNode(t, descriptor)),
        ),
      ],
      false,
    ),
    t.jsxClosingElement(name),
    [child],
  )
}

function inspectionBabelPlugin({ types: t }, options) {
  return {
    name: 'design-lab-source-inspection',
    visitor: {
      Program: {
        enter(path, state) {
          state.imports = []
          state.componentBindings = new Map()
          state.assetComponentBindings = new Map()
          state.assetImportByLocal = new Map() // local binding => exported symbol (best-effort)
          state.assetLiteralArrays = new Map() // arrayId => Map<propKey, { forcedLocals:Set, exportedSymbols:Set }>
          state.changed = false
          for (const statement of path.node.body) {
            if (statement.type !== 'ImportDeclaration' || statement.importKind === 'type') continue
            const statementSource = options.source.slice(statement.start, statement.end)
            for (const specifier of statement.specifiers) {
              if (specifier.importKind === 'type') continue
              state.imports.push({
                local: specifier.local.name,
                statement: statementSource,
              })
              const symbol = importedName(specifier)
              const packageContract = options.contracts.byImport
                .get(statement.source.value)
                ?.get(symbol)
              if (packageContract) {
                state.componentBindings.set(specifier.local.name, packageContract)
                continue
              }

              // TSX asset components (code-native icons) exported as named exports from iconImport.
              const assetSymbolsForImport = options.contracts.assetByImport?.get(
                statement.source.value,
              )
              if (assetSymbolsForImport?.has(symbol)) {
                state.assetImportByLocal.set(specifier.local.name, symbol)
                state.assetComponentBindings.set(specifier.local.name, {
                  exportedSymbols: new Set([symbol]),
                  forcedLocals: new Set([specifier.local.name]),
                })
              }
              if (!statement.source.value.startsWith('.')) continue
              const resolved = existingScript(resolve(dirname(options.id), statement.source.value))
              if (resolved) {
                const ext = extname(resolved).toLowerCase()
                const isIconTsxAsset =
                  ext === '.tsx' && resolved.includes(`${sep}assets${sep}icons${sep}`)
                if (isIconTsxAsset) {
                  const inferredSymbol = basename(resolved, extname(resolved))
                  state.assetImportByLocal.set(specifier.local.name, inferredSymbol)
                  state.assetComponentBindings.set(specifier.local.name, {
                    exportedSymbols: new Set([inferredSymbol]),
                    forcedLocals: new Set([specifier.local.name]),
                  })
                }

                const relativeContract = options.contracts.byEntry.get(resolved)
                if (relativeContract)
                  state.componentBindings.set(specifier.local.name, relativeContract)
              }
            }
          }

          // Infer a limited set of “icon variable” patterns used in Pages/Wireframes, e.g.
          //   const features = [{ icon: StarIcon }, ...]
          //   {features.map(({ icon: Icon }) => <Icon />)}
          // If `features` is a literal array and `icon` values are imported asset bindings,
          // then `<Icon />` can be wrapped as `asset` too, with forced import prelude.
          // This is intentionally conservative: if we cannot prove the mapping, we do nothing.
          path.traverse({
            VariableDeclarator(variablePath) {
              const { node } = variablePath
              if (!node.id || node.id.type !== 'Identifier') return
              if (!node.init || node.init.type !== 'ArrayExpression') return
              const arrayName = node.id.name
              const propMap = new Map()
              for (const element of node.init.elements ?? []) {
                if (!element || element.type !== 'ObjectExpression') continue
                for (const property of element.properties) {
                  if (property.type !== 'ObjectProperty') continue
                  const key =
                    property.key.type === 'Identifier'
                      ? property.key.name
                      : property.key.type === 'StringLiteral'
                        ? property.key.value
                        : null
                  if (!key) continue
                  if (property.value.type !== 'Identifier') continue
                  const valueLocal = property.value.name
                  if (!state.assetImportByLocal.has(valueLocal)) continue
                  const existing = propMap.get(key) ?? {
                    forcedLocals: new Set(),
                    exportedSymbols: new Set(),
                  }
                  existing.forcedLocals.add(valueLocal)
                  existing.exportedSymbols.add(state.assetImportByLocal.get(valueLocal))
                  propMap.set(key, existing)
                }
              }
              if (propMap.size) state.assetLiteralArrays.set(arrayName, propMap)
            },
            CallExpression(callPath) {
              const { node } = callPath
              if (node.callee.type !== 'MemberExpression') return
              const { object, property } = node.callee
              if (property.type !== 'Identifier' || property.name !== 'map') return
              if (object.type !== 'Identifier') return
              const arrayName = object.name
              const cb = node.arguments?.[0]
              if (!cb || cb.type !== 'ArrowFunctionExpression') return
              const firstParam = cb.params?.[0]
              if (!firstParam || firstParam.type !== 'ObjectPattern') return
              const keyMap = state.assetLiteralArrays.get(arrayName)
              if (!keyMap) return
              for (const destructured of firstParam.properties ?? []) {
                if (destructured.type !== 'ObjectProperty') continue
                const key =
                  destructured.key.type === 'Identifier'
                    ? destructured.key.name
                    : destructured.key.type === 'StringLiteral'
                      ? destructured.key.value
                      : null
                if (!key) continue
                if (destructured.value.type !== 'Identifier') continue
                const targetLocal = destructured.value.name
                const inferred = keyMap.get(key)
                if (!inferred) continue
                state.assetComponentBindings.set(targetLocal, {
                  exportedSymbols: new Set([...inferred.exportedSymbols]),
                  forcedLocals: new Set([...inferred.forcedLocals]),
                })
              }
            },
          })
        },
        exit(path, state) {
          if (!state.changed) return
          path.unshiftContainer(
            'body',
            t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier('__DLInspectionBoundary'),
                  t.identifier('InspectionBoundary'),
                ),
                t.importSpecifier(
                  t.identifier('__DLInspectionHost'),
                  t.identifier('InspectionHost'),
                ),
              ],
              t.stringLiteral('@design-lab/system/inspection'),
            ),
          )
        },
      },
      JSXElement: {
        exit(path, state) {
          if (path.node.extra?.designLabWrapped) return
          const opening = path.node.openingElement
          if (opening.name.type !== 'JSXIdentifier') return
          const contract = state.componentBindings.get(opening.name.name)
          if (contract) {
            for (const attribute of opening.attributes) {
              if (
                attribute.type !== 'JSXAttribute' ||
                attribute.name.type !== 'JSXIdentifier' ||
                !contract.slots.has(attribute.name.name) ||
                attribute.value?.type !== 'JSXExpressionContainer' ||
                attribute.value.expression.type === 'JSXEmptyExpression'
              )
                continue
              const expression = attribute.value.expression
              const fragment = options.source.slice(expression.start, expression.end)
              attribute.value.expression = boundaryElement(
                t,
                {
                  kind: 'slot',
                  name: attribute.name.name,
                  code: sourceCode(fragment, state.imports),
                  sourceId: options.sourceId,
                  file: options.file,
                  line: expression.loc?.start.line ?? 1,
                },
                t.jsxExpressionContainer(expression),
              )
              state.changed = true
            }

            const fragment = options.source.slice(path.node.start, path.node.end)
            path.node.extra = { ...(path.node.extra ?? {}), designLabWrapped: true }
            const wrapped = boundaryElement(
              t,
              {
                kind: 'component',
                name: contract.name,
                code: sourceCode(fragment, state.imports),
                sourceId: options.sourceId,
                file: options.file,
                line: path.node.loc?.start.line ?? 1,
              },
              path.node,
            )
            wrapped.extra = { designLabWrapped: true }
            path.replaceWith(wrapped)
            state.changed = true
            return
          }

          const assetInfo = state.assetComponentBindings.get(opening.name.name)
          if (!assetInfo) return
          const fragment = options.source.slice(path.node.start, path.node.end)
          path.node.extra = { ...(path.node.extra ?? {}), designLabWrapped: true }
          const forcedLocals = [...assetInfo.forcedLocals]
          const importPrelude = importsForFragment(fragment, state.imports, forcedLocals)
          const code = importPrelude ? `${importPrelude}\n\n${fragment}` : fragment
          const name =
            assetInfo.exportedSymbols.size === 1
              ? [...assetInfo.exportedSymbols][0]
              : opening.name.name
          const wrapped = boundaryElement(
            t,
            {
              kind: 'asset',
              name,
              code,
              sourceId: options.sourceId,
              file: options.file,
              line: path.node.loc?.start.line ?? 1,
            },
            path.node,
          )
          wrapped.extra = { designLabWrapped: true }
          path.replaceWith(wrapped)
          state.changed = true
        },
      },
      JSXOpeningElement(path, state) {
        const name = path.node.name
        if (name.type !== 'JSXIdentifier' || !/^[a-z]/.test(name.name)) return
        const tag = name.name
        const asset = assetHandoffCode(path.node, options.source, state.imports)
        const source = {
          sourceId: options.sourceId,
          file: options.file,
          line: path.node.loc?.start.line ?? 1,
        }
        if (asset) source.asset = asset
        path.node.name = t.jsxIdentifier('__DLInspectionHost')
        path.node.attributes.unshift(
          t.jsxAttribute(t.jsxIdentifier('as'), t.stringLiteral(tag)),
          t.jsxAttribute(
            t.jsxIdentifier('source'),
            t.jsxExpressionContainer(descriptorNode(t, source)),
          ),
        )
        state.changed = true
      },
      JSXClosingElement(path) {
        const name = path.node.name
        if (name.type === 'JSXIdentifier' && /^[a-z]/.test(name.name))
          path.node.name = t.jsxIdentifier('__DLInspectionHost')
      },
    },
  }
}

export function designLabInspectionPlugin(workspaceRoot) {
  const librariesRoot = resolve(workspaceRoot, 'libraries')
  const contracts = readContracts(librariesRoot)
  return {
    name: 'design-lab-inspection-transform',
    enforce: 'pre',
    async transform(code, id) {
      const cleanId = id.split('?')[0]
      if (!/\.[jt]sx$/.test(cleanId)) return null
      const source = sourceForFile(cleanId, librariesRoot)
      if (!source) return null
      const result = await transformAsync(code, {
        filename: cleanId,
        sourceMaps: true,
        sourceFileName: cleanId,
        parserOpts: {
          sourceType: 'module',
          plugins: ['typescript', 'jsx', 'importAttributes'],
        },
        plugins: [
          [
            inspectionBabelPlugin,
            {
              id: cleanId,
              source: code,
              sourceId: source.id,
              file: source.file,
              contracts,
            },
          ],
        ],
      })
      return result?.code ? { code: result.code, map: result.map } : null
    },
  }
}
