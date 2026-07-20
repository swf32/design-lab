# SidebarShell — changelog

## 2026-07-02 16:40 — consolidated into the sidebar KIT (one module, one catalog page)

- What: `SidebarToggle` and `SidebarGroupHeader` moved INTO this module
  (tsx + scss + stories; their standalone folders and catalog entries are
  deleted — public class names and `@klyp/brand` barrel imports unchanged).
  `SidebarRowAction` is deleted outright — replaced by the ui
  `ToolButton variant="bare"` (a new variant added to the existing atom:
  no wash at any state, glyph-only brighten, built-in tooltip). Story
  frames' outer radius corrected `--r-panel` (20) → `--r-section` (16) per
  the concentric-radii rule (inner rows --r-chip 10 + 8px gutter); a new
  "Kit pieces" story covers the toggle mirror states + group-header
  disclosure in isolation.
- Why: Val — «не пили тонну лишних компонентов»: sidebar-only pieces don't
  deserve separate catalog pages (they'd never be reused standalone), the
  24px icon action already existed as ToolButton (extend states, don't
  duplicate), and the story frames' outer radius visibly over-rounded
  against the row corners.

## 2026-07-02 15:27 — initial extraction from the AppSidebar frame

- What: New compound brand molecule — the sidebar chassis. Root `<aside>`
  (panel surface, 8px gutter, right hairline seam, `data-expanded` collapse
  driver) + `SidebarShellHeader` / `SidebarShellNav`(+`NavItem`, with
  `sectionBreak`) / `SidebarShellFooter` slots. Owns NO width — the host
  layout animates the track (AppLayout's `--app-sidebar-width` in the app).
  Stories compose the FULL production-like sidebar (nav rows + Recents on
  demo `ConversationRow`s + profile footer, interactive collapse/expand) and
  the 216px mobile drawer panel.
- Why: Val — «разбить сайдбар по компонентам» + the catalog needed a page
  showing the whole sidebar (with chat history, collapse/expand) and the
  mobile view, not just the lone nav button.
