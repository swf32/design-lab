# Select

Select chooses one value from a predefined option list. It preserves the native `select` element so keyboard, touch, and platform option-picker behavior remain available.

Use Select for enum values and longer option sets. Use Tab Switcher when two or three visible modes benefit from immediate comparison, and Radio Button when every option and its description must remain visible.

Labels are visible by default. `visuallyHideLabel` keeps the accessible label when a dense inspector already provides equivalent visual context. Errors connect through `aria-describedby` and `aria-invalid`.

At phone widths, every size uses a minimum 48px field and 16px control text.
