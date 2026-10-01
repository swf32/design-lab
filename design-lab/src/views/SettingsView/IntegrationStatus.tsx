import { useCallback, useEffect, useState } from 'react'
import { Button, Dialog, Input, SettingsPanel } from '@design-lab/system/components'
import { InterfaceFolderPicker } from './InterfaceFolderPicker'
import {
  applySetupRepair,
  getSetupInstallationStatus,
  getSetupRepairPlan,
  type SetupInstallationStatus,
  type SetupRepairPlan,
  type MountReplacement,
} from '../../api/projects'

const mountKey = (kind: string, path: string) => JSON.stringify([kind, path])

function nextStep(code: string) {
  if (code === 'SETUP_MOUNT_MISSING')
    return 'If this folder moved, choose its new location below and preview the config change.'
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
  const [repairPlan, setRepairPlan] = useState<SetupRepairPlan | null>(null)
  const [repairOpen, setRepairOpen] = useState(false)
  const [repairBusy, setRepairBusy] = useState(false)
  const [repairMessage, setRepairMessage] = useState<string | null>(null)
  const [mountPaths, setMountPaths] = useState<Record<string, string>>({})
  const [reviewedMounts, setReviewedMounts] = useState<MountReplacement[]>([])
  const [pickerMount, setPickerMount] = useState<{ kind: string; path: string } | null>(null)

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

  const previewRepair = async () => {
    setRepairBusy(true)
    setError(null)
    try {
      const replacements: MountReplacement[] = status?.available
        ? status.diagnostics
            .filter((item) => item.code === 'SETUP_MOUNT_MISSING' && item.kind)
            .flatMap((item) => {
              const to = mountPaths[mountKey(item.kind!, item.path)]?.trim()
              return to ? [{ kind: item.kind!, from: item.path, to }] : []
            })
        : []
      setRepairPlan(await getSetupRepairPlan(replacements))
      setReviewedMounts(replacements)
      setRepairOpen(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not prepare the repair plan.')
    } finally {
      setRepairBusy(false)
    }
  }

  const repair = async () => {
    if (!repairPlan?.available || !repairPlan.canApply) return
    setRepairBusy(true)
    setError(null)
    try {
      const result = await applySetupRepair(repairPlan.fingerprint, reviewedMounts)
      setRepairMessage(
        result.applied
          ? `Applied ${result.changes.length} integration repair(s). Review any remaining diagnostics below.`
          : 'No managed files needed repair.',
      )
      setRepairOpen(false)
      setRepairPlan(null)
      setReviewedMounts([])
      setMountPaths({})
      void refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not repair the integration.')
      setRepairOpen(false)
      void refresh()
    } finally {
      setRepairBusy(false)
    }
  }

  return (
    <SettingsPanel
      className="settings-integration"
      eyebrow="Project files"
      title="Design Lab integration"
      description="Check the project config, source mounts, local authoring rules, AGENTS pointer, and active System. This check reads files without changing them."
      action={
        <Button type="button" size="small" loading={loading} onClick={() => void refresh()}>
          Check integration
        </Button>
      }
    >
      {loading && !status && <p role="status">Checking project files…</p>}
      {error && (
        <p className="settings-page__error" role="alert">
          {error}
        </p>
      )}
      {repairMessage && <p role="status">{repairMessage}</p>}
      {status && !status.available && <p role="status">{status.reason}</p>}
      {status?.available && (
        <div className="settings-integration__report" role="status">
          <strong className={`settings-status${status.ok ? '' : ' settings-status--error'}`}>
            {status.ok ? 'Healthy' : 'Needs attention'}
          </strong>
          {status.ok ? (
            <p>Config, mounts, rules, AGENTS pointer, and System structure are present.</p>
          ) : (
            <>
              <Button
                type="button"
                size="small"
                loading={repairBusy}
                onClick={() => void previewRepair()}
              >
                Preview safe repair
              </Button>
              <ul>
                {status.diagnostics.map((diagnostic, index) => (
                  <li key={`${diagnostic.code}:${diagnostic.path}:${index}`}>
                    <strong>{diagnostic.message}</strong>
                    <code>{diagnostic.path}</code>
                    <p>{nextStep(diagnostic.code)}</p>
                    {diagnostic.code === 'SETUP_MOUNT_MISSING' && diagnostic.kind && (
                      <div className="settings-integration__mount-repair">
                        <Input
                          label={`New folder for ${diagnostic.kind}`}
                          value={mountPaths[mountKey(diagnostic.kind, diagnostic.path)] ?? ''}
                          onChange={(event) =>
                            setMountPaths((current) => ({
                              ...current,
                              [mountKey(diagnostic.kind!, diagnostic.path)]:
                                event.currentTarget.value,
                            }))
                          }
                          placeholder="src/components"
                          fullWidth
                        />
                        <Button
                          type="button"
                          size="small"
                          onClick={() =>
                            setPickerMount({ kind: diagnostic.kind!, path: diagnostic.path })
                          }
                        >
                          Browse project
                        </Button>
                      </div>
                    )}
                    <details>
                      <summary>Diagnostic code</summary>
                      <code>{diagnostic.code}</code>
                    </details>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      <Dialog
        open={repairOpen}
        title="Repair Design Lab integration?"
        eyebrow="Review file changes"
        description="Review each proposed change. Missing managed rules and the AGENTS pointer can be restored; selected missing source mounts update only their relative paths in config. Source files and the active System stay in place."
        onClose={() => setRepairOpen(false)}
        dismissible={!repairBusy}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={repairBusy}
              onClick={() => setRepairOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={repairBusy}
              disabled={!repairPlan?.available || !repairPlan.canApply}
              onClick={() => void repair()}
            >
              Apply safe repair
            </Button>
          </>
        }
      >
        {repairPlan?.available ? (
          <div className="settings-integration__repair-plan">
            <h4>Changes to apply</h4>
            {repairPlan.changes.length ? (
              <ul>
                {repairPlan.changes.map((change) => (
                  <li
                    key={`${change.kind}:${change.path}:${change.kind === 'replace-mount' ? change.from : ''}`}
                  >
                    <code>{change.path}</code> ·{' '}
                    {change.kind === 'restore-rule'
                      ? 'restore missing rule'
                      : change.kind === 'append-agents-pointer'
                        ? 'append managed pointer'
                        : `${change.mountKind}: ${change.from} → ${change.to}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No safe changes selected.</p>
            )}
            {repairPlan.blockers.length > 0 && (
              <>
                <h4>Needs manual attention</h4>
                <ul>
                  {repairPlan.blockers.map((item, index) => (
                    <li key={`${item.code}:${index}`}>
                      <code>{item.path}</code> · {item.message}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <p>{repairPlan?.reason}</p>
        )}
      </Dialog>
      <InterfaceFolderPicker
        kind="source mount"
        open={pickerMount !== null}
        onClose={() => setPickerMount(null)}
        onSelect={(path) => {
          if (pickerMount)
            setMountPaths((current) => ({
              ...current,
              [mountKey(pickerMount.kind, pickerMount.path)]: path,
            }))
          setPickerMount(null)
        }}
      />
    </SettingsPanel>
  )
}
