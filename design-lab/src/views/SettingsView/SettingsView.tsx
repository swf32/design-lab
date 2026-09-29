import './SettingsView.scss'
import { useCallback, useEffect, useState } from 'react'
import { Button, CodeBlock, ModuleHeader } from '@design-lab/system/components'
import {
  getInterfaceSystemDiff,
  getInterfaceSystemDoctor,
  getMcpIntegration,
  type InterfaceSystemDiff,
  type InterfaceSystemDoctor,
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
  const [systemError, setSystemError] = useState<string | null>(null)
  const [systemLoading, setSystemLoading] = useState(false)

  const refreshSystem = useCallback(async () => {
    setSystemLoading(true)
    setSystemError(null)
    const [doctor, diff] = await Promise.allSettled([
      getInterfaceSystemDoctor(),
      getInterfaceSystemDiff(),
    ])
    setSystemDoctor(doctor.status === 'fulfilled' ? doctor.value : null)
    setSystemDiff(diff.status === 'fulfilled' ? diff.value : null)
    if (doctor.status === 'rejected' || diff.status === 'rejected') {
      const failure =
        doctor.status === 'rejected'
          ? doctor.reason
          : diff.status === 'rejected'
            ? diff.reason
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
      </section>

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
