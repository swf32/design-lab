# Navigation Region

Composite shell boundary for `AppSidebar` and `DirectoryPanel`. It owns their shared width budget,
disclosure interpolation, clipping, responsive drawer, and mobile header. It renders both production
Components directly from `sidebarProps` and `directoryProps`, so the discovered production graph
reports `AppSidebar` and `DirectoryPanel` under `uses`. The application keeps ownership of the active
module, project data, and navigation callbacks.

Use the shell navigation tokens to customize this relationship. Do not reproduce the shared grid in
application SCSS.
