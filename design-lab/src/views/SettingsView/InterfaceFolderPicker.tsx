import { useEffect, useRef, useState } from 'react'
import { Button, Dialog } from '@design-lab/system/components'
import { browseInterfaceFolders, type InterfaceFolderListing } from '../../api/projects'

export function InterfaceFolderPicker({
  kind,
  open,
  onClose,
  onSelect,
}: {
  kind: 'Skin' | 'System' | 'source mount'
  open: boolean
  onClose: () => void
  onSelect: (path: string) => void
}) {
  const [listing, setListing] = useState<InterfaceFolderListing | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const request = useRef(0)

  const browse = async (path: string) => {
    const current = ++request.current
    setLoading(true)
    setError(null)
    try {
      const result = await browseInterfaceFolders(path)
      if (request.current === current) setListing(result)
    } catch (cause) {
      if (request.current === current)
        setError(cause instanceof Error ? cause.message : 'Could not open the folder.')
    } finally {
      if (request.current === current) setLoading(false)
    }
  }

  useEffect(() => {
    if (open) void browse('.')
    else request.current += 1
  }, [open])

  return (
    <Dialog
      open={open}
      title={`Choose a ${kind} folder`}
      eyebrow="Project folders"
      description={
        kind === 'source mount'
          ? 'Choose the folder where the project source now lives. Its relative path will be reviewed before the config changes.'
          : 'Browse folders in this project. Choosing one checks its package contract before installation.'
      }
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!listing || listing.path === '.' || loading}
            onClick={() => {
              if (listing && listing.path !== '.') onSelect(listing.path)
            }}
          >
            {kind === 'source mount' ? 'Use this folder' : 'Check this folder'}
          </Button>
        </>
      }
    >
      <div className="settings-folder-picker">
        <p>
          Project / <code>{listing?.path ?? '.'}</code>
        </p>
        {loading && <p role="status">Opening folder…</p>}
        {error && (
          <p className="settings-page__error" role="alert">
            {error}
          </p>
        )}
        {listing?.parent && (
          <Button
            type="button"
            size="small"
            variant="ghost"
            onClick={() => void browse(listing.parent!)}
          >
            Up one folder
          </Button>
        )}
        {listing && listing.folders.length === 0 && <p>No more folders here.</p>}
        {listing && listing.folders.length > 0 && (
          <ul>
            {listing.folders.map((folder) => (
              <li key={folder.path}>
                <Button
                  type="button"
                  size="small"
                  variant="ghost"
                  onClick={() => void browse(folder.path)}
                >
                  {folder.name}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  )
}
