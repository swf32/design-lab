# Table

Generic semantic table for typed application data. Consumers define columns with a header, cell
renderer, and optional sortable value; `Table` owns stable sorting, density, selected-row treatment,
keyboard row activation, column resizing, overflow, and empty state presentation.

Use controlled `sort` and `onSortChange` when ordering belongs to application state. Otherwise,
`defaultSort` enables local sorting without boilerplate. `onRowSelect` turns rows into keyboard-
operable selections; omit it for read-only tables. Cells may contain any React content, including
code, swatches, chips, and composed Components.

For registry cells, the System owns optional presentation classes under `dl-table__*`: `identity`
for a primary label and secondary code, `path` and `source` for clipped paths, `type`, `comment`,
`value` and `value-text`, plus `swatch`, `swatch--large`, and `swatch-label`. The `token-identity`
and `copy` classes present a token path with a keyboard-focusable copy button; the application
still owns its copy action and live announcement in `copy-status`. Use these classes only inside
`Table` cells (apart from the adjacent live status) so a replacement System can restyle registry
content without editing the application.

Columns are resizable by default. Each divider redistributes width between its two adjacent columns,
so resizing does not unexpectedly grow the whole page. Drag the divider with a pointer, or focus it
and use Left/Right Arrow in 12px steps. Double-click or press Home to restore authored widths.
`minWidth` and `maxWidth` keep important content usable; `resizable: false` locks one column, while
`resizableColumns={false}` locks the whole table. `onColumnWidthsChange` exposes pixel snapshots when
an application wants to persist the user's layout, and `defaultColumnWidths` restores that layout.

Use `striped` for long, dense registries where quiet alternating row bands improve horizontal
tracking. The tint is deliberately weaker than hover and selection, and remains off by default for
short tables or surfaces where row separators already provide enough structure.

On narrow surfaces the table scrolls horizontally instead of silently removing columns. Choose
columns deliberately and keep the primary identity first.
