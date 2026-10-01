import './SettingsView.scss'
import { SkinSettings } from './SkinSettings'
import { InterfaceFolderPicker } from './InterfaceFolderPicker'
import { InterfacePackDiagnostic } from './InterfacePackDiagnostic'
import { IntegrationStatus } from './IntegrationStatus'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, CodeBlock, Dialog, Input, ModuleHeader } from '@design-lab/system/components'
import {
  applyInterfaceSystemUpgrade,
  createLocalInterfaceSystem,
  getInterfaceSystemDiff,
  getInterfaceSystemDoctor,
  getInterfaceSystemRecovery,
  getInterfaceSystemUpgrade,
  getInterfaceSystemUpgradeConflict,
  getMcpIntegration,
  inspectLocalInterfaceSystem,
  installLocalInterfaceSystem,
  resetInterfaceSystem,
  type InterfaceSystemDiff,
  type InterfaceSystemDoctor,
  type InterfaceSystemRecovery,
  type InterfaceSystemUpgrade,
  type InterfaceSystemUpgradeConflict,
  type InterfaceSystemUpgradeConflictSide,
  type LocalInterfaceSystemInspection,
  type McpIntegrationInfo,
} from '../../api/projects'

const diffKinds = ['changed', 'added', 'missing'] as const

function DiffGroups({
  title,
  entries,
  baselineLabel,
  targetLabel,
}: {
  title: string
  entries: InterfaceSystemDiff['files']
  baselineLabel: string
  targetLabel: string
}) {
  return (
    <div className="settings-system__diff-group">
      <h4>{title}</h4>
      {diffKinds.map((kind) => (
        <details key={kind}>
          <summary>
            {kind === 'missing'
              ? `Only in ${baselineLabel}`
              : kind === 'added'
                ? `Only in ${targetLabel}`
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

function ConflictVersion({
  title,
  side,
  path,
}: {
  title: string
  side: InterfaceSystemUpgradeConflictSide
  path: string
}) {
  return (
    <section>
      <h4>{title}</h4>
      {side.kind === 'text' ? (
        <CodeBlock
          code={side.text}
          language={path.split('.').pop() ?? 'text'}
          collapsedLines={12}
        />
      ) : (
        <p>
          {side.kind === 'missing'
            ? 'File absent in this version.'
            : side.kind === 'binary'
              ? `Binary file (${side.bytes} bytes). Open it in an editor to compare.`
              : `File is too large to preview (${side.bytes} bytes). Open it in an editor to compare.`}
        </p>
      )}
    </section>
  )
}

function UpgradeConflictPreview({
  path,
  fingerprint,
  onRefresh,
}: {
  path: string
  fingerprint: string
  onRefresh: () => Promise<void>
}) {
  const [comparison, setComparison] = useState<InterfaceSystemUpgradeConflict | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const compare = async () => {
    setLoading(true)
    setError(null)
    try {
      setComparison(await getInterfaceSystemUpgradeConflict(path, fingerprint))
    } catch (cause) {
      setComparison(null)
      setError(cause instanceof Error ? cause : new Error('Could not compare the files.'))
    } finally {
      setLoading(false)
    }
  }
  return (
    <li>
      <code>{path}</code>{' '}
      <Button type="button" size="small" loading={loading} onClick={() => void compare()}>
        Compare versions
      </Button>
      {error && (
        <p role="alert">
          {error.message}{' '}
          <Button type="button" size="small" onClick={() => void onRefresh()}>
            Refresh plan
          </Button>
        </p>
      )}
      {comparison && (
        <div className="settings-system__diff-groups">
          <ConflictVersion title="Your active System" side={comparison.local} path={path} />
          <ConflictVersion title="Bundled default" side={comparison.bundled} path={path} />
        </div>
      )}
    </li>
  )
}

export function SettingsView({ onClose }: { onClose: () => void }) {
  const [integration, setIntegration] = useState<McpIntegrationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [systemDoctor, setSystemDoctor] = useState<InterfaceSystemDoctor | null>(null)
  const [systemDiff, setSystemDiff] = useState<InterfaceSystemDiff | null>(null)
  const [systemRecovery, setSystemRecovery] = useState<InterfaceSystemRecovery | null>(null)
  const [systemUpgrade, setSystemUpgrade] = useState<InterfaceSystemUpgrade | null>(null)
  const [upgradeConfirmOpen, setUpgradeConfirmOpen] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeResult, setUpgradeResult] = useState<string | null>(null)
  const [systemError, setSystemError] = useState<string | null>(null)
  const [systemLoading, setSystemLoading] = useState(false)
  const [systemFolder, setSystemFolder] = useState('')
  const [systemPickerOpen, setSystemPickerOpen] = useState(false)
  const [newSystemName, setNewSystemName] = useState('')
  const [newSystemFolder, setNewSystemFolder] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createResult, setCreateResult] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<LocalInterfaceSystemInspection | null>(null)
  const [candidateError, setCandidateError] = useState<Error | null>(null)
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
    const [doctor, diff, recovery, upgrade] = await Promise.allSettled([
      getInterfaceSystemDoctor(),
      getInterfaceSystemDiff(),
      getInterfaceSystemRecovery(),
      getInterfaceSystemUpgrade(),
    ])
    setSystemDoctor(doctor.status === 'fulfilled' ? doctor.value : null)
    setSystemDiff(diff.status === 'fulfilled' ? diff.value : null)
    setSystemRecovery(recovery.status === 'fulfilled' ? recovery.value : null)
    setSystemUpgrade(upgrade.status === 'fulfilled' ? upgrade.value : null)
    if (
      doctor.status === 'rejected' ||
      diff.status === 'rejected' ||
      recovery.status === 'rejected' ||
      upgrade.status === 'rejected'
    ) {
      const failure =
        doctor.status === 'rejected'
          ? doctor.reason
          : diff.status === 'rejected'
            ? diff.reason
            : recovery.status === 'rejected'
              ? recovery.reason
              : upgrade.status === 'rejected'
                ? upgrade.reason
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

  const inspectCandidate = async (path = systemFolder) => {
    const request = ++candidateRequest.current
    setCandidateLoading(true)
    setCandidateError(null)
    setInstallResult(null)
    try {
      const inspection = await inspectLocalInterfaceSystem(path.trim())
      if (candidateRequest.current === request) setCandidate(inspection)
    } catch (cause) {
      if (candidateRequest.current === request) {
        setCandidate(null)
        setCandidateError(cause instanceof Error ? cause : new Error('Could not check the folder.'))
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
            cause instanceof Error ? cause : new Error('Could not check the new System.'),
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
      const result = await installLocalInterfaceSystem(candidate.path, candidate.fingerprint)
      setInstallResult(
        `${result.name} ${result.version} is installed. Restart Design Lab to load it.`,
      )
      setCandidate(null)
      setInstallConfirmOpen(false)
      void refreshSystem()
    } catch (cause) {
      setCandidateError(cause instanceof Error ? cause : new Error('Could not install the System.'))
      setCandidate(null)
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

  const upgradeDefaultSystem = async () => {
    if (!systemUpgrade?.available || !systemUpgrade.canApply) return
    setUpgrading(true)
    setSystemError(null)
    try {
      const result = await applyInterfaceSystemUpgrade(systemUpgrade.fingerprint)
      setUpgradeResult(
        result.updated
          ? 'Default updates applied; your local edits were preserved. Restart Design Lab to load the updated System.'
          : 'There were no default updates to apply.',
      )
      setUpgradeConfirmOpen(false)
      void refreshSystem()
    } catch (cause) {
      setSystemError(cause instanceof Error ? cause.message : 'Could not upgrade the System.')
      setUpgradeConfirmOpen(false)
      void refreshSystem()
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <section className="settings-page">
      <ModuleHeader eyebrow="Application" title="Settings" backLabel="Workspace" onBack={onClose} />

      <IntegrationStatus />

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
              and compare authored files before an update.
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
                ? `Authored files match the ${systemDiff.baselineKind === 'bundled' ? 'bundled default' : 'active System'}.`
                : `Authored files differ from the ${systemDiff.baselineKind === 'bundled' ? 'bundled default' : 'active System'}.`}
            </p>
            <p>
              This is a read-only, two-way comparison. It does not merge updates or identify which
              side changed first.
            </p>
            <div className="settings-system__diff-groups">
              <DiffGroups
                title="Components"
                entries={systemDiff.components}
                baselineLabel={
                  systemDiff.baselineKind === 'bundled' ? 'bundled default' : 'active System'
                }
                targetLabel="active System"
              />
              <DiffGroups
                title="Files"
                entries={systemDiff.files}
                baselineLabel={
                  systemDiff.baselineKind === 'bundled' ? 'bundled default' : 'active System'
                }
                targetLabel="active System"
              />
            </div>
          </div>
        )}

        {systemUpgrade && (
          <div className="settings-system__upgrade">
            <h4>Update the default System</h4>
            {systemUpgrade.available ? (
              <>
                <p>
                  Recorded base: {systemUpgrade.baselineVersion} · Bundled default:{' '}
                  {systemUpgrade.bundledVersion}. Files changed only upstream:{' '}
                  {systemUpgrade.files.upstreamOnly.length}; only locally:{' '}
                  {systemUpgrade.files.localOnly.length}; conflicts:{' '}
                  {systemUpgrade.files.conflicts.length}.
                </p>
                {systemUpgrade.files.conflicts.length > 0 && (
                  <details>
                    <summary>Conflicting files · {systemUpgrade.files.conflicts.length}</summary>
                    <p>
                      Compare the current local and bundled versions, resolve overlapping edits in
                      your System folder, then refresh the plan. The recorded base stores hashes,
                      not previous file contents. Nothing will be applied while conflicts remain.
                    </p>
                    <ul>
                      {systemUpgrade.files.conflicts.map((path) => (
                        <UpgradeConflictPreview
                          key={`${systemUpgrade.fingerprint}:${path}`}
                          path={path}
                          fingerprint={systemUpgrade.fingerprint}
                          onRefresh={refreshSystem}
                        />
                      ))}
                    </ul>
                  </details>
                )}
                {systemUpgrade.files.upstreamOnly.length > 0 && (
                  <details>
                    <summary>
                      Files from the bundled default · {systemUpgrade.files.upstreamOnly.length}
                    </summary>
                    <ul>
                      {systemUpgrade.files.upstreamOnly.map((path) => (
                        <li key={path}>
                          <code>{path}</code>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {systemUpgrade.canApply ? (
                  <Button type="button" size="small" onClick={() => setUpgradeConfirmOpen(true)}>
                    Review update
                  </Button>
                ) : systemUpgrade.files.conflicts.length === 0 ? (
                  <p>No default changes to apply.</p>
                ) : null}
              </>
            ) : (
              <p>{systemUpgrade.reason}</p>
            )}
            {upgradeResult && <p role="status">{upgradeResult}</p>}
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
            <Button type="button" size="small" onClick={() => setSystemPickerOpen(true)}>
              Browse project
            </Button>
          </form>
          {candidateError && <InterfacePackDiagnostic error={candidateError} kind="System" />}
          {installResult && <p role="status">{installResult}</p>}
          {candidate && (
            <div className="settings-system__candidate" role="status">
              <strong>
                {candidate.name} · {candidate.version}
              </strong>
              <p>{candidate.description || 'Complete interface System'}</p>
              <code>{candidate.path}</code>
              <div className="settings-system__diff">
                <p>
                  {candidate.diff.identical
                    ? 'No authored file differences'
                    : 'Authored file differences'}{' '}
                  compared with the{' '}
                  {candidate.diff.baselineKind === 'bundled' ? 'bundled default' : 'active System'}.
                </p>
                <p>This is a read-only comparison. Check the folder again after editing it.</p>
                <div className="settings-system__diff-groups">
                  <DiffGroups
                    title="Candidate Components"
                    entries={candidate.diff.components}
                    baselineLabel={
                      candidate.diff.baselineKind === 'bundled'
                        ? 'bundled default'
                        : 'active System'
                    }
                    targetLabel="candidate System"
                  />
                  <DiffGroups
                    title="Candidate Files"
                    entries={candidate.diff.files}
                    baselineLabel={
                      candidate.diff.baselineKind === 'bundled'
                        ? 'bundled default'
                        : 'active System'
                    }
                    targetLabel="candidate System"
                  />
                </div>
              </div>
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

      <InterfaceFolderPicker
        kind="System"
        open={systemPickerOpen}
        onClose={() => setSystemPickerOpen(false)}
        onSelect={(path) => {
          setSystemPickerOpen(false)
          setSystemFolder(path)
          void inspectCandidate(path)
        }}
      />

      <Dialog
        open={upgradeConfirmOpen}
        title="Update default System?"
        eyebrow="Apply bundled changes"
        description="Only files unchanged since the recorded base receive bundled updates. Any overlap blocks the entire update. Design Lab validates the result and saves a snapshot before activation. Restart afterward."
        onClose={() => setUpgradeConfirmOpen(false)}
        dismissible={!upgrading}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={upgrading}
              onClick={() => setUpgradeConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={upgrading}
              onClick={() => void upgradeDefaultSystem()}
            >
              Apply update
            </Button>
          </>
        }
      >
        {systemUpgrade?.available && (
          <p>
            {systemUpgrade.files.upstreamOnly.length} bundled file changes will be applied.{' '}
            {systemUpgrade.files.localOnly.length} locally edited files stay as they are.
          </p>
        )}
      </Dialog>

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

      <SkinSettings
        activeSkin={systemDoctor?.skin ?? null}
        onRefresh={() => void refreshSystem()}
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
