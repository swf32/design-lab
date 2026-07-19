# Component Card

Borderless catalog entry that uses the authored preview as its full visual surface and overlays the component name on a bottom gradient.

The card is a single interactive target with a 12px radius on every corner. The card itself has no visual hover treatment: it does not lift, add a border or shadow, or change the surface fill. Keyboard focus keeps an explicit focus outline. Selection uses the same stable geometry with an accented title.

Set `previewAnimated` only when the component manifest declares `previewMotion`. The card then exposes the shared hover/focus trigger to the authored preview; it does not invent motion or animate generic fallbacks.

`entry` and `meta` remain accepted for API compatibility but are not rendered. Source filename and variant count belong in details and filtering surfaces, not in the visual card footer.
