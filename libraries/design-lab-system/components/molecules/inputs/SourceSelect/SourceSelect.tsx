import './SourceSelect.scss'
import { useState } from 'react'
import { ArrowDownIcon } from '../../../../assets/icons'
import { useDesignLabI18n } from '../../../../i18n'

export type SourceOption = {
  id: string
  name: string
  path: string
  available: boolean
  kind: 'project' | 'library'
}

type SourceSelectProps = {
  sources: SourceOption[]
  activeSource: SourceOption | null
  onChange: (sourceId: string) => void
  onCreateProject: () => void
}

export function SourceSelect({
  sources,
  activeSource,
  onChange,
  onCreateProject,
}: SourceSelectProps) {
  const { t } = useDesignLabI18n()
  const [open, setOpen] = useState(false)

  return (
    <div className="source-select">
      <button
        className="project-select"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="project-select__mark">DL</span>
        <span className="project-select__text">
          <strong>{activeSource?.name ?? t('source.none')}</strong>
          <small>
            {activeSource
              ? t(activeSource.kind === 'library' ? 'source.localLibrary' : 'source.localProject')
              : t('source.createFirst')}
          </small>
        </span>
        <ArrowDownIcon size={18} />
      </button>

      {open && (
        <div className="project-menu" role="menu">
          {sources.map((source) => (
            <button
              type="button"
              role="menuitem"
              className={
                source.id === activeSource?.id
                  ? 'project-menu__item project-menu__item--active'
                  : 'project-menu__item'
              }
              key={source.id}
              disabled={!source.available}
              onClick={() => {
                onChange(source.id)
                setOpen(false)
              }}
            >
              <strong>{source.name}</strong>
              <small>{source.path}</small>
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            className="project-menu__create"
            onClick={() => {
              onCreateProject()
              setOpen(false)
            }}
          >
            ＋ {t('source.create')}
          </button>
        </div>
      )}
    </div>
  )
}
