export function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

export function sendBuffer(response, status, body, contentType) {
  response.writeHead(status, { 'Content-Type': contentType, 'Content-Length': body.length, 'Cache-Control': 'no-store' })
  response.end(body)
}

export async function readJson(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 64 * 1024) throw Object.assign(new Error('Request body is too large'), { status: 413 })
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON'), { status: 400 })
  }
}

export function sendError(response, error) {
  const status = Number.isInteger(error.status) ? error.status : 500
  sendJson(response, status, {
    error: {
      code: error.code ?? 'INTERNAL_ERROR',
      message: status === 500 ? 'Unexpected local server error' : error.message,
    },
  })
  if (status === 500) console.error(error)
}
