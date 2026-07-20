import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { designLabInspectionPlugin } from './inspectionTransform.mjs'

test('review transform discovers Component calls and manifest slots without authored markers', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'design-lab-inspection-'))
  try {
    const library = join(workspace, 'libraries', 'test-system')
    const buttonDirectory = join(library, 'components', 'atoms', 'Button')
    const wireframeDirectory = join(library, 'wireframes', 'Pricing')
    await mkdir(buttonDirectory, { recursive: true })
    await mkdir(wireframeDirectory, { recursive: true })
    await writeFile(
      join(library, 'library.json'),
      JSON.stringify({
        id: 'test-system',
        packageName: '@test/system',
        componentImport: '@test/system/components',
      }),
    )
    await writeFile(
      join(buttonDirectory, 'component.json'),
      JSON.stringify({
        name: 'Button',
        entry: 'Button.tsx',
        props: { leading: { type: 'slot' } },
      }),
    )
    await writeFile(join(buttonDirectory, 'Button.tsx'), 'export function Button() { return null }')
    const entry = join(wireframeDirectory, 'Pricing.wireframe.tsx')
    const authored = `import { Button } from '@test/system/components'
import { StarIcon } from '@test/system/icons'

export function Pricing() {
  return <Button leading={<StarIcon size={16} />}>Choose</Button>
}
`
    await writeFile(entry, authored)
    const plugin = designLabInspectionPlugin(workspace)
    const result = await plugin.transform.call({}, authored, entry)
    assert.ok(result?.code)
    assert.match(result.code, /InspectionBoundary/)
    assert.match(result.code, /InspectionHost/)
    assert.match(result.code, /kind: "component"/)
    assert.match(result.code, /kind: "slot"/)
    assert.match(result.code, /name: "leading"/)
    assert.ok(result.code.includes("import { StarIcon } from '@test/system/icons'"))
    assert.doesNotMatch(result.code, /data-dl-component|data-dl-slot|inspectionSourceAttributes/)
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})
