import assert from 'node:assert/strict'
import { execFile, spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { existsSync } from 'node:fs'
import { cp, mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { writeSystemBaseline } from '../server/services/interfacePacks.mjs'

const execFileAsync = promisify(execFile)
const applicationRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const temporary = await realpath(await mkdtemp(join(tmpdir(), 'design-lab-package-smoke-')))
const projectRoot = join(temporary, 'external-project')
const alternateSystem = join(temporary, 'alternate-system')
const smokeSkin = join(projectRoot, 'design-lab', 'skins', 'smoke-skin')
const systemRoot = join(projectRoot, 'design-lab', 'system')

async function run(command, args, cwd) {
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd,
    env: process.env,
    maxBuffer: 8 * 1024 * 1024,
    timeout: 120_000,
  })
  if (stderr.trim()) process.stderr.write(stderr)
  return stdout.trim()
}

function parse(output) {
  return JSON.parse(output)
}

async function freePort() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const port = server.address().port
  server.close()
  await once(server, 'close')
  return port
}

async function cleanDevSmoke(cli, root) {
  const uiPort = await freePort()
  const apiPort = await freePort()
  const logs = []
  const server = spawn(cli, ['dev'], {
    cwd: root,
    env: {
      ...process.env,
      DESIGN_LAB_PORT: String(uiPort),
      DESIGN_LAB_API_PORT: String(apiPort),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  for (const stream of [server.stdout, server.stderr])
    stream.on('data', (chunk) => logs.push(String(chunk)))
  try {
    let ready = false
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (server.exitCode !== null) break
      try {
        const page = await fetch(`http://localhost:${uiPort}/`)
        const health = await fetch(`http://127.0.0.1:${apiPort}/api/health`)
        if (page.ok && health.ok && (await page.text()).includes('Design Lab')) {
          ready = true
          break
        }
      } catch {
        /* Wait for the installed UI and API. */
      }
      await delay(250)
    }
    assert(ready, `Clean managed dev server did not start:\n${logs.join('').slice(-3000)}`)
    const response = await fetch(`http://127.0.0.1:${apiPort}/api/sources`)
    assert.equal(response.ok, true)
    const sources = await response.json()
    assert(sources.sources.some((source) => source.id === 'design-lab-system'))
    assert(sources.sources.some((source) => source.id === 'clean-smoke'))
  } finally {
    if (server.exitCode === null) {
      server.kill('SIGINT')
      await Promise.race([once(server, 'exit'), delay(5000)])
      if (server.exitCode === null) server.kill('SIGKILL')
    }
  }
}

async function browserSmoke(
  cli,
  {
    customStructure = false,
    createCandidate = null,
    installCandidate = null,
    resetSystem = false,
    upgradeSystem = false,
    browseProjectSystem = false,
    checkIntegrationFailure = false,
    createSkinCandidate = null,
    verifySkinAndClear = false,
    expectDefaultMatch = false,
  } = {},
) {
  const { chromium } = await import('playwright')
  const uiPort = await freePort()
  const apiPort = await freePort()
  const browserPath =
    process.env.DESIGN_LAB_BROWSER_PATH ??
    (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined)
  const stylePath = join(systemRoot, 'components/atoms/actions/Button/Button.scss')
  const originalStyle = await readFile(stylePath, 'utf8')
  let styleChanged = false
  const logs = []
  const server = spawn(cli, ['dev'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      DESIGN_LAB_PORT: String(uiPort),
      DESIGN_LAB_API_PORT: String(apiPort),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  for (const stream of [server.stdout, server.stderr])
    stream.on('data', (chunk) => logs.push(String(chunk)))
  let browser
  try {
    let ready = false
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (server.exitCode !== null) break
      try {
        const response = await fetch(`http://localhost:${uiPort}/`)
        if (response.ok) {
          ready = true
          break
        }
      } catch {
        /* Wait for both local servers. */
      }
      await delay(250)
    }
    assert(ready, `Installed dev server did not start:\n${logs.join('').slice(-3000)}`)
    browser = await chromium.launch({
      headless: true,
      ...(browserPath ? { executablePath: browserPath } : {}),
    })
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })
    const pageErrors = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.goto(`http://localhost:${uiPort}/components/design-lab-system`, {
      waitUntil: 'networkidle',
    })
    await page.getByText('Button', { exact: true }).first().click()
    await page.locator('.story-comparison .dl-button').first().waitFor({ timeout: 20_000 })
    assert((await page.locator('.story-comparison .dl-button').count()) > 0)
    assert((await page.locator('.dl-button').count()) > 1)
    if (customStructure) {
      const decorations = page.locator('.dl-button [data-system-decoration="alternate-smoke"]')
      const shellDecoration = page.locator(
        '.dl-button:not(.story-comparison .dl-button) [data-system-decoration="alternate-smoke"]',
      )
      const specimenDecoration = page.locator(
        '.story-comparison .dl-button [data-system-decoration="alternate-smoke"]',
      )
      await shellDecoration.first().waitFor()
      await specimenDecoration.first().waitFor()
      assert((await decorations.count()) > 1)
      assert(
        await page.evaluate(() =>
          [
            ...document.querySelectorAll(
              '.dl-button [data-system-decoration="alternate-smoke"] img',
            ),
          ].every((image) => image.complete && image.naturalWidth > 0),
        ),
      )
    }
    await writeFile(
      stylePath,
      `${originalStyle}\n.dl-button { outline: 3px solid rgb(12 34 56) !important; }\n`,
    )
    styleChanged = true
    await page.waitForFunction(
      () => {
        const buttons = [...document.querySelectorAll('.dl-button')]
        const shell = buttons.find((button) => !button.closest('.story-comparison'))
        const specimen = buttons.find((button) => button.closest('.story-comparison'))
        return (
          shell &&
          specimen &&
          getComputedStyle(shell).outlineColor === 'rgb(12, 34, 56)' &&
          getComputedStyle(specimen).outlineColor === 'rgb(12, 34, 56)'
        )
      },
      null,
      { timeout: 15_000 },
    )
    await writeFile(stylePath, originalStyle)
    styleChanged = false
    await page.locator('.app-sidebar__footer .sidebar-tab').click()
    await page.getByRole('heading', { name: 'Active System' }).waitFor()
    await page.getByRole('heading', { name: 'Design Lab integration' }).waitFor()
    await page.getByText('Healthy', { exact: true }).waitFor()
    if (checkIntegrationFailure) {
      const rulePath = join(projectRoot, 'design-lab/rules/COMPONENT_RULES.md')
      const rule = await readFile(rulePath, 'utf8')
      try {
        await rm(rulePath)
        assert.equal(existsSync(rulePath), false)
        const [failed] = await Promise.all([
          page.waitForResponse(async (result) => {
            if (!result.url().endsWith('/api/onboarding/status')) return false
            const report = await result.json()
            return report.diagnostics?.some((item) => item.code === 'SETUP_RULE_MISSING') ?? false
          }),
          page.getByRole('button', { name: 'Check integration' }).click(),
        ])
        assert.equal(failed.status(), 200)
        const report = await failed.json()
        assert(
          report.diagnostics.some((item) => item.code === 'SETUP_RULE_MISSING'),
          JSON.stringify(report),
        )
        await page.getByText('Needs attention', { exact: true }).waitFor()
        await page.getByText('COMPONENT_RULES.md is missing.').waitFor()
        const [preview] = await Promise.all([
          page.waitForResponse(
            (result) =>
              result.url().endsWith('/api/onboarding/repair') &&
              result.request().method() === 'GET',
          ),
          page.getByRole('button', { name: 'Preview safe repair' }).click(),
        ])
        assert.equal(preview.status(), 200)
        assert(
          (await preview.json()).changes.some(
            (item) => item.path === 'design-lab/rules/COMPONENT_RULES.md',
          ),
        )
        const [appliedRepair] = await Promise.all([
          page.waitForResponse(
            (result) =>
              result.url().endsWith('/api/onboarding/repair') &&
              result.request().method() === 'POST',
          ),
          page.getByRole('dialog').getByRole('button', { name: 'Apply safe repair' }).click(),
        ])
        assert.equal(appliedRepair.status(), 200)
        assert.equal((await appliedRepair.json()).applied, true)
        assert.equal(await readFile(rulePath, 'utf8'), rule)
        await page.getByText('Healthy', { exact: true }).waitFor()
      } finally {
        if (!existsSync(rulePath)) await writeFile(rulePath, rule)
      }
    }
    await page.getByText('Compatible', { exact: true }).waitFor()
    await page
      .getByText(
        expectDefaultMatch
          ? 'Authored files match the bundled default.'
          : 'Authored files differ from the bundled default.',
      )
      .waitFor()
    if (customStructure) {
      await page.getByRole('heading', { name: 'Components' }).waitFor()
      await page.getByText('alternate-smoke', { exact: true }).waitFor()
    }
    assert.deepEqual(pageErrors, [])
    if (browseProjectSystem) {
      await page
        .locator('.settings-section--system')
        .getByRole('button', { name: 'Browse project' })
        .click()
      for (const folder of ['design-lab', 'system'])
        await page.getByRole('dialog').getByRole('button', { name: folder, exact: true }).click()
      const [inspection] = await Promise.all([
        page.waitForResponse((result) => result.url().endsWith('/api/interface/system/inspect')),
        page.getByRole('dialog').getByRole('button', { name: 'Check this folder' }).click(),
      ])
      assert.equal(inspection.status(), 200)
      assert.equal(
        await page.getByRole('textbox', { name: 'System folder', exact: true }).inputValue(),
        'design-lab/system',
      )
    }
    if (verifySkinAndClear) {
      await page.waitForFunction(
        () =>
          getComputedStyle(document.documentElement)
            .getPropertyValue('--shell-application-background')
            .trim() === 'rgb(12 34 56)',
      )
      const clear = async () => {
        const [response] = await Promise.all([
          page.waitForResponse((result) => result.url().endsWith('/api/interface/skin/reset')),
          page.getByRole('button', { name: 'Clear Skin' }).click(),
        ])
        assert.equal(response.status(), 200)
      }
      await clear()
      const [used] = await Promise.all([
        page.waitForResponse((result) => result.url().endsWith('/api/interface/skin/use')),
        page.getByRole('button', { name: 'Use Skin' }).click(),
      ])
      assert.equal(used.status(), 200)
      await page.getByRole('button', { name: 'Clear Skin' }).waitFor()
      await clear()
    }
    if (createSkinCandidate) {
      await page.getByRole('textbox', { name: 'New Skin name' }).fill('Smoke Skin')
      await page
        .getByRole('textbox', { name: 'New Skin folder' })
        .fill(relative(projectRoot, createSkinCandidate))
      const [created] = await Promise.all([
        page.waitForResponse((result) => result.url().endsWith('/api/interface/skin/create')),
        page.getByRole('button', { name: 'Create Skin' }).click(),
      ])
      assert.equal(created.status(), 201)
      await writeFile(
        join(createSkinCandidate, 'theme.css'),
        ':root { --shell-application-background: rgb(12 34 56) !important; }\n',
      )
      await page
        .locator('.settings-section--skin')
        .getByRole('button', { name: 'Browse project' })
        .click()
      for (const folder of ['design-lab', 'skins', 'smoke-skin'])
        await page.getByRole('dialog').getByRole('button', { name: folder, exact: true }).click()
      const [inspection] = await Promise.all([
        page.waitForResponse((result) => result.url().endsWith('/api/interface/skin/inspect')),
        page.getByRole('dialog').getByRole('button', { name: 'Check this folder' }).click(),
      ])
      assert.equal(inspection.status(), 200)
      assert.equal(
        await page.getByRole('textbox', { name: 'Skin folder', exact: true }).inputValue(),
        'design-lab/skins/smoke-skin',
      )
      await page.getByRole('button', { name: 'Install this Skin' }).waitFor()
      await page.getByRole('button', { name: 'Install this Skin' }).click()
      const [installed] = await Promise.all([
        page.waitForResponse((result) => result.url().endsWith('/api/interface/skin/install')),
        page.getByRole('dialog').getByRole('button', { name: 'Install Skin' }).click(),
      ])
      assert.equal(installed.status(), 200)
      assert.equal((await installed.json()).id, 'smoke-skin')
      await page.setViewportSize({ width: 390, height: 844 })
      await page.getByRole('heading', { name: 'Interface Skin' }).waitFor()
      assert(
        await page
          .locator('.settings-page')
          .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
      )
    }
    if (upgradeSystem) {
      await page.getByRole('button', { name: 'Review update' }).click()
      const [response] = await Promise.all([
        page.waitForResponse(
          (result) =>
            result.url().endsWith('/api/interface/system/upgrade') &&
            result.request().method() === 'POST',
        ),
        page.getByRole('dialog').getByRole('button', { name: 'Apply update' }).click(),
      ])
      assert.equal(response.status(), 200)
      assert.equal((await response.json()).updated, true)
    }
    if (createCandidate) {
      await page.getByRole('textbox', { name: 'New System name' }).fill('Alternate Smoke')
      await page
        .getByRole('textbox', { name: 'New System folder' })
        .fill(relative(projectRoot, createCandidate))
      const [response] = await Promise.all([
        page.waitForResponse((result) => result.url().endsWith('/api/interface/system/create')),
        page.getByRole('button', { name: 'Create System' }).click(),
      ])
      assert.equal(response.status(), 201)
      assert.equal((await response.json()).id, 'alternate-smoke')
      await page.getByRole('button', { name: 'Install this System' }).waitFor()
      const barrel = join(createCandidate, 'components/index.ts')
      const originalBarrel = await readFile(barrel, 'utf8')
      try {
        await writeFile(barrel, 'export const NotTheContract = null\n')
        const [invalid] = await Promise.all([
          page.waitForResponse((result) => result.url().endsWith('/api/interface/system/inspect')),
          page.getByRole('button', { name: 'Check folder' }).click(),
        ])
        assert.equal(invalid.status(), 422)
        const failure = await invalid.json()
        assert.equal(failure.error.code, 'INTERFACE_PACK_EXPORTS_MISSING')
        assert(failure.error.details.missing.includes('Button'))
        await page
          .getByText(
            'Export the required names from the declared System entrypoint, then check the folder again.',
          )
          .waitFor()
        await page.getByText('Missing from components:').waitFor()
      } finally {
        await writeFile(barrel, originalBarrel)
      }
      const candidateButton = join(createCandidate, 'components/atoms/actions/Button/Button.tsx')
      const originalButton = await readFile(candidateButton, 'utf8')
      try {
        await writeFile(candidateButton, `${originalButton}\nconst brokenTypeCheck: string = 1\n`)
        const [invalid] = await Promise.all([
          page.waitForResponse((result) => result.url().endsWith('/api/interface/system/inspect')),
          page.getByRole('button', { name: 'Check folder' }).click(),
        ])
        assert.equal(invalid.status(), 422)
        const failure = await invalid.json()
        assert.equal(failure.error.code, 'INTERFACE_PACK_TYPECHECK_FAILED')
        assert(
          failure.error.details.diagnostics.some(
            (item) =>
              item.origin === 'system' &&
              item.path.endsWith('Button/Button.tsx') &&
              item.code === 'TS2322',
          ),
        )
        await page.getByText('TypeScript found these contract errors:').waitFor()
        await page.getByText('TS2322', { exact: true }).first().waitFor()
      } finally {
        await writeFile(candidateButton, originalButton)
      }
    }
    if (installCandidate) {
      await page
        .getByRole('textbox', { name: 'System folder', exact: true })
        .fill(relative(projectRoot, installCandidate))
      await page.getByRole('button', { name: 'Check folder' }).click()
      await page.getByRole('button', { name: 'Install this System' }).waitFor()
      await page.getByRole('button', { name: 'Install this System' }).click()
      const [response] = await Promise.all([
        page.waitForResponse((result) => result.url().endsWith('/api/interface/system/install')),
        page.getByRole('button', { name: 'Install System', exact: true }).click(),
      ])
      assert.equal(response.status(), 200)
      assert.equal((await response.json()).id, 'alternate-smoke')
    }
    if (resetSystem) {
      await page.getByRole('button', { name: 'Restore default' }).first().click()
      const [response] = await Promise.all([
        page.waitForResponse((result) => result.url().endsWith('/api/interface/system/reset')),
        page.getByRole('dialog').getByRole('button', { name: 'Restore default' }).click(),
      ])
      assert.equal(response.status(), 200)
      assert.equal((await response.json()).active, 'design-lab-system')
    }
  } finally {
    if (styleChanged) await writeFile(stylePath, originalStyle)
    await browser?.close()
    if (server.exitCode === null) {
      server.kill('SIGINT')
      await Promise.race([once(server, 'exit'), delay(5000)])
      if (server.exitCode === null) server.kill('SIGKILL')
    }
  }
}

try {
  await mkdir(join(projectRoot, 'src', 'components'), { recursive: true })
  await writeFile(
    join(projectRoot, 'package.json'),
    `${JSON.stringify({
      name: 'design-lab-external-smoke',
      version: '1.0.0',
      private: true,
      type: 'module',
      dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
    })}\n`,
  )
  const authoredComponent = 'export function Button() { return <button>External button</button> }\n'
  await writeFile(join(projectRoot, 'src', 'components', 'Button.tsx'), authoredComponent)
  await run('git', ['init', '-q'], projectRoot)

  const packed = parse(
    await run('npm', ['pack', '--json', '--pack-destination', temporary], applicationRoot),
  )[0]
  const archive = join(temporary, packed.filename)
  assert(packed.files.some((file) => file.path === 'vendor/default-system/design-lab-pack.json'))
  assert(packed.files.every((file) => !file.path.includes('node_modules')))
  await run('npm', ['install', archive, '--ignore-scripts', '--no-audit', '--no-fund'], projectRoot)
  const cli = join(projectRoot, 'node_modules', '.bin', 'designlab')

  const plan = parse(await run(cli, ['setup', '--name', 'External smoke'], projectRoot))
  assert.deepEqual(plan.changes.moveFiles, [])
  assert.deepEqual(plan.changes.deleteFiles, [])
  assert.deepEqual(plan.changes.copyDirectories, ['design-lab/system'])
  const applied = parse(
    await run(cli, ['setup', '--name', 'External smoke', '--apply', '--confirm'], projectRoot),
  )
  assert.equal(applied.applied, true)
  assert.deepEqual(applied.selfCheck, { ok: true, diagnostics: [] })
  assert.equal(applied.source.mounts.components[0], 'src/components')
  assert.equal(
    await readFile(join(projectRoot, 'src', 'components', 'Button.tsx'), 'utf8'),
    authoredComponent,
  )

  const doctor = parse(await run(cli, ['system', 'doctor'], projectRoot))
  assert.equal(doctor.ok, true)
  assert.equal(doctor.system.path, systemRoot)
  const sources = parse(await run(cli, ['sources'], projectRoot))
  assert.equal(sources.filter((source) => source.kind === 'library').length, 1)
  assert.equal(sources[0].id, 'design-lab-system')

  const cleanRoot = join(temporary, 'clean-project')
  await mkdir(cleanRoot)
  await writeFile(
    join(cleanRoot, 'package.json'),
    `${JSON.stringify({ name: 'design-lab-clean-smoke', version: '1.0.0', private: true, type: 'module' })}\n`,
  )
  await run('git', ['init', '-q'], cleanRoot)
  await run('npm', ['install', archive, '--ignore-scripts', '--no-audit', '--no-fund'], cleanRoot)
  const cleanCli = join(cleanRoot, 'node_modules', '.bin', 'designlab')
  const cleanPlan = parse(
    await run(cleanCli, ['setup', '--mode', 'managed', '--name', 'Clean smoke'], cleanRoot),
  )
  assert.equal(cleanPlan.mode, 'managed')
  assert.deepEqual(cleanPlan.changes.moveFiles, [])
  assert.deepEqual(cleanPlan.changes.deleteFiles, [])
  const cleanApplied = parse(
    await run(
      cleanCli,
      ['setup', '--mode', 'managed', '--name', 'Clean smoke', '--apply', '--confirm'],
      cleanRoot,
    ),
  )
  assert.equal(cleanApplied.applied, true)
  assert.deepEqual(cleanApplied.selfCheck, { ok: true, diagnostics: [] })
  assert.deepEqual(cleanApplied.source.mounts.components, ['design-lab/components'])
  assert.equal(parse(await run(cleanCli, ['system', 'doctor'], cleanRoot)).ok, true)
  assert.equal(
    parse(await readFile(join(cleanRoot, 'design-lab', 'designlab.config.json'), 'utf8')).mode,
    'managed',
  )
  assert(existsSync(join(cleanRoot, 'design-lab', 'components')))
  assert(existsSync(join(cleanRoot, 'design-lab', 'system', 'design-lab-pack.json')))
  assert.deepEqual(
    parse(await run(cleanCli, ['sources'], cleanRoot))
      .filter((source) => source.kind === 'library')
      .map((source) => source.id),
    ['design-lab-system'],
  )
  await cleanDevSmoke(cleanCli, cleanRoot)

  const marker = `Local edit ${randomUUID()}`
  await writeFile(join(systemRoot, 'local-smoke-marker.txt'), marker)
  await run('npm', ['install', archive, '--ignore-scripts', '--no-audit', '--no-fund'], projectRoot)
  assert.equal(await readFile(join(systemRoot, 'local-smoke-marker.txt'), 'utf8'), marker)

  if (process.argv.includes('--browser'))
    await browserSmoke(cli, { browseProjectSystem: true, checkIntegrationFailure: true })

  const upgradeRoot = join(temporary, 'upgrade')
  await mkdir(upgradeRoot)
  await run('tar', ['-xzf', archive, '-C', upgradeRoot], temporary)
  const upgradePackage = join(upgradeRoot, 'package')
  const upgradeManifestPath = join(upgradePackage, 'package.json')
  const upgradeManifest = parse(await readFile(upgradeManifestPath, 'utf8'))
  const [major, minor, patch] = upgradeManifest.version.split('.').map(Number)
  upgradeManifest.version = `${major}.${minor}.${patch + 1}`
  await writeFile(upgradeManifestPath, `${JSON.stringify(upgradeManifest, null, 2)}\n`)
  const templateMarker = `New package default ${randomUUID()}`
  await writeFile(
    join(upgradePackage, 'vendor/default-system/upgrade-smoke-marker.txt'),
    templateMarker,
  )
  await writeSystemBaseline(
    join(upgradePackage, 'vendor/default-system'),
    join(upgradePackage, 'vendor/default-system'),
  )
  const upgradePack = parse(
    await run(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary],
      upgradePackage,
    ),
  )[0]
  await run(
    'npm',
    [
      'install',
      join(temporary, upgradePack.filename),
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
    ],
    projectRoot,
  )
  assert.equal(await readFile(join(systemRoot, 'local-smoke-marker.txt'), 'utf8'), marker)
  assert.equal(
    await readFile(
      join(projectRoot, 'node_modules/design-lab/vendor/default-system/upgrade-smoke-marker.txt'),
      'utf8',
    ),
    templateMarker,
  )
  await assert.rejects(readFile(join(systemRoot, 'upgrade-smoke-marker.txt'), 'utf8'))
  const upgradeDiff = parse(await run(cli, ['system', 'diff'], projectRoot))
  assert(upgradeDiff.files.added.includes('local-smoke-marker.txt'))
  assert(upgradeDiff.files.missing.includes('upgrade-smoke-marker.txt'))
  const upgradePreview = parse(await run(cli, ['system', 'upgrade'], projectRoot))
  assert.equal(upgradePreview.available, true)
  assert.equal(upgradePreview.canApply, true)
  assert(upgradePreview.files.upstreamOnly.includes('upgrade-smoke-marker.txt'))
  assert(upgradePreview.files.localOnly.includes('local-smoke-marker.txt'))
  assert.deepEqual(upgradePreview.files.conflicts, [])
  if (process.argv.includes('--browser')) await browserSmoke(cli, { upgradeSystem: true })
  else {
    const appliedUpgrade = parse(
      await run(
        cli,
        ['system', 'upgrade', '--apply', '--confirm', '--fingerprint', upgradePreview.fingerprint],
        projectRoot,
      ),
    )
    assert.equal(appliedUpgrade.updated, true)
  }
  assert.equal(await readFile(join(systemRoot, 'local-smoke-marker.txt'), 'utf8'), marker)
  assert.equal(await readFile(join(systemRoot, 'upgrade-smoke-marker.txt'), 'utf8'), templateMarker)
  if (process.argv.includes('--browser'))
    await browserSmoke(cli, { createCandidate: alternateSystem })
  else {
    const created = parse(
      await run(
        cli,
        ['system', 'create', alternateSystem, '--name', 'Alternate Smoke'],
        projectRoot,
      ),
    )
    assert.equal(created.created, true)
  }
  const alternateButton = join(alternateSystem, 'components/atoms/actions/Button/Button.tsx')
  const originalButton = await readFile(alternateButton, 'utf8')
  assert(originalButton.includes('      {loading ? ('))
  await mkdir(join(alternateSystem, 'assets/images'), { recursive: true })
  await writeFile(
    join(alternateSystem, 'assets/images/system-accent.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#7544ee"/></svg>\n',
  )
  await writeFile(
    alternateButton,
    `import systemAccent from '../../../../assets/images/system-accent.svg'\n${originalButton.replace(
      '      {loading ? (',
      '      <span data-system-decoration="alternate-smoke"><img src={systemAccent} alt="" /></span>\n      {loading ? (',
    )}`,
  )
  const validatedFork = parse(await run(cli, ['system', 'validate', alternateSystem], projectRoot))
  assert.equal(validatedFork.valid, true)
  if (process.argv.includes('--browser'))
    await browserSmoke(cli, { installCandidate: alternateSystem })
  else {
    const installed = parse(await run(cli, ['system', 'install', alternateSystem], projectRoot))
    assert.equal(installed.path, 'design-lab/system')
  }
  assert.equal(
    parse(await run(cli, ['system', 'doctor'], projectRoot)).system.id,
    'alternate-smoke',
  )
  if (process.argv.includes('--browser'))
    await browserSmoke(cli, { customStructure: true, resetSystem: true })
  else
    assert.equal(
      parse(await run(cli, ['system', 'reset'], projectRoot)).active,
      'design-lab-system',
    )
  assert.equal(parse(await run(cli, ['system', 'doctor'], projectRoot)).system.path, systemRoot)
  assert.equal(await readFile(join(systemRoot, 'upgrade-smoke-marker.txt'), 'utf8'), templateMarker)

  await rm(systemRoot, { recursive: true })
  await cp(alternateSystem, systemRoot, { recursive: true })
  assert.equal(
    parse(await run(cli, ['system', 'doctor'], projectRoot)).system.id,
    'alternate-smoke',
  )
  assert.equal(parse(await run(cli, ['system', 'reset'], projectRoot)).active, 'design-lab-system')
  assert.equal(parse(await run(cli, ['system', 'doctor'], projectRoot)).ok, true)

  if (process.argv.includes('--browser')) {
    await browserSmoke(cli, { createSkinCandidate: smokeSkin, expectDefaultMatch: true })
    assert.equal(parse(await run(cli, ['system', 'doctor'], projectRoot)).skin.id, 'smoke-skin')
    await browserSmoke(cli, { verifySkinAndClear: true, expectDefaultMatch: true })
    assert.equal(parse(await run(cli, ['system', 'doctor'], projectRoot)).skin, null)
  }

  process.stdout.write(
    `Package smoke passed: pack, attach, clean managed setup, one System, versioned upgrade preserving edits, validated fork with Component anatomy and SVG asset, switch, manual folder replacement, reset${process.argv.includes('--browser') ? ', browser integration health, Skin/System folder selection, shell/Workbench fork and HMR' : ''}.\n`,
  )
} finally {
  if (process.env.DESIGN_LAB_KEEP_SMOKE === '1')
    process.stdout.write(`Preserved smoke workspace: ${temporary}\n`)
  else await rm(temporary, { recursive: true, force: true })
}
