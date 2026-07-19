# User Flow Canvas

Production Canvas for directed Wireframe and Page state graphs. Every node shows the real screen through an inert 16:9 `WireframeScreenPreview`, keeps its state name and description, and exposes an explicit keyboard-accessible Preview state action. Edges use visible arrowheads and action labels so causality is not encoded through color alone.

Dragging empty Canvas space pans the graph and its grid as one world. Zoom out, Reset, and Zoom in remain visible keyboard-accessible alternatives. Consumers own node screen content and the relationship between selection and opening a rendered state.

Use authored stable coordinates from the entity manifest. The component does not infer product transitions or persist graph data.
