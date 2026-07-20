import './Dropzone.scss'

import { type ReactNode, useId } from 'react'
import { type Accept, type DropzoneOptions, useDropzone } from 'react-dropzone'

// =====================================================================
// Dropzone — Klyp brand atom (Phase 3 of Tailwind → SCSS migration)
// =====================================================================
//
// Wrapper around react-dropzone with token-based styling. Used for
// character refsheet uploads, asset import, video upload.
//
// State is communicated via `data-state` (idle | dragover | reject) and
// `data-disabled`. All visual variants are resolved in Dropzone.scss —
// no Tailwind, no cn(), no className concatenation gymnastics.
// Pattern reference: ../Chip/Chip.tsx, ../GlassPanel/GlassPanel.tsx

type DropzoneState = 'idle' | 'dragover' | 'reject'

type DropzoneProps = {
  onDropFiles: (files: File[]) => void
  accept?: Accept
  maxFiles?: number
  /** Max size in bytes per file. */
  maxSize?: number
  disabled?: boolean
  className?: string
  /** Slot for icon/illustration. */
  icon?: ReactNode
  /** Primary copy. Default: "Drop files here". */
  label?: ReactNode
  /** Secondary copy under the label. */
  hint?: ReactNode
  /** Render slot for completely custom inner content (overrides label/hint). */
  children?: ReactNode
  /**
   * Screen-reader-only strings. EN defaults — packages ship EN-only;
   * localized builds pass their own strings from the app layer.
   */
  srStrings?: {
    /** Accessible name for the hidden input when custom children replace the visible label. */
    uploadLabel?: string
    /** Live announcement while files are dragged over the zone. */
    releaseToUpload?: string
    /** Live announcement when the dragged files are rejected. */
    fileRejected?: string
  }
} & Pick<DropzoneOptions, 'multiple' | 'noClick' | 'noKeyboard'>

export function Dropzone({
  onDropFiles,
  accept,
  maxFiles,
  maxSize,
  disabled,
  multiple,
  noClick,
  noKeyboard,
  icon,
  label = 'Drop files here',
  hint,
  className,
  children,
  srStrings,
}: DropzoneProps) {
  const sr = {
    uploadLabel: 'Upload files',
    releaseToUpload: 'Release to upload',
    fileRejected: 'File rejected',
    ...srStrings,
  }
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: onDropFiles,
    accept,
    maxFiles,
    maxSize,
    disabled,
    multiple,
    noClick,
    noKeyboard,
  })

  const state: DropzoneState = isDragReject ? 'reject' : isDragActive ? 'dragover' : 'idle'

  // a11y: stable id to name the hidden <input> via aria-labelledby (3.1).
  const labelId = useId()
  // a11y: announce drag state changes to screen readers via a live region (3.2).
  const liveMessage =
    state === 'reject' ? sr.fileRejected : state === 'dragover' ? sr.releaseToUpload : ''
  // When custom children are used there is no visible label to reference,
  // so fall back to a static accessible name.
  const inputA11yProps =
    children == null ? { 'aria-labelledby': labelId } : { 'aria-label': sr.uploadLabel }

  const rootProps = getRootProps()
  const mergedClassName =
    typeof className === 'string' && className.length > 0
      ? `klyp-Dropzone ${className}`
      : 'klyp-Dropzone'

  return (
    <div
      {...rootProps}
      data-slot="dropzone"
      data-state={state}
      data-disabled={disabled ? 'true' : undefined}
      className={mergedClassName}
    >
      <input {...getInputProps()} {...inputA11yProps} />
      <div className="klyp-Dropzone__live" role="status" aria-live="polite">
        {liveMessage}
      </div>
      {children ?? (
        <>
          {icon && (
            <div className="klyp-Dropzone__icon" aria-hidden>
              {icon}
            </div>
          )}
          <div className="klyp-Dropzone__copy">
            <p className="klyp-Dropzone__label" id={labelId}>
              {label}
            </p>
            {hint && <p className="klyp-Dropzone__hint">{hint}</p>}
          </div>
        </>
      )}
    </div>
  )
}
