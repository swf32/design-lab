import assert from 'node:assert/strict'
import test from 'node:test'
import { resolve } from 'node:path'
import {
  mountedPublicPath,
  resolveMountedPath,
  sourceMounts,
  sourceRelativePath,
} from './sourceMounts.mjs'

const root = resolve('/tmp/design-lab-mounted-source')

test('canonical sources keep legacy module-relative paths', () => {
  const source = { path: root }
  const mounts = sourceMounts(source, 'components')
  assert.equal(mounts.length, 1)
  assert.equal(mounts[0].root, resolve(root, 'components'))
  assert.equal(mountedPublicPath(mounts, mounts[0], 'actions/Button'), 'actions/Button')
  assert.equal(
    resolveMountedPath(source, 'components', 'actions/Button/Button.tsx').target,
    resolve(root, 'components/actions/Button/Button.tsx'),
  )
})

test('one attached mount stays module-relative while multiple mounts become source-relative', () => {
  const singleSource = { path: root, mounts: { components: ['src/ui'] } }
  const single = sourceMounts(singleSource, 'components')
  assert.equal(mountedPublicPath(single, single[0], 'Button.tsx'), 'Button.tsx')
  assert.equal(
    resolveMountedPath(singleSource, 'components', 'Button.tsx').target,
    resolve(root, 'src/ui/Button.tsx'),
  )

  const source = { path: root, mounts: { components: ['packages/react/src', 'packages/vue/src'] } }
  const mounts = sourceMounts(source, 'components')
  assert.equal(mountedPublicPath(mounts, mounts[1], 'Button.vue'), 'packages/vue/src/Button.vue')
  assert.equal(
    resolveMountedPath(source, 'components', 'packages/vue/src/Button.vue').target,
    resolve(root, 'packages/vue/src/Button.vue'),
  )
})

test('mounts and entity paths cannot leave the source boundary', () => {
  assert.throws(() => sourceMounts({ path: root, mounts: { assets: ['../private'] } }, 'assets'), {
    code: 'SOURCE_MOUNT_INVALID',
  })
  assert.throws(() => sourceMounts({ path: root, mounts: { assets: ['C:\\private'] } }, 'assets'), {
    code: 'SOURCE_MOUNT_INVALID',
  })
  assert.throws(() => resolveMountedPath({ path: root }, 'assets', '../private/key.svg'), {
    code: 'SOURCE_PATH_INVALID',
  })
  assert.throws(() => sourceRelativePath({ path: root }, resolve(root, '../private')), {
    code: 'SOURCE_PATH_OUTSIDE_SOURCE',
  })
})

test('a multi-mount public path must select exactly one mount', () => {
  const source = { path: root, mounts: { pages: ['apps/web/pages', 'apps/admin/pages'] } }
  assert.throws(() => resolveMountedPath(source, 'pages', 'Checkout/page.json'), {
    code: 'SOURCE_PATH_MOUNT_AMBIGUOUS',
  })
})
