import { MoreHorizontalOutline, SearchOutline, XOutline } from '@klyp/icons'
import type { BadgeIntent } from '@klyp/ui/Badge'
import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@klyp/ui/Command'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@klyp/ui/Dialog'
import { Spinner } from '@klyp/ui/Spinner'
import { defaultFilter, useCommandState } from 'cmdk'
import {
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  type SVGProps,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { Button as RACButton } from 'react-aria-components'
import { BadgeToggle } from '../BadgeToggle/BadgeToggle'
import { Dropdown } from '../Dropdown'
import { Kbd } from '../Kbd/Kbd'
import './CommandMenu.scss'

// =====================================================================
// CommandMenu — Klyp brand molecule (⌘K palette over @klyp/ui Command)
// =====================================================================
//
// Data-driven wrapper over the @klyp/ui Command primitives (cmdk) in two
// registers:
//   variant="palette" — the full command palette: leading item icons,
//     optional category chips (BadgeToggle) under the input, <Kbd>
//     shortcuts right-aligned on items, hint footer (↑↓ / ↵ / esc).
//   variant="search"  — the minimal search look (conversation search):
//     SearchOutline in the input, no icons / categories / footer, rows
//     rest muted and lift when selected, trailing hint text (e.g.
//     relative time) in tabular-nums, optional per-row kebab actions
//     (rename / delete — the ConversationRow pattern).
//
// Category filtering renders only the active category's groups — cmdk
// scores mounted items only, so text search stays on cmdk's built-in
// filter. Item values embed the id for uniqueness ("id:::label"), but a
// custom `filter` strips the id before scoring so machine ids (e.g.
// Convex ids in conversation search) never produce ghost matches.
// Result-state changes (loading / no results) are mirrored into an
// sr-only live region — cmdk's own Empty/Loading are silent for AT.
// Shortcuts adapt to the platform (⌘ on Apple, Ctrl elsewhere).
// The query is controllable (search/onSearchChange) or internal.
// All copy has EN defaults overridable via `labels` (brand-agnostic tier).

export type CommandMenuVariant = 'palette' | 'search'

// Apple keyboards get ⌘; everything else swaps cmd → ctrl (module-level:
// the platform cannot change mid-session).
const IS_APPLE_PLATFORM = (() => {
  if (typeof navigator === 'undefined') return true
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const platform = nav.userAgentData?.platform ?? nav.platform ?? ''
  return /mac|iphone|ipad|ipod/i.test(platform)
})()

function toPlatformCombo(combo: string): string {
  return IS_APPLE_PLATFORM ? combo : combo.replace(/\bcmd\b/gi, 'ctrl')
}

export interface CommandMenuItemAction {
  id: string
  label: string
  icon?: ReactNode
  /** Paints the row red (e.g. Delete). */
  danger?: boolean
  /** Draws a separator ABOVE this action. */
  separator?: boolean
}

export interface CommandMenuItem {
  id: string
  label: string
  /** Leading glyph — rendered by the palette variant only. */
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  /** Keyboard combo in Kbd syntax (e.g. "cmd+n"), right-aligned. */
  shortcut?: string
  /** Trailing muted meta text (e.g. relative time). Shortcut wins if both set. */
  hint?: string
  /**
   * Hover kebab (⋯) actions — rename / delete etc. Fired through the
   * root `onItemAction`. On pointer devices the kebab swaps in for the
   * hint on hover/selection (the ConversationRow recipe).
   */
  actions?: CommandMenuItemAction[]
  /** Extra aliases fed to cmdk's scoring (synonyms, not categories). */
  keywords?: string[]
  disabled?: boolean
}

export interface CommandMenuGroup {
  id: string
  heading?: string
  /** Category this group belongs to. Groups without one always render. */
  category?: string
  items: CommandMenuItem[]
}

export interface CommandMenuCategory {
  id: string
  label: string
  /**
   * Badge intent for the chip dot (default 'gray'). Color-code kinds when
   * the palette mixes different domains — same idea as the Library kind
   * filters.
   */
  intent?: BadgeIntent
}

export interface CommandMenuLabels {
  empty: string
  loading: string
  all: string
  navigate: string
  /** sr-only key names behind the glyph-only ↑↓ / ↵ kbd hints. */
  navigateKeys: string
  select: string
  selectKeys: string
  close: string
  clearSearch: string
  /** Accessible name for the close (×) button next to the input. */
  closeMenu: string
  categories: string
  placeholderPalette: string
  placeholderSearch: string
  /** Accessible name for a row's kebab trigger. */
  actionsFor: (itemLabel: string) => string
}

export const COMMAND_MENU_DEFAULT_LABELS: CommandMenuLabels = {
  empty: 'No results found.',
  loading: 'Searching…',
  all: 'All',
  navigate: 'navigate',
  navigateKeys: 'Up and down arrow keys',
  select: 'select',
  selectKeys: 'Enter',
  close: 'close',
  clearSearch: 'Clear search',
  closeMenu: 'Close menu',
  categories: 'Filter by category',
  placeholderPalette: 'Type a command…',
  placeholderSearch: 'Search…',
  actionsFor: (itemLabel) => `Actions for ${itemLabel}`,
}

/** Reserved category value for the auto-prepended "All" chip. */
const ALL_CATEGORY = 'all'

/** Separates the stable item id from the human label inside cmdk values. */
const VALUE_SEPARATOR = ':::'

// Score only the label part (+ keywords) — the id prefix keeps values
// unique but must not participate in matching.
function commandMenuFilter(value: string, search: string, keywords?: string[]): number {
  const sep = value.indexOf(VALUE_SEPARATOR)
  const label = sep === -1 ? value : value.slice(sep + VALUE_SEPARATOR.length)
  return defaultFilter(label, search, keywords)
}

// Kbd combo syntax → aria-keyshortcuts syntax ("cmd+n" → "Meta+N").
const ARIA_KEYS: Record<string, string> = {
  cmd: 'Meta',
  ctrl: 'Control',
  alt: 'Alt',
  opt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  return: 'Enter',
  esc: 'Escape',
  tab: 'Tab',
  space: 'Space',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  backspace: 'Backspace',
  delete: 'Delete',
}

function comboToAriaKeyshortcuts(combo: string): string {
  return combo
    .toLowerCase()
    .split(/\s*\+\s*/)
    .map((key) => ARIA_KEYS[key] ?? (key.length === 1 ? key.toUpperCase() : key))
    .join('+')
}

// sr-only live region mirroring the result state — cmdk's Empty is
// role="presentation" and Loading's children are aria-hidden, so without
// this a screen-reader user typing to zero results hears nothing
// (WCAG 4.1.3). Debounced so per-keystroke changes don't spam the queue.
// Must render under the <Command> provider, as a SIBLING of CommandList
// (a non-option node inside the listbox would break its content model).
function CommandMenuStatus({
  isLoading,
  labels,
}: {
  isLoading: boolean
  labels: CommandMenuLabels
}) {
  const count = useCommandState((state) => state.filtered.count)
  const [message, setMessage] = useState('')
  const next = isLoading ? labels.loading : count === 0 ? labels.empty : ''
  useEffect(() => {
    const timer = window.setTimeout(() => setMessage(next), 300)
    return () => window.clearTimeout(timer)
  }, [next])
  return (
    <div className="klyp-Command__sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  )
}

export interface CommandMenuProps {
  groups: CommandMenuGroup[]
  variant?: CommandMenuVariant
  /**
   * 'internal' (default) — cmdk scores the mounted items against the query.
   * 'external' — the consumer already filtered `groups` (e.g. server-side
   * content search where a hit's TITLE may not contain the query): cmdk's
   * own filter is off and rows render exactly as given. Empty/loading
   * states still derive from the rendered item count.
   */
  filterMode?: 'internal' | 'external'
  /** Category chips rendered under the input (palette variant only). */
  categories?: CommandMenuCategory[]
  /** Overrides labels.placeholderPalette / labels.placeholderSearch. */
  placeholder?: string
  /** Controlled query. Omit for internal state. */
  search?: string
  onSearchChange?: (search: string) => void
  /** Fires with the item id on keyboard ↵ or pointer select. */
  onSelect?: (itemId: string) => void
  /** Fires when a row-kebab action is chosen (item.actions). */
  onItemAction?: (itemId: string, actionId: string) => void
  /**
   * When set, a close (×) button renders in the top row next to the input
   * (the search field doesn't stretch full width). CommandMenuDialog wires
   * this automatically — the visible dismiss affordance for touch, where
   * Esc doesn't exist and backdrop-tap is undiscoverable.
   */
  onClose?: () => void
  /** Shows a loading row instead of results while async work is in flight. */
  isLoading?: boolean
  /** Hint footer (↑↓ / ↵ / esc). Default: on for palette, off for search. */
  showFooter?: boolean
  /** Clear (×) button when the query is non-empty. Default true. */
  showClear?: boolean
  /** Rich empty slot override (e.g. <EmptyState size="compact">). */
  emptyState?: ReactNode
  /** EN defaults; override per brand at the callsite. */
  labels?: Partial<CommandMenuLabels>
  /** Accessible label for the cmdk combobox. */
  ariaLabel?: string
  autoFocus?: boolean
  className?: string
}

export function CommandMenu({
  groups,
  variant = 'palette',
  filterMode = 'internal',
  categories,
  placeholder,
  search,
  onSearchChange,
  onSelect,
  onItemAction,
  onClose,
  isLoading = false,
  showFooter,
  showClear = true,
  emptyState,
  labels: labelsProp,
  ariaLabel = 'Command menu',
  autoFocus,
  className,
}: CommandMenuProps) {
  const labels = { ...COMMAND_MENU_DEFAULT_LABELS, ...labelsProp }
  const [internalSearch, setInternalSearch] = useState('')
  const [category, setCategory] = useState(ALL_CATEGORY)
  const inputRef = useRef<HTMLInputElement>(null)

  const query = search ?? internalSearch
  const setQuery = (next: string) => {
    if (search === undefined) setInternalSearch(next)
    onSearchChange?.(next)
  }

  const isPalette = variant === 'palette'
  const withCategories = isPalette && !!categories && categories.length > 0
  const withFooter = showFooter ?? isPalette
  // Validate the raw chip state against the CURRENT categories prop — if the
  // selected id disappears from a dynamic list, fall back to "All" instead of
  // filtering by a phantom category with no chip visibly selected.
  const activeCategory =
    withCategories && categories.some((cat) => cat.id === category) ? category : ALL_CATEGORY
  const visibleGroups =
    withCategories && activeCategory !== ALL_CATEGORY
      ? groups.filter((group) => !group.category || group.category === activeCategory)
      : groups

  return (
    <Command
      className={
        typeof className === 'string' ? `klyp-CommandMenu ${className}` : 'klyp-CommandMenu'
      }
      data-variant={variant}
      label={ariaLabel}
      shouldFilter={filterMode !== 'external'}
      filter={commandMenuFilter}
      loop
    >
      <div className="klyp-CommandMenu__topRow">
        <CommandInput
          ref={inputRef}
          icon={isPalette ? undefined : SearchOutline}
          placeholder={
            placeholder ?? (isPalette ? labels.placeholderPalette : labels.placeholderSearch)
          }
          value={query}
          onValueChange={setQuery}
          autoFocus={autoFocus}
          trailing={
            showClear && query.length > 0 ? (
              <RACButton
                aria-label={labels.clearSearch}
                className="klyp-CommandMenu__clear"
                onPress={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
              >
                <XOutline aria-hidden />
              </RACButton>
            ) : undefined
          }
        />
        {onClose ? (
          <RACButton
            aria-label={labels.closeMenu}
            className="klyp-CommandMenu__close"
            onPress={onClose}
          >
            <XOutline aria-hidden />
          </RACButton>
        ) : null}
      </div>
      {withCategories ? (
        <div
          className="klyp-CommandMenu__categories"
          onKeyDown={(event) => {
            // cmdk's root listener moves the LIST highlight on ↑/↓ even while
            // focus sits on a chip — but Enter would then activate the CHIP.
            // Keep list navigation exclusively with the input.
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') event.stopPropagation()
          }}
        >
          <BadgeToggle
            value={activeCategory}
            onValueChange={setCategory}
            ariaLabel={labels.categories}
            size="sm"
          >
            <BadgeToggle.Item value={ALL_CATEGORY} intent="gray">
              {labels.all}
            </BadgeToggle.Item>
            {categories.map((cat) => (
              <BadgeToggle.Item key={cat.id} value={cat.id} intent={cat.intent ?? 'gray'}>
                {cat.label}
              </BadgeToggle.Item>
            ))}
          </BadgeToggle>
        </div>
      ) : null}
      <CommandList>
        {isLoading ? (
          <CommandLoading label={labels.loading}>
            <Spinner size="sm" />
            <span>{labels.loading}</span>
          </CommandLoading>
        ) : (
          <>
            <CommandEmpty>{emptyState ?? labels.empty}</CommandEmpty>
            {visibleGroups.map((group) => (
              <CommandGroup
                key={group.id}
                heading={group.heading}
                // cmdk requires a unique group value when there is no heading
                value={group.heading ? undefined : group.id}
              >
                {group.items.map((item) => {
                  const hasActions = !!item.actions?.length
                  const shortcut = item.shortcut ? toPlatformCombo(item.shortcut) : undefined
                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.id}${VALUE_SEPARATOR}${item.label}`}
                      keywords={item.keywords}
                      disabled={item.disabled}
                      onSelect={() => onSelect?.(item.id)}
                      aria-keyshortcuts={shortcut ? comboToAriaKeyshortcuts(shortcut) : undefined}
                    >
                      {isPalette && item.icon ? <item.icon aria-hidden /> : null}
                      <span className="klyp-CommandMenu__itemLabel">{item.label}</span>
                      {shortcut ? (
                        // aria-hidden: the combo is exposed via aria-keyshortcuts
                        // above — glyphs in the option name are SR noise.
                        <span className="klyp-CommandMenu__itemMeta" aria-hidden>
                          <Kbd combo={shortcut} size="md" />
                        </span>
                      ) : item.hint || hasActions ? (
                        <span className="klyp-CommandMenu__itemMeta">
                          {item.hint ? (
                            <span
                              className="klyp-CommandMenu__itemHint"
                              data-swap={hasActions ? 'true' : undefined}
                            >
                              {item.hint}
                            </span>
                          ) : null}
                          {hasActions && item.actions ? (
                            // Event barrier: the kebab lives inside the cmdk
                            // option — pointer/keyboard activity on it must not
                            // select the row or move the list highlight.
                            <span
                              className="klyp-CommandMenu__itemActions"
                              onPointerDown={(event) => event.stopPropagation()}
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                              }}
                              onKeyDown={(event) => event.stopPropagation()}
                            >
                              <Dropdown
                                aria-label={labels.actionsFor(item.label)}
                                trigger={<MoreHorizontalOutline width={16} height={16} />}
                                triggerProps={{
                                  className: 'klyp-CommandMenu__kebab',
                                  'aria-label': labels.actionsFor(item.label),
                                }}
                                side="bottom"
                                align="end"
                                options={item.actions.map((action) => ({
                                  id: action.id,
                                  label: action.label,
                                  icon: action.icon,
                                  variant: action.danger ? ('danger' as const) : undefined,
                                  separator: action.separator,
                                }))}
                                onAction={(actionId) => onItemAction?.(item.id, String(actionId))}
                              />
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </>
        )}
      </CommandList>
      <CommandMenuStatus isLoading={isLoading} labels={labels} />
      {withFooter ? (
        <CommandFooter>
          <span className="klyp-CommandMenu__hint">
            <Kbd combo="up" aria-hidden />
            <Kbd combo="down" aria-hidden />
            <span className="klyp-Command__sr-only">{labels.navigateKeys}</span>
            <span>{labels.navigate}</span>
          </span>
          <span className="klyp-CommandMenu__hint">
            <Kbd combo="enter" aria-hidden />
            <span className="klyp-Command__sr-only">{labels.selectKeys}</span>
            <span>{labels.select}</span>
          </span>
          <span className="klyp-CommandMenu__hint">
            <Kbd combo="esc" />
            <span>{labels.close}</span>
          </span>
        </CommandFooter>
      ) : null}
    </Command>
  )
}

// === CommandMenuDialog ===============================================
// Modal register — same scaffolding as ui CommandDialog (sr-only header
// INSIDE DialogContent labels the dialog via RAC's Heading slot="title";
// the description is wired by id to aria-describedby). CommandMenu brings
// its own cmdk root, so ui CommandDialog (which mounts its own <Command>)
// cannot be reused here — it would double-mount the Command context.
export interface CommandMenuDialogProps extends CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** sr-only accessible title for the dialog. */
  title?: string
  /** sr-only accessible description for the dialog. */
  description?: string
  backdrop?: ComponentProps<typeof DialogContent>['backdrop']
}

export function CommandMenuDialog({
  open,
  onOpenChange,
  title = 'Command menu',
  description = 'Search for a command to run…',
  backdrop,
  autoFocus = true,
  onClose,
  ...menuProps
}: CommandMenuDialogProps) {
  const descriptionId = useId()
  // Standalone controlled DialogContent (isOpen/onOpenChange), NOT a <Dialog>
  // wrapper: <Dialog> is a RAC DialogTrigger, and with no pressable trigger
  // child it logged "A PressResponder was rendered without a pressable
  // child" on every mount. Same fix Sheet got (Sheet.tsx:32-39); standalone
  // mode is documented in Dialog.tsx:132-138.
  return (
    <DialogContent
      className="klyp-Command__dialog klyp-CommandMenu__dialog"
      showCloseButton={false}
      aria-describedby={descriptionId}
      isOpen={open}
      onOpenChange={onOpenChange}
      {...(backdrop ? { backdrop } : {})}
    >
      <DialogHeader className="klyp-Command__sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription id={descriptionId}>{description}</DialogDescription>
      </DialogHeader>
      {/* The (×) next to the input is the dialog's visible dismiss — wired
          by default; a consumer-supplied onClose takes precedence. The
          mobile sheet additionally shows a grabber bar (CSS ::before). */}
      <CommandMenu
        autoFocus={autoFocus}
        onClose={onClose ?? (() => onOpenChange(false))}
        {...menuProps}
      />
    </DialogContent>
  )
}

export default CommandMenu
