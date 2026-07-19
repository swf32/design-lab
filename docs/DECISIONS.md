# Product and architecture decisions

Решения в этом файле считаются актуальными, пока явно не заменены более новым решением.

## D-001 — Единая локальная территория Design Lab

**Статус:** принято, 2026-07-16.

Корневая директория workspace является общей локальной территорией продукта. В ней приложение `design-lab/` и хранилище `projects/` лежат рядом и не смешиваются.

Новый Project всегда создаётся в `projects/<slug>/`. Пользователь указывает только название и не выбирает родительскую директорию. Служебный registry хранится внутри приложения в `design-lab/.designlab/projects.json`.

Следствия:

- код приложения, проекты и библиотеки визуально и структурно разделены;
- `projects/`, `libraries/` и `.designlab/` не входят в git-историю самого приложения;
- интерфейс не просит пользователя управлять абсолютными путями;
- подключение существующего репозитория означает миграцию в каноническую структуру, а не настройку путей.

## D-002 — Автоматическое обнаружение относится ко всем основным сущностям

**Статус:** принято, 2026-07-16.

Автоматическое обнаружение обязательно для Tokens, Palette, Fonts и Components.

- Tokens обнаруживаются по поддерживаемым token-файлам.
- Palette строится из color tokens и дополняется необязательными palette metadata.
- Fonts обнаруживаются по font files и дополняются необязательным registry.
- Components обнаруживаются по папкам, exports и соседним preview/docs/stories файлам.

Ни одна из этих сущностей не требует ручной регистрации в глобальном индексе.

## D-003 — Directory panel зависит от активного модуля

**Статус:** принято, 2026-07-16.

Вторая панель не является универсальным просмотрщиком всего репозитория. Она показывает структуру активного project/library в контексте выбранного модуля:

- Components → component folders;
- Tokens → token sets и группы;
- Palette → palette groups и color-token views;
- Fonts → families, files и typography groups.

Общий filesystem browser не входит в текущую продуктовую вертикаль.

## D-004 — Создание Project предшествует редакторам сущностей

**Статус:** принято, 2026-07-16.

Первый продуктовый сценарий — создать или выбрать Project внутри территории Design Lab. Только после выбора Project модули Tokens, Palette, Fonts и Components получают конкретный filesystem scope для автоматического обнаружения и записи.

Создание Project формирует минимальный файловый контракт (`project.json` и каталоги модулей), но не наполняет проект демонстрационными компонентами или другими моковыми данными.

## D-005 — Design Lab задаёт структуру, а не адаптируется к произвольной

**Статус:** принято, 2026-07-16.

Design Lab является структурированным хранилищем дизайн-систем. Project и Library обязаны следовать каноническому файловому контракту продукта. Автоматическое обнаружение работает рекурсивно внутри закреплённых каталогов `components/`, `tokens/`, `palette/`, `fonts/` и других модулей, но не сканирует произвольные пути чужого репозитория.

В интерфейсе не должно быть настройки вроде «укажите директорию компонентов». Существующую дизайн-систему пользователь переносит в формат Design Lab вручную, импортёром или с помощью AI. Постфактум-установка Design Lab означает добавление папки приложения рядом с каноническим `projects/`, а не бесшовное подключение к любой существующей структуре.

## D-006 — Design Lab dogfoods одну редактируемую Library без kernel

**Статус:** принято, 2026-07-16.

`libraries/design-lab-system/` является единственным источником токенов, палитры, шрифтов, иконок и переиспользуемых UI-компонентов самого приложения. Design Lab одновременно импортирует эту Library как code dependency и показывает её через обычные scanners. Зеркальной копии под `design-lab/src/` нет.

Специальный immutable kernel и запасная дизайн-система не создаются. Пользовательская кастомизация может сломать интерфейс Design Lab; это принятый риск. Восстановление выполняется удалением повреждённой Library и повторной установкой чистой стандартной `design-lab-system`.

## D-007 — Assets объединяет медиа и иконки; Components использует папочный контракт

**Статус:** принято, 2026-07-16.

Отдельного модуля Icons нет. `assets/` хранит изображения, видео, SVG и code-native иконки в TSX. Внутри него допустимы произвольные категории, например `assets/icons/navigation/`.

Component является директорией, а не одиночным TSX-файлом. Минимальный идентификатор — соседний `component.json`; рядом могут находиться implementation, types, styles, preview, stories/states, README и CHANGELOG. Папки выше Component являются произвольно вложенными категориями (`atoms/`, `molecules/`, `organisms/` или любая собственная классификация).

Directory panel строит семантическое дерево. Для Components он показывает категории и Component nodes, скрывая внутренние файлы до открытия workbench. Для Tokens он показывает token groups и tokens по их paths, а не содержимое CSS/JSON как обычные файлы.

## D-008 — Illustration Preview и реальный Playground разделены

**Статус:** принято, 2026-07-16.

Component preview является упрощённой token-based иллюстрацией для быстрого узнавания сущности. Он не импортирует реальный Component, не обязан сохранять production dimensions и не принимает реальное interaction. Optional motion может условно инсценировать переход между двумя illustrative states. Его задача — визуально объяснить, над чем пользователь будет работать.

Workbench Canvas, напротив, рендерит настоящий Component и предоставляет controls для props, variants и states. Canvas поддерживает dark grid, light grid и настраиваемый solid background. Повторяемые headers, background controls, cards, dropdowns, tree items, dialogs и sidebars оформляются как компоненты `design-lab-system`.

## D-009 — Workbench организован по самостоятельным stories

**Статус:** принято, 2026-07-16.

Workbench не смешивает все axes компонента в общей матрице карточек. Каждый показательный сценарий получает отдельный полноширинный Story Canvas: например `Variants`, `Sizes`, `Full width`, `Loading`, `States and composition`. Внутри одного Canvas сравниваются только связанные значения, расположенные в общем визуальном поле.

Story может быть интерактивной, если interaction объясняет реальное поведение компонента. Эталонный Loading story переводит Button из ready в loading на две секунды и возвращает обратно. Документация из README рендерится как Markdown, а не выводится как plain text. Dark и light grid являются шахматной подложкой; solid mode использует встроенный в Design Lab color picker, а не системный picker браузера.

## D-010 — Locale, theme и Canvas являются системными preferences

**Статус:** принято, 2026-07-16.

Английский является текущим product locale Design Lab. Интерфейсные строки компонентов не хардкодятся: они разрешаются через typed i18n dictionary с английским fallback. Русский словарь служит вторым подготовленным locale; будущие French и другие locales добавляются тем же контрактом. Язык пользовательской документации не ограничивается product locale.

Dark и light являются semantic token modes одной дизайн-системы. Выбранная theme сохраняется локально; переключение на light устанавливает light grid как исходный Canvas mode, переключение на dark — dark grid. Canvas mode и solid color также сохраняются глобально и применяются одновременно к Playground и всем Story Canvas текущего и других компонентов.

`COMPONENT_RULES.md` является общим component lifecycle contract. `AGENTS.md` и `CLAUDE.md` ссылаются на него, поскольку единого автоматически распознаваемого формата наподобие `.rules` для обоих агентов нет.

## D-011 — Theme modes принадлежат данным дизайн-системы

**Статус:** принято, 2026-07-16.

Theme интерфейса Design Lab и выбранный mode просматриваемой дизайн-системы независимы. Token set объявляет `defaultMode`, базовые values и частичные overrides в `themes.<mode>.tokens`. Scanner нормализует их в единый `values[mode]` для каждого Token с наследованием базового значения.

Tokens, Palette и Fonts используют общий Tab Switcher. Tokens всегда показывают resolved value выбранного mode; color token дополнительно показывает компактный swatch. Palette строит карточки из тех же resolved color values. Fonts показывает typography tokens и применяет mode-specific family, weight и line-height к specimen, не смешивая font registry с typography token source of truth.

## D-012 — Context и integration stories не являются variants

**Статус:** принято, 2026-07-16.

Story получает явный тип: `variant`, `state`, `behavior`, `context`, `integration` или `accessibility`. Название описывает проверяемый сценарий, а не внутреннее устройство компонента.

`context` показывает реальный компонент внутри характерного родителя, когда без окружения нельзя проверить геометрию, clipping, hover, focus или responsive behavior. `integration` показывает контракт нескольких production-компонентов, например совместное управление шириной соседних sidebar. Такие композиции не добавляются в `variants` компонента.

Workbench обязан рендерить реальный компонент. Наличие `*.stories.ts` без исполняемого представления в Workbench не считается завершённой историей.

## D-013 — Контент является частью проверки компонента

**Статус:** принято, 2026-07-16.

Компоненты, чья геометрия или behavior зависят от наполнения, получают product-like fixtures с реалистичными названиями, иерархией, metadata и различной длиной значений. Пустые прямоугольники и равномерно короткие подписи недостаточны для sheet, modal, menu, tree, table и sidebar.

Когда плотность может выявить дефект, создаётся отдельная `content-stress` context story. В ней должно быть достаточно элементов для overflow, а проверяемый scroll owner, фиксированные области, clipping, scrollbar, focus и overlays должны быть явно наблюдаемы. Fixtures остаются детерминированными и не требуют live backend.

## D-014 — Каталог исполняет preview из manifest

**Статус:** принято, 2026-07-16.

Component catalog рендерит конкретный `*.preview.tsx`, объявленный в `component.json`. Ручной switch по известным component ids не заменяет automatic discovery: он скрывает authored previews и превращает неизвестные компоненты в одинаковые карточки.

Generic thumbnail используется только при отсутствии или ошибке загрузки declared preview и должен быть визуально отличим от authored preview. Наличие preview-файла считается завершённым только после проверки его фактического отображения в catalog card.

## D-015 — Взаимоисключающий выбор унифицирован в Tab Switcher

**Статус:** принято, 2026-07-16.

Выбор interface theme, mode просматриваемой дизайн-системы и Canvas background использует один production-компонент `TabSwitcher`. Компонент принимает произвольные строковые values и content options; визуальные варианты `segmented` и `toggle` не создают отдельные сущности дизайн-системы.

`TabSwitcher` является общим selection control с `aria-pressed`, а не всегда WAI-ARIA tabs: interface theme и Canvas background не управляют связанными `tabpanel`. Настоящий tabbed content в будущем должен получать отдельную семантику tabs поверх того же визуального языка или отдельный компонент, если keyboard contract materially отличается.

## D-016 — Component axes проверяются матрицей; fenced code рендерится компонентом

**Статус:** принято, 2026-07-16.

Если public axis применим к нескольким variants, Workbench обязан явно показать все релевантные сочетания. Для `TabSwitcher` размеры `small` и `medium` поддерживаются и проверяются отдельно для `segmented` и `toggle`. Toggle использует единый перемещаемый thumb; отдельные option buttons являются прозрачными hit areas и не повторяют segmented styling.

Markdown inline code остаётся коротким текстовым выделением. Fenced code blocks рендерятся production-компонентом `CodeBlock` с language label, внутренним overflow и копированием полного source. Dark Canvas grid использует нейтральные charcoal tokens без цветового оттенка.

## D-017 — Animated Preview является optional manifest capability

**Статус:** принято, 2026-07-16.

Компонент может объявить `previewMotion` в `component.json`. Catalog запускает authored motion только у opted-in preview на hover или keyboard focus реальной Component Card; blur/leave возвращает deterministic baseline. Generic fallback и preview без metadata остаются статичными.

Motion показывает illustrative state transition, reveal, dismiss или короткую sequence, но не импортирует production Component и не исполняет его логику. Autoplay и infinite loop запрещены. Duration и easing используют общие `transition.preview` и `easing.preview`; при `prefers-reduced-motion` остаётся static baseline. Эталонная реализация — Tab Switcher preview, синхронно меняющий выбранное состояние двух miniature controls.

## D-018 — Иконки компонентов принадлежат Assets

**Статус:** принято, 2026-07-16.

При создании или изменении Component новая продуктовая иконка добавляется как переиспользуемый code-native vector asset в канонический `assets/icons/` активной Library и экспортируется через assets barrel. Implementation, preview и stories импортируют один и тот же asset.

Inline SVG path data внутри компонента или preview, CSS-рисование и emoji/произвольные Unicode glyphs не используются как замена отсутствующей иконки. Так иконки остаются обнаруживаемыми, тематизируемыми, консистентными и пригодными для повторного использования.

## D-019 — Navigation disclosure и Workbench Canvas имеют единых владельцев

**Статус:** принято, 2026-07-16.

Application Sidebar и Directory Panel делят одну сохраняемую ширину navigation region. Hover disclosure меняет две grid-колонки синхронно с одинаковыми duration и easing: Application Sidebar расширяется ровно на ту величину, на которую Directory Panel сужается. Workspace при этом не меняет ширину. Прямой resize меняет общую ширину navigation region и на время pointer interaction отключает transition; `prefers-reduced-motion` также отключает disclosure motion.

`WorkbenchPlayground` является production-организмом и единым владельцем live Canvas, Canvas Background Control, controls rail и optional event feedback. Canvas по умолчанию использует `comfortable` padding, поэтому `width: 100%` у просматриваемого компонента заполняет безопасную content area, а не упирается в физические края Canvas. `none` применяется только когда edge behavior является предметом проверки.

Boolean controls в Design Lab используют системный `Checkbox`, а не browser-default appearance. Компонент сохраняет native input semantics, поддерживает checked, indeterminate, disabled и theme-aware token styling; внутри плотных `ControlField` используется размер `small`.

## D-020 — Preview не повторяет metadata карточки

**Статус:** принято, 2026-07-16.

Component Card показывает имя компонента; source entry и количество variants перенесены из визуальной карточки в catalog/detail metadata. Authored preview не повторяет имя, категорию, manifest variants или другую metadata как собственный заголовок, badge или легенду; вся его площадь используется для узнаваемой иллюстрации.

Текст допустим, когда он является частью изображаемого UI — например label поля, значение, helper text или пункт меню — либо без него нельзя распознать демонстрируемое поведение. Это отделяет содержимое компонента от описания компонента.

## D-021 — Folder selection фильтрует module view; Assets имеет канонический старт

**Статус:** принято, 2026-07-16.

Directory Panel разделяет selection и disclosure. Клик по реальной папке одновременно выбирает её как scope правой области и меняет её expanded/collapsed state; повторное сворачивание не сбрасывает выбранный scope. Для Components, Tokens и Assets над filesystem groups отображается code-owned virtual folder `All`. Она не существует на диске, не имеет disclosure state и возвращает полный inventory.

Components фильтруются по component directory, Tokens — по semantic token path, Assets — по asset directory. При переходе между modules или sources scope сбрасывается на `All`; открытие Component detail и возврат сохраняют выбранную component folder.

Новый Project всегда получает пустые `assets/icons/`, `assets/images/` и `assets/videos/`. Это рекомендуемый верхнеуровневый порядок, а не запрет на пользовательскую вложенность. Assets scanner обнаруживает SVG/TSX icons, raster images и video files внутри канонического `assets/`; `AssetCard` показывает filesystem identity и type, а raster preview выдаётся через path-contained local API. Отдельного Icons module по-прежнему нет.

## D-022 — TSX icon preview нормализуется в SVG без исполнения модуля

**Статус:** принято, 2026-07-16.

Assets обязан показывать реальную геометрию SVG и code-native TSX icons. Для этого local Node.js renderer извлекает единственный SVG root из TSX icon, нормализует `size`, spread props, `currentColor` и статические SVG attributes, после чего отдаёт результат как `image/svg+xml`. React-модуль пользователя не импортируется и не исполняется внутри Design Lab.

Renderer отклоняет scripts, event handlers, `foreignObject`, embedded objects, внешние references и неподдерживаемые dynamic JSX expressions. Невалидная или более сложная TSX-иконка остаётся обнаруженной сущностью, но `AssetCard` показывает type fallback вместо broken preview. Такой контракт одинаково работает для собственной Library, Projects и будущих Libraries, не требуя build-time import map.

## D-023 — Module navigation использует path-based deep links

**Статус:** принято, 2026-07-18.

Каждый module имеет устойчивый корневой URL `/<module>`. Вложенные сегменты адресуют filesystem folder или entity внутри активного Project/Library: `/components/atoms/navigation/SidebarTab`, `/components/atoms/navigation` и `/assets/icons/TokensIcon`. Source остаётся отдельным сохраняемым workspace context и не кодируется в URL на этом этапе.

Route identity строится из канонического semantic/filesystem path, а не из внутреннего id. URL segments кодируются независимо, direct load и browser Back/Forward восстанавливают module, folder scope и entity selection. Сопоставление входной ссылки не зависит от регистра; после успешного разрешения URL нормализуется к каноническому регистру. Для Assets каноническая ссылка скрывает расширение, но resolver принимает и полный filename для совместимости.

Folders открывают отфильтрованный module view. Components открывают Workbench, а Assets и Tokens сохраняют module catalog и выделяют адресованную сущность. Тот же navigation contract должен использоваться будущими Wireframes, Pages и другими entity modules без отдельных router conventions.

## D-024 — Component Preview является identity specimen

**Статус:** принято, 2026-07-19.

Authored preview проектируется только после чтения реального implementation, styles/tokens, manifest и representative Workbench story или application consumer. Название компонента не является достаточным основанием для выбора силуэта: preview обязан сохранять фактическую orientation, icon asset, label relationship, control shape, border/surface hierarchy и defining state treatment.

По умолчанию карточка показывает один крупный representative specimen. Дополнительный specimen допускается, только если без него нельзя объяснить одну главную ось контракта, например collapsed/expanded или unchecked/checked. Preview не превращается в миниатюрный экран: sidebar, dialog, toolbar, overflow controls, badges и другой context не добавляются, если они не принадлежат самому компоненту. Масштабировать anatomy можно, изобретать новую — нельзя.

Геометрия считается частью качества preview. Повторяющиеся элементы используют общую alignment model; связанные labels, control edges и центры задаются явными guide lines. Заявленное выравнивание проверяется после рендера в настоящей Component Card в dark и light themes, при необходимости через bounding boxes или pixel inspection, а не только чтением CSS.

Component Card владеет единым safe area для authored previews: `spacing.4` inline и `spacing.3` block. Preview root не отменяет этот inset отрицательными margins или переполненным `width: 100%`; full-width specimens включают собственные padding и border в геометрию через `border-box`. Edge-to-edge presentation требует явного shared modifier и допускается только когда касание края является defining behavior компонента.

Калибровочные примеры:

- Checkbox показывает реальные boolean states, а checkmark оптически центрируется внутри box.
- Input может складывать text и search в левую колонку, а textarea — в правую; первые labels и конечные нижние края совпадают.
- Sidebar Tab показывает собственные collapsed/expanded silhouettes без изображения всего Sidebar.
- Source Select и Semantic Tree Item остаются full-width specimens, но их внешние края показывают общий card safe area.

## D-025 — MCP и CLI являются adapters одного AI context gateway

**Статус:** принято, 2026-07-19.

Ранее внешний MCP был отложен до стабилизации внутреннего context layer. После продуктового решения первый локальный read-only MCP перенесён в ранний срез, но не становится отдельным источником логики: stdio server и CLI вызывают один `contextGateway`, который читает канонические Project/Library scanners.

Обязательный агентский цикл: search by intent → сравнение descriptions и relevance → `get` по stable ref → использование проверенных name/import/props/variants/states/docs. Search намеренно скрывает имя сущности, чтобы агент не принимал решение только по угаданному naming. `get` раскрывает полную filesystem-backed карточку.

Stable external identity имеет форму `<source-id>:<kind>:<entity-id>`. Numeric index остаётся удобным указателем внутри конкретной ревизии и scope, но не используется как долговечная ссылка.

Первый MCP read-only и не предоставляет arbitrary file reads, shell или write tools. Remote HTTP, auth и подтверждаемые writes являются отдельным будущим решением. Текущий weighted lexical + fuzzy retrieval является явным fallback; multilingual embeddings добавляются производным слоем, не меняя MCP/CLI contracts.

## D-026 — Directory navigation имеет включаемые UX-возможности

**Статус:** принято, 2026-07-19.

Directory Panel по умолчанию показывает virtual rows и папки верхнего уровня, а реальные папки начинает в collapsed state. Это уменьшает начальный шум, не меняя filesystem tree и выбранный folder scope. Поиск включён по умолчанию, фильтрует текущий module tree и временно показывает совпавшие сущности вместе с их ancestor folders, не изменяя сохранённый disclosure state.

Semantic Tree Item разделяет четыре независимых действия: disclosure, selection, icon color и future actions. Icon coloring и trailing More action включены в Directory Panel по умолчанию, но являются отключаемыми props. More появляется только при hover/focus и предоставляет slot для будущего action menu.

Цвет иконки является пользовательской presentation metadata, а не частью filesystem entity и не изменяет исходные design tokens. По умолчанию override хранится в localStorage по составному ключу source, entity kind и canonical path; consumer может отключить persistence или передать controlled colors/callback. Общий Color Picker владеет spectrum input, presets, HEX editing и nullable reset.

## D-027 — Component Card является borderless preview surface

**Статус:** принято, 2026-07-19.

Component Card больше не добавляет отдельный footer к высоте authored preview. Карточка имеет ту же высоту, что и preview area; название компонента располагается absolute overlay снизу поверх token-driven gradient. Source filename и variant count визуально не рендерятся. Legacy `entry` и `meta` props временно сохраняются для совместимости.

Карточка не имеет border и визуального hover treatment: hover не меняет position, transform, fill, border или shadow. У opted-in animated preview тот же pointer hover остаётся только shared trigger для внутреннего illustrative motion. Keyboard focus сохраняет явный accent outline, а selected state меняет только цвет overlay title без изменения геометрии.

Все углы Component Card используют semantic `radius.card = 12px`. Preview safe area остаётся `spacing.4` inline и `spacing.3` block. Component catalog использует `spacing.1` (`4px`) между карточками.

## D-028 — Стили имеют локального владельца

**Статус:** принято, 2026-07-19.

Каждый production Component владеет соседним `ComponentName.scss` и импортирует его из `ComponentName.tsx`. Library не публикует общий `components/styles.css`, а Design Lab не подключает package-wide component stylesheet. Scanner автоматически обнаруживает implementation-named `.scss`, `.sass` или `.css` рядом с manifest и возвращает его как `style`; явное поле `style` в manifest допускается для нестандартного имени. Workbench показывает этот ref в полном discovered file inventory, поэтому style является видимой частью Component entity, а не скрытой build-деталью.

Catalog preview является отдельным артефактом и хранит `.preview-*` CSS непосредственно в `ComponentName.preview.tsx` как token-driven `String.raw` stylesheet. Preview CSS не попадает в production SCSS и загружается только вместе с authored preview module. Shared Component Card отвечает лишь за geometry, safe area и trigger contract; конкретная preview-анимация остаётся у самого preview.

В приложении Design Lab глобальный stylesheet ограничен reset/root/body rules. `App`, `ModuleView` и `SettingsView` импортируют соседние owner-specific SCSS; новые локальные view styles не добавляются в единый `main.scss`. Переиспользуемый UI и его стили по-прежнему принадлежат единственной Library `libraries/design-lab-system/`.

SCSS и CSS внутри preview `String.raw` форматируются одной репозиторной командой `npm run format:styles`. `npm run check:styles` входит в root build/test и отклоняет compressed style sources и повторные селекторы в одном cascade context, чтобы читаемость и предсказуемость каскада не зависели от ручной дисциплины.

## D-029 — Application views не являются Library Components

**Статус:** принято, 2026-07-19.

`ModuleView` и `SettingsView` являются route-level композициями Design Lab: они владеют загрузкой данных, application state и сборкой нескольких production Components. Они остаются в приложении, но располагаются в `design-lab/src/views/`, а не в вводящем в заблуждение `src/components/`.

В `design-lab/src/components/` не поддерживается параллельная коллекция UI. Любой переиспользуемый shell pattern или control принадлежит `libraries/design-lab-system/components/`; app-level `views` только связывают Library, API и navigation в конкретные экраны продукта.

TS/TSX/MJS исходники приложения и Library форматируются через `npm run format:code`, а `npm run check:code` входит в root build/test. Общая `npm run format` последовательно форматирует code и styles, включая CSS внутри preview `String.raw`.

## D-030 — Component registration является производным от файловой системы

**Статус:** принято, 2026-07-19.

Пользователь создаёт произвольно вложенную category folder — она сразу появляется в Directory Panel, даже пока пуста. После добавления Component directory и соседнего `component.json` scanner автоматически строит entity path и category из фактического filesystem path. Внутренние директории уже обнаруженного Component не смешиваются с category navigation. `category` не хранится в manifest вторым источником истины. Перемещение папки сразу создаёт новый канонический path и URL; legacy redirects, aliases и ручные migration tables не поддерживаются.

Default `design-lab-system` сохраняет Atomic Design как верхний уровень (`atoms/`, `molecules/`, `organisms/`) и добавляет semantic subfolders внутри каждого уровня. Эта структура является примером Library authoring, а не ограничением scanner: пользовательские Libraries могут применять собственную вложенность.

Component catalog группирует карточки по полному category path относительно открытой папки. Корень показывает, например, `atoms / actions`, папка `atoms` — `actions`, а конечная category сразу показывает карточки без повторяющего её заголовка. Ни имена групп, ни глубина вложенности в UI не хардкодятся.

Package barrel `components/index.ts` остаётся для удобного `import { Button } from '@design-lab/system/components'`, но является удаляемым generated artifact. Генератор рекурсивно читает manifests и их adjacent `entry`, сортирует exports и запускается перед dev/build/test; dev watcher обновляет barrel при filesystem changes. Компоненты никогда не перечисляются в генераторе или package scripts вручную.

## D-031 — Semantic component colors используют общий пятицветный контракт

**Статус:** принято, 2026-07-19.

Компоненты, которым нужен публичный color axis, используют единый набор `default | accent | success | warning | danger`. `default` строится из нейтральных surface/text tokens, `accent` — из `color.accent.primary`, а статусные роли — из `color.status.success`, `color.status.warning` и `color.status.danger`. Каждая роль имеет dark/light mode values в каноническом token source; component SCSS не хранит локальные HEX-значения.

Первое полное применение контракта — `RadioButton`, `Slider` и `Chip`. RadioButton сохраняет native radio semantics, Slider — native range semantics с HeroUI-подобной anatomy `label/output + track/fill/thumb`, Chip остаётся неинтерактивной metadata surface с вариантами `primary`, `secondary`, `tertiary` и `soft`. Все три автоматически обнаруживаются, публикуются generated barrel, имеют illustrative preview, интерактивный Playground, сфокусированные stories, README и append-only changelog.

## D-032 — Component Reference и Story runtime производны от соседних файлов

**Статус:** принято, 2026-07-19.

Component Workbench показывает Component Reference сразу после заголовка: канонический package import через production `CodeBlock`, полный discovered file inventory и четыре набора прямых связей. `Uses` / `Used by` строятся из static imports production entry, а `Examples use` / `Used in examples by` — из соседнего manifest-declared story module с вычитанием production dependencies. `import type` не создаёт runtime relationship. Связи ограничены активным Project/Library и не пытаются включать application consumers на этом этапе.

Preview imports production Components не считаются dependency graph: это нарушение non-interactive illustrative preview contract и отдельный scanner diagnostic. Relations остаются прямыми; transitive graph не подмешивается в detail.

Story metadata и реальный JSX renderer принадлежат соседнему `*.stories.ts(x)`, который экспортирует `stories` и `renderStoryExample`. Workbench автоматически находит этот module по filesystem directory. Центральные `ButtonStories`, `FocusedStories`, component id lists и per-component story switches из `ModuleView` удалены; добавление нового Component со Story не требует правки application source.

## D-033 — Workbench Back следует пользовательской history, а не filesystem parent

**Статус:** принято, 2026-07-19.

Workbench Back восстанавливает предыдущее состояние навигации Design Lab. Component, открытый из `All`, возвращается в `All`; Component, открытый из конкретной folder, возвращается в неё; переход по `Uses`, `Used by` или example relation возвращается к исходному Component. Кнопка не вычисляет destination из category текущей entity, потому что filesystem parent не описывает пользовательский путь.

Каждый внутренний `pushState` помечает entry как имеющий предыдущий Design Lab state. `replaceState` при canonicalization сохраняет эту метку, а browser `popstate` остаётся единственным механизмом восстановления module, folder scope и entity selection. У прямой deep link без предыдущего внутреннего entry Workbench Back безопасно открывает корень активного module вместо ухода с приложения.

## D-034 — Module Header отделяет navigation action от page identity

**Статус:** принято, 2026-07-19.

Workbench history action стабильно называется `Back` / `Назад`: его destination определяется предыдущим Design Lab history entry и не может правдиво называться `Components`, category или filesystem parent. Destination-specific label остаётся допустимым только для действий с неизменным назначением, например закрытия Settings обратно в workspace.

`ModuleHeader` не изображает Back как текстовую ссылку. Он использует production `Button` и канонический `ArrowLeftIcon`, сохраняет минимум `size.control.medium` по высоте, видимый focus и отдельную structural navigation zone. Page identity остаётся главным визуальным слоем: semantic eyebrow объясняет scope, title называет текущую сущность, а count, source metadata и actions образуют тихую trailing utility zone. На узкой ширине utilities переносятся отдельным рядом, не уменьшая hit target и не скрывая название действия.

## D-035 — AI semantics принадлежат каноническим сущностям

**Статус:** принято, 2026-07-19.

Intent retrieval не поддерживает отдельную ручную search database. Component semantics живут в `component.json`; Token semantics — на base token leaves в `*.tokens.json`; Font semantics — у family в `fonts.json`; Asset semantics — в автоматически обнаруживаемом соседнем `<AssetStem>.meta.json`. Basic filesystem discovery не зависит от optional metadata, но default `design-lab-system` предоставляет authored English descriptions и usage guidance для всех текущих сущностей.

Общий semantic vocabulary включает `description`, `aliases`, `useWhen`, `avoidWhen` и `tags`. `avoidWhen` является настоящим отрицательным ranking signal, а не пассивной документацией. Search остаётся компактным и не раскрывает entity name или тяжёлые relations; отдельный `get` возвращает проверенные details, canonical imports и Component relations.

Code-native icon asset не требует ручной export registration. `assets/icons/index.ts` является удаляемым generated artifact, строится рекурсивно при dev/build/test и получает import root из Library manifest. MCP и CLI возвращают готовый canonical icon import для TSX assets.

Локальный lexical/fuzzy search ранжирует на языке authored metadata и пользовательского запроса. Multilingual embeddings остаются отдельным derived provider: они не меняют filesystem contracts и не должны подменять отсутствующую entity semantics попыткой угадать назначение только по filename или value.

## D-036 — Mobile shell использует modal navigation drawer

**Статус:** принято, 2026-07-19.

Desktop Design Lab сохраняет три визуальные области: Application Sidebar, Directory Panel и Workspace. На ширине до `760px` первые две области объединяются в один modal navigation drawer поверх одноколоночного Workspace. Постоянный workspace header открывает drawer; явный Close, backdrop и Escape закрывают его. Выбор module, settings, source, folder или entity закрывает drawer и возвращает пользователя к выбранному контенту. Desktop resize и hover disclosure на телефоне отключены.

Мобильный shell использует `100dvh`, safe-area insets и один вертикальный scroll owner внутри активного Module View, Settings View или Workbench. Узкие каталоги имеют одну колонку, landscape — две; широкие token и props tables переходят в stacked rows. Navigation и header controls получают touch area не меньше `44px`, search input использует мобильный читаемый размер, а document и workspace не создают горизонтальный overflow.

Dark и light modes сохраняют один layout contract. Motion drawer использует общий transition rhythm и полностью отключается при `prefers-reduced-motion`.
