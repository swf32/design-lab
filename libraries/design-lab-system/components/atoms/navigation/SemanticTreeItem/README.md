# Semantic Tree Item

Row for the module-specific semantic tree. It represents a folder, component, token, asset, or relevant file entity rather than exposing every implementation file.

Real folder rows expose `aria-expanded`. Use `onExpandedChange` for disclosure and `onSelect` for navigation or filtering, so expanding a branch never changes location as a side effect. If `onExpandedChange` is omitted, the disclosure button falls back to `onSelect` for backwards compatibility. A virtual folder such as `All` is selectable but has no disclosure state because it does not exist on disk. Selectable folders and entities use the same active treatment. `Inside semantic tree` is a context story for indentation and sibling alignment, not a visual variant.

`coloringEnabled` turns the semantic entity icon into a Color Picker trigger while preserving label selection as a separate action. `actionsEnabled` reveals a trailing More control on row hover or keyboard focus. Consumers may provide real menu content through `actions`; the default menu deliberately communicates that actions are reserved for future behavior.

At phone widths, the row is 48 CSS pixels tall and disclosure, color, label, and More remain separate touch targets. Labels use a larger mobile type size while desktop keeps the compact workbench density.
