import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { resolveComponentRuntimeProfile } from './runtimeProfiles.mjs'

async function fixture(context) {
  const root = await mkdtemp(join(tmpdir(), 'design-lab-runtime-profile-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'packages', 'vue-kit', 'src', 'Button'), { recursive: true })
  await writeFile(
    join(root, 'packages', 'vue-kit', 'package.json'),
    JSON.stringify({ name: '@fixture/vue-kit', dependencies: { vue: '^3.0.0' } }),
  )
  await writeFile(join(root, 'package-lock.json'), '{}')
  await writeFile(
    join(root, 'packages', 'vue-kit', 'src', 'Button', 'Button.vue'),
    '<template><button>Button</button></template>',
  )
  return root
}

test('runtime profile follows the Component mount and nearest package owner', async (context) => {
  const root = await fixture(context)
  const source = {
    id: 'fixture',
    path: root,
    mounts: { components: ['packages/vue-kit/src'] },
    packageEnvironments: [
      {
        root: 'packages/vue-kit',
        manifest: 'packages/vue-kit/package.json',
        lockfile: 'package-lock.json',
        frameworks: ['vue'],
      },
    ],
  }
  const component = {
    id: 'button',
    directory: 'Button',
    technology: 'vue',
    adapter: 'vue-sfc',
    implementation: { locator: { kind: 'file', path: 'Button.vue' } },
  }

  const profile = await resolveComponentRuntimeProfile(source, component)

  assert.match(profile.id, /^fixture:vue:[a-f0-9]{12}$/)
  assert.equal(profile.entryPublicPath, 'Button/Button.vue')
  assert.equal(profile.packageEnvironment.sourceRelativeRoot, 'packages/vue-kit')
  assert.equal(profile.packageEnvironment.manifestName, '@fixture/vue-kit')
  assert.equal(profile.packageEnvironment.packageManager, 'npm')
  assert.equal(profile.framework.packageName, 'vue')
  assert.equal(profile.framework.available, false)
})

test('two framework packages become separate stable runtime profiles', async (context) => {
  const root = await fixture(context)
  await mkdir(join(root, 'packages', 'react-kit', 'src', 'Button'), { recursive: true })
  await writeFile(
    join(root, 'packages', 'react-kit', 'package.json'),
    JSON.stringify({ name: '@fixture/react-kit', dependencies: { react: '^19.0.0' } }),
  )
  await writeFile(
    join(root, 'packages', 'react-kit', 'src', 'Button', 'Button.tsx'),
    'export function Button() { return <button>Button</button> }',
  )
  const source = {
    id: 'fixture',
    path: root,
    mounts: { components: ['packages/vue-kit/src', 'packages/react-kit/src'] },
  }
  const vue = await resolveComponentRuntimeProfile(source, {
    directory: 'packages/vue-kit/src/Button',
    sourcePath: 'packages/vue-kit/src/Button/Button.vue',
    technology: 'vue',
    adapter: 'vue-sfc',
  })
  const react = await resolveComponentRuntimeProfile(source, {
    directory: 'packages/react-kit/src/Button',
    sourcePath: 'packages/react-kit/src/Button/Button.tsx',
    technology: 'react',
    adapter: 'react-manifest',
  })

  assert.notEqual(vue.id, react.id)
  assert.equal(vue.packageEnvironment.sourceRelativeRoot, 'packages/vue-kit')
  assert.equal(react.packageEnvironment.sourceRelativeRoot, 'packages/react-kit')
})

test('runtime profiles reject source escapes and unsupported managed adapters', async (context) => {
  const root = await fixture(context)
  const source = { id: 'fixture', path: root, mounts: { components: ['packages/vue-kit/src'] } }

  await assert.rejects(
    resolveComponentRuntimeProfile(source, {
      directory: 'Button',
      sourcePath: '../outside/Button.vue',
      technology: 'vue',
    }),
    { code: 'SOURCE_PATH_INVALID' },
  )
  await assert.rejects(
    resolveComponentRuntimeProfile(source, {
      directory: 'Button',
      sourcePath: 'Button/Button.swift',
      technology: 'swiftui',
    }),
    { code: 'RUNTIME_ADAPTER_UNAVAILABLE' },
  )
})
