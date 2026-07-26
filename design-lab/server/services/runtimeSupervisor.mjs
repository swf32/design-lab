const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]'])

function supervisorError(message, code = 'RUNTIME_SUPERVISOR_INVALID') {
  return Object.assign(new Error(message), { code, status: 500 })
}

function publicState(record) {
  return {
    profileId: record.profile.id,
    technology: record.profile.technology,
    status: record.status,
    origin: record.origin,
    startedAt: record.startedAt,
    readyAt: record.readyAt,
    stoppedAt: record.stoppedAt,
    restartCount: record.restartCount,
    error: record.error,
  }
}

function validateHandle(handle) {
  if (!handle || typeof handle.close !== 'function')
    throw supervisorError('Runtime launcher must return a closeable handle.')
  let origin
  try {
    origin = new URL(handle.origin)
  } catch {
    throw supervisorError('Runtime launcher returned an invalid origin.')
  }
  if (origin.protocol !== 'http:' || !LOOPBACK_HOSTS.has(origin.hostname))
    throw supervisorError(
      'Managed runtimes must listen on an explicit loopback HTTP origin.',
      'RUNTIME_ORIGIN_UNSAFE',
    )
  return { ...handle, origin: origin.origin }
}

async function withTimeout(promise, timeoutMs, onTimeout) {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(supervisorError('Runtime did not stop in time.', 'RUNTIME_STOP_TIMEOUT')),
          timeoutMs,
        )
      }),
    ])
  } catch (error) {
    if (error.code === 'RUNTIME_STOP_TIMEOUT') await onTimeout?.()
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export class RuntimeSupervisor {
  constructor({ launch, stopTimeoutMs = 4_000 } = {}) {
    if (typeof launch !== 'function')
      throw supervisorError('RuntimeSupervisor requires a launch(profile) function.')
    this.launch = launch
    this.stopTimeoutMs = stopTimeoutMs
    this.records = new Map()
  }

  status(profileId) {
    const record = this.records.get(profileId)
    return record ? publicState(record) : null
  }

  list() {
    return [...this.records.values()].map(publicState)
  }

  async ensure(profile) {
    if (!profile?.id) throw supervisorError('Runtime profile id is required.')
    const existing = this.records.get(profile.id)
    if (existing?.status === 'ready') return publicState(existing)
    if (existing?.startPromise) return existing.startPromise
    if (existing?.status === 'stopping') await existing.stopPromise

    const previousRestarts = existing?.restartCount ?? 0
    const record = {
      profile,
      status: 'starting',
      origin: null,
      startedAt: new Date().toISOString(),
      readyAt: null,
      stoppedAt: null,
      restartCount: previousRestarts,
      error: null,
      handle: null,
      expectedClose: false,
      startPromise: null,
      stopPromise: null,
    }
    this.records.set(profile.id, record)
    record.startPromise = Promise.resolve()
      .then(() => this.launch(profile))
      .then(async (candidate) => {
        try {
          return validateHandle(candidate)
        } catch (error) {
          try {
            await candidate?.close?.()
          } catch {
            // Preserve the validation error; cleanup failure is secondary here.
          }
          throw error
        }
      })
      .then((handle) => {
        record.handle = handle
        record.origin = handle.origin
        record.status = 'ready'
        record.readyAt = new Date().toISOString()
        record.startPromise = null
        if (handle.closed && typeof handle.closed.then === 'function')
          handle.closed.then(
            (result) => this.markUnexpectedClose(record, result),
            (error) => this.markUnexpectedClose(record, { error }),
          )
        return publicState(record)
      })
      .catch((error) => {
        record.status = 'error'
        record.error = {
          code: error.code ?? 'RUNTIME_START_FAILED',
          message: error.message ?? String(error),
        }
        record.startPromise = null
        throw error
      })
    return record.startPromise
  }

  markUnexpectedClose(record, result) {
    if (record.expectedClose || record.status === 'stopped') return
    record.status = 'error'
    record.origin = null
    record.error = {
      code: 'RUNTIME_EXITED',
      message: result?.error?.message
        ? `Runtime exited: ${result.error.message}`
        : `Runtime exited unexpectedly${result?.code !== undefined ? ` with code ${result.code}` : ''}.`,
    }
  }

  async dispose(profileId) {
    const record = this.records.get(profileId)
    if (!record || record.status === 'stopped') return record ? publicState(record) : null
    if (record.stopPromise) return record.stopPromise
    if (record.startPromise) await record.startPromise.catch(() => undefined)
    record.expectedClose = true
    record.status = 'stopping'
    record.stopPromise = Promise.resolve()
      .then(async () => {
        if (record.handle)
          await withTimeout(
            Promise.resolve(record.handle.close()),
            this.stopTimeoutMs,
            record.handle.forceClose ? () => record.handle.forceClose() : undefined,
          )
        record.status = 'stopped'
        record.origin = null
        record.stoppedAt = new Date().toISOString()
        record.stopPromise = null
        return publicState(record)
      })
      .catch((error) => {
        record.status = 'error'
        record.error = { code: error.code ?? 'RUNTIME_STOP_FAILED', message: error.message }
        record.stopPromise = null
        throw error
      })
    return record.stopPromise
  }

  async restart(profileId) {
    const record = this.records.get(profileId)
    if (!record) throw supervisorError('Runtime profile is not managed.', 'RUNTIME_NOT_FOUND')
    const profile = record.profile
    const restartCount = record.restartCount + 1
    await this.dispose(profileId)
    this.records.delete(profileId)
    const state = await this.ensure(profile)
    this.records.get(profileId).restartCount = restartCount
    return { ...state, restartCount }
  }

  async disposeAll() {
    return Promise.all(this.list().map(({ profileId }) => this.dispose(profileId)))
  }
}
