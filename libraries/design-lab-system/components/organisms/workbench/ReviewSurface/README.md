# Review Surface

Fullscreen presentation for the real Page and Wireframe review routes. The application owns
renderer selection, flow data, state, controls, and navigation. This Component owns the visual
stage, missing-state presentation, hint and dev-control layout for both routes. `kind` chooses
the existing Page or Wireframe class contract; it does not change the rendered product screen.

Keep the corresponding review route inside this surface so edits to an installed project-owned
System change the live review UI. The preview below is illustrative; Stories use the real surface.
