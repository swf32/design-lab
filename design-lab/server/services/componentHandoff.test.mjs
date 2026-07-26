import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  assertComponentSourcePath,
  getComponentHandoff,
  handoffLanguage,
} from './componentHandoff.mjs'

test('handoff reports platform source languages', () => {
  assert.equal(handoffLanguage('Button.swift'), 'swift')
  assert.equal(handoffLanguage('Button.kt'), 'kotlin')
  assert.equal(handoffLanguage('Button.vue'), 'vue')
  assert.equal(handoffLanguage('unknown.xyz'), 'text')
})

test('handoff source paths cannot leave the canonical components root', () => {
  const root = resolve('/tmp/design-lab-project/components')
  assert.doesNotThrow(() => assertComponentSourcePath(root, resolve(root, 'ios/Button.swift')))
  assert.throws(
    () => assertComponentSourcePath(root, resolve(root, '../secrets.txt')),
    (error) => error.code === 'COMPONENT_SOURCE_OUTSIDE_SOURCE',
  )
})

test('discovered native source is returned as read-only handoff with explicit provenance', async () => {
  const libraries = await mkdtemp(join(tmpdir(), 'design-lab-handoff-'))
  const previous = process.env.DESIGN_LAB_LIBRARIES_DIR
  process.env.DESIGN_LAB_LIBRARIES_DIR = libraries
  try {
    const library = join(libraries, 'mobile-system')
    await mkdir(join(library, 'components', 'ios'), { recursive: true })
    await writeFile(
      join(library, 'library.json'),
      JSON.stringify({ id: 'mobile-system', name: 'Mobile System', kind: 'library' }),
    )
    const swift =
      'import SwiftUI\n\nstruct ProfileCard: View { var body: some View { Text("Profile") } }\n'
    await writeFile(join(library, 'components', 'ios', 'ProfileCard.swift'), swift)

    const handoff = await getComponentHandoff('mobile-system', 'ios/ProfileCard')
    assert.equal(handoff.language, 'swift')
    assert.equal(handoff.platform, 'ios')
    assert.equal(handoff.provenance.kind, 'authored')
    assert.equal(handoff.source, swift)
    assert.equal(handoff.warnings.length, 1)
  } finally {
    if (previous === undefined) delete process.env.DESIGN_LAB_LIBRARIES_DIR
    else process.env.DESIGN_LAB_LIBRARIES_DIR = previous
    await rm(libraries, { recursive: true, force: true })
  }
})
