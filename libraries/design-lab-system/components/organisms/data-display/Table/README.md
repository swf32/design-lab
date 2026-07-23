# Table

Generic semantic table for typed application data. Consumers define columns with a header, cell
renderer, and optional sortable value; `Table` owns stable sorting, density, selected-row treatment,
keyboard row activation, overflow, and empty state presentation.

Use controlled `sort` and `onSortChange` when ordering belongs to application state. Otherwise,
`defaultSort` enables local sorting without boilerplate. `onRowSelect` turns rows into keyboard-
operable selections; omit it for read-only tables. Cells may contain any React content, including
code, swatches, chips, and composed Components.

On narrow surfaces the table scrolls horizontally instead of silently removing columns. Choose
columns deliberately and keep the primary identity first.
