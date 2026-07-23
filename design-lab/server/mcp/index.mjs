#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  CONTEXT_KINDS,
  browseSource,
  getContextEntities,
  getContextEntity,
  searchContext,
} from '../services/contextGateway.mjs'
import { listSources } from '../services/projectRegistry.mjs'
import { getComponentCaptureInfo, renderComponentCapture } from '../services/componentCapture.mjs'

const kindSchema = z.enum(CONTEXT_KINDS)
const browseKindSchema = z.enum(['component', 'token', 'asset', 'wireframe', 'page'])
const server = new McpServer(
  { name: 'design-lab', version: '0.1.0' },
  {
    instructions: [
      'Use designlab_search before creating interface code or design-system entities.',
      'Search results intentionally hide entity names and expose descriptions plus refs.',
      'Call designlab_get with the selected ref before writing code. Reuse the verified import and public contract.',
      'Use designlab_capture_component to inspect available source modes and Stories, then render an isolated preview or Story Stage for visual review.',
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
      'Resolve one or more search refs (or a catalog index) into the complete filesystem-backed entity/entities, including name, import, props, variants, states, documentation, and source paths. Pass "refs" to resolve several at once in a single call; unresolved refs are returned as individual errors instead of failing the whole call.',
    inputSchema: {
      ref: z
        .string()
        .optional()
        .describe('Stable ref returned by designlab_search. Preferred over a numeric index.'),
      refs: z
        .array(z.string())
        .max(15)
        .optional()
        .describe('Multiple stable refs to resolve in one call instead of separate get calls.'),
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
  async ({ ref, refs, index, sourceId, kinds }) => {
    if (refs?.length) return text(await getContextEntities({ refs, sourceId, kinds }))
    if (!ref && !index) {
      return { isError: true, content: [{ type: 'text', text: 'Provide ref, refs, or index.' }] }
    }
    return text(await getContextEntity({ ref, index, sourceId, kinds }))
  },
)

server.registerTool(
  'designlab_browse',
  {
    title: 'Browse the design system by canonical filesystem path',
    description:
      'Walk canonical Component, Token, Asset, Wireframe, or Page groups one filesystem path segment at a time — e.g. every top-level Token category, then everything under "color", then everything under "color.accent" — instead of guessing an id or reading the full flat catalog. Returns folders and leaf refs; resolve a leaf ref with designlab_get.',
    inputSchema: {
      sourceId: z.string().describe('Project or Library id.'),
      kind: browseKindSchema.describe('Entity kind to browse.'),
      path: z
        .string()
        .optional()
        .describe(
          'Dotted or slash-delimited group path to descend into, e.g. "color.accent" for tokens or "molecules/cards" for components. Omit for the top level.',
        ),
      depth: z
        .number()
        .int()
        .min(1)
        .max(4)
        .optional()
        .describe('How many additional path segments below "path" to include. Defaults to 1.'),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ sourceId, kind, path, depth }) =>
    text(await browseSource({ sourceId, kind, path, depth })),
)

server.registerTool(
  'designlab_capture_component',
  {
    title: 'Inspect or render a Component capture',
    description:
      'Inspect the source-defined theme modes and Stories available for a Component, or render an isolated catalog preview (260×150 CSS px) or Story Stage (600×180 CSS px). Rendered PNGs use DPR 2. The source mode is independent from the dark/light Design Lab interface background.',
    inputSchema: {
      ref: z
        .string()
        .describe('Stable Component ref returned by designlab_search or designlab_get.'),
      capture: z
        .enum(['info', 'preview', 'story'])
        .default('info')
        .describe(
          'Use info first to discover every source mode and Story id without rendering an image.',
        ),
      storyId: z
        .string()
        .optional()
        .describe('Required when capture is story; use an id returned by capture=info.'),
      sourceMode: z
        .string()
        .optional()
        .describe(
          'Any mode discovered from the selected source tokens. Omit for the source default.',
        ),
      interfaceTheme: z
        .enum(['dark', 'light'])
        .default('dark')
        .describe(
          'Design Lab surface theme, independent from sourceMode. Use the mode recommendation returned by capture=info unless testing a deliberate contrast mismatch.',
        ),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ ref, capture, storyId, sourceMode, interfaceTheme }) => {
    try {
      if (capture === 'info') return text(await getComponentCaptureInfo(ref, interfaceTheme))
      const result = await renderComponentCapture({
        ref,
        capture,
        storyId,
        sourceMode,
        interfaceTheme,
      })
      return {
        content: [
          { type: 'image', data: result.png.toString('base64'), mimeType: 'image/png' },
          { type: 'text', text: JSON.stringify(result.metadata, null, 2) },
        ],
      }
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: error.message }],
      }
    }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
