import { cp, mkdir, rm } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const applicationRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const workspaceRoot = resolve(applicationRoot, '..')
const vendorRoot = join(applicationRoot, 'vendor')

await rm(vendorRoot, { recursive: true, force: true })
await mkdir(vendorRoot, { recursive: true })
await cp(
  join(workspaceRoot, 'libraries', 'design-lab-system'),
  join(vendorRoot, 'default-system'),
  {
    recursive: true,
    filter(path) {
      return !['.git', '.designlab', 'node_modules', 'dist'].includes(basename(path))
    },
  },
)
await cp(join(workspaceRoot, 'rules'), join(vendorRoot, 'rules'), { recursive: true })
