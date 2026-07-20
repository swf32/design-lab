# Wireframe Dev Panel

Floating production shell for all Wireframe review controls, including back navigation, Screen/User flow mode, share link, state, and layout. Desktop anchors its deliberately quiet translucent trigger at the viewport start edge and opens the panel beside it. Mobile turns the trigger into a safe-area bottom action.

The trigger is the shared `WorkbenchAction` atom in its orange dashed `dev` tone. It keeps the same
compact six-pixel radius and 44px target as Settings and Inspector while remaining visually distinct
from product actions.

Header, content, and optional footer are named inspection slots. Escape, outside pointer dismissal, explicit Done, and focus restoration provide equivalent close paths.

The component owns shell behavior only. Wireframe-specific state presets and typed controls are passed through slots.
