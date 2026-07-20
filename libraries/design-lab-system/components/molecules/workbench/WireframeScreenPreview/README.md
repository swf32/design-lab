# Wireframe Screen Preview

Scales the actual adjacent Wireframe renderer from a stable virtual viewport into a catalog or user-flow surface. The default is desktop 1440 × 810; callers may provide a portrait viewport such as 390 × 844 for a real mobile composition. The virtual viewport is an inline-size container, so Wireframe container queries resolve against the represented device instead of the outer browser window. The rendered page is inert and hidden from the accessibility tree, so its controls cannot compete with the card or graph actions.

Use the same renderer, layout, and saved state that the fullscreen route uses. Do not provide a separately authored thumbnail.
