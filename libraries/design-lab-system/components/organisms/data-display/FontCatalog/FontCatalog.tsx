import './FontCatalog.scss'

export type FontCatalogFamily = {
  id: string
  name: string
  cssFamily: string
  source: string
  styles: ReadonlyArray<{ weight: number; style: string }>
}

export type FontCatalogToken = {
  id: string
  path: string
  value: unknown
}

export type FontCatalogProps = {
  families: ReadonlyArray<FontCatalogFamily>
  typography: ReadonlyArray<FontCatalogToken>
  mode: string
}

export function FontCatalog({ families, typography, mode }: FontCatalogProps) {
  const values = Object.fromEntries(typography.map((token) => [token.path, token.value]))

  return (
    <div className="font-list">
      {families.map((family) => (
        <article
          className="font-card"
          key={family.id}
          style={{ fontFamily: String(values['typography.interface.family'] ?? family.cssFamily) }}
        >
          <span>
            {family.source} · {mode}
          </span>
          <h2 style={{ fontWeight: Number(values['typography.heading.weight'] ?? 600) }}>
            {family.name}
          </h2>
          <p
            style={{
              fontSize: String(values['typography.body.size'] ?? '42px'),
              lineHeight: Number(values['typography.body.line-height'] ?? 1.5),
            }}
          >
            Hamburgefontsiv 012345
          </p>
          <div className="font-mode-values">
            {typography.map((token) => (
              <div key={token.id}>
                <code>{token.path}</code>
                <strong>{String(token.value)}</strong>
              </div>
            ))}
          </div>
          <footer>
            {family.styles.map((style) => (
              <code key={`${style.weight}-${style.style}`}>
                {style.weight} {style.style}
              </code>
            ))}
          </footer>
        </article>
      ))}
    </div>
  )
}
