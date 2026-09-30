import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Dialog, Input } from '@design-lab/system/components'
import {
  createLocalInterfaceSkin,
  inspectLocalInterfaceSkin,
  installLocalInterfaceSkin,
  listInterfaceSkins,
  resetInterfaceSkin,
  useInterfaceSkin,
  type InterfaceSkinPack,
  type InterfaceSystemDoctor,
  type LocalInterfaceSkinInspection,
} from '../../api/projects'

export function SkinSettings({
  activeSkin,
  onRefresh,
}: {
  activeSkin: InterfaceSystemDoctor['skin'] | null
  onRefresh: () => void
}) {
  const [packs, setPacks] = useState<InterfaceSkinPack[]>([])
  const [name, setName] = useState('')
  const [newFolder, setNewFolder] = useState('')
  const [folder, setFolder] = useState('')
  const [candidate, setCandidate] = useState<LocalInterfaceSkinInspection | null>(null)
  const [checking, setChecking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const candidateRequest = useRef(0)

  const refresh = useCallback(async () => {
    try {
      setPacks((await listInterfaceSkins()).packs)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not list installed Skins.')
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const checkFolder = async (path = folder) => {
    const request = ++candidateRequest.current
    setChecking(true)
    setError(null)
    try {
      const inspected = await inspectLocalInterfaceSkin(path.trim())
      if (candidateRequest.current === request) setCandidate(inspected)
    } catch (cause) {
      if (candidateRequest.current === request) {
        setCandidate(null)
        setError(cause instanceof Error ? cause.message : 'Could not check the Skin.')
      }
    } finally {
      if (candidateRequest.current === request) setChecking(false)
    }
  }

  const createSkin = async () => {
    setBusy(true)
    setError(null)
    try {
      const created = await createLocalInterfaceSkin(name.trim(), newFolder.trim())
      setFolder(created.path)
      setMessage(
        `Created ${created.name} at ${created.path}. Edit theme.css, then check the folder.`,
      )
      void checkFolder(created.path)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the Skin.')
    } finally {
      setBusy(false)
    }
  }

  const installSkin = async () => {
    if (!candidate) return
    setBusy(true)
    setError(null)
    try {
      const result = await installLocalInterfaceSkin(candidate.path)
      setConfirmOpen(false)
      setMessage(`${result.name} ${result.version} is active. Restart Design Lab to load it.`)
      onRefresh()
      void refresh()
    } catch (cause) {
      setConfirmOpen(false)
      setError(cause instanceof Error ? cause.message : 'Could not install the Skin.')
    } finally {
      setBusy(false)
    }
  }

  const selectSkin = async (pack: InterfaceSkinPack) => {
    setBusy(true)
    setError(null)
    try {
      await useInterfaceSkin(pack.id, pack.version)
      setMessage(`${pack.name} ${pack.version} is active. Restart Design Lab to load it.`)
      onRefresh()
      void refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not activate the Skin.')
    } finally {
      setBusy(false)
    }
  }

  const restoreSkin = async () => {
    setBusy(true)
    setError(null)
    try {
      await resetInterfaceSkin()
      setMessage('Skin cleared. Restart Design Lab to load the System appearance.')
      onRefresh()
      void refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not clear the Skin.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      className="settings-section settings-section--skin"
      aria-labelledby="settings-skin-title"
    >
      <header>
        <span>Visual layer</span>
        <h3 id="settings-skin-title">Interface Skin</h3>
        <p>
          A Skin changes documented CSS variables over the active System. Use a full System for
          different Component structure or assets in Component code.
        </p>
      </header>
      <p>
        Active:{' '}
        <strong>
          {activeSkin ? `${activeSkin.id} · ${activeSkin.version}` : 'System appearance'}
        </strong>
      </p>
      {error && (
        <p className="settings-page__error" role="alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}

      <div className="settings-system__create">
        <h4>Create a Skin</h4>
        <p>Creates an inactive folder with theme.css, usage guidance, and local authoring rules.</p>
        <form
          className="settings-system__create-form"
          onSubmit={(event) => {
            event.preventDefault()
            void createSkin()
          }}
        >
          <Input
            label="New Skin name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            placeholder="My Skin"
            fullWidth
          />
          <Input
            label="New Skin folder"
            value={newFolder}
            onChange={(event) => setNewFolder(event.currentTarget.value)}
            placeholder="design-lab/skins/my-skin"
            fullWidth
          />
          <Button
            type="submit"
            size="small"
            loading={busy}
            disabled={!name.trim() || !newFolder.trim()}
          >
            Create Skin
          </Button>
        </form>
      </div>

      <div className="settings-system__install">
        <h4>Install a Skin from a folder</h4>
        <p>
          Check the local Skin contract, then activate it. Relative paths start at the project root.
        </p>
        <form
          className="settings-system__install-form"
          onSubmit={(event) => {
            event.preventDefault()
            void checkFolder()
          }}
        >
          <Input
            label="Skin folder"
            value={folder}
            onChange={(event) => {
              candidateRequest.current += 1
              setFolder(event.currentTarget.value)
              setCandidate(null)
              setChecking(false)
            }}
            placeholder="design-lab/skins/my-skin"
            fullWidth
          />
          <Button type="submit" size="small" loading={checking} disabled={!folder.trim()}>
            Check Skin
          </Button>
        </form>
        {candidate && (
          <div className="settings-system__candidate" role="status">
            <strong>
              {candidate.name} · {candidate.version}
            </strong>
            <p>{candidate.description || 'Visual Skin'}</p>
            <code>{candidate.path}</code>
            <Button type="button" size="small" onClick={() => setConfirmOpen(true)}>
              Install this Skin
            </Button>
          </div>
        )}
      </div>

      <div className="settings-system__recovery">
        <h4>Installed Skins</h4>
        {packs.length === 0 ? (
          <p>No Skins installed yet.</p>
        ) : (
          <ul className="settings-skin__packs">
            {packs.map((pack) => (
              <li key={`${pack.id}:${pack.version}`}>
                <span>
                  <strong>{pack.name}</strong> · {pack.version}
                  {pack.active ? ' · Active' : ''}
                </span>
                {!pack.active && (
                  <Button
                    type="button"
                    size="small"
                    disabled={busy}
                    onClick={() => void selectSkin(pack)}
                  >
                    Use Skin
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {activeSkin && (
          <Button type="button" size="small" disabled={busy} onClick={() => void restoreSkin()}>
            Clear Skin
          </Button>
        )}
      </div>

      <Dialog
        open={confirmOpen}
        title="Install interface Skin?"
        eyebrow="Change interface appearance"
        description="Design Lab will validate and cache this Skin, then select it. Restart Design Lab afterward."
        onClose={() => setConfirmOpen(false)}
        dismissible={!busy}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={busy}
              onClick={() => void installSkin()}
            >
              Install Skin
            </Button>
          </>
        }
      >
        {candidate && (
          <p>
            <strong>
              {candidate.name} {candidate.version}
            </strong>
            <br />
            <code>{candidate.path}</code>
          </p>
        )}
      </Dialog>
    </section>
  )
}
