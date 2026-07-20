import { readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { transformAsync } from '@babel/core'

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

function sourceForFile(file, librariesRoot) {
  const path = resolve(file)
  if (!path.startsWith(`${librariesRoot}${sep}`)) return null
  const [sourceId] = relative(librariesRoot, path).split(sep)
  const sourceRoot = join(librariesRoot, sourceId)
  return {
    id: sourceId,
    root: sourceRoot,
    file: relative(sourceRoot, path).split(sep).join('/'),
  }
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
  for (const manifestPath of filesNamed(librariesRoot, 'library.json')) {
    const sourceRoot = dirname(manifestPath)
    const library = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const componentImport =
      library.componentImport ?? (library.packageName ? `${library.packageName}/components` : null)
    for (const componentPath of filesNamed(join(sourceRoot, 'components'), 'component.json')) {
      const component = JSON.parse(readFileSync(componentPath, 'utf8'))
      if (!component.entry) continue
      const contract = {
        name: component.name,
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
        byImport.get(componentImport).set(component.name, contract)
      }
    }
  }
  return { byImport, byEntry }
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

function sourceCode(fragment, imports) {
  const prelude = referencedImports(fragment, imports)
  return prelude ? `${prelude}\n\n${fragment}` : fragment
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
              if (!statement.source.value.startsWith('.')) continue
              const resolved = existingScript(resolve(dirname(options.id), statement.source.value))
              const relativeContract = resolved ? options.contracts.byEntry.get(resolved) : null
              if (relativeContract)
                state.componentBindings.set(specifier.local.name, relativeContract)
            }
          }
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
          if (!contract) return

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
        },
      },
      JSXOpeningElement(path, state) {
        const name = path.node.name
        if (name.type !== 'JSXIdentifier' || !/^[a-z]/.test(name.name)) return
        const tag = name.name
        path.node.name = t.jsxIdentifier('__DLInspectionHost')
        path.node.attributes.unshift(
          t.jsxAttribute(t.jsxIdentifier('as'), t.stringLiteral(tag)),
          t.jsxAttribute(
            t.jsxIdentifier('source'),
            t.jsxExpressionContainer(
              descriptorNode(t, {
                sourceId: options.sourceId,
                file: options.file,
                line: path.node.loc?.start.line ?? 1,
              }),
            ),
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
