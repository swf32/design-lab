# Workbench Action

Compact floating utility for fullscreen review surfaces. Settings, Inspector, and Dev mode share
one 44px touch target, one compact six-pixel radius, and one translucent surface instead of
maintaining separate button silhouettes.

The `inspect` tone uses the stable purple Component-inspection identity. The `dev` tone uses the
warning orange identity to distinguish review tooling from product actions. Both use dashed borders
and reinforce color with an icon and visible label.

Positioning belongs to the consuming shell. Workbench Action owns only the interactive shape,
semantic tone, active state, focus treatment, and named icon/label slots.
