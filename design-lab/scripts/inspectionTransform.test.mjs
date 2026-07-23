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

test('review transform ignores the Design Lab application shell after self-inspection is disabled', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'design-lab-inspection-'))
  try {
    const library = join(workspace, 'libraries', 'test-system')
    const cardDirectory = join(library, 'components', 'molecules', 'ComponentCard')
    const appSourceDirectory = join(workspace, 'design-lab', 'src')
    await mkdir(cardDirectory, { recursive: true })
    await mkdir(appSourceDirectory, { recursive: true })
    await writeFile(
      join(library, 'library.json'),
      JSON.stringify({
        id: 'test-system',
        packageName: '@test/system',
        componentImport: '@test/system/components',
      }),
    )
    await writeFile(
      join(cardDirectory, 'component.json'),
      JSON.stringify({ name: 'Component Card', entry: 'ComponentCard.tsx', props: {} }),
    )
    await writeFile(
      join(cardDirectory, 'ComponentCard.tsx'),
      'export function ComponentCard() { return null }',
    )
    const entry = join(appSourceDirectory, 'App.tsx')
    const authored = `import { ComponentCard } from '@test/system/components'

export function App() {
  return <main><ComponentCard /><span>Raw shell element</span></main>
}
`
    await writeFile(entry, authored)
    const plugin = designLabInspectionPlugin(workspace)
    const result = await plugin.transform.call({}, authored, entry)
    assert.equal(result, null)
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})

test('review transform resolves the import behind a bare host `src`/`poster` attribute', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'design-lab-inspection-'))
  try {
    const library = join(workspace, 'libraries', 'test-system')
    const pageDirectory = join(library, 'pages', 'Auth')
    await mkdir(pageDirectory, { recursive: true })
    await writeFile(
      join(library, 'library.json'),
      JSON.stringify({ id: 'test-system', packageName: '@test/system' }),
    )
    const entry = join(pageDirectory, 'Auth.page.tsx')
    const authored = `import sideImage from '@test/system/assets/images/stock/side.webp'

export function Auth() {
  return <img src={sideImage} alt="" />
}
`
    await writeFile(entry, authored)
    const plugin = designLabInspectionPlugin(workspace)
    const result = await plugin.transform.call({}, authored, entry)
    assert.ok(result?.code)
    assert.match(result.code, /asset: "import sideImage/)
    assert.ok(
      result.code.includes("import sideImage from '@test/system/assets/images/stock/side.webp'"),
    )
    assert.match(result.code, /src=\{sideImage\}/)
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})

test('review transform does not fabricate an asset handoff for a literal string URL', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'design-lab-inspection-'))
  try {
    const library = join(workspace, 'libraries', 'test-system')
    const pageDirectory = join(library, 'pages', 'Auth')
    await mkdir(pageDirectory, { recursive: true })
    await writeFile(
      join(library, 'library.json'),
      JSON.stringify({ id: 'test-system', packageName: '@test/system' }),
    )
    const entry = join(pageDirectory, 'Auth.page.tsx')
    const authored = `export function Auth() {
  return <img src="https://example.com/side.webp" alt="" />
}
`
    await writeFile(entry, authored)
    const plugin = designLabInspectionPlugin(workspace)
    const result = await plugin.transform.call({}, authored, entry)
    assert.ok(result?.code)
    assert.doesNotMatch(result.code, /asset:/)
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})

test('review transform wraps a directly used TSX icon asset with an `asset` handoff', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'design-lab-inspection-'))
  try {
    const library = join(workspace, 'libraries', 'test-system')
    const assetsIconsDir = join(library, 'assets', 'icons')
    const pageDirectory = join(library, 'pages', 'Home')
    await mkdir(assetsIconsDir, { recursive: true })
    await mkdir(pageDirectory, { recursive: true })

    await writeFile(
      join(library, 'library.json'),
      JSON.stringify({
        id: 'test-system',
        iconImport: '@test/system/icons',
      }),
    )

    await writeFile(
      join(assetsIconsDir, 'StarIcon.tsx'),
      `export function StarIcon({ size = 24, ...props }: { size?: number; [key: string]: unknown }) {\n  return (\n    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>\n      <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="currentColor" />\n    </svg>\n  )\n}\n`,
    )

    const entry = join(pageDirectory, 'Home.page.tsx')
    const authored = `import { StarIcon } from '@test/system/icons'\n\nexport function Home() {\n  return <StarIcon size={16} aria-hidden=\"true\" />\n}\n`
    await writeFile(entry, authored)

    const plugin = designLabInspectionPlugin(workspace)
    const result = await plugin.transform.call({}, authored, entry)
    assert.ok(result?.code)
    assert.match(result.code, /kind:\s*"asset"/)
    assert.ok(result.code.includes("import { StarIcon } from '@test/system/icons'"))
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})

test('review transform infers TSX icon asset import behind a destructured `<Icon />` variable', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'design-lab-inspection-'))
  try {
    const library = join(workspace, 'libraries', 'test-system')
    const assetsIconsDir = join(library, 'assets', 'icons')
    const pageDirectory = join(library, 'pages', 'Home')
    await mkdir(assetsIconsDir, { recursive: true })
    await mkdir(pageDirectory, { recursive: true })

    await writeFile(
      join(library, 'library.json'),
      JSON.stringify({
        id: 'test-system',
        iconImport: '@test/system/icons',
      }),
    )

    await writeFile(
      join(assetsIconsDir, 'StarIcon.tsx'),
      `export function StarIcon({ size = 24, ...props }: { size?: number; [key: string]: unknown }) {\n  return (\n    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>\n      <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="currentColor" />\n    </svg>\n  )\n}\n`,
    )

    const entry = join(pageDirectory, 'Home.page.tsx')
    const authored = `import { StarIcon } from '@test/system/icons'\n\nconst features = [{ icon: StarIcon }]\n\nexport function Home() {\n  return <div>{features.map(({ icon: Icon }) => <Icon size={16} aria-hidden=\"true\" />)}</div>\n}\n`
    await writeFile(entry, authored)

    const plugin = designLabInspectionPlugin(workspace)
    const result = await plugin.transform.call({}, authored, entry)
    assert.ok(result?.code)
    assert.match(result.code, /kind:\s*"asset"/)
    assert.ok(result.code.includes("import { StarIcon } from '@test/system/icons'"))
    assert.match(result.code, /<Icon /)
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})

test('review transform wraps a TSX icon asset imported via a relative path', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'design-lab-inspection-'))
  try {
    const library = join(workspace, 'libraries', 'test-system')
    const assetsIconsDir = join(library, 'assets', 'icons')
    const pageDirectory = join(library, 'pages', 'Preview')
    await mkdir(assetsIconsDir, { recursive: true })
    await mkdir(pageDirectory, { recursive: true })

    await writeFile(
      join(library, 'library.json'),
      JSON.stringify({
        id: 'test-system',
        // Intentionally no iconImport; this test covers relative import resolution.
      }),
    )

    await writeFile(
      join(assetsIconsDir, 'StarIcon.tsx'),
      `export function StarIcon({ size = 24, ...props }: { size?: number; [key: string]: unknown }) {\n  return (\n    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>\n      <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="currentColor" />\n    </svg>\n  )\n}\n`,
    )

    const entry = join(pageDirectory, 'SidebarTab.preview.tsx')
    const authored = `import { StarIcon } from '../../assets/icons/StarIcon'\n\nexport function SidebarTabPreview() {\n  return <StarIcon size={20} aria-hidden=\"true\" />\n}\n`
    await writeFile(entry, authored)

    const plugin = designLabInspectionPlugin(workspace)
    const result = await plugin.transform.call({}, authored, entry)
    assert.ok(result?.code)
    assert.match(result.code, /kind:\s*"asset"/)
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})
