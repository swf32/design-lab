import assert from 'node:assert/strict'
import { execFile, spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { existsSync } from 'node:fs'
import { cp, mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const applicationRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const temporary = await realpath(await mkdtemp(join(tmpdir(), 'design-lab-package-smoke-')))
const projectRoot = join(temporary, 'external-project')
const alternateSystem = join(temporary, 'alternate-system')
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

async function browserSmoke(cli) {
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
    await writeFile(
      stylePath,
      `${originalStyle}\n.dl-button { outline: 3px solid rgb(12 34 56) !important; }\n`,
    )
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
    assert.deepEqual(pageErrors, [])
  } finally {
    await writeFile(stylePath, originalStyle)
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

  const marker = `Local edit ${randomUUID()}`
  await writeFile(join(systemRoot, 'local-smoke-marker.txt'), marker)
  await run('npm', ['install', archive, '--ignore-scripts', '--no-audit', '--no-fund'], projectRoot)
  assert.equal(await readFile(join(systemRoot, 'local-smoke-marker.txt'), 'utf8'), marker)

  if (process.argv.includes('--browser')) await browserSmoke(cli)

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
  if (process.argv.includes('--browser')) await browserSmoke(cli)

  const created = parse(
    await run(cli, ['system', 'create', alternateSystem, '--name', 'Alternate Smoke'], projectRoot),
  )
  assert.equal(created.created, true)
  const installed = parse(await run(cli, ['system', 'install', alternateSystem], projectRoot))
  assert.equal(installed.path, 'design-lab/system')
  assert.equal(
    parse(await run(cli, ['system', 'doctor'], projectRoot)).system.id,
    'alternate-smoke',
  )
  assert.equal(parse(await run(cli, ['system', 'reset'], projectRoot)).active, 'design-lab-system')
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

  process.stdout.write(
    `Package smoke passed: pack, attach, one System, versioned upgrade preserving edits, switch, manual folder replacement, reset${process.argv.includes('--browser') ? ', browser Workbench HMR' : ''}.\n`,
  )
} finally {
  if (process.env.DESIGN_LAB_KEEP_SMOKE === '1')
    process.stdout.write(`Preserved smoke workspace: ${temporary}\n`)
  else await rm(temporary, { recursive: true, force: true })
}
