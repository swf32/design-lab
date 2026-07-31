# Application Frame

Outermost visual surface for Design Lab. It owns the viewport background, stable navigation width,
workspace track, mobile scrim, focus treatment, and resize transition. The application supplies the
navigation/workspace props and remains responsible for routing, data, active state, and optional
overlays. The frame directly renders `NavigationRegion` and `WorkspaceSurface`, keeping its fixed
production composition visible in the automatic Component graph.

Change `shell.application.background` to restyle the real application and this Component together.
Do not use this Component inside product Pages or reviewed design-system content.
