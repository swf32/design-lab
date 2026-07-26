# Table

Generic semantic table for typed application data. Consumers define columns with a header, cell
renderer, and optional sortable value; `Table` owns stable sorting, density, selected-row treatment,
keyboard row activation, column resizing, overflow, and empty state presentation.

Use controlled `sort` and `onSortChange` when ordering belongs to application state. Otherwise,
`defaultSort` enables local sorting without boilerplate. `onRowSelect` turns rows into keyboard-
operable selections; omit it for read-only tables. Cells may contain any React content, including
code, swatches, chips, and composed Components.

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
