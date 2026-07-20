/**
 * Pure file-type helpers for the `<PromptField>` upload gate.
 *
 * Kept React/CSS-free (no `./PromptField.scss` import) so they unit-test without
 * rendering. The problem they solve: `File.type` is OS-extension-derived by the
 * browser (not byte-sniffed) and is `''` — or a stray `application/octet-stream`
 * — for many video files on Windows. A raw `f.type.startsWith('video/')` gate
 * then rejects a real `.mp4`. These helpers let a consumer inject an
 * extension→MIME inference fn (`inferType`) so the gate AND the downstream
 * upload see a real type. The server magic-byte sniff stays the source of truth.
 */

export type InferMimeFromName = (filename: string) => string | undefined

/** Browser-reported types we don't trust and try to replace via the extension. */
const UNRELIABLE_TYPES: ReadonlySet<string> = new Set(['', 'application/octet-stream'])

function isUnreliable(type: string): boolean {
  return UNRELIABLE_TYPES.has(type)
}

/**
 * The file's own MIME when trustworthy, else the extension-inferred MIME, else
 * the original (possibly empty) type. Used by the accept gate.
 */
export function effectiveFileType(file: File, infer?: InferMimeFromName): string {
  if (file.type && !isUnreliable(file.type)) return file.type
  return infer?.(file.name) ?? file.type ?? ''
}

/**
 * True when the file's effective MIME starts with any accepted prefix.
 * `acceptPrefixes` entries are MIME prefixes like `'image/'` or `'video/'`
 * (or full types like `'application/pdf'`).
 */
export function fileMatchesAccept(
  file: File,
  acceptPrefixes: readonly string[],
  infer?: InferMimeFromName,
): boolean {
  const type = effectiveFileType(file, infer)
  if (!type) return false
  return acceptPrefixes.some((prefix) => type.startsWith(prefix))
}

/**
 * Reconstruct the File carrying the inferred MIME when its own type is missing
 * or untrusted, so the corrected type flows through the entire upload pipeline
 * (accept-gate → presigned-PUT `Content-Type` header → server `finalize` sniff).
 * Returns the ORIGINAL File untouched when its type is trustworthy or no
 * inference is available — so callers that don't pass `infer` are unaffected.
 */
export function fileWithResolvedType(file: File, infer?: InferMimeFromName): File {
  if (file.type && !isUnreliable(file.type)) return file
  const inferred = infer?.(file.name)
  if (!inferred || inferred === file.type) return file
  return new File([file], file.name, { type: inferred, lastModified: file.lastModified })
}
