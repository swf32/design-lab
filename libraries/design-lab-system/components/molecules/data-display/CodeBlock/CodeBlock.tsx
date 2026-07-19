import './CodeBlock.scss'
import { useEffect, useState } from 'react'
import { useDesignLabI18n } from '../../../../i18n'
import { CopyIcon } from '../../../../assets/icons/CopyIcon'

export interface CodeBlockProps {
  code: string
  language?: string
  showCopy?: boolean
}

export function CodeBlock({ code, language = 'text', showCopy = true }: CodeBlockProps) {
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
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(copyWithSelection())
    }
  }

  return (
    <figure className="dl-code-block">
      <figcaption>
        <span>{language}</span>
        {showCopy && (
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? t('action.copied') : t('action.copy')}
          >
            <i aria-hidden="true">{copied ? '✓' : <CopyIcon size={11} />}</i>
            {copied ? t('action.copied') : t('action.copy')}
          </button>
        )}
      </figcaption>
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </figure>
  )
}
