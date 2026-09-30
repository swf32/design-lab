import { useCallback, useEffect, useState } from 'react'
import { Button } from '@design-lab/system/components'
import { getSetupInstallationStatus, type SetupInstallationStatus } from '../../api/projects'

function nextStep(code: string) {
  if (code === 'SETUP_MOUNT_MISSING')
    return 'Restore the source folder or update its relative mount in designlab.config.json.'
  if (code === 'SETUP_RULE_MISSING')
    return 'Restore the missing rule in design-lab/rules/ from the installed Design Lab package.'
  if (code === 'SETUP_AGENTS_POINTER_MISSING')
    return 'Restore the Design Lab pointer block in the project AGENTS.md without removing your own instructions.'
  if (code === 'SETUP_CONFIG_INVALID' || code === 'SETUP_SCHEMA_UNSUPPORTED')
    return 'Check design-lab/designlab.config.json. Keep a backup before changing this project-owned configuration.'
  if (code.startsWith('INTERFACE_') || code.startsWith('SETUP_SYSTEM_'))
    return 'Check the active System below. You can restore the bundled default from Settings after reviewing its snapshot warning.'
  return 'Review this path and the project configuration before changing files.'
}

export function IntegrationStatus() {
  const [status, setStatus] = useState<SetupInstallationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setStatus(await getSetupInstallationStatus())
    } catch (cause) {
      setStatus(null)
      setError(cause instanceof Error ? cause.message : 'Could not check the integration.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <section
      className="settings-section settings-integration"
      aria-labelledby="settings-integration-title"
    >
      <header className="settings-system__header">
        <div>
          <span>Project files</span>
          <h3 id="settings-integration-title">Design Lab integration</h3>
          <p>
            Check the project config, source mounts, local authoring rules, AGENTS pointer, and
            active System. This check reads files without changing them.
          </p>
        </div>
        <Button type="button" size="small" loading={loading} onClick={() => void refresh()}>
          Check integration
        </Button>
      </header>
      {loading && !status && <p role="status">Checking project files…</p>}
      {error && (
        <p className="settings-page__error" role="alert">
          {error}
        </p>
      )}
      {status && !status.available && <p role="status">{status.reason}</p>}
      {status?.available && (
        <div className="settings-integration__report" role="status">
          <strong className={`settings-status${status.ok ? '' : ' settings-status--error'}`}>
            {status.ok ? 'Healthy' : 'Needs attention'}
          </strong>
          {status.ok ? (
            <p>Config, mounts, rules, AGENTS pointer, and System structure are present.</p>
          ) : (
            <ul>
              {status.diagnostics.map((diagnostic, index) => (
                <li key={`${diagnostic.code}:${diagnostic.path}:${index}`}>
                  <strong>{diagnostic.message}</strong>
                  <code>{diagnostic.path}</code>
                  <p>{nextStep(diagnostic.code)}</p>
                  <details>
                    <summary>Diagnostic code</summary>
                    <code>{diagnostic.code}</code>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
