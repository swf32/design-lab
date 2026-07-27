# Story Canvas

A full-width, task-specific specimen. Each canvas explains one component axis such as variants, sizes, loading, or full-width behavior without mixing unrelated comparisons.

The compact header names the scenario, keeps its story kind beside the title, and does not reserve a fixed height. The stage renders the real subject component. Optional controlled Canvas background and source-theme props keep Story stages synchronized with the surrounding Workbench preferences and place the compact control over the stage's top-right without changing stage padding. Canvas background and source theme remain separate choices.

Design Lab derives canonical imports plus the framework-native usage of every displayed example. The current React adapter analyzes the actual node returned by `renderStoryExample`; managed adapters provide their own canonical printer. `sourceLanguage` selects the CodeBlock language and defaults to `tsx`. `source` remains an escape hatch for examples that intentionally cannot be represented by a rendered tree. A bare import is not a complete Story handoff. Long source previews show three lines before disclosure, and actions stay inside the code surface. Context and integration fixtures must remain visibly subordinate to the subject.

The source code rests at `0.2` opacity so examples remain visually primary. Hover, keyboard focus within the block, or expanded disclosure restores full opacity. Story header geometry remains identical across viewport widths.
