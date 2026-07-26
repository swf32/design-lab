export const DESIGN_LAB_RUNTIME_PROTOCOL = 'designlab.runtime'
export const RUNTIME_PROTOCOL_VERSION = 1

export const RUNTIME_CAPABILITIES = Object.freeze([
  'component.preview',
  'component.story',
  'component.playground',
  'wireframe.render',
  'page.render',
  'controls.args',
  'controls.state',
  'events',
  'resize',
  'capture',
  'inspect',
  'hmr',
])

export const RUNTIME_COMMAND_TYPES = Object.freeze([
  'handshake',
  'render',
  'setArgs',
  'setState',
  'setMode',
  'capture',
  'inspect',
  'dispose',
])

export const RUNTIME_EVENT_TYPES = Object.freeze([
  'ready',
  'rendered',
  'event',
  'resize',
  'captureReady',
  'inspection',
  'error',
  'disposed',
])

const RUNTIME_MESSAGE_TYPES = new Set([...RUNTIME_COMMAND_TYPES, ...RUNTIME_EVENT_TYPES])
const RUNTIME_DIRECTIONS = {
  command: new Set(RUNTIME_COMMAND_TYPES),
  event: new Set(RUNTIME_EVENT_TYPES),
}

function protocolError(message) {
  return Object.assign(new Error(message), { code: 'RUNTIME_PROTOCOL_INVALID' })
}

function isRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function isJsonValue(value, seen = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'object' || seen.has(value)) return false
  seen.add(value)
  const valid = Array.isArray(value)
    ? value.every((item) => isJsonValue(item, seen))
    : isRecord(value) &&
      Object.entries(value).every(
        ([key, item]) => typeof key === 'string' && isJsonValue(item, seen),
      )
  seen.delete(value)
  return valid
}

function requireString(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw protocolError(`${field} must be a string`)
  return value
}

function requirePositiveNumber(value, field) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
    throw protocolError(`${field} must be a positive number`)
  return value
}

function parseCapabilities(value) {
  if (!Array.isArray(value)) throw protocolError('runtime.capabilities must be an array')
  const capabilities = value.map((capability) => requireString(capability, 'runtime capability'))
  const unknown = capabilities.filter((capability) => !RUNTIME_CAPABILITIES.includes(capability))
  if (unknown.length) throw protocolError(`Unknown runtime capabilities: ${unknown.join(', ')}`)
  if (new Set(capabilities).size !== capabilities.length)
    throw protocolError('runtime.capabilities must not contain duplicates')
  return capabilities
}

export function parseRuntimeMessage(value, options = {}) {
  if (!isRecord(value)) throw protocolError('Runtime message must be a plain object')
  if (value.protocol !== DESIGN_LAB_RUNTIME_PROTOCOL)
    throw protocolError(`Runtime message protocol must be ${DESIGN_LAB_RUNTIME_PROTOCOL}`)
  if (value.version !== RUNTIME_PROTOCOL_VERSION)
    throw protocolError(`Unsupported runtime protocol version: ${String(value.version)}`)
  const type = requireString(value.type, 'type')
  if (!RUNTIME_MESSAGE_TYPES.has(type)) throw protocolError(`Unknown runtime message type: ${type}`)
  if (options.direction && !RUNTIME_DIRECTIONS[options.direction]?.has(type))
    throw protocolError(`Runtime message type ${type} is not a ${options.direction}`)
  requireString(value.runtimeId, 'runtimeId')
  if (value.requestId !== undefined) requireString(value.requestId, 'requestId')
  if (value.payload !== undefined && !isJsonValue(value.payload))
    throw protocolError('Runtime message payload must be JSON-serializable')
  return value
}

export function createRuntimeMessage({ type, runtimeId, requestId, payload = null }) {
  return parseRuntimeMessage({
    protocol: DESIGN_LAB_RUNTIME_PROTOCOL,
    version: RUNTIME_PROTOCOL_VERSION,
    type,
    runtimeId,
    ...(requestId ? { requestId } : {}),
    payload,
  })
}

function parseCaptureDescriptor(value, kind) {
  if (!isRecord(value)) throw protocolError(`captures.${kind} must be an object`)
  if (value.kind !== kind) throw protocolError(`captures.${kind}.kind must be ${kind}`)
  const selector = requireString(value.selector, `captures.${kind}.selector`)
  const cssWidth = requirePositiveNumber(value.cssWidth, `captures.${kind}.cssWidth`)
  const cssHeight = requirePositiveNumber(value.cssHeight, `captures.${kind}.cssHeight`)
  const dpr = requirePositiveNumber(value.dpr, `captures.${kind}.dpr`)
  if (dpr > 4) throw protocolError(`captures.${kind}.dpr must not exceed 4`)
  return {
    kind,
    selector,
    cssWidth,
    cssHeight,
    dpr,
    pixelWidth: Math.round(cssWidth * dpr),
    pixelHeight: Math.round(cssHeight * dpr),
  }
}

export function parseRuntimeCaptureInfo(value) {
  if (!isRecord(value)) throw protocolError('Runtime capture info must be an object')
  if (value.protocol !== DESIGN_LAB_RUNTIME_PROTOCOL)
    throw protocolError(`Runtime capture protocol must be ${DESIGN_LAB_RUNTIME_PROTOCOL}`)
  if (value.version !== RUNTIME_PROTOCOL_VERSION)
    throw protocolError(`Unsupported runtime protocol version: ${String(value.version)}`)
  if (!isRecord(value.runtime)) throw protocolError('runtime must be an object')
  requireString(value.runtime.profileId, 'runtime.profileId')
  requireString(value.runtime.adapter, 'runtime.adapter')
  requireString(value.runtime.technology, 'runtime.technology')
  const capabilities = parseCapabilities(value.runtime.capabilities)
  if (!capabilities.includes('capture'))
    throw protocolError('runtime.capabilities must include capture')
  if (!isRecord(value.captures)) throw protocolError('captures must be an object')

  const captures = {}
  for (const kind of ['preview', 'story'])
    if (value.captures[kind] !== undefined)
      captures[kind] = parseCaptureDescriptor(value.captures[kind], kind)
  if (!Object.keys(captures).length)
    throw protocolError('captures must contain at least one capture surface')

  return {
    ...value,
    runtime: { ...value.runtime, capabilities },
    captures,
  }
}

export function createRuntimeCaptureInfo(value) {
  return parseRuntimeCaptureInfo({
    ...value,
    protocol: DESIGN_LAB_RUNTIME_PROTOCOL,
    version: RUNTIME_PROTOCOL_VERSION,
  })
}

export function getRuntimeCaptureDescriptor(value, kind) {
  const info = parseRuntimeCaptureInfo(value)
  const descriptor = info.captures[kind]
  if (!descriptor) throw protocolError(`Runtime does not provide a ${kind} capture surface`)
  return descriptor
}
