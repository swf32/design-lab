# Canvas Background Control

Controls the shared Workbench background preference. One change updates the Playground and every Story Canvas, and persists when another component is opened.

`Background modes` is an interactive state story. `Solid color picker` is a behavior story that verifies draft HEX input, presets, and committed color changes.

The mode row composes the production `TabSwitcher`; this component owns only Canvas-specific labels, samples, persistence events, and the solid color picker.
