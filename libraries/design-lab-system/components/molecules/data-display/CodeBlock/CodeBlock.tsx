import './CodeBlock.scss'
import { useEffect, useState } from 'react'
import { useDesignLabI18n } from '../../../../i18n'
import { CopyIcon } from '../../../../assets/icons/CopyIcon'

export interface CodeBlockProps {
  code: string
  language?: string
  showCopy?: boolean
  copyOnClick?: boolean
  onCopy?: () => void
}

export function CodeBlock({
  code,
  language = 'text',
  showCopy = true,
  copyOnClick = false,
  onCopy,
}: CodeBlockProps) {
  const { t } = useDesignLabI18n()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

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
      className={`dl-code-block${copyOnClick ? ' dl-code-block--copy-on-click' : ''}`}
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
      <figcaption>
        <span>{language}</span>
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
        {!showCopy && copyOnClick && <em>{copied ? t('action.copied') : t('action.copy')}</em>}
      </figcaption>
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </figure>
  )
}
