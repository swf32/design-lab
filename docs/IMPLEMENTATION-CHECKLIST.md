# Implementation checklist

Этот документ — рабочая карта реализации Design Lab. Он переводит Product Definition v0.2 в проверяемые инженерные задачи и обновляется по мере разработки.

## Принятые ограничения

- [x] Продукт работает как локальное React-приложение с Node.js runtime.
- [x] Файловая система — единственный источник истины.
- [x] UI, формы и AI в будущем записывают одинаковые файловые контракты.
- [x] Производные индексы и кэши не становятся источником истины.
- [x] Пользователь не поддерживает глобальные `index.ts` вручную.
- [x] Начальная вертикаль: Tokens → Palette → Fonts → Components.
- [x] Пользовательские projects/libraries находятся в отдельных каталогах под общим корнем Design Lab и исключены из git приложения.
- [x] Автоматическое обнаружение обязательно для Tokens, Palette, Fonts и Components.
- [x] Автоматическое обнаружение ограничено каноническими каталогами Design Lab; произвольные пути пользовательского репозитория не поддерживаются.
- [x] Directory panel показывает только данные активного модуля выбранного project/library.
- [x] Собственная `design-lab-system` является редактируемой Library и единственным source для приложения и scanners.
- [x] Политика восстановления: переустановка стандартной Library, без fallback kernel.
- [x] Assets является общим модулем для media, SVG и TSX icons; отдельной вкладки Icons нет.
- [x] Assets автоматически обнаруживает SVG/TSX icons, raster images и videos; raster thumbnails выдаются безопасным local API.
- [x] TSX и SVG icons получают реальные previews: TSX нормализуется в sandboxed SVG без исполнения пользовательского React-кода.
- [x] Новый Project сразу получает пустые `assets/icons`, `assets/images` и `assets/videos`.
- [x] Components, Tokens и Assets имеют виртуальную папку `All`; выбор реальной папки фильтрует правую область и не зависит от disclosure state.
- [x] Новые иконки компонентов, previews и stories создаются в каноническом `assets/icons/` Library и переиспользуются через export, а не хардкодятся локально.
- [x] Зафиксирован папочный Component contract и semantic navigation вместо raw file browser.
- [x] Не включать в эту вертикаль Pages, Wireframes, hosted collaboration, remote/write MCP и глубокую Figma-синхронизацию. Локальный read-only MCP adapter включён отдельным ранним срезом.

## Текущее состояние

- [x] Настроены React, TypeScript, SCSS, Vite и Node.js.
- [x] Есть локальный API, health endpoint, Project registry и filesystem gateway.
- [x] Создан визуальный shell приложения.
- [x] Sidebar использует компоненты и TSX-иконки из Figma.
- [x] Навигационная зона изменяет ширину и сохраняет её локально.
- [x] Внутренние UI-цвета и размеры вынесены в токены.
- [x] Добавлены semantic dark/light token modes и сохраняемый theme control на общем `TabSwitcher`.
- [x] Product copy переведён на typed i18n dictionary; английский активен, русский подготовлен как следующий locale.
- [x] Canvas mode и solid color сохраняются глобально и синхронно применяются к Playground и Stories.
- [x] Application Sidebar и Directory Panel синхронно анимируют разделение общей navigation width без изменения Workspace.
- [x] Mobile shell объединяет Application Sidebar и Directory Panel в доступный drawer, сохраняет 44px touch targets, safe areas и одноколоночный Workspace без horizontal overflow.
- [x] Mobile density сохраняет 16px gutters, 44–48px touch targets и раздельные действия disclosure/navigation в Directory Panel.
- [x] Workbench Back восстанавливает предыдущее session-history состояние, включая исходную папку и переходы между связанными Components; direct deep link возвращается в корень module.
- [x] Module Header использует production Button для действия Back, сохраняет 40px hit target, явный keyboard focus и адаптивную иерархию title/source/actions.
- [x] Workbench Playground вынесен в production-организм с Canvas padding policy, controls rail и shared background control.
- [x] Browser-default boolean controls заменены системным Checkbox с native semantics и theme-aware styling.
- [x] Assets реализован как filesystem-first catalog с группами, реальными image previews, empty-folder state и production `AssetCard`.
- [x] Token scanner нормализует base values и theme overrides в mode-aware values.
- [x] Tokens, Palette и Fonts используют общий `TabSwitcher` независимо от UI theme.
- [x] Файловое дерево получает модульные данные из Node.js.
- [x] Project и filesystem-discovered Library реализованы как реальные sources; UI создания Library ещё не реализован.
- [ ] `/api/entities` возвращает первичное файловое представление, но ещё не нормализованные сущности.
- [x] Tokens, Palette, Fonts и Components получают первые реальные read-only представления из canonical Library.
- [x] Зафиксирована taxonomy `variant/state/behavior/context/integration/accessibility` для Workbench stories.
- [x] Зафиксированы representative-content и content-stress fixtures для контент-зависимых компонентов.
- [x] Catalog рендерит authored `*.preview.tsx` из manifest для всех компонентов `design-lab-system`, generic thumbnail остаётся только fallback.
- [x] Authored preview не дублирует имя компонента, категорию и manifest variants из Component Card; остаётся только текст изображаемого UI.
- [x] Authored preview строится от реальной anatomy компонента, показывает один главный identity specimen и не подменяет компонент выдуманным parent shell.
- [x] Preview geometry проверяется в фактической Component Card: общие guide lines, оптическое центрирование, dark/light themes и отсутствие invented anatomy.
- [x] Component Card задаёт общий preview safe area; full-width specimens используют border-box и не прилипают к краям без явного edge-to-edge contract.
- [x] Component Card является borderless preview surface с 12px radius, overlay title gradient, без визуального hover treatment и без filename/variant metadata.
- [x] Component catalog использует `spacing.1` между карточками; card height совпадает с preview area.
- [x] Optional `previewMotion` запускает authored state transition на card hover/focus и отключается при reduced motion.
- [x] Убрать generic Workbench placeholder у всех текущих компонентов `design-lab-system`; playground и контекстные stories исполняют реальные production-компоненты.
- [x] `DirectoryPanel` использует representative и dense content fixtures; дерево является единственным scroll owner, header/footer остаются фиксированными.
- [x] `DirectoryPanel` начинает с collapsed real folders, включает настраиваемый поиск, source-scoped icon colors и future item actions.
- [x] `SemanticTreeItem` разделяет disclosure, selection, color picker trigger и More action на независимые keyboard targets.
- [x] Добавить общий `ColorPicker` с presets, spectrum, HEX editing и nullable reset.
- [x] Завершить обязательные файлы у `ControlField`, `SemanticTreeItem`, `ComponentThumbnail`, `ModuleHeader` и `StoryCanvas`.
- [x] Добавить канонический атом `Input` с text/search/textarea, общей матрицей размеров, accessibility-состояниями и реальным Workbench.
- [x] Добавить общий AI context gateway для Components, Tokens, Assets, Fonts и Markdown knowledge.
- [x] Добавить local read-only MCP stdio server и CLI fallback над тем же context gateway.
- [x] Добавить Settings entry внизу Application Sidebar с готовым MCP config и CLI tutorial.

## Gap audit — 2026-07-19

### P0 — foundation before broader authoring

- [ ] Promote the normalized context object into one shared `DesignLabEntity` schema used by API, index, MCP, CLI, and frontend types.
- [ ] Add `updatedAt`, diagnostics, source locations, and stable relation fields to the entity schema.
- [ ] Add a filesystem watcher with scoped invalidation and SSE/WebSocket updates; UI and context search currently rescan only on request or navigation.
- [ ] Apply one explicit path-containment helper to every read/write route and scanner.
- [ ] Add invalid-entity isolation so one broken manifest or token file becomes a diagnostic instead of failing the whole module/search request.

### P1 — AI retrieval quality

- [ ] Add multilingual embeddings as a derived provider and rerank lexical candidates; current relevance is deterministic lexical/fuzzy fallback.
- [x] Add semantic metadata coverage (`description`, `aliases`, `useWhen`, `avoidWhen`) to every default component manifest.
- [x] Add searchable semantic metadata to default tokens, font families, and adjacent asset sidecars.
- [x] Index direct production and example-only Component dependency/usage relations.
- [ ] Index transitive impact plus token, font, and asset relations.
- [ ] Add Search UI using the same gateway; search currently exists through MCP and CLI only.
- [ ] Add Settings presets/tutorials for individual MCP clients and a connection self-test action.

### P1 — first design-system vertical

- [ ] Finish token schema/version, aliases, type validation, diagnostics, CRUD, and deterministic generated outputs.
- [ ] Finish Palette mappings/contrast/origin instead of only displaying resolved color tokens.
- [ ] Add font-file discovery, metadata parsing, safe local serving, and loading diagnostics.
- [x] Add shared `TOKEN_RULES.md`, `ASSET_RULES.md`, and `FONT_RULES.md` authoring contracts.
- [x] Generate the code-native icon barrel from filesystem assets during dev/build/test.
- [x] Add static import AST analysis, dependency/usages view, and copy import/source actions.
- [ ] Add export/prop AST extraction, sandbox/error boundary, and create/update scaffold.

### P2 — product breadth

- [ ] Add Rules, Decisions, and Prompts modules so indexed knowledge is authorable in UI.
- [x] Implement the first Wireframes vertical: hybrid filesystem contract, semantic discovery/navigation, fullscreen multi-layout review, typed saved/custom states, and user-flow Canvas.
- [x] Keep Wireframe review navigation inside one translucent Dev mode action and render the real screen in 16:9 catalog and flow previews.
- [x] Scope Wireframes to active-source product modes and adapt theme controls between Tab Switcher and Radio Buttons by option count.
- [x] Pair desktop/mobile screens in collision-safe flow nodes and support infinite transformed grid, pan, pinch zoom, and semantic folder routes.
- [x] Bring the shared Inspector/handoff contract from Component Playground to fullscreen Wireframes.
- [ ] Implement Pages and bring the same Inspector/handoff contract to Pages.
- [ ] Add guarded AI write proposals only after diff, validation, and confirmation contracts exist.

---

# Phase 0. Общая основа

Эта фаза нужна всем четырём модулям. Без неё каждый экран начнёт самостоятельно читать файлы, валидировать данные и обрабатывать ошибки.

## 0.1 Workspace, Project и Library

- [ ] Зафиксировать TypeScript-типы `Workspace`, `Project`, `Library`, `EntityRef`.
- [ ] Создать минимальный `workspace.json`.
- [ ] Создать минимальные `project.json` и `library.json`. (`project.json` готов; `library.json` — нет.)
- [ ] Создать локальный registry project/library внутри `.designlab/`. (Project registry готов; Library — нет.)
- [ ] Поддержать standalone-структуру `projects/` и `libraries/`.
- [ ] Оставить `.designlab/`-режим вторичным и не смешивать его с первым сценарием.
- [ ] Выбирать активный project/library в UI. (Project готов; Library — нет.)
- [ ] Сохранять последний выбранный project/library локально. (Project готов; Library — нет.)
- [x] Показывать реальную файловую структуру активного Project во второй панели.

## 0.2 Общая модель сущности

- [ ] Создать базовый контракт `DesignLabEntity`.
- [ ] Обязательные поля: `id`, `kind`, `name`, `path`, `source`, `updatedAt`.
- [ ] Опциональные поля: `description`, `tags`, `status`, `metadataPath`, `diagnostics`.
- [ ] Использовать стабильные относительные пути вместо абсолютных путей в индексах.
- [ ] Определить правила генерации стабильного `id`.
- [ ] Не требовать metadata-файл для обнаружения сущности.

## 0.3 Node.js filesystem gateway

- [ ] Разделить server на `routes`, `services`, `scanners`, `watcher`, `schemas`.
- [ ] Проверять, что любой читаемый или записываемый путь остаётся внутри workspace.
- [ ] Запретить path traversal и доступ за пределы workspace.
- [x] Добавить API получения дерева файлов.
- [ ] Добавить API чтения сущности.
- [ ] Добавить API создания и обновления сущности.
- [ ] Добавить API диагностик и validation errors.
- [x] Возвращать структурированные ошибки, а не только HTTP status.
- [x] Не давать UI прямой доступ к Node `fs`.

## 0.4 Watcher и обновления UI

- [ ] Исключить `.git`, `node_modules`, `dist`, cache и временные файлы.
- [ ] Дебаунсить серии filesystem events.
- [ ] Определять затронутый модуль по пути файла.
- [ ] Пересканировать только затронутую область, а не весь workspace.
- [ ] Передавать изменения в UI через SSE или WebSocket.
- [ ] Обновлять список сущностей без перезагрузки страницы.
- [ ] Корректно обрабатывать create, change, rename и delete.

## 0.5 Производный индекс

- [x] Создать `.designlab/index/` только как генерируемый слой.
- [ ] Индексировать entity summary, связи, diagnostics и время изменения.
- [x] Уметь полностью пересобрать AI context index из исходных файлов.
- [x] Делать атомарную запись AI context index.
- [x] Версионировать schema AI context index.
- [ ] Не добавлять embeddings до стабилизации базовой entity schema.

## 0.6 Общая frontend-архитектура

- [x] Добавить router или эквивалентный устойчивый module routing.
- [ ] Разделить module shell, directory panel и content view.
- [x] Создать единый API client с типизированными ответами для Project lifecycle.
- [ ] Создать состояния loading, empty, error, invalid и ready. (Project loading/empty/error готовы.)
- [ ] Создать общие компоненты: toolbar, search, tree, list, grid, details panel, field, dialog, toast. (Header, canvas toolbar, search input, semantic tree item, color picker, source select, field и dialog готовы.)
- [x] Все новые компоненты строить на существующих color/metric tokens.
- [ ] Не добавлять одноразовые hex-цвета и размеры без токена.

## Exit criteria Phase 0

- [ ] Design Lab открывает реальный workspace.
- [ ] Project/library выбирается в UI.
- [ ] Файловая панель показывает реальное дерево.
- [ ] Изменение файла на диске обновляет UI без reload.
- [ ] Любой индекс можно удалить и восстановить автоматически.

---

# Phase 1. Tokens

Tokens — первый полноценный модуль и базовая зависимость Palette, Fonts и Components.

## 1.1 Канонический файловый контракт

- [ ] Использовать JSON как рекомендуемый канонический формат для новых token sets.
- [ ] Не хранить одно и то же значение одновременно как независимый JSON, SCSS и TypeScript source of truth.
- [ ] Генерируемые CSS/SCSS/TS-представления считать output/cache.
- [ ] Поддержать категории: `color`, `dimension`, `spacing`, `radius`, `shadow`, `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`, `letterSpacing`, `duration`, `number`, `boolean`, `string`.
- [ ] Поддержать группы и вложенные token paths.
- [ ] Поддержать `description`, `deprecated`, `extensions` и tags.
- [ ] Поддержать ссылки одного токена на другой.
- [x] Поддержать modes/themes без дублирования дерева токенов.
- [ ] Добавить schema version.

## 1.2 Parser и normalization

- [ ] Найти `*.tokens.json` автоматически.
- [ ] Прочитать legacy/plain JSON без падения всего модуля.
- [ ] Нормализовать разные JSON-формы во внутренний `TokenEntity`.
- [ ] Разрешать references и обнаруживать циклы.
- [ ] Проверять соответствие value заявленному type.
- [ ] Сохранять source location для ошибок.
- [ ] Возвращать warnings отдельно от errors.
- [ ] Не скрывать невалидный файл: показывать его с diagnostics.

## 1.3 Tokens API

- [ ] `GET /api/tokens` — список и фильтры.
- [ ] `GET /api/tokens/:id` — полная сущность и source location.
- [ ] `POST /api/tokens` — создание token set/token.
- [ ] `PATCH /api/tokens/:id` — изменение значения и metadata.
- [ ] `DELETE /api/tokens/:id` — удаление с предварительным usage summary.
- [ ] `POST /api/tokens/validate` — проверка draft до записи.
- [ ] `POST /api/tokens/build` — генерация производных форматов.
- [ ] Любая запись должна быть атомарной и форматировать JSON детерминированно.

## 1.4 Tokens UI

- [x] Реальная semantic tree token groups/tokens во второй панели.
- [ ] Переключение list/grid/table без потери фильтров.
- [ ] Поиск по name, path, value, description и tags.
- [ ] Фильтры по category, set, mode, deprecated и diagnostics.
- [ ] Группировка по дереву token path.
- [ ] Preview для каждого поддерживаемого type. (Color swatch и явные resolved values готовы.)
- [ ] Details panel с value, resolved value, reference chain и source.
- [ ] Копирование name, CSS variable, raw value, reference и JSON fragment.
- [ ] Форма создания и изменения токена.
- [ ] Чёткий diff перед массовой записью.
- [ ] Empty state с ручной инструкцией и будущим AI prompt.

## 1.5 Tokens validation

- [ ] Дубликаты token paths.
- [ ] Broken references.
- [ ] Circular references.
- [ ] Type/value mismatch.
- [ ] Некорректные color/dimension/shadow values.
- [ ] Отсутствующие theme/mode fallback.
- [ ] Naming warnings без принудительной блокировки.

## 1.6 Tokens tests

- [ ] Unit tests parser/normalizer.
- [ ] Unit tests reference resolver.
- [ ] Unit tests validator.
- [ ] API integration tests на временном workspace.
- [ ] Watcher test: изменение token-файла обновляет ответ API.
- [ ] UI test: filters, details, copy и edit.

## Exit criteria Tokens

- [ ] Пользователь добавляет `*.tokens.json` вручную — модуль подхватывает его автоматически.
- [ ] Тот же токен можно создать через UI без дополнительной регистрации.
- [ ] Значения, aliases и modes корректно разрешаются.
- [ ] Ошибки видны рядом с источником и не ломают весь workspace.
- [ ] Из токенов генерируются стабильные CSS/SCSS/TS outputs.

---

# Phase 2. Palette

Palette — визуальный слой над color tokens, а не второе независимое хранилище цветов.

## 2.1 Модель Palette

- [ ] Значения цветов всегда ссылаются на Tokens.
- [ ] Разделить primitive, semantic и component-level colors.
- [ ] Поддержать light/dark и другие modes.
- [ ] Опциональный `*.palette.json` хранит только группировку, роли и mappings.
- [ ] Отсутствие palette metadata не мешает построить базовую палитру из color tokens.
- [ ] Изменение color token автоматически обновляет Palette.

## 2.2 Palette UI

- [ ] Swatch grid с названием, resolved value и token path.
- [ ] Переключение primitive/semantic/component views.
- [ ] Переключение theme/mode.
- [ ] Группы и сравнение соседних оттенков.
- [ ] Копирование HEX, RGB/HSL, CSS variable и token reference.
- [ ] Details panel со связью primitive → semantic → component.
- [ ] Поиск цветов по имени, роли и значению.
- [ ] Отображение usages после появления component index.

## 2.3 Проверки Palette

- [ ] WCAG contrast для foreground/background pairs.
- [ ] Невалидные или неразрешённые color references.
- [ ] Semantic color без primitive source.
- [ ] Дублирующиеся значения как warning, а не error.
- [ ] Missing dark/light mapping.
- [ ] Проверка текста, UI boundaries и non-text contrast отдельными сценариями.

## Exit criteria Palette

- [ ] Palette полностью строится из color tokens.
- [ ] Никакой цвет не требует ручного дублирования значения.
- [ ] Темы переключаются без перезагрузки.
- [ ] Пользователь видит цепочку происхождения цвета и contrast diagnostics.

---

# Phase 3. Fonts

Fonts объединяет реальные font files, registry и typography tokens.

## 3.1 Font discovery

- [ ] Автоматически находить `.woff2`, `.woff`, `.ttf` и `.otf`.
- [ ] Читать доступные metadata: family, style, weight, format.
- [ ] Поддержать `fonts.json` для aliases, fallback, license и ручных уточнений.
- [ ] Не требовать `fonts.json` для простого обнаружения файла.
- [ ] Обнаруживать missing font files в registry.
- [ ] Безопасно отдавать локальные font files через Node API.

## 3.2 Связь с Tokens

- [ ] Связать family, weight, size, line-height и letter-spacing с typography tokens.
- [ ] Разделить font registry и typography styles.
- [ ] Поддержать fallback chains.
- [ ] Показать unresolved family/weight references.
- [ ] Не копировать typography token values в font registry.

## 3.3 Fonts UI

- [ ] Список семейств и начертаний.
- [ ] Preview произвольного текста.
- [ ] Переключение language/sample text.
- [ ] Просмотр веса, стиля, размера и line-height.
- [ ] Typography scale view: headings, body, labels, captions.
- [ ] Копирование token path, CSS и font-family declaration.
- [ ] Loading/error state для повреждённого или неподдерживаемого файла.

## 3.4 Fonts tests

- [ ] Discovery разных форматов.
- [ ] Registry merge с автоматически найденными файлами.
- [ ] Безопасная отдача бинарных файлов.
- [ ] Preview и переключение typography styles.
- [ ] Missing weight/family diagnostics.

## Exit criteria Fonts

- [ ] Добавленный font file появляется без ручной регистрации.
- [ ] Typography tokens используют обнаруженные семейства.
- [ ] Preview отображает локальный шрифт, а не системный fallback.
- [ ] Пользователь может скопировать готовое корректное применение стиля.

---

# Phase 4. Components

Components использует Tokens, Palette и Fonts и становится первым полным объектом дизайн-системы.

## 4.1 Component discovery

- [x] Автоматически находить component folders по соседнему `component.json`.
- [x] Показывать реальные category folders даже до появления первого Component, скрывая внутренние директории уже обнаруженных Component entities.
- [x] Не требовать центральный index для отображения компонента.
- [x] Генерировать package `components/index.ts` рекурсивно из manifests; обновлять его при dev/build и проверять без ручной регистрации exports.
- [x] Вычислять category из вложенного filesystem path, не дублируя её в `component.json`.
- [x] Читать refs на preview, stories, README и `CHANGELOG.md` из локального manifest.
- [ ] Поддержать опциональный `*.meta.json` или `*.meta.ts`.
- [ ] Определить основной export без выполнения непроверенного кода.
- [ ] Показывать ambiguous/multiple exports как diagnostics.

## 4.2 Component model

- [ ] `id`, `name`, `description`, `status`, `path`, `exports`.
- [ ] Props с type, required, default и description.
- [ ] Variants, states, slots и examples. (Variants и states готовы.)
- [x] Direct `uses`, `usedBy`, `examplesUse`, and `usedInExamplesBy`.
- [ ] Transitive impact, `tokensUsed`, `fontsUsed`, and `assetsUsed`.
- [x] Docs, preview, stories и changelog refs.
- [ ] Локальная семантика: aliases, useWhen, avoidWhen.

## 4.3 TypeScript analysis

- [ ] Использовать TypeScript Compiler API для AST.
- [ ] Извлекать exports и props без запуска компонента.
- [x] Строить direct import/dependency graph внутри активного Project/Library.
- [ ] Находить usages во всём workspace, включая application consumers.
- [ ] Находить CSS variables и token references.
- [ ] Инкрементально пересчитывать только затронутые файлы.
- [ ] Отделить надёжно извлечённые факты от эвристических выводов.

## 4.4 Preview runtime

- [x] Выбрать минимальный канонический preview contract: token-based иллюстрация без импорта реального Component.
- [x] Зафиксировать implementation-first preview recipe: ground truth → defining property → один comparison axis → минимальный specimen.
- [x] Запретить generic name-based compositions, лишний parent context и invented controls; масштабирование не меняет anatomy.
- [x] Зафиксировать geometry QA в реальной карточке: shared alignment guides, optical centering, rendered coordinate check и dark/light review.
- [x] Зафиксировать и реализовать shared preview safe area (`spacing.4` inline, `spacing.3` block) с явным contract для будущих edge-to-edge исключений.
- [x] Систематизировать optional animated preview: manifest capability, shared tokens, hover/focus reset и reduced-motion baseline.
- [ ] Рендерить preview изолированно от shell приложения.
- [ ] Использовать iframe или другой sandbox boundary.
- [ ] Передавать выбранные theme, tokens и fonts.
- [ ] Показывать compile/runtime errors внутри preview panel.
- [ ] Не позволять ошибке одного компонента ломать каталог.
- [ ] Поддержать refresh после изменения файла.

## 4.5 Components catalog

- [x] Directory tree с произвольно вложенными группами/папками.
- [x] Grid, визуально сгруппированный по произвольно вложенным категориям, с illustrative preview компонентов.
- [x] Catalog показывает полный category path относительно текущей папки и не предполагает фиксированную глубину или известные имена групп.
- [x] Radio Button, Slider и Chip реализованы как автоматически обнаруживаемые production Components с preview, Playground, focused stories, docs и changelog.
- [x] Общий component color axis использует `default | accent | success | warning | danger`; warning добавлен в canonical dark/light tokens.
- [ ] Поиск по name, aliases, description, props и назначению.
- [ ] Filters: status, completeness, dependencies, diagnostics, tags.
- [x] Карточка показывает name и lifecycle status; отсутствие или неизвестное значение не блокирует discovery.
- [x] Typed `*.playground.tsx` автоматически создаёт multi-variant route без application registry.
- [x] Playground route является отдельным fullscreen review mode: desktop controls rail + Canvas, mobile Canvas + dismissible Settings rail.
- [x] Playground Inspector различает Components, named slots и обычные DOM elements, показывает copyable JSX/HTML/authored CSS и работает через hover/tap.
- [x] Component outline использует стабильный inspection purple, slot outline — inspection pink; оба не зависят от interface accent.
- [x] Fullscreen Playground использует production `PlaygroundControlsRail` и `InspectorCodePopover`; Canvas Background Control плавает сверху справа над Canvas.
- [x] Shared `WorkbenchInspector` и `WorkbenchAction` заменяют application-local Inspector и разрозненные Settings/Inspect/Dev mode buttons.
- [x] Button получил typed Wireframe Playground с mesh/solid/outline directions, управляемым radius и Safari-prefixed mask clipping.
- [x] Playground popovers портальны и viewport-aware: открытие не увеличивает scroll area controls rail.
- [x] Wireframe-only Component обнаруживается без production entry и не попадает в generated package barrel.
- [ ] Completeness badge/action помимо lifecycle status.
- [x] Detail view: Canvas, Playground, Docs, Code, Dependencies, Changelog; Component Reference показывает import, discovered files и прямые production/example relationships.
- [ ] Props controls для boolean, enum, string, number и slots. (Boolean, enum, string и slots реализованы для Button.)
- [x] Самостоятельные полноширинные Stories для variants, sizes, fullWidth, loading и composition эталонного Button.
- [x] Props API имеет подписанные Name, Type и Default columns.
- [x] README и CHANGELOG отображаются как Markdown в Workbench.
- [x] Theme, design-system mode и Canvas background используют единый `TabSwitcher` с разными visual variants.
- [x] `TabSwitcher` проверен полной матрицей segmented/toggle × small/medium; toggle использует moving thumb.
- [x] Markdown fenced code рендерится через production `CodeBlock` с копированием и overflow.
- [x] Dark Canvas grid использует нейтральные charcoal tokens.
- [x] Canonical import показывается через production CodeBlock и копируется.
- [ ] Copy JSX example, props и source path.

## 4.6 Completeness assistant

- [ ] Проверять наличие preview, stories, docs, examples и changelog.
- [ ] Показывать checklist, не блокируя использование компонента.
- [ ] Предлагать создать недостающий scaffold.
- [ ] Поддержать ручной, UI и будущий AI-сценарий создания.
- [ ] Все сценарии создают одинаковую структуру файлов.

## 4.7 Component scaffold

- [ ] Форма создания component folder.
- [ ] Основной `.tsx`.
- [x] Соседний production `*.scss`, импортируемый самим component implementation и автоматически обнаруживаемый scanner.
- [ ] `*.preview.tsx`.
- [x] Preview-only CSS хранится внутри `*.preview.tsx`, а не в production SCSS или package-wide stylesheet.
- [x] Workbench показывает полный discovered file inventory, включая implementation, style, manifest, preview, stories, docs и changelog.
- [x] Репозиторные `format:code` и `check:code` форматируют TS/TSX/MJS приложения и Library и запрещают compressed source в root build/test.
- [x] Репозиторные `format:styles` и `check:styles` форматируют SCSS и preview `String.raw` CSS и защищают от однострочных style sources и повторных селекторов в одном cascade context.
- [x] Manifest-declared `*.stories.ts(x)` автоматически загружается из component directory и владеет своим renderer.
- [ ] README и `CHANGELOG.md`.
- [ ] Опциональная локальная metadata.
- [ ] Preview diff создаваемых файлов до записи.
- [ ] Защита от перезаписи существующих файлов.

## 4.8 Components tests

- [ ] Discovery разных component structures.
- [ ] Props extraction.
- [x] Direct production и example-only dependency/usage graph строится из static TypeScript/TSX imports; `import type` исключён.
- [ ] Один сломанный компонент не ломает каталог.
- [ ] Preview sandbox и error boundary.
- [ ] Controls изменяют props preview.
- [ ] Scaffold создаёт ожидаемые файлы.
- [ ] Watcher обновляет карточку после изменения source.

## Exit criteria Components

- [ ] Созданный вручную компонент появляется автоматически.
- [ ] Component detail показывает реальный preview, props, docs и source.
- [ ] Playground управляет основными типами props.
- [x] Видны прямые production dependencies/usages и отдельные example-only relationships.
- [ ] Видны используемые design tokens.
- [ ] UI показывает недостающие артефакты, но не блокирует компонент.
- [ ] Компонент можно создать через форму без ручной регистрации.

---

# Phase 5. Интеграция первой вертикали

- [ ] Создать демонстрационную library с tokens, palette, fonts и components.
- [ ] Изменение primitive color обновляет semantic color и component preview.
- [ ] Изменение typography token обновляет Fonts preview и component preview.
- [ ] Component detail показывает token/font origin.
- [ ] Поиск работает сразу по четырём типам сущностей.
- [ ] Diagnostics агрегируются на уровне library/project.
- [ ] Экспортируемый static preview не зависит от локального API после сборки.
- [ ] Описать backup/recovery при повреждении файла.
- [ ] Проверить работу на чистом workspace и на частично заполненном проекте.

## Definition of Done первой вертикали

- [ ] Файлы можно создавать вручную, через UI и в будущем через AI без разных контрактов.
- [ ] Все сущности автоматически обнаруживаются после filesystem changes.
- [ ] UI никогда не является единственным местом хранения данных.
- [ ] Удаление `.designlab/index` не приводит к потере пользовательских данных.
- [ ] Ошибка одной сущности локализована и объяснима.
- [ ] Для каждого модуля есть loading, empty, invalid и ready state.
- [ ] Основные операции покрыты unit/integration/UI tests.
- [ ] Нет обязательной зависимости от Figma, Storybook, cloud или production repo.

---

# Отложено после первой вертикали

- [x] Assets как самостоятельный каталог: automatic discovery, semantic tree, folder filters и read-only cards. Editing/tagging остаются следующей вертикалью.
- [ ] Rules, Decisions и Prompts.
- [x] Weighted keyword/fuzzy search по каноническим sources с description-first выдачей.
- [ ] Embeddings и semantic retrieval.
- [x] Внутренний context gateway и MCP-ready schema.
- [x] Local read-only MCP stdio adapter и CLI fallback.
- [x] Wireframes: hybrid JSON+TSX contract, pricing reference entity, Dev mode, shareable state, and user-flow graph.
- [x] Wireframes: no permanent review toolbar, real renderer-backed desktop/mobile previews, source product modes, infinite Canvas grid, pinch zoom, semantic folder routes, and target actions kept inside the product screen.
- [x] Wireframes: shared bottom-end Inspector provides purple Component, pink slot, and authored element handoff.
- [ ] Pages.
- [ ] Page inspector и handoff.
- [ ] Storybook read-only ingestion.
- [ ] Figma as context workflows.
- [ ] Design analytics.
- [ ] Hosted preview, comments и collaboration.
- [ ] Multi-platform component contracts.

## Ближайший конкретный шаг

Закрепить единый `DesignLabEntity` schema и watcher/invalidation, затем подключить multilingual embeddings provider к уже работающему context gateway. После этого реализовать Tokens вертикальным срезом: `*.tokens.json` → scanner/normalization/diagnostics → API → UI → watcher → tests. Palette по-прежнему строится как представление color tokens, а не отдельный источник цветов.
