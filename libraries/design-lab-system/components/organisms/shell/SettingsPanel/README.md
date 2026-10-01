# Settings Panel

`SettingsPanel` provides the shared surface, eyebrow, heading, guidance, and optional action for a Design Lab settings task. The caller owns copy, data loading, and all controls inside `children`.

Use it for integration, System, Skin, and agent settings so a replacement System can restyle those surfaces from one component. `prominent` renders the leading overview with an `h2`; regular tasks use `h3`. `className` is available for page layout only; keep visual properties in this component's styles. The section labels itself with its generated heading id.
