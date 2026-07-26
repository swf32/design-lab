# Semantic Tree Item

Row for the module-specific semantic tree. It represents a folder, token document, token group, component, token, asset, Wireframe, or relevant file entity rather than exposing every implementation file.

Filesystem folders and typed semantic containers such as token documents and token groups expose `aria-expanded`. Their distinct icons preserve what each row means instead of flattening every expandable node into a fake folder. Use `onExpandedChange` for disclosure and `onSelect` for navigation or filtering, so expanding a branch never changes location as a side effect. If `onExpandedChange` is omitted, the disclosure button falls back to `onSelect` for backwards compatibility. A virtual folder such as `All` is selectable but has no disclosure state because it does not exist on disk. Selectable containers and entities use the same active treatment. `Inside semantic tree` is a context story for indentation and sibling alignment, not a visual variant.

`coloringEnabled` turns the semantic entity icon into a Color Picker trigger while preserving label selection as a separate action. `actionsEnabled` reveals a trailing More control on row hover or keyboard focus. Consumers may provide real menu content through `actions`; the default menu deliberately communicates that actions are reserved for future behavior.

Row height, indentation, disclosure, color, label, More geometry, and type scale remain identical across viewport widths. These actions stay semantically separate without switching to a second mobile density.
