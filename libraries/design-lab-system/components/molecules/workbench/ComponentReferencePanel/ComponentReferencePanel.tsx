import './ComponentReferencePanel.scss'
import { useDesignLabI18n } from '../../../../i18n'
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
  files: ComponentReferenceFile[]
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
        <div>
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
  files,
  uses = [],
  usedBy = [],
  examplesUse = [],
  usedInExamplesBy = [],
  diagnostics = [],
  onSelectRelation,
}: ComponentReferencePanelProps) {
  const { t } = useDesignLabI18n()

  return (
    <section className="dl-component-reference" aria-label={t('reference.label')}>
      <div className="dl-component-reference__primary">
        <section className="dl-component-reference__import">
          <header>
            <strong>{t('reference.import')}</strong>
          </header>
          <CodeBlock language="tsx" code={importStatement} />
        </section>
        <section className="dl-component-reference__files">
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
      </div>
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
