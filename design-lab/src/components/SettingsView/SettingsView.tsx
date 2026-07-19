import { useEffect, useState } from 'react'
import { CodeBlock, ModuleHeader } from '@design-lab/system/components'
import { getMcpIntegration, type McpIntegrationInfo } from '../../api/projects'

export function SettingsView({ onClose }: { onClose: () => void }) {
  const [integration, setIntegration] = useState<McpIntegrationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMcpIntegration().then(setIntegration).catch((cause: Error) => setError(cause.message))
  }, [])

  return <section className="settings-page">
    <ModuleHeader eyebrow="Application" title="Settings" backLabel="Workspace" onBack={onClose} />

    <div className="settings-page__intro">
      <div>
        <span>AI integration</span>
        <h2>MCP and agent access</h2>
        <p>Give coding agents a verified, filesystem-backed view of components, tokens, assets, fonts, and knowledge. Search returns descriptions and relevance first; a second lookup reveals the real name and implementation contract.</p>
      </div>
      <strong className={`settings-status${error ? ' settings-status--error' : ''}`}>{error ? 'Unavailable' : integration ? 'Ready' : 'Checking'}</strong>
    </div>

    {error && <p className="settings-page__error">{error}</p>}
    {integration && <>
      <section className="settings-section">
        <header>
          <span>Recommended</span>
          <h3>Connect the local MCP server</h3>
          <p>Add this stdio server to any MCP-compatible agent. The command uses the exact Node.js runtime and absolute server path from this installation.</p>
        </header>
        <CodeBlock language="json" code={JSON.stringify(integration.config, null, 2)} />
      </section>

      <section className="settings-section">
        <header>
          <span>Fallback</span>
          <h3>Use the same context engine from a script</h3>
          <p>No MCP client is required. The CLI and MCP adapters call the same scanner, ranking, and entity resolver.</p>
        </header>
        <CodeBlock language="shell" code={integration.cli.examples.join('\n')} />
      </section>

      <section className="settings-section settings-section--workflow">
        <header>
          <span>Agent contract</span>
          <h3>Search before generation</h3>
        </header>
        <ol>{integration.workflow.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>
    </>}
  </section>
}
