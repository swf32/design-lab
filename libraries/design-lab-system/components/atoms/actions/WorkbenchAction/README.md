# Workbench Action

Compact floating utility for fullscreen review surfaces. Settings, Inspector, and Dev mode share
one visually 24px-high pill with a transparent glass surface and backdrop blur instead of
maintaining separate button silhouettes. A transparent pseudo-element expands the interactive area
to 44px without making the visible control heavy.

The `inspect` tone uses the stable purple Component-inspection identity. The `dev` tone uses the
stable developer orange identity to distinguish review tooling from product actions. Both use
dashed borders and reinforce color with an icon and visible label. The glass, neutral, purple, and
orange identities do not switch between interface themes.

Positioning belongs to the consuming shell. Workbench Action owns only the interactive shape,
semantic tone, active state, focus treatment, and named icon/label slots.
