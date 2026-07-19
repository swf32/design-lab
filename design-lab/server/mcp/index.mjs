#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { CONTEXT_KINDS, getContextEntity, searchContext } from '../services/contextGateway.mjs'
import { listSources } from '../services/projectRegistry.mjs'

const kindSchema = z.enum(CONTEXT_KINDS)
const server = new McpServer(
  { name: 'design-lab', version: '0.1.0' },
  {
    instructions: [
      'Use designlab_search before creating interface code or design-system entities.',
      'Search results intentionally hide entity names and expose descriptions plus refs.',
      'Call designlab_get with the selected ref before writing code. Reuse the verified import and public contract.',
      'The Design Lab filesystem is the source of truth; this server is read-only.',
    ].join(' '),
  },
)

function text(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] }
}

server.registerTool(
  'designlab_sources',
  {
    title: 'List Design Lab sources',
    description:
      'List canonical Projects and Libraries available to Design Lab. Call this when the source id is unknown.',
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async () => {
    const result = await listSources()
    return text(
      result.sources.map(({ id, name, kind, available }) => ({ id, name, kind, available })),
    )
  },
)

server.registerTool(
  'designlab_search',
  {
    title: 'Search the design system by intent',
    description:
      'Rank existing Design Lab entities by their purpose, description, aliases, tags, props, and fuzzy relevance. Names stay hidden to reduce name-led reuse mistakes; use the returned ref with designlab_get.',
    inputSchema: {
      query: z
        .string()
        .min(2)
        .describe(
          'Natural-language intent, such as "text entry with validation" or "switch between themes".',
        ),
      sourceId: z
        .string()
        .optional()
        .describe('Optional Project or Library id. Omit to search every available source.'),
      kinds: z
        .array(kindSchema)
        .optional()
        .describe('Optional entity kinds. Use ["component"] before creating UI code.'),
      limit: z.number().int().min(1).max(25).default(8),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ query, sourceId, kinds, limit }) =>
    text(await searchContext({ query, sourceId, kinds, limit })),
)

server.registerTool(
  'designlab_get',
  {
    title: 'Get a verified Design Lab entity',
    description:
      'Resolve a search ref or catalog index into the complete filesystem-backed entity, including its name, import, props, variants, states, documentation, and source paths.',
    inputSchema: {
      ref: z
        .string()
        .optional()
        .describe('Stable ref returned by designlab_search. Preferred over a numeric index.'),
      index: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Catalog index from the same source and entity-kind scope.'),
      sourceId: z
        .string()
        .optional()
        .describe('Required for an unambiguous numeric index; optional with a stable ref.'),
      kinds: z.array(kindSchema).optional(),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ ref, index, sourceId, kinds }) => {
    if (!ref && !index) {
      return { isError: true, content: [{ type: 'text', text: 'Provide ref or index.' }] }
    }
    return text(await getContextEntity({ ref, index, sourceId, kinds }))
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
