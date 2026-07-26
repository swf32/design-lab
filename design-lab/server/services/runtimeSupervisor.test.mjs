import assert from 'node:assert/strict'
import test from 'node:test'
import { RuntimeSupervisor } from './runtimeSupervisor.mjs'

function deferred() {
  let resolve
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

test('parallel requests share one runtime launch and dispose cleanly', async () => {
  let launches = 0
  let closes = 0
  const supervisor = new RuntimeSupervisor({
    launch: async () => {
      launches += 1
      return {
        origin: 'http://127.0.0.1:5401',
        close: async () => {
          closes += 1
        },
      }
    },
  })
  const profile = { id: 'source:vue:one', technology: 'vue' }

  const [first, second] = await Promise.all([
    supervisor.ensure(profile),
    supervisor.ensure(profile),
  ])

  assert.equal(launches, 1)
  assert.equal(first.status, 'ready')
  assert.deepEqual(second, first)
  assert.equal((await supervisor.dispose(profile.id)).status, 'stopped')
  assert.equal(closes, 1)
})

test('one failed profile does not change a neighboring ready runtime', async () => {
  const supervisor = new RuntimeSupervisor({
    launch: async (profile) => {
      if (profile.technology === 'vue') throw new Error('Vue dependency is missing')
      return { origin: 'http://127.0.0.1:5402', close: async () => {} }
    },
  })

  const react = await supervisor.ensure({ id: 'source:react:one', technology: 'react' })
  await assert.rejects(
    supervisor.ensure({ id: 'source:vue:one', technology: 'vue' }),
    /Vue dependency is missing/,
  )

  assert.equal(react.status, 'ready')
  assert.equal(supervisor.status('source:react:one').status, 'ready')
  assert.deepEqual(supervisor.status('source:vue:one').error, {
    code: 'RUNTIME_START_FAILED',
    message: 'Vue dependency is missing',
  })
})

test('unexpected process exit is localized as a profile error', async () => {
  const exit = deferred()
  const supervisor = new RuntimeSupervisor({
    launch: async () => ({
      origin: 'http://localhost:5403',
      close: async () => {},
      closed: exit.promise,
    }),
  })

  await supervisor.ensure({ id: 'source:svelte:one', technology: 'svelte' })
  exit.resolve({ code: 7 })
  await Promise.resolve()

  assert.equal(supervisor.status('source:svelte:one').status, 'error')
  assert.match(supervisor.status('source:svelte:one').error.message, /code 7/)
})

test('managed runtime origins must stay on loopback', async () => {
  let closed = false
  const supervisor = new RuntimeSupervisor({
    launch: async () => ({
      origin: 'http://0.0.0.0:5404',
      close: async () => {
        closed = true
      },
    }),
  })

  await assert.rejects(supervisor.ensure({ id: 'source:react:unsafe', technology: 'react' }), {
    code: 'RUNTIME_ORIGIN_UNSAFE',
  })
  assert.equal(closed, true)
})
