# Canvas Background Control

Controls two independent Workbench preferences: the Canvas background and the active theme of the
inspected design system. One change updates the Playground and every Story Canvas, and persists when
another component is opened.

`Compact mode disclosure` is an interactive behavior story. At rest the control shows only the selected background in the same fixed position for every mode. Pointer hover or keyboard focus reveals every mode with a short transition; on touch, the first tap reveals the options and a tap outside collapses them. Reduced-motion preferences reveal the options without animation. `Solid color picker` verifies saturation, brightness, hue, draft HEX input, presets, and committed color changes.

When the active source exposes more than one token theme, the same disclosure adds a separately
labelled Theme row. Theme names are not fixed to light/dark: `blue`, `red`, `white`, or any other
source-authored names are rendered from the supplied token modes. The interface theme of Design Lab
never selects or renames them.

The Background row composes the small production `TabSwitcher` and `ColorPicker`; the Theme row
composes another horizontally scrollable `TabSwitcher`. This component owns only Canvas-specific
labels, circular samples, compact disclosure, mode coordination, and persistence events.

Collapsed and expanded geometry is viewport-invariant. Touch changes the disclosure sequence, not the size of the swatches or option buttons.
