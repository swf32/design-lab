# Wireframe Dev Panel

Floating production shell for Wireframe state and layout controls. Desktop anchors the trigger at the viewport start edge and opens the panel beside it. Mobile turns the trigger into a bottom action and expands the panel within safe-area bounds.

Header, content, and optional footer are named inspection slots. Escape, outside pointer dismissal, explicit Done, and focus restoration provide equivalent close paths.

The component owns shell behavior only. Wireframe-specific state presets and typed controls are passed through slots.
