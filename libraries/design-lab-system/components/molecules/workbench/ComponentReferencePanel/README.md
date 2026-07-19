# Component Reference Panel

Workbench reference surface for a discovered Component. It keeps the canonical import statement, complete adjacent file inventory, direct production relationships, example-only relationships, and scanner diagnostics visible before long-form stories and documentation.

The panel does not discover or infer data. Consumers pass scanner-derived import, file, and relation records. Relationship actions may navigate to another Component in the same active Project or Library.

Production `Uses` and `Used by` relationships must remain separate from `Examples use` and `Used in examples by`. Preview imports of production Components are contract violations and belong in diagnostics rather than either graph.
