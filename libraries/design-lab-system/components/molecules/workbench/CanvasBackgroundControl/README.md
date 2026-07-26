# Canvas Background Control

Controls the shared Workbench background preference. One change updates the Playground and every Story Canvas, and persists when another component is opened.

`Compact mode disclosure` is an interactive behavior story. At rest the control shows only the selected background in the same fixed position for every mode. Pointer hover or keyboard focus reveals every mode with a short transition; on touch, the first tap reveals the options and a tap outside collapses them. Reduced-motion preferences reveal the options without animation. `Solid color picker` verifies saturation, brightness, hue, draft HEX input, presets, and committed color changes.

The mode row composes the small production `TabSwitcher` and `ColorPicker`; this component owns only Canvas-specific labels, circular samples, compact disclosure, mode coordination, and persistence events.

Collapsed and expanded geometry is viewport-invariant. Touch changes the disclosure sequence, not the size of the swatches or option buttons.
