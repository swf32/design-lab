import './LibraryPicker.scss'

import {
  AudioOutline,
  FilterOutline,
  FrameOutline,
  HeartOutline,
  ImageOutline,
  Messages2Outline,
  SparklesOutline,
  UploadOutline,
  VideoOutline,
  XOutline,
} from '@klyp/icons/outline'
import { Button } from '@klyp/ui/Button'
import { DialogClose, DialogContent, DialogHeader, DialogTitle } from '@klyp/ui/Dialog'
import { SearchField } from '@klyp/ui/SearchField'
import { Spinner } from '@klyp/ui/Spinner'
import {
  type ComponentType,
  type ReactNode,
  type SVGProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { type Accept, useDropzone } from 'react-dropzone'
import { Drawer } from 'vaul'
import { useBrand } from '../_brand-context'
import { AdvancedFilterPopover } from '../AdvancedFilterPopover'
import { Dropdown, type DropdownOption } from '../Dropdown'
import { MediaGrid, type MediaGridItem, useMediaGridSelection } from '../MediaGrid'
import { ModalToolbar } from '../ModalToolbar'
import { TabSwitcher } from '../TabSwitcher'

// =====================================================================
// LibraryPicker — Klyp brand molecule
// =====================================================================
//
// "Pick from library or upload" modal. Composes:
//   - DESKTOP: a Dialog-primitives shell with a custom banded header that puts
//     the toolbar inline with the title + close — [ title ][ toolbar ][ ✕ ].
//     MOBILE: a vaul bottom-sheet (toolbar stays at the top of the body).
//   - Library-page-parity filter toolbar:
//       iconOnly <TabSwitcher> sections + Type + Source as MULTISELECT
//       <Dropdown>s (menu-row options; empty selection = "all"). Desktop
//       renders each axis as its own labelled <AdvancedFilterPopover> pill with
//       a count badge; mobile collapses both axes into ONE filter button.
//       Plus a right-pinned <SearchField>.
//   - A horizontal upload BAND under the toolbar (was a right rail): it
//     collapses to a 40px strip on grid scroll so it stays visible, and the
//     WHOLE modal becomes the drop target on drag-over (react-dropzone root +
//     full-cover overlay). The band is the resting affordance + Upload button.
//   - <MediaGrid> masonry + selection (multi by default; single when maxSelect=1
//     — used by the composer's Start/End video-frame slot pickers)
//   - Empty state = a FULL-SCREEN dropzone (no grid, no scroll) when the
//     resolved library has no items.
//
// All data flows through props — the component does NOT talk to a
// backend. Caller wires Convex / fetch / whatever, refetching when the
// section / media-type / source axes change. Only the free-text search
// filters items locally; section / type / source are callback-only
// (the host owns the actual filtering). See
// `apps/web/src/features/chat/components/library-picker-modal.tsx`
// for the Convex-backed wrapper used in production.

const COPY = {
  klyp: {
    title: 'Library',
    searchAria: 'Search library',
    searchPlaceholder: 'Search',
    sectionAria: 'Library section',
    filterAll: 'All',
    filterGenerated: 'Generated',
    filterUploaded: 'Uploaded',
    filterFavourites: 'Favourites',
    typeAria: 'Media type',
    typeRowLabel: 'Type',
    typeImage: 'Image',
    typeVideo: 'Video',
    typeAudio: 'Audio',
    filtersAria: 'Filters',
    sourceLabel: 'Source',
    sourceRowLabel: 'Source',
    sourceAria: 'Source',
    sourceSeries: 'Series',
    sourceChat: 'Chat',
    sourceCanvas: 'Canvas',
    dropzoneTitle: 'Drop an image or upload your own media',
    dropzoneTitleCompact: 'Drop or upload an image',
    uploadCta: 'Upload an image',
    dropOverlayTitle: 'Drop to upload',
    dropRejectTitle: "That file type isn't supported",
    closeAria: 'Close',
    emptyTitle: 'Nothing here yet',
    emptyHint: 'Drop a file anywhere or upload from your computer.',
    selectedZero: 'Nothing selected',
    selectedOne: '1 selected',
    selectedMany: (n: number) => `${n} selected`,
    use: (n: number) => (n === 0 ? 'Use selection' : `Use ${n}`),
    loading: 'Loading library…',
  },
  unreals: {
    title: 'Библиотека',
    searchAria: 'Поиск по библиотеке',
    searchPlaceholder: 'Поиск',
    sectionAria: 'Раздел библиотеки',
    filterAll: 'Всё',
    filterGenerated: 'Генерации',
    filterUploaded: 'Загруженные',
    filterFavourites: 'Избранное',
    typeAria: 'Тип медиа',
    typeRowLabel: 'Тип',
    typeImage: 'Картинка',
    typeVideo: 'Видео',
    typeAudio: 'Аудио',
    filtersAria: 'Фильтры',
    sourceLabel: 'Источник',
    sourceRowLabel: 'Источник',
    sourceAria: 'Источник',
    sourceSeries: 'Сериалы',
    sourceChat: 'Чат',
    sourceCanvas: 'Canvas',
    dropzoneTitle: 'Перетащи картинку или загрузи свой файл',
    dropzoneTitleCompact: 'Перетащи или загрузи картинку',
    uploadCta: 'Загрузить картинку',
    dropOverlayTitle: 'Отпусти, чтобы загрузить',
    dropRejectTitle: 'Этот тип файла не поддерживается',
    closeAria: 'Закрыть',
    emptyTitle: 'Пока пусто',
    emptyHint: 'Перетащи файл в окно или загрузи с компьютера.',
    selectedZero: 'Ничего не выбрано',
    selectedOne: '1 выбрано',
    selectedMany: (n: number) => `Выбрано ${n}`,
    use: (n: number) => (n === 0 ? 'Использовать' : `Использовать (${n})`),
    loading: 'Загружаем библиотеку…',
  },
} as const

/** Resolved per-brand copy table. Both brand variants share one shape. */
type LibraryCopy = (typeof COPY)[keyof typeof COPY]

/** Library section — mirrors the `/library` shell taxonomy (minus Trash,
 *  which you never pick from). Drives the iconOnly `<TabSwitcher>`. */
export type LibraryPickerSection = 'all' | 'generated' | 'uploaded' | 'favourites'

/** Back-compat alias — the section axis used to be called `filter`. */
export type LibraryPickerFilter = LibraryPickerSection

/** Media-type axis — matches the `/library` Type filter. Multiselect: an
 *  empty array means "all types" (no filtering on this axis). */
export type LibraryPickerMediaType = 'image' | 'video' | 'audio'

/** Source axis — matches the `/library` advanced-filter Source filter.
 *  Multiselect: an empty array means "any source" (no filtering). */
export type LibraryPickerSource = 'series' | 'chat' | 'canvas'

/** Item shape — superset of `MediaGridItem` with optional `url` (full-size
 *  asset URL when the grid `src` is a thumbnail). Required `name` drives
 *  the local search filter. */
export type LibraryPickerItem = MediaGridItem & {
  /** Full-resolution URL — defaults to `src`. */
  url?: string
  /** Display name used by the local search filter. */
  name: string
}

/** Picked asset shape returned via `onPick`. */
export type LibraryPickerPick = {
  id: string
  url: string
  thumbnailUrl: string
  name: string
}

export type LibraryPickerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  // ── Data ─────────────────────────────────────────────────────────────
  items: LibraryPickerItem[]
  isLoading?: boolean
  /** Section axis is re-resolving while the previous items stay on screen
   *  (stale-while-revalidate). Dims the grid subtly instead of blanking to the
   *  full-body spinner — set by the Convex host on a section switch. */
  isRefetching?: boolean

  // ── Section filter (controlled or uncontrolled) ──────────────────────
  /** Active library section. Callback-only axis: this component does NOT
   *  filter `items` by section — it only reports the selection via
   *  `onFilterChange`. The host owns the actual filtering (e.g. refetch).
   *  Contrast with `search`, which IS filtered locally. */
  filter?: LibraryPickerSection
  defaultFilter?: LibraryPickerSection
  /** Fires when the section axis changes. The host is responsible for
   *  filtering `items` accordingly — the picker does not filter by section. */
  onFilterChange?: (next: LibraryPickerSection) => void

  // ── Media-type filter (controlled or uncontrolled, MULTISELECT) ──────
  /** Active media-types (multiselect). Empty array = "all types" (no
   *  filtering on this axis). Callback-only axis: this component does NOT
   *  filter `items` by media type — it only reports the selection via
   *  `onMediaTypesChange`. The host owns the actual filtering. */
  mediaTypes?: LibraryPickerMediaType[]
  defaultMediaTypes?: LibraryPickerMediaType[]
  /** Fires when the media-type axis changes. The host is responsible for
   *  filtering `items` accordingly — the picker does not filter by type. */
  onMediaTypesChange?: (next: LibraryPickerMediaType[]) => void

  // ── Source filter (controlled or uncontrolled, MULTISELECT) ──────────
  /** Active sources (multiselect). Empty array = "any source" (no filtering
   *  on this axis). Callback-only axis: this component does NOT filter
   *  `items` by source — it only reports the selection via
   *  `onSourcesChange`. The host owns the actual filtering. */
  sources?: LibraryPickerSource[]
  defaultSources?: LibraryPickerSource[]
  /** Fires when the source axis changes. The host is responsible for
   *  filtering `items` accordingly — the picker does not filter by source. */
  onSourcesChange?: (next: LibraryPickerSource[]) => void

  // ── Search state (controlled or uncontrolled) ───────────────────────
  search?: string
  defaultSearch?: string
  onSearchChange?: (next: string) => void

  // ── Callbacks ────────────────────────────────────────────────────────
  onPick: (picks: LibraryPickerPick[]) => void
  onUploadFiles: (files: File[]) => void

  /** Override the rendered title. Defaults to "Library" (brand-aware). */
  title?: ReactNode

  /** Dropzone/file-picker `accept` map. Default `{ 'image/*': [] }`. Pass a
   *  wider map (e.g. `{ 'image/*': [], 'video/*': [] }`) to allow video
   *  uploads on surfaces that support them. */
  uploadAccept?: Accept

  /** MIME prefixes the defensive client-side drop filter keeps. Default
   *  `['image/']`. Must stay in sync with `uploadAccept` — a file passes when
   *  its `type` starts with ANY entry. */
  uploadMimePrefixes?: readonly string[]

  /** Max number of items selectable. `1` = single-select: clicking an item
   *  replaces the selection (no range/toggle) and the modal returns exactly
   *  one pick — used by the composer's Start/End video-frame slot pickers.
   *  Omit for unlimited multi-select (the default library-attach flow). */
  maxSelect?: number
}

const DEFAULT_UPLOAD_ACCEPT: Accept = { 'image/*': [] }
const DEFAULT_UPLOAD_MIME_PREFIXES: readonly string[] = ['image/']

// Section nav — mirrors the `/library` shell. "All" is intentionally
// icon-less: in the iconOnly TabSwitcher it renders as a text chip (the
// `data-icon-only` mode skips the label-clip for options without an icon).
// Built from the runtime-resolved `copy` table inside the component body.
function makeSections(copy: LibraryCopy): {
  value: LibraryPickerSection
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}[] {
  return [
    { value: 'all', label: copy.filterAll },
    { value: 'generated', label: copy.filterGenerated, icon: SparklesOutline },
    { value: 'uploaded', label: copy.filterUploaded, icon: UploadOutline },
    { value: 'favourites', label: copy.filterFavourites, icon: HeartOutline },
  ]
}

/**
 * Duo-tone document-upload glyph (design-lead-supplied). There is no Iconsax
 * outline equivalent and the `@klyp/icons` bulk pack is deprecated (renders
 * null), so this ships as a local inline glyph — same precedent as
 * `SwapGlyph` / `FrameRatioGlyph` in the composer. `currentColor` so it themes
 * (klyp dark / unreals light); the 50% opacity is applied on the WRAPPER, not
 * here, per the icon-opacity rule (the inner 0.4 layer is the icon's own
 * duo-tone, not a per-stroke alpha). Sized via the wrapper's box.
 */
function UploadDocGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        opacity="0.4"
        d="M20.5 10.19H17.61C15.24 10.19 13.31 8.26 13.31 5.89V3C13.31 2.45 12.86 2 12.31 2H8.07C4.99 2 2.5 4 2.5 7.57V16.43C2.5 20 4.99 22 8.07 22H15.93C19.01 22 21.5 20 21.5 16.43V11.19C21.5 10.64 21.05 10.19 20.5 10.19Z"
        fill="currentColor"
      />
      <path
        d="M15.8002 2.21048C15.3902 1.80048 14.6802 2.08048 14.6802 2.65048V6.14048C14.6802 7.60048 15.9202 8.81048 17.4302 8.81048C18.3802 8.82048 19.7002 8.82048 20.8302 8.82048C21.4002 8.82048 21.7002 8.15048 21.3002 7.75048C19.8602 6.30048 17.2802 3.69048 15.8002 2.21048Z"
        fill="currentColor"
      />
      <path
        d="M11.5299 12.47L9.52994 10.47C9.51994 10.46 9.50994 10.46 9.50994 10.45C9.44994 10.39 9.36994 10.34 9.28994 10.3C9.27994 10.3 9.27994 10.3 9.26994 10.3C9.18994 10.27 9.10994 10.26 9.02994 10.25C8.99994 10.25 8.97994 10.25 8.94994 10.25C8.88994 10.25 8.81994 10.27 8.75994 10.29C8.72994 10.3 8.70994 10.31 8.68994 10.32C8.60994 10.36 8.52994 10.4 8.46994 10.47L6.46994 12.47C6.17994 12.76 6.17994 13.24 6.46994 13.53C6.75994 13.82 7.23994 13.82 7.52994 13.53L8.24994 12.81V17C8.24994 17.41 8.58994 17.75 8.99994 17.75C9.40994 17.75 9.74994 17.41 9.74994 17V12.81L10.4699 13.53C10.6199 13.68 10.8099 13.75 10.9999 13.75C11.1899 13.75 11.3799 13.68 11.5299 13.53C11.8199 13.24 11.8199 12.76 11.5299 12.47Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Mobile-only vaul bottom-sheet shell. Single-detent (no snapPoints → opens
 * full, drag-down dismisses); the grid is the scroll region (it + the footer
 * carry `data-vaul-no-drag`). Drag-handle + a title row (Library + close ✕).
 * Surface palette mirrors MobilePanelSheet / the model-picker family. Desktop
 * uses a Dialog-primitives shell instead — never both at once (one focus-trap
 * each).
 */
function LibraryPickerSheet({
  open,
  onOpenChange,
  titleText,
  closeAria,
  onClose,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  titleText: ReactNode
  closeAria: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="klyp-LibraryPicker__sheetOverlay" />
        <Drawer.Content className="klyp-LibraryPicker__sheet" aria-describedby={undefined}>
          <Drawer.Handle className="klyp-LibraryPicker__sheetHandle" />
          <div className="klyp-LibraryPicker__sheetTitleRow">
            <Drawer.Title className="klyp-LibraryPicker__sheetTitle">{titleText}</Drawer.Title>
            <button
              type="button"
              className="klyp-LibraryPicker__sheetClose"
              onClick={onClose}
              aria-label={closeAria}
            >
              <XOutline width={18} height={18} aria-hidden="true" />
            </button>
          </div>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export function LibraryPicker({
  open,
  onOpenChange,
  items,
  isLoading = false,
  isRefetching = false,
  filter: filterProp,
  defaultFilter = 'all',
  onFilterChange,
  mediaTypes: mediaTypesProp,
  defaultMediaTypes = [],
  onMediaTypesChange,
  sources: sourcesProp,
  defaultSources = [],
  onSourcesChange,
  search: searchProp,
  defaultSearch = '',
  onSearchChange,
  onPick,
  onUploadFiles,
  title,
  uploadAccept = DEFAULT_UPLOAD_ACCEPT,
  uploadMimePrefixes = DEFAULT_UPLOAD_MIME_PREFIXES,
  maxSelect,
}: LibraryPickerProps) {
  const single = maxSelect === 1
  const { brandId } = useBrand()
  const copy = COPY[brandId]
  // Section nav options — memoised so the TabSwitcher children keep a stable
  // identity per brand. (Type + Source are now multi-select <Dropdown> pills in
  // the filter popover, no longer derived option lists.)
  const SECTIONS = useMemo(() => makeSections(copy), [copy])

  // ── Controlled / uncontrolled section ────────────────────────────────
  const [internalFilter, setInternalFilter] = useState<LibraryPickerSection>(defaultFilter)
  const filter = filterProp ?? internalFilter
  const setFilter = useCallback(
    (next: LibraryPickerSection) => {
      if (filterProp === undefined) setInternalFilter(next)
      onFilterChange?.(next)
    },
    [filterProp, onFilterChange],
  )

  // ── Controlled / uncontrolled media types (multiselect) ──────────────
  const [internalMediaTypes, setInternalMediaTypes] =
    useState<LibraryPickerMediaType[]>(defaultMediaTypes)
  const mediaTypes = mediaTypesProp ?? internalMediaTypes
  const setMediaTypes = useCallback(
    (next: LibraryPickerMediaType[]) => {
      if (mediaTypesProp === undefined) setInternalMediaTypes(next)
      onMediaTypesChange?.(next)
    },
    [mediaTypesProp, onMediaTypesChange],
  )

  // ── Controlled / uncontrolled sources (multiselect) ──────────────────
  const [internalSources, setInternalSources] = useState<LibraryPickerSource[]>(defaultSources)
  const sources = sourcesProp ?? internalSources
  const setSources = useCallback(
    (next: LibraryPickerSource[]) => {
      if (sourcesProp === undefined) setInternalSources(next)
      onSourcesChange?.(next)
    },
    [sourcesProp, onSourcesChange],
  )

  // ── Controlled / uncontrolled search ────────────────────────────────
  const [internalSearch, setInternalSearch] = useState(defaultSearch)
  const search = searchProp ?? internalSearch
  const setSearch = useCallback(
    (next: string) => {
      if (searchProp === undefined) setInternalSearch(next)
      onSearchChange?.(next)
    },
    [searchProp, onSearchChange],
  )

  // Phone breakpoint (mirrors the Dialog mobile-sheet switch) drives a denser
  // masonry: at the default 180px min only ONE column fits a ~380px phone, so
  // drop the min on phones to keep TWO columns. Reactive via matchMedia.
  const [isPhone, setIsPhone] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(max-width: 639.98px)')
    const update = () => setIsPhone(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  const gridMinItemWidth = isPhone ? 150 : 180

  // Collapse the upload band to a thin 40px strip once the grid is scrolled,
  // so it stays visible without eating vertical space (icon shrinks + copy
  // swaps to the compact line). Reactive to the grid's OWN scroll
  // (rAF-throttled); expands back at the top. Re-armed whenever the modal
  // opens (the grid node mounts only while open).
  const [bandCollapsed, setBandCollapsed] = useState(false)
  // Mirror of `bandCollapsed` read inside the scroll handler (no stale closure)
  // and used to detect a real change before locking out the next toggle.
  const bandCollapsedRef = useRef(false)

  // Re-arm (expand) the band whenever the picker (re)opens. The grid node and
  // its scroll listener are owned by the callback ref below (it re-mounts per
  // open), but the collapse STATE persists across opens — reset it here.
  useEffect(() => {
    if (!open) return
    bandCollapsedRef.current = false
    setBandCollapsed(false)
  }, [open])

  // Scroll-collapse: a CALLBACK REF on the grid node, NOT a [open,isPhone]
  // effect. The picker swaps its whole shell on the phone↔desktop boundary
  // (vaul sheet ⇄ Dialog), so the grid is a DIFFERENT DOM node per shell; an
  // effect that captured `gridRef.current` re-attached to the wrong (unmounted)
  // node across that swap, so mobile never collapsed on scroll (desktop has no
  // swap, so it worked — masking the bug). A callback ref is driven by the
  // node's own mount/unmount: it attaches the moment the grid exists in EITHER
  // shell and detaches on unmount, re-attaching automatically across the swap
  // and across the loading→ready flip (the grid mounts only once data arrives).
  // React 19 ref-cleanup handles the teardown. Stable identity (`[]` deps) so it
  // fires on node mount/unmount only, not every render.
  const gridScrollRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    let raf = 0
    let lockedUntil = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const now = performance.now()
        // Collapsing/expanding changes the band's height, which resizes the grid
        // and can CLAMP scrollTop — firing another scroll event that flips the
        // state straight back (the open/close flicker). After a real toggle, lock
        // out further changes for one transition so the layout can settle.
        if (now < lockedUntil) return
        const top = el.scrollTop
        // Collapse almost immediately once the grid scrolls (8px), and only
        // re-expand when scrolled all the way back to the top. The 0↔8 hysteresis
        // gap + the post-toggle lock above keep it from twitching.
        const next = bandCollapsedRef.current ? top > 0 : top > 8
        if (next !== bandCollapsedRef.current) {
          bandCollapsedRef.current = next
          lockedUntil = now + 320
          setBandCollapsed(next)
        }
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Local search filter — caller may also filter upstream; both stack.
  const visibleItems = useMemo<LibraryPickerItem[]>(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => it.name.toLowerCase().includes(q))
  }, [items, search])

  const itemsById = useMemo(() => {
    const m = new Map<string, LibraryPickerItem>()
    for (const it of visibleItems) m.set(it.id, it)
    return m
  }, [visibleItems])

  const orderedIds = useMemo(() => visibleItems.map((it) => it.id), [visibleItems])
  const selection = useMediaGridSelection({ orderedIds })

  // Stable join keys for the multiselect axes — so the clear-selection effect
  // below fires on a real value change, not on every array-ref identity change
  // (a fresh `[]`/array each render would otherwise clear the selection on
  // every render).
  const mediaTypesKey = mediaTypes.join(',')
  const sourcesKey = sources.join(',')

  // Active-filter count for the popover trigger — counts active AXES (not the
  // number of picked values), since the trigger shows a DOT, not a number. An
  // axis is active when it has ≥1 selected value.
  const activeFilterCount = (mediaTypes.length > 0 ? 1 : 0) + (sources.length > 0 ? 1 : 0)

  // Clear selection when any data axis changes — selected IDs from one
  // mode don't apply to another (would invisibly inflate `count`).
  // biome-ignore lint/correctness/useExhaustiveDependencies: filter axes are the trigger
  useEffect(() => {
    selection.clear()
  }, [filter, mediaTypesKey, sourcesKey])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        selection.clear()
        // Only reset internal state when the consumer is uncontrolled.
        if (filterProp === undefined) setInternalFilter(defaultFilter)
        if (mediaTypesProp === undefined) setInternalMediaTypes(defaultMediaTypes)
        if (sourcesProp === undefined) setInternalSources(defaultSources)
        if (searchProp === undefined) setInternalSearch('')
      }
      onOpenChange(next)
    },
    [
      onOpenChange,
      selection,
      filterProp,
      mediaTypesProp,
      sourcesProp,
      searchProp,
      defaultFilter,
      defaultMediaTypes,
      defaultSources,
    ],
  )

  const handleConfirm = useCallback(() => {
    if (selection.count === 0) return
    const picked: LibraryPickerPick[] = []
    for (const id of selection.selectedIds) {
      const it = itemsById.get(id)
      if (!it) continue
      picked.push({
        id: it.id,
        url: it.url ?? it.src,
        thumbnailUrl: it.src,
        name: it.name,
      })
    }
    if (picked.length === 0) return
    onPick(picked)
    handleOpenChange(false)
  }, [selection, itemsById, onPick, handleOpenChange])

  const handleDropFiles = useCallback(
    (files: File[]) => {
      // Defensive client-side MIME filter — OS picker honours `accept`
      // only as a hint. Round-tripping disallowed types is wasteful UX.
      // Prefix list mirrors `uploadAccept` (image-only by default, image+video
      // when the consumer opts in).
      const allowed = files.filter((f) =>
        uploadMimePrefixes.some((prefix) => f.type.startsWith(prefix)),
      )
      if (allowed.length === 0) return
      onUploadFiles(allowed)
      handleOpenChange(false)
    },
    [onUploadFiles, handleOpenChange, uploadMimePrefixes],
  )

  // Whole-modal drop target. `noClick` / `noKeyboard` so clicks on the grid,
  // filters or search NEVER trigger the OS file dialog — only the explicit
  // Upload button (`openFileDialog()`) does. `isDragActive` paints the
  // full-cover overlay, so dragging a file ANYWHERE over the modal reads as
  // droppable. Single (slot) mode uploads one file at a time.
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    open: openFileDialog,
  } = useDropzone({
    onDrop: handleDropFiles,
    accept: uploadAccept,
    multiple: !single,
    noClick: true,
    noKeyboard: true,
  })

  const selectedLabel =
    selection.count === 0
      ? copy.selectedZero
      : selection.count === 1
        ? copy.selectedOne
        : copy.selectedMany(selection.count)

  const titleText = title ?? copy.title

  // Type + Source multiselect lists — shared between the desktop layout (two
  // labelled popover pills) and the mobile layout (one filter button with both
  // sections). Defined once so the two layouts can't drift. Each axis is the
  // unified <Dropdown> in multi-select mode: empty selection = "show all" (the
  // axis reports no filter — the host owns the actual filtering), so an empty
  // Set ↔ empty array round-trips the prior CheckboxGroup semantics exactly.
  const typeOptions: DropdownOption[] = [
    { id: 'image', label: copy.typeImage, icon: <ImageOutline /> },
    { id: 'video', label: copy.typeVideo, icon: <VideoOutline /> },
    { id: 'audio', label: copy.typeAudio, icon: <AudioOutline /> },
  ]
  const sourceOptions: DropdownOption[] = [
    { id: 'series', label: copy.sourceSeries, icon: <VideoOutline /> },
    { id: 'chat', label: copy.sourceChat, icon: <Messages2Outline /> },
    { id: 'canvas', label: copy.sourceCanvas, icon: <FrameOutline /> },
  ]
  const typeFilterGroup = (
    <Dropdown
      aria-label={copy.typeAria}
      triggerProps={{ className: 'klyp-LibraryPicker__axisSelect' }}
      triggerLabel={copy.typeRowLabel}
      activeCount={mediaTypes.length}
      selectionMode="multiple"
      selectedKeys={new Set(mediaTypes)}
      onSelectionChange={(ids) => setMediaTypes(Array.from(ids) as LibraryPickerMediaType[])}
      options={typeOptions}
    />
  )
  const sourceFilterGroup = (
    <Dropdown
      aria-label={copy.sourceAria}
      triggerProps={{ className: 'klyp-LibraryPicker__axisSelect' }}
      triggerLabel={copy.sourceRowLabel}
      activeCount={sources.length}
      selectionMode="multiple"
      selectedKeys={new Set(sources)}
      onSelectionChange={(ids) => setSources(Array.from(ids) as LibraryPickerSource[])}
      options={sourceOptions}
    />
  )

  // Toolbar — section TabSwitcher + the two axis controls (desktop = two
  // labelled multiselect popover pills, each with a count badge; mobile = one
  // filter button popover holding both axes as checkbox rows) + the search
  // field. Extracted as ONE node so the desktop header band + the mobile sheet
  // body render the SAME toolbar (no drift between shells).
  const toolbarNode = (
    <ModalToolbar
      controls={
        <>
          {/* Section nav — iconOnly on BOTH devices; stretches full-width on
                phones (the filter button sits flush to its right). */}
          <TabSwitcher
            size="md"
            iconOnly
            fullWidth={isPhone}
            ariaLabel={copy.sectionAria}
            value={filter}
            onValueChange={(next) => setFilter(next as LibraryPickerSection)}
          >
            {SECTIONS.map((s) => (
              <TabSwitcher.Item key={s.value} value={s.value} icon={s.icon}>
                {s.label}
              </TabSwitcher.Item>
            ))}
          </TabSwitcher>
          {/* Desktop: Type + Source as TWO labelled multiselect pills (each
                opens its own menu-row checkbox list and shows a count badge
                when ≥1 value is picked). Mobile: the two axes collapse into ONE
                filter-icon button with both sections; the accent DOT shows when
                any axis has a selection. Empty array on an axis = "all". */}
          {isPhone ? (
            <AdvancedFilterPopover
              ariaLabel={copy.filtersAria}
              activeCount={activeFilterCount}
              icon={FilterOutline}
              className="klyp-LibraryPicker__filterTrigger"
            >
              {/* No Row label — the Dropdown pill's own triggerLabel ("Type" /*/}
              {/* "Source") is the single label; a Row label would duplicate it.*/}
              <AdvancedFilterPopover.Row>{typeFilterGroup}</AdvancedFilterPopover.Row>
              <AdvancedFilterPopover.Row>{sourceFilterGroup}</AdvancedFilterPopover.Row>
            </AdvancedFilterPopover>
          ) : (
            // Desktop: each axis IS the Dropdown pill (its own labelled trigger +
            // multi-select menu) — rendered directly, NO outer AdvancedFilterPopover
            // shell, else the shell's "Type" pill would wrap the Dropdown's "Type"
            // pill (double nesting). Mirrors the /library route's standalone pills.
            <>
              {typeFilterGroup}
              {sourceFilterGroup}
            </>
          )}
        </>
      }
      search={
        <SearchField
          size="lg"
          variant="outline"
          aria-label={copy.searchAria}
          placeholder={copy.searchPlaceholder}
          value={search}
          onChange={setSearch}
          className="klyp-LibraryPicker__search"
        />
      }
    />
  )

  // The collapsing upload-band strip (shown ABOVE the grid when there ARE
  // items) — the whole band is one button: hover fills it, click opens the OS
  // file dialog (dropping ANYWHERE in the modal still works via the root
  // dropzone + full-cover overlay). Collapses to a 40px strip on grid scroll.
  const dropbandStrip = (
    <button
      type="button"
      className="klyp-LibraryPicker__dropband"
      data-collapsed={bandCollapsed ? '' : undefined}
      onClick={openFileDialog}
      aria-label={copy.dropzoneTitle}
      data-testid="library-picker-upload"
    >
      <span className="klyp-LibraryPicker__dropbandIcon" aria-hidden="true">
        <UploadDocGlyph />
      </span>
      <span className="klyp-LibraryPicker__dropbandCopy" aria-hidden="true">
        {bandCollapsed ? copy.dropzoneTitleCompact : copy.dropzoneTitle}
      </span>
    </button>
  )

  // Body content = everything that is NOT the toolbar. When the library is
  // EMPTY (resolved, length 0), the whole body becomes ONE full-height dropzone
  // — no collapsing strip, no grid scroll container, no footer. When there ARE
  // items: collapsing strip + scrollable grid + footer (today's layout).
  const isEmpty = visibleItems.length === 0
  const bodyContent = isLoading ? (
    <div className="klyp-LibraryPicker__loading">
      <Spinner size="md" />
      <p>{copy.loading}</p>
    </div>
  ) : isEmpty ? (
    // Full-screen dropzone — fills the body, centred, no grid/footer/scroll.
    <button
      type="button"
      className="klyp-LibraryPicker__dropband"
      data-empty=""
      onClick={openFileDialog}
      aria-label={copy.dropzoneTitle}
      data-testid="library-picker-upload"
    >
      <span className="klyp-LibraryPicker__dropbandIcon" aria-hidden="true">
        <UploadDocGlyph />
      </span>
      <span className="klyp-LibraryPicker__dropbandCopy" aria-hidden="true">
        {copy.dropzoneTitle}
      </span>
    </button>
  ) : (
    <>
      {dropbandStrip}
      {/* data-vaul-no-drag: vertical swipes scroll the grid, they don't drag
            the mobile sheet down (vaul). Inert in the desktop Dialog. */}
      <div
        className="klyp-LibraryPicker__grid"
        ref={gridScrollRef}
        data-vaul-no-drag
        data-refetching={isRefetching ? '' : undefined}
      >
        <MediaGrid
          items={visibleItems}
          viewMode="masonry"
          minItemWidth={gridMinItemWidth}
          gap={8}
          selectionMode
          selectedIds={selection.selectedIds}
          onSelectionClick={({ id, meta, shift }) => {
            if (single) {
              // Single-select (slot picker): clicking replaces the selection;
              // clicking the lone selected item clears it.
              selection.setSelectedIds(selection.isSelected(id) ? new Set() : new Set([id]))
            } else {
              selection.handleItemClick(id, { meta, shift })
            }
          }}
        />
      </div>
    </>
  )

  // Footer — its OWN band (sibling of __main, like the header), NOT inside the
  // scrolling body. Only shown when the grid is (no footer in loading/empty).
  // data-vaul-no-drag: tapping "Use selection" must fire onPick, not start a
  // sheet-drag.
  const footerNode =
    !isLoading && !isEmpty ? (
      <div className="klyp-LibraryPicker__footer" data-vaul-no-drag>
        {/* Selection summary (left) + primary confirm (right). aria-live so the
            count change is announced; the label truncates so a long summary
            never pushes the button off-row. */}
        <p className="klyp-LibraryPicker__footerLabel" aria-live="polite">
          {selectedLabel}
        </p>
        <Button
          variant="primary"
          size="md"
          isDisabled={selection.count === 0}
          onPress={handleConfirm}
        >
          {copy.use(selection.count)}
        </Button>
      </div>
    ) : null

  // SR-only drag-state announcement (the visual overlay is aria-hidden).
  const srLive = (
    <div className="klyp-LibraryPicker__srLive" role="status" aria-live="polite">
      {/* Keyed span so an accept→reject flip (neither string empty) re-mounts
            the node and reliably re-fires the announcement — a bare text swap
            between two non-empty strings is dropped by some screen readers. */}
      {isDragActive ? (
        <span key={isDragReject ? 'reject' : 'accept'}>
          {isDragReject ? copy.dropRejectTitle : copy.dropOverlayTitle}
        </span>
      ) : null}
    </div>
  )

  // Full-cover drop overlay — shown only while a file is dragged over the
  // modal. pointer-events:none so the drop reaches the root.
  const dropOverlay = isDragActive ? (
    <div
      className="klyp-LibraryPicker__dropOverlay"
      data-reject={isDragReject ? '' : undefined}
      aria-hidden="true"
    >
      <UploadOutline width={40} height={40} />
      <p className="klyp-LibraryPicker__dropOverlayText">
        {isDragReject ? copy.dropRejectTitle : copy.dropOverlayTitle}
      </p>
    </div>
  ) : null

  // ── MOBILE shell — vaul bottom-sheet. Toolbar stays at the TOP of the body
  //    (not the header), exactly like before. ────────────────────────────────
  const mobileBody = (
    <div className="klyp-LibraryPicker" {...getRootProps()}>
      <input {...getInputProps()} />
      {srLive}

      <section className="klyp-LibraryPicker__main">
        {/* Toolbar band — filter controls (left) + search (right) via the shared
              ModalToolbar; stacks on mobile (controls on top, search full-width
              below). data-vaul-no-drag: interacting with the toolbar must not drag
              the mobile sheet (vaul ignores drags starting here). */}
        <div className="klyp-LibraryPicker__toolbar" data-vaul-no-drag>
          {toolbarNode}
        </div>
        {bodyContent}
      </section>

      {footerNode}
      {dropOverlay}
    </div>
  )

  // Mobile → real vaul bottom-sheet (drag-handle, drag-down-to-dismiss, grid
  // scrolls, footer pinned). Desktop → a Dialog shell with a custom banded
  // header that puts the toolbar inline with the title + close. Both shells are
  // controlled by the SAME `open` + `handleOpenChange`, so flipping isPhone
  // (orientation change) just re-mounts the shared body in the other shell.
  if (isPhone) {
    return (
      <LibraryPickerSheet
        open={open}
        onOpenChange={handleOpenChange}
        titleText={titleText}
        closeAria={copy.closeAria}
        onClose={() => handleOpenChange(false)}
      >
        {mobileBody}
      </LibraryPickerSheet>
    )
  }

  // ── DESKTOP shell — Dialog primitives with a custom banded header:
  //    [ DialogTitle "Library" ] [ toolbar ] [ vertical divider ] [ ✕ ].
  //    The dropzone root wraps the WHOLE shell so a file dragged anywhere over
  //    the modal still drops (full-cover __dropOverlay on drag).
  return (
    <DialogContent
      showCloseButton={false}
      className="klyp-Modal__content klyp-Modal__content--full klyp-LibraryPicker__modal"
      isOpen={open}
      onOpenChange={handleOpenChange}
      isDismissable
    >
      <div className="klyp-LibraryPicker" {...getRootProps()}>
        <input {...getInputProps()} />
        {srLive}
        <DialogHeader className="klyp-LibraryPicker__header">
          <DialogTitle className="klyp-LibraryPicker__headerTitle">{titleText}</DialogTitle>
          <div className="klyp-LibraryPicker__headerToolbar">{toolbarNode}</div>
          <span className="klyp-LibraryPicker__headerDivider" aria-hidden />
          <DialogClose
            variant="secondary"
            size="icon"
            className="klyp-LibraryPicker__close"
            aria-label={copy.closeAria}
          >
            <XOutline aria-hidden />
          </DialogClose>
        </DialogHeader>
        <section className="klyp-LibraryPicker__main">{bodyContent}</section>
        {footerNode}
        {dropOverlay}
      </div>
    </DialogContent>
  )
}

export default LibraryPicker
