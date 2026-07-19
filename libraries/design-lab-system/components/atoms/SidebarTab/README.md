# Sidebar Tab

Module navigation item used by `AppSidebar`. Its 20px icon remains visible at both widths; the label is disclosed when the application sidebar expands while the tab retains its fixed height. Active tabs retain full opacity and use the hover surface when pointed at.

## Usage

Pass a code-native icon, a concise localized label, and whether the destination is current. `active` maps to `aria-current="page"`. Use `expanded` only when the parent controls disclosure explicitly, including deterministic Workbench stories.

## Stories

`Selection states` is a state story. `Inside application sidebar` is a context story: it verifies the real tab against the parent's clipping, width, hover, and focus behavior and is not a component variant.
