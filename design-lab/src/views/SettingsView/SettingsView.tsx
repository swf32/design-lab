import './SettingsView.scss'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, CodeBlock, Dialog, Input, ModuleHeader } from '@design-lab/system/components'
import {
  createLocalInterfaceSystem,
  getInterfaceSystemDiff,
  getInterfaceSystemDoctor,
  getInterfaceSystemRecovery,
  getMcpIntegration,
  inspectLocalInterfaceSystem,
  installLocalInterfaceSystem,
  resetInterfaceSystem,
  type InterfaceSystemDiff,
  type InterfaceSystemDoctor,
  type InterfaceSystemRecovery,
  type LocalInterfaceSystemInspection,
  type McpIntegrationInfo,
} from '../../api/projects'

const diffKinds = ['changed', 'added', 'missing'] as const

function DiffGroups({ title, entries }: { title: string; entries: InterfaceSystemDiff['files'] }) {
  return (
    <div className="settings-system__diff-group">
      <h4>{title}</h4>
      {diffKinds.map((kind) => (
        <details key={kind}>
          <summary>
            {kind === 'missing'
              ? 'Only in bundled default'
              : kind === 'added'
                ? 'Only in active System'
                : 'Changed'}
            {' · '}
            {entries[kind].length}
          </summary>
          {entries[kind].length > 0 ? (
            <ul>
              {entries[kind].map((path) => (
                <li key={path}>
                  <code>{path}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p>None</p>
          )}
        </details>
      ))}
    </div>
  )
}

export function SettingsView({ onClose }: { onClose: () => void }) {
  const [integration, setIntegration] = useState<McpIntegrationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [systemDoctor, setSystemDoctor] = useState<InterfaceSystemDoctor | null>(null)
  const [systemDiff, setSystemDiff] = useState<InterfaceSystemDiff | null>(null)
  const [systemRecovery, setSystemRecovery] = useState<InterfaceSystemRecovery | null>(null)
  const [systemError, setSystemError] = useState<string | null>(null)
  const [systemLoading, setSystemLoading] = useState(false)
  const [systemFolder, setSystemFolder] = useState('')
  const [newSystemName, setNewSystemName] = useState('')
  const [newSystemFolder, setNewSystemFolder] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createResult, setCreateResult] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<LocalInterfaceSystemInspection | null>(null)
  const [candidateError, setCandidateError] = useState<string | null>(null)
  const [candidateLoading, setCandidateLoading] = useState(false)
  const candidateRequest = useRef(0)
  const [installConfirmOpen, setInstallConfirmOpen] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [installResult, setInstallResult] = useState<string | null>(null)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  const refreshSystem = useCallback(async () => {
    setSystemLoading(true)
    setSystemError(null)
    const [doctor, diff, recovery] = await Promise.allSettled([
      getInterfaceSystemDoctor(),
      getInterfaceSystemDiff(),
      getInterfaceSystemRecovery(),
    ])
    setSystemDoctor(doctor.status === 'fulfilled' ? doctor.value : null)
    setSystemDiff(diff.status === 'fulfilled' ? diff.value : null)
    setSystemRecovery(recovery.status === 'fulfilled' ? recovery.value : null)
    if (
      doctor.status === 'rejected' ||
      diff.status === 'rejected' ||
      recovery.status === 'rejected'
    ) {
      const failure =
        doctor.status === 'rejected'
          ? doctor.reason
          : diff.status === 'rejected'
            ? diff.reason
            : recovery.status === 'rejected'
              ? recovery.reason
              : null
      setSystemError(failure instanceof Error ? failure.message : 'Could not check the System.')
    }
    setSystemLoading(false)
  }, [])

  useEffect(() => {
    getMcpIntegration()
      .then(setIntegration)
      .catch((cause: Error) => setError(cause.message))
  }, [])

  useEffect(() => {
    void refreshSystem()
  }, [refreshSystem])

  const inspectCandidate = async () => {
    const request = ++candidateRequest.current
    setCandidateLoading(true)
    setCandidateError(null)
    setInstallResult(null)
    try {
      const inspection = await inspectLocalInterfaceSystem(systemFolder.trim())
      if (candidateRequest.current === request) setCandidate(inspection)
    } catch (cause) {
      if (candidateRequest.current === request) {
        setCandidate(null)
        setCandidateError(cause instanceof Error ? cause.message : 'Could not check the folder.')
      }
    } finally {
      if (candidateRequest.current === request) setCandidateLoading(false)
    }
  }

  const createSystem = async () => {
    setCreating(true)
    setCreateError(null)
    setCreateResult(null)
    try {
      const result = await createLocalInterfaceSystem(newSystemName.trim(), newSystemFolder.trim())
      const request = ++candidateRequest.current
      setSystemFolder(result.path)
      setCandidate(null)
      setCandidateError(null)
      setCreateResult(`Created ${result.name} at ${result.path}. The active System is unchanged.`)
      try {
        const inspection = await inspectLocalInterfaceSystem(result.path)
        if (candidateRequest.current === request) setCandidate(inspection)
      } catch (cause) {
        if (candidateRequest.current === request)
          setCandidateError(
            cause instanceof Error ? cause.message : 'Could not check the new System.',
          )
      }
    } catch (cause) {
      setCreateError(cause instanceof Error ? cause.message : 'Could not create the System.')
    } finally {
      setCreating(false)
    }
  }

  const installCandidate = async () => {
    if (!candidate) return
    setInstalling(true)
    setCandidateError(null)
    try {
      const result = await installLocalInterfaceSystem(candidate.path)
      setInstallResult(
        `${result.name} ${result.version} is installed. Restart Design Lab to load it.`,
      )
      setCandidate(null)
      setInstallConfirmOpen(false)
      void refreshSystem()
    } catch (cause) {
      setCandidateError(cause instanceof Error ? cause.message : 'Could not install the System.')
      setInstallConfirmOpen(false)
    } finally {
      setInstalling(false)
    }
  }

  const restoreDefaultSystem = async () => {
    setResetting(true)
    setSystemError(null)
    try {
      await resetInterfaceSystem()
      setInstallResult('Bundled default System restored. Restart Design Lab to load it.')
      setResetConfirmOpen(false)
      setCandidate(null)
      void refreshSystem()
    } catch (cause) {
      setSystemError(
        cause instanceof Error ? cause.message : 'Could not restore the default System.',
      )
      setResetConfirmOpen(false)
    } finally {
      setResetting(false)
    }
  }

  return (
    <section className="settings-page">
      <ModuleHeader eyebrow="Application" title="Settings" backLabel="Workspace" onBack={onClose} />

      <section
        className="settings-section settings-section--system"
        aria-labelledby="settings-system-title"
      >
        <header className="settings-system__header">
          <div>
            <span>Interface System</span>
            <h3 id="settings-system-title">Active System</h3>
            <p>
              Design Lab and its Workbench use the same editable System folder. Check its contract
              and compare authored files with the bundled default before an update.
            </p>
          </div>
          <Button
            type="button"
            size="small"
            onClick={() => void refreshSystem()}
            loading={systemLoading}
          >
            Check again
          </Button>
        </header>
        {systemLoading && !systemDoctor && <p role="status">Checking System…</p>}
        {systemError && (
          <p className="settings-page__error" role="alert">
            {systemError}
          </p>
        )}
        {systemDoctor && (
          <div className="settings-system__status">
            <strong
              className={`settings-status${systemDoctor.ok ? '' : ' settings-status--error'}`}
            >
              {systemDoctor.ok ? 'Compatible' : 'Needs repair'}
            </strong>
            {systemDoctor.system && (
              <p>
                <strong>{systemDoctor.system.id}</strong> · version {systemDoctor.system.version}
                <br />
                <code>{systemDoctor.system.path}</code>
              </p>
            )}
            {systemDoctor.diagnostics.map((diagnostic) => (
              <p className="settings-page__error" key={`${diagnostic.code}:${diagnostic.message}`}>
                {diagnostic.code}: {diagnostic.message}
              </p>
            ))}
          </div>
        )}
        {systemDiff && (
          <div className="settings-system__diff">
            <p role="status">
              {systemDiff.identical
                ? 'Authored files match the bundled default.'
                : 'Authored files differ from the bundled default.'}
            </p>
            <p>
              This is a read-only, two-way comparison. It does not merge updates or identify which
              side changed first.
            </p>
            <div className="settings-system__diff-groups">
              <DiffGroups title="Components" entries={systemDiff.components} />
              <DiffGroups title="Files" entries={systemDiff.files} />
            </div>
          </div>
        )}

        <div className="settings-system__create">
          <h4>Create a System</h4>
          <p>
            Make an editable copy of the currently active System with its Components, assets, and
            local authoring rules. This does not change the active System. A relative folder starts
            at the project root.
          </p>
          <form
            className="settings-system__create-form"
            onSubmit={(event) => {
              event.preventDefault()
              void createSystem()
            }}
          >
            <Input
              label="New System name"
              value={newSystemName}
              onChange={(event) => setNewSystemName(event.currentTarget.value)}
              placeholder="My System"
              fullWidth
            />
            <Input
              label="New System folder"
              value={newSystemFolder}
              onChange={(event) => setNewSystemFolder(event.currentTarget.value)}
              placeholder="design-lab/systems/my-system"
              fullWidth
            />
            <Button
              type="submit"
              size="small"
              loading={creating}
              disabled={!newSystemName.trim() || !newSystemFolder.trim()}
            >
              Create System
            </Button>
          </form>
          {createError && (
            <p className="settings-page__error" role="alert">
              {createError}
            </p>
          )}
          {createResult && <p role="status">{createResult}</p>}
        </div>

        <div className="settings-system__install">
          <h4>Install a System from a folder</h4>
          <p>
            Choose a local folder containing a complete System. A relative path starts at the
            project root. The app checks compatibility before you decide to replace the active
            System.
          </p>
          <form
            className="settings-system__install-form"
            onSubmit={(event) => {
              event.preventDefault()
              void inspectCandidate()
            }}
          >
            <Input
              label="System folder"
              value={systemFolder}
              onChange={(event) => {
                candidateRequest.current += 1
                setSystemFolder(event.currentTarget.value)
                setCandidate(null)
                setCandidateError(null)
                setCandidateLoading(false)
              }}
              placeholder="../my-system"
              fullWidth
            />
            <Button
              type="submit"
              size="small"
              loading={candidateLoading}
              disabled={!systemFolder.trim()}
            >
              Check folder
            </Button>
          </form>
          {candidateError && (
            <p className="settings-page__error" role="alert">
              {candidateError}
            </p>
          )}
          {installResult && <p role="status">{installResult}</p>}
          {candidate && (
            <div className="settings-system__candidate" role="status">
              <strong>
                {candidate.name} · {candidate.version}
              </strong>
              <p>{candidate.description || 'Complete interface System'}</p>
              <code>{candidate.path}</code>
              {candidate.canInstall ? (
                <Button type="button" size="small" onClick={() => setInstallConfirmOpen(true)}>
                  Install this System
                </Button>
              ) : (
                <p>This is the bundled default. Use System recovery to restore it.</p>
              )}
            </div>
          )}
        </div>
        {systemRecovery?.available && (
          <div className="settings-system__recovery">
            <h4>Restore the default System</h4>
            <p>
              Replaces the active folder with the bundled default. Design Lab saves a snapshot of
              the current System before restoring it. Restart afterward.
            </p>
            <Button
              type="button"
              size="small"
              disabled={systemDoctor?.system?.id === 'design-lab-system' && systemDiff?.identical}
              onClick={() => setResetConfirmOpen(true)}
            >
              Restore default
            </Button>
          </div>
        )}
      </section>

      <Dialog
        open={installConfirmOpen}
        title="Install interface System?"
        eyebrow="Replace active System"
        description="Design Lab will save a snapshot of the current System, validate the selected folder again, and install it into the one active slot. Restart Design Lab afterward."
        onClose={() => setInstallConfirmOpen(false)}
        dismissible={!installing}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={installing}
              onClick={() => setInstallConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={installing}
              onClick={() => void installCandidate()}
            >
              Install System
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

      <Dialog
        open={resetConfirmOpen}
        title="Restore default System?"
        eyebrow="Replace active System"
        description="This replaces the active project-owned System folder with the bundled default. A snapshot of the current folder is saved first. Restart Design Lab afterward."
        onClose={() => setResetConfirmOpen(false)}
        dismissible={!resetting}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={resetting}
              onClick={() => setResetConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={resetting}
              onClick={() => void restoreDefaultSystem()}
            >
              Restore default
            </Button>
          </>
        }
      />

      <div className="settings-page__intro">
        <div>
          <span>AI integration</span>
          <h2>MCP and agent access</h2>
          <p>
            Give coding agents a verified, filesystem-backed view of components, tokens, assets,
            fonts, and knowledge. Search returns descriptions and relevance first; a second lookup
            reveals the real name and implementation contract.
          </p>
        </div>
        <strong className={`settings-status${error ? ' settings-status--error' : ''}`}>
          {error ? 'Unavailable' : integration ? 'Ready' : 'Checking'}
        </strong>
      </div>

      {error && <p className="settings-page__error">{error}</p>}
      {integration && (
        <>
          <section className="settings-section">
            <header>
              <span>Recommended</span>
              <h3>Connect the local MCP server</h3>
              <p>
                Add this stdio server to any MCP-compatible agent. The command uses the exact
                Node.js runtime and absolute server path from this installation.
              </p>
            </header>
            <CodeBlock language="json" code={JSON.stringify(integration.config, null, 2)} />
          </section>

          <section className="settings-section">
            <header>
              <span>Fallback</span>
              <h3>Use the same context engine from a script</h3>
              <p>
                No MCP client is required. The CLI and MCP adapters call the same scanner, ranking,
                and entity resolver.
              </p>
            </header>
            <CodeBlock language="shell" code={integration.cli.examples.join('\n')} />
          </section>

          <section className="settings-section settings-section--workflow">
            <header>
              <span>Agent contract</span>
              <h3>Search before generation</h3>
            </header>
            <ol>
              {integration.workflow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </>
      )}
    </section>
  )
}
