# Semantic Tree Item

Row for the module-specific semantic tree. It represents a folder, component, token, asset, or relevant file entity rather than exposing every implementation file.

Real folder rows expose `aria-expanded`; selecting one may also filter the active module view. A virtual folder such as `All` is selectable but has no disclosure state because it does not exist on disk. Selectable folders and entities use the same active treatment. `Inside semantic tree` is a context story for indentation and sibling alignment, not a visual variant.

`coloringEnabled` turns the semantic entity icon into a Color Picker trigger while preserving label selection as a separate action. `actionsEnabled` reveals a trailing More control on row hover or keyboard focus. Consumers may provide real menu content through `actions`; the default menu deliberately communicates that actions are reserved for future behavior.
