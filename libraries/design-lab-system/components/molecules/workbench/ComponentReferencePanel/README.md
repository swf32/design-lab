# Component Reference Panel

Workbench reference surface for a discovered Component. It keeps the canonical import statement, direct production relationships, example-only relationships, and scanner diagnostics visible before long-form stories and documentation. Relations are collapsed by default; each group scrolls after roughly two and a half cards.

The panel does not discover or infer data. Consumers pass scanner-derived import and relation records. `importLanguage` selects the CodeBlock language and defaults to `tsx`, so managed Vue and future adapters do not present every import as React source. Relationship actions may navigate to another Component in the same active Project or Library. Render the separately exported `ComponentReferenceFiles` as the final Component detail block, below Changelog.

Production `Uses` and `Used by` relationships must remain separate from `Examples use` and `Used in examples by`. Preview imports of production Components are contract violations and belong in diagnostics rather than either graph.
