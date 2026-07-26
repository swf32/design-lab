import './ComponentReferencePanel.scss'
import { useState } from 'react'
import { useDesignLabI18n } from '../../../../i18n'
import { ArrowDownIcon } from '../../../../assets/icons/ArrowDownIcon'
import { CodeBlock } from '../../data-display/CodeBlock/CodeBlock'

export type ComponentReferenceFile = {
  role: string
  path: string
}

export type ComponentReferenceRelation = {
  id: string
  name: string
  directory: string
}

export type ComponentReferencePanelProps = {
  importStatement: string
  importLanguage?: string
  uses?: ComponentReferenceRelation[]
  usedBy?: ComponentReferenceRelation[]
  examplesUse?: ComponentReferenceRelation[]
  usedInExamplesBy?: ComponentReferenceRelation[]
  diagnostics?: Array<{ code: string; message: string }>
  onSelectRelation?: (relation: ComponentReferenceRelation) => void
}

function RelationGroup({
  label,
  relations,
  emptyLabel,
  onSelect,
}: {
  label: string
  relations: ComponentReferenceRelation[]
  emptyLabel: string
  onSelect?: (relation: ComponentReferenceRelation) => void
}) {
  return (
    <section className="dl-component-reference__relations">
      <header>
        <strong>{label}</strong>
        <span>{relations.length}</span>
      </header>
      {relations.length ? (
        <div className="dl-component-reference__relation-list">
          {relations.map((relation) => (
            <button
              key={relation.id}
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(relation)}
            >
              <strong>{relation.name}</strong>
              <code>{relation.directory}</code>
            </button>
          ))}
        </div>
      ) : (
        <p>{emptyLabel}</p>
      )}
    </section>
  )
}

export function ComponentReferencePanel({
  importStatement,
  importLanguage = 'tsx',
  uses = [],
  usedBy = [],
  examplesUse = [],
  usedInExamplesBy = [],
  diagnostics = [],
  onSelectRelation,
}: ComponentReferencePanelProps) {
  const { t } = useDesignLabI18n()
  const [graphExpanded, setGraphExpanded] = useState(false)
  const relationCount = uses.length + usedBy.length + examplesUse.length + usedInExamplesBy.length

  return (
    <section className="dl-component-reference" aria-label={t('reference.label')}>
      <div className="dl-component-reference__primary">
        <section className="dl-component-reference__import">
          <header>
            <strong>{t('reference.import')}</strong>
          </header>
          <CodeBlock language={importLanguage} code={importStatement} />
        </section>
      </div>
      <div
        className={`dl-component-reference__graph-disclosure${graphExpanded ? ' is-expanded' : ''}`}
      >
        <button
          className="dl-component-reference__graph-toggle"
          type="button"
          aria-expanded={graphExpanded}
          onClick={() => setGraphExpanded((current) => !current)}
        >
          <strong>{t('reference.relations')}</strong>
          <span>{relationCount}</span>
          <i aria-hidden="true">
            <ArrowDownIcon size={12} />
          </i>
        </button>
        <div
          className="dl-component-reference__graph-shell"
          aria-hidden={!graphExpanded}
          inert={!graphExpanded}
        >
          <div className="dl-component-reference__graph">
            <RelationGroup
              label={t('reference.uses')}
              relations={uses}
              emptyLabel={t('reference.none')}
              onSelect={onSelectRelation}
            />
            <RelationGroup
              label={t('reference.usedBy')}
              relations={usedBy}
              emptyLabel={t('reference.none')}
              onSelect={onSelectRelation}
            />
            <RelationGroup
              label={t('reference.examplesUse')}
              relations={examplesUse}
              emptyLabel={t('reference.none')}
              onSelect={onSelectRelation}
            />
            <RelationGroup
              label={t('reference.usedInExamplesBy')}
              relations={usedInExamplesBy}
              emptyLabel={t('reference.none')}
              onSelect={onSelectRelation}
            />
          </div>
        </div>
      </div>
      {diagnostics.length > 0 && (
        <div className="dl-component-reference__diagnostics" role="status">
          <strong>{t('reference.diagnostics')}</strong>
          {diagnostics.map((diagnostic) => (
            <p key={`${diagnostic.code}:${diagnostic.message}`}>{diagnostic.message}</p>
          ))}
        </div>
      )}
    </section>
  )
}

export function ComponentReferenceFiles({ files }: { files: ComponentReferenceFile[] }) {
  const { t } = useDesignLabI18n()
  return (
    <section className="dl-component-reference-files">
      <header>
        <strong>{t('workbench.files')}</strong>
        <span>{files.length}</span>
      </header>
      <div>
        {files.map((file) => (
          <span key={`${file.role}:${file.path}`}>
            <small>{file.role}</small>
            <code>{file.path}</code>
          </span>
        ))}
      </div>
    </section>
  )
}
