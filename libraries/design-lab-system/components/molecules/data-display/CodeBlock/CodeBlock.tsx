import './CodeBlock.scss'
import { useEffect, useState, type CSSProperties } from 'react'
import { useDesignLabI18n } from '../../../../i18n'
import { ArrowDownIcon } from '../../../../assets/icons/ArrowDownIcon'
import { CopyIcon } from '../../../../assets/icons/CopyIcon'

export interface CodeBlockProps {
  code: string
  language?: string
  variant?: 'default' | 'code-only'
  showCopy?: boolean
  copyOnClick?: boolean
  collapsedLines?: number
  onCopy?: () => void
}

export function CodeBlock({
  code,
  language = 'text',
  variant = 'default',
  showCopy = true,
  copyOnClick = false,
  collapsedLines,
  onCopy,
}: CodeBlockProps) {
  const { t } = useDesignLabI18n()
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const canCollapse = Boolean(
    collapsedLines && collapsedLines > 0 && code.split(/\r?\n/).length > collapsedLines,
  )

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  useEffect(() => setExpanded(false), [code, collapsedLines])

  const copyWithSelection = () => {
    const field = document.createElement('textarea')
    field.value = code
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    const succeeded = document.execCommand('copy')
    field.remove()
    return succeeded
  }

  const copy = async () => {
    let succeeded = false
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(code)
      succeeded = true
    } catch {
      succeeded = copyWithSelection()
    }
    setCopied(succeeded)
    if (succeeded) onCopy?.()
  }

  return (
    <figure
      className={`dl-code-block dl-code-block--${variant}${copyOnClick ? ' dl-code-block--copy-on-click' : ''}${canCollapse && !expanded ? ' dl-code-block--collapsed' : ''}${canCollapse && expanded ? ' dl-code-block--expanded' : ''}`}
      role={copyOnClick ? 'button' : undefined}
      tabIndex={copyOnClick ? 0 : undefined}
      aria-label={copyOnClick ? (copied ? t('action.copied') : t('action.copy')) : undefined}
      onClick={copyOnClick ? copy : undefined}
      onKeyDown={
        copyOnClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                void copy()
              }
            }
          : undefined
      }
    >
      {variant === 'default' && (
        <figcaption>
          <span className="dl-code-block__language">{language}</span>
          <span className="dl-code-block__actions">
            {canCollapse && (
              <button
                type="button"
                aria-expanded={expanded}
                onClick={(event) => {
                  event.stopPropagation()
                  setExpanded((current) => !current)
                }}
              >
                <i className={expanded ? 'is-expanded' : undefined} aria-hidden="true">
                  <ArrowDownIcon size={11} />
                </i>
                {expanded ? t('action.collapseCode') : t('action.expandCode')}
              </button>
            )}
            {showCopy && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  void copy()
                }}
                aria-label={copied ? t('action.copied') : t('action.copy')}
              >
                <i aria-hidden="true">{copied ? '✓' : <CopyIcon size={11} />}</i>
                {copied ? t('action.copied') : t('action.copy')}
              </button>
            )}
          </span>
          {!showCopy && copyOnClick && <em>{copied ? t('action.copied') : t('action.copy')}</em>}
        </figcaption>
      )}
      {variant === 'code-only' && (canCollapse || showCopy) && (
        <span className="dl-code-block__actions dl-code-block__actions--overlay">
          {canCollapse && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? t('action.collapseCode') : t('action.expandCode')}
              title={expanded ? t('action.collapseCode') : t('action.expandCode')}
              onClick={(event) => {
                event.stopPropagation()
                setExpanded((current) => !current)
              }}
            >
              <i className={expanded ? 'is-expanded' : undefined} aria-hidden="true">
                <ArrowDownIcon size={13} />
              </i>
            </button>
          )}
          {showCopy && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                void copy()
              }}
              aria-label={copied ? t('action.copied') : t('action.copy')}
              title={copied ? t('action.copied') : t('action.copy')}
            >
              <i aria-hidden="true">{copied ? '✓' : <CopyIcon size={13} />}</i>
            </button>
          )}
        </span>
      )}
      <pre
        style={
          collapsedLines
            ? ({ '--code-block-collapsed-lines': collapsedLines } as CSSProperties)
            : undefined
        }
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </figure>
  )
}
