# Workbench Layout

`WorkbenchLayout` owns the scroll surface used by Component and Page detail workbenches. Place a
`WorkbenchLayoutHeader` first, then the workbench's real Canvas or reference content, followed by
one `WorkbenchLayoutRail` for stories, props, documentation, and files. Use `WorkbenchSection` for
each labelled content group, `WorkbenchMarkdown` for rendered documentation, and
`WorkbenchPropsTable` for the Component props grid. The caller owns route state, data, controls,
and the real renderer. All these presentation regions come from the active System.

The rail preserves the existing desktop and narrow viewport spacing. A replacement System may
restyle these regions without changing application navigation or runtime behavior.
