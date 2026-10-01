export function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

export function sendBuffer(response, status, body, contentType) {
  response.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  })
  response.end(body)
}

export async function readJson(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 64 * 1024)
      throw Object.assign(new Error('Request body is too large'), { status: 413 })
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON'), { status: 400 })
  }
}

export async function readFolderUpload(request) {
  const contentType = request.headers['content-type'] ?? ''
  if (!/^multipart\/form-data(?:;|$)/i.test(contentType))
    throw Object.assign(new Error('Choose a folder using the local Design Lab interface.'), {
      status: 415,
      code: 'INTERFACE_UPLOAD_CONTENT_TYPE_INVALID',
    })
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 64 * 1024 * 1024)
      throw Object.assign(new Error('The folder upload exceeds 64 MB.'), {
        status: 413,
        code: 'INTERFACE_UPLOAD_TOO_LARGE',
      })
    chunks.push(chunk)
  }
  let form
  try {
    form = await new Request('http://localhost/upload', {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: Buffer.concat(chunks),
    }).formData()
  } catch {
    throw Object.assign(new Error('The selected folder could not be read.'), {
      status: 400,
      code: 'INTERFACE_UPLOAD_INVALID',
    })
  }
  const files = []
  for (const [path, value] of form) {
    if (typeof value === 'string')
      throw Object.assign(new Error('The folder upload contains a non-file field.'), {
        status: 422,
        code: 'INTERFACE_UPLOAD_FILES_INVALID',
      })
    files.push({ path, bytes: Buffer.from(await value.arrayBuffer()) })
  }
  return files
}

export function sendError(response, error) {
  const status = Number.isInteger(error.status) ? error.status : 500
  sendJson(response, status, {
    error: {
      code: error.code ?? 'INTERNAL_ERROR',
      message: status === 500 ? 'Unexpected local server error' : error.message,
      ...(status < 500 && error.details !== undefined ? { details: error.details } : {}),
    },
  })
  if (status === 500) console.error(error)
}
