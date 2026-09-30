import { ApiRequestError } from '../../api/projects'

function guidance(error: ApiRequestError, kind: 'Skin' | 'System') {
  switch (error.code) {
    case 'INTERFACE_PACK_SOURCE_NOT_FOUND':
    case 'INTERFACE_PACK_SOURCE_REQUIRED':
    case 'INTERFACE_PACK_SOURCE_NOT_DIRECTORY':
      return 'Choose an existing folder. Browse project folders or check the path you entered.'
    case 'INTERFACE_PACK_MANIFEST_MISSING':
      return `This folder needs design-lab-pack.json at its root. Create a ${kind} in Settings for a working starting structure.`
    case 'INTERFACE_PACK_LIBRARY_MISSING':
    case 'INTERFACE_PACK_PACKAGE_MISSING':
    case 'INTERFACE_PACK_LIBRARY_INVALID':
    case 'INTERFACE_PACK_LIBRARY_IMPORT_INVALID':
      return 'Check library.json and package.json against the generated System template. Keep the canonical @design-lab/system imports.'
    case 'INTERFACE_PACK_ENTRY_MISSING':
      return 'An entrypoint in design-lab-pack.json points to a missing file. Restore that file or correct its relative path.'
    case 'INTERFACE_PACK_EXPORTS_MISSING':
    case 'INTERFACE_PACK_EXPORT_MISSING':
      return 'Export the required names from the declared System entrypoint, then check the folder again.'
    case 'INTERFACE_PACK_TYPECHECK_FAILED':
      return 'Fix the TypeScript errors in this System. Its Components must satisfy the current Design Lab application contract.'
    case 'INTERFACE_PACK_ASSET_MISSING':
      return 'Add the missing media or font file to this System, or correct its path, then check the folder again.'
    case 'INTERFACE_PACK_ASSET_OUTSIDE':
      return 'Keep referenced media and fonts inside this System folder, then check the folder again.'
    case 'INTERFACE_PACK_ASSETS_INVALID':
      return 'Set entrypoints.assets in design-lab-pack.json to a folder inside this System.'
    case 'INTERFACE_PACK_INCOMPATIBLE':
      return 'This package targets a different Design Lab version. Use a compatible release or update its implementation and compatibility range.'
    case 'INTERFACE_PACK_KIND_INVALID':
      return `This is not a ${kind} package. Check the kind in design-lab-pack.json or choose the matching installer.`
    case 'INTERFACE_PACK_SYMLINK_UNSUPPORTED':
    case 'INTERFACE_PACK_SYMLINK_ESCAPE':
      return 'Copy linked files into the package itself, then check the folder again.'
    default:
      return null
  }
}

export function InterfacePackDiagnostic({
  error,
  kind,
}: {
  error: Error
  kind: 'Skin' | 'System'
}) {
  if (!(error instanceof ApiRequestError))
    return (
      <p className="settings-page__error" role="alert">
        {error.message}
      </p>
    )

  const nextStep = guidance(error, kind)
  const details = error.details as
    | {
        entrypoint?: unknown
        missing?: unknown
        source?: unknown
        path?: unknown
      }
    | undefined
  const missing = Array.isArray(details?.missing)
    ? details.missing.filter((name): name is string => typeof name === 'string')
    : []
  return (
    <div className="settings-pack-diagnostic" role="alert">
      <strong>{kind} check failed</strong>
      {nextStep && <p>{nextStep}</p>}
      {missing.length > 0 && (
        <p>
          Missing from {String(details?.entrypoint ?? 'entrypoint')}: {missing.join(', ')}
        </p>
      )}
      {typeof details?.source === 'string' && typeof details?.path === 'string' && (
        <p>
          Referenced in {details.source}: {details.path}
        </p>
      )}
      <details>
        <summary>Technical details · {error.code}</summary>
        <pre>{error.message}</pre>
      </details>
    </div>
  )
}
