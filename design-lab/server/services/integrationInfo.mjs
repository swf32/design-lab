import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const applicationRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))

export function getIntegrationInfo() {
  const command = process.execPath
  const serverPath = join(applicationRoot, 'server', 'mcp', 'index.mjs')
  const cliPath = join(applicationRoot, 'scripts', 'designlab.mjs')
  return {
    status: 'ready',
    transport: 'stdio',
    protocol: 'Model Context Protocol',
    server: { command, args: [serverPath] },
    config: {
      mcpServers: {
        'design-lab': { command, args: [serverPath] },
      },
    },
    cli: {
      command: `${command} ${cliPath}`,
      examples: [
        `${command} ${cliPath} sources`,
        `${command} ${cliPath} search "text entry with validation" --source design-lab-system --kind component`,
        `${command} ${cliPath} get design-lab-system:component:input`,
      ],
    },
    workflow: [
      'Search by intent before creating UI or design-system code.',
      'Choose a result by description and relevance score.',
      'Resolve its ref to verify the name, import, props, variants, states, docs, and source paths.',
      'Only create a new entity when no existing result satisfies the intent.',
    ],
  }
}
