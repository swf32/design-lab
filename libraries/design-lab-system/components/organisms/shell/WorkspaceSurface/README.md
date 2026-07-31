# Workspace Surface

Persistent application content surface that directly renders the shared `WorkspaceHeader` and
`WorkspaceStage`. It owns viewport height, clipping, background, and column flow. The application
supplies header props and arbitrary active module content, while the automatic Component graph keeps
the fixed shell composition visible.

Change `shell.workspace.background` to customize the surface without editing application styles.
