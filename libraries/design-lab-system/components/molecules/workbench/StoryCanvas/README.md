# Story Canvas

A full-width, task-specific specimen. Each canvas explains one component axis such as variants, sizes, loading, or full-width behavior without mixing unrelated comparisons.

The compact header names the scenario, keeps its story kind beside the title, and does not reserve a fixed height. The stage renders the real subject component. Optional controlled Canvas background props keep Story stages synchronized with the surrounding Workbench preference and place the compact control over the stage's top-right without changing stage padding.

Design Lab derives canonical imports plus the TSX usage of every displayed example from the actual node returned by `renderStoryExample`, including nested Components, icon assets, slots, transformed props, and host composition. One shared structural printer keeps short JSX compact and expands long tags, arrays, objects, nested values, and sibling examples with stable indentation; this does not depend on how the Story source file itself was laid out. `source` remains an escape hatch for examples that intentionally cannot be represented by their rendered tree; ordinary stories must not duplicate their JSX as strings. A bare import is not a complete Story handoff. Long source previews show three lines before disclosure, and actions stay inside the code surface. Context and integration fixtures must remain visibly subordinate to the subject.

The source code rests at `0.2` opacity so examples remain visually primary. Hover, keyboard focus within the block, or expanded disclosure restores full opacity. Story header geometry remains identical across viewport widths.
