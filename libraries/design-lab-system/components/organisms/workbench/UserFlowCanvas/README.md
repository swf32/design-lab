# User Flow Canvas

Production Canvas for directed Wireframe and Page state graphs. Nodes remain native buttons, expose selected state through `aria-pressed`, and do not require drag interaction. Edges use visible arrowheads and action labels so causality is not encoded through color alone.

Dragging empty Canvas space pans the graph. Zoom out, Reset, and Zoom in remain visible keyboard-accessible alternatives. Consumers own node content and the relationship between selection and opening a rendered state.

Use authored stable coordinates from the entity manifest. The component does not infer product transitions or persist graph data.
