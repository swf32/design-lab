import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

test('stdio MCP exposes the Design Lab search and get workflow', async (context) => {
  const serverPath = fileURLToPath(new URL('./index.mjs', import.meta.url))
  const client = new Client({ name: 'design-lab-test', version: '1.0.0' })
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] })
  context.after(() => client.close())
  await client.connect(transport)

  const tools = await client.listTools()
  assert.deepEqual(
    tools.tools.map((tool) => tool.name),
    ['designlab_sources', 'designlab_search', 'designlab_get'],
  )

  const search = await client.callTool({
    name: 'designlab_search',
    arguments: {
      query: 'text entry with validation',
      sourceId: 'design-lab-system',
      kinds: ['component'],
      limit: 1,
    },
  })
  const searchBody = JSON.parse(search.content[0].text)
  assert.equal(searchBody.results[0].ref, 'design-lab-system:component:input')
  assert.equal(Object.hasOwn(searchBody.results[0], 'name'), false)

  const get = await client.callTool({
    name: 'designlab_get',
    arguments: { ref: searchBody.results[0].ref, kinds: ['component'] },
  })
  const entity = JSON.parse(get.content[0].text)
  assert.equal(entity.name, 'Input')
  assert.equal(entity.details.import.from, '@design-lab/system/components')
})
