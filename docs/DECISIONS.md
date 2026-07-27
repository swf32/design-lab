# Product and architecture decisions

Решения в этом файле считаются актуальными, пока явно не заменены более новым решением.

## D-001 — Единая локальная территория Design Lab

**Статус:** частично заменено D-084/D-085 для embedded mode; canonical greenfield остаётся.

Корневая директория workspace является общей локальной территорией продукта. В ней приложение `design-lab/` и хранилище `projects/` лежат рядом и не смешиваются.

Новый Project всегда создаётся в `projects/<slug>/`. Пользователь указывает только название и не выбирает родительскую директорию. Служебный registry хранится внутри приложения в `design-lab/.designlab/projects.json`.

Следствия:

- код приложения, проекты и библиотеки визуально и структурно разделены;
- `projects/`, `libraries/` и `.designlab/` не входят в git-историю самого приложения;
- интерфейс не просит пользователя управлять абсолютными путями;
- для canonical greenfield сохраняется `projects/<slug>/`; существующий repository подключается
  in place через D-084/D-085 и не обязан мигрировать.

## D-002 — Автоматическое обнаружение относится ко всем основным сущностям

**Статус:** принято, 2026-07-16; D-085 расширяет discovery на configured mounts.

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

**Статус:** заменено D-084/D-085 для existing repositories; применяется к Design Lab-authored roots.

Design Lab остаётся структурированным хранилищем для собственных authored entities. Canonical
greenfield Project/Library следуют файловому контракту продукта. Existing repository подключается
через versioned relative mounts: scanner не обходит весь диск и не принимает absolute paths, но
может читать доказуемые source roots вне canonical имён папок.

В интерфейсе по-прежнему нет developer-form «введите пути руками». Read-only onboarding сам
находит mounts, показывает понятную сводку и требует подтверждение перед записью integration config.
Перенос в canonical layout остаётся отдельной optional migration, а не ценой установки.

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

`WorkbenchPlayground` является production-организмом и единым владельцем live Canvas, Canvas Background Control, optional controls rail и optional event feedback. Если `controls` не переданы, rail не рендерится и Canvas занимает всю ширину — пустую колонку не оставляем. Canvas по умолчанию использует `comfortable` padding, поэтому `width: 100%` у просматриваемого компонента заполняет безопасную content area, а не упирается в физические края Canvas. `none` применяется только когда edge behavior является предметом проверки.

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

По умолчанию карточка показывает один крупный representative specimen. Небольшой набор из двух–четырёх specimens допускается по одной оси, когда siblings быстрее объясняют defining grammar семейства, например boolean states, collapsed/expanded или asset kinds. Preview не превращается в уменьшенную документационную копию: вторичная metadata, полный production content, alternate API axes и parent context опускаются, если они не помогают узнаванию. Масштабировать anatomy и абстрагировать несущественные детали можно, изобретать новую — нельзя.

Optional preview motion объясняет одну defining state transition, которую static baseline не передаёт сам: selection handoff, focus movement, reveal, dismiss или media emphasis. Motion не служит декором, не меняет геометрию карточки, использует shared preview tokens и сохраняет статичный baseline при reduced motion. Tab Switcher и Input являются калибровкой этого контракта; Asset Card может показывать компактный ряд kind miniatures вместо полного filesystem identity layout.

Геометрия считается частью качества preview. Повторяющиеся элементы используют общую alignment model; связанные labels, control edges и центры задаются явными guide lines. Заявленное выравнивание проверяется после рендера в настоящей Component Card в dark и light themes, при необходимости через bounding boxes или pixel inspection, а не только чтением CSS.

Component Card владеет единым safe area для authored previews: `space.16` inline и `space.12` block. Preview root не отменяет этот inset отрицательными margins или переполненным `width: 100%`; full-width specimens включают собственные padding и border в геометрию через `border-box`. Edge-to-edge presentation требует явного shared modifier и допускается только когда касание края является defining behavior компонента.

Калибровочные примеры:

- Checkbox показывает реальные boolean states, а checkmark оптически центрируется внутри box.
- Input может складывать text и search в левую колонку, а textarea — в правую; первые labels и конечные нижние края совпадают.
- Sidebar Tab показывает собственные collapsed/expanded silhouettes без изображения всего Sidebar.
- Source Select и Semantic Tree Item остаются full-width specimens, но их внешние края показывают общий card safe area.
- Tab Switcher показывает segmented silhouette; card hover может переносить selected segment, чтобы объяснить mutual exclusivity.
- Asset Card может показывать компактный ряд kind miniatures с media band и extension label без полного filesystem identity layout.
- Button и Chip достаточно показывают компактный набор defining variants или tones на одной оси.
- Marketing blocks сохраняют section grammar через abstract bars и surfaces, а не уменьшенный marketing copy.

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

Все углы Component Card используют semantic `corner.card = 12px`. Preview safe area остаётся `space.16` inline и `space.12` block. Component catalog использует `space.4` (`4px`) между карточками.

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

Информационный Chip дополнительно поддерживает категориальные `teal | cyan | violet | orange` tones из `color.category.*`. Они различают peer metadata families и не расширяют semantic control axis RadioButton/Slider. Category tones нельзя подменять `success | warning | danger`: цвет категории не сообщает статус.

## D-032 — Component Reference и Story runtime производны от соседних файлов

**Статус:** принято, 2026-07-19.

Component Workbench показывает Component Reference сразу после заголовка: канонический package import через production `CodeBlock`, полный discovered file inventory и четыре набора прямых связей. `Uses` / `Used by` строятся из static imports production entry, а `Examples use` / `Used in examples by` — из соседнего manifest-declared story module с вычитанием production dependencies. `import type` не создаёт runtime relationship. Связи ограничены активным Project/Library и не пытаются включать application consumers на этом этапе. Последующее D-070 сохраняет те же scanner-derived данные, но переносит file inventory вниз detail и сворачивает relation graph по умолчанию.

Preview imports production Components не считаются dependency graph: это нарушение non-interactive illustrative preview contract и отдельный scanner diagnostic. Relations остаются прямыми; transitive graph не подмешивается в detail.

Story metadata и реальный JSX renderer принадлежат соседнему `*.stories.ts(x)`, который экспортирует `stories` и `renderStoryExample`. Workbench автоматически находит этот module по filesystem directory. Центральные `ButtonStories`, `FocusedStories`, component id lists и per-component story switches из `ModuleView` удалены; добавление нового Component со Story не требует правки application source.

## D-033 — Workbench Back следует пользовательской history, а не filesystem parent

**Статус:** принято, 2026-07-19.

Workbench Back восстанавливает предыдущее состояние навигации Design Lab. Component, открытый из `All`, возвращается в `All`; Component, открытый из конкретной folder, возвращается в неё; переход по `Uses`, `Used by` или example relation возвращается к исходному Component. Кнопка не вычисляет destination из category текущей entity, потому что filesystem parent не описывает пользовательский путь.

Каждый внутренний `pushState` помечает entry как имеющий предыдущий Design Lab state. `replaceState` при canonicalization сохраняет эту метку, а browser `popstate` остаётся единственным механизмом восстановления module, folder scope и entity selection. У прямой deep link без предыдущего внутреннего entry Workbench Back безопасно открывает корень активного module вместо ухода с приложения.

## D-034 — Module Header отделяет navigation action от page identity

**Статус:** принято, 2026-07-19.

Workbench history action стабильно называется `Back` / `Назад`: его destination определяется предыдущим Design Lab history entry и не может правдиво называться `Components`, category или filesystem parent. Destination-specific label остаётся допустимым только для действий с неизменным назначением, например закрытия Settings обратно в workspace.

`ModuleHeader` не изображает Back как текстовую ссылку. Он использует production `Button` и канонический `ArrowLeftIcon`, сохраняет минимум `control.size.m` по высоте, видимый focus и отдельную structural navigation zone. Page identity остаётся главным визуальным слоем: semantic eyebrow объясняет scope, title называет текущую сущность, а count, source metadata и actions образуют тихую trailing utility zone. На узкой ширине utilities переносятся отдельным рядом, не уменьшая hit target и не скрывая название действия.

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

## D-037 — Mobile density и folder navigation разделяют визуальную компактность и touch behavior

**Статус:** принято, 2026-07-19.

На ширине до `760px` компактные desktop-размеры не определяют размер большинства touch targets. Header и основной content получают минимум `16px` боковых gutters; поля ввода имеют высоту минимум `48px` и текст `16px`; tree disclosure и вторичные действия имеют интерактивную область минимум `44px`. D-070 позже делает `TabSwitcher` осознанным исключением с ростом не более 4px. Catalog groups разделяются увеличенным vertical rhythm и явным divider, чтобы filesystem categories не слипались визуально.

У реальной папки Directory Panel есть два независимых действия. Disclosure button только раскрывает или сворачивает потомков и не меняет URL, selection или состояние drawer. Label button выбирает folder scope и выполняет navigation. Это разделение действует для pointer, touch и keyboard и устраняет конфликт, при котором один tap одновременно раскрывал ветку, переходил в папку и закрывал мобильный drawer.

## D-038 — Component Wireframe является lifecycle-состоянием той же filesystem entity

**Статус:** принято, 2026-07-19.

Component не обязан начинаться с production implementation. Папка с `component.json`, `README.md`, `CHANGELOG.md` и typed `ComponentName.playground.tsx` является Component Wireframe со статусом `wireframe`. После выбора направления в ту же папку добавляются implementation, styles, preview и Stories, а status проходит `in-progress` и `ready`. Отдельная сущность, реестр или миграция между component-wireframe и Component не создаются.

Playground и Stories решают разные задачи. Playground сравнивает альтернативные directions, использует общий typed control registry и сохраняет variant, design-system mode и значения controls в shareable URL `/components/<path>/playground`. Stories документируют production behavior и не требуются у wireframe-only entity. Preview остаётся неинтерактивной catalog illustration.

Catalog показывает lifecycle через production Chip. `not-ready` не используется как неоднозначный статус; поддерживаются `wireframe`, `in-progress` и `ready`. Отсутствующий или неизвестный status не блокирует filesystem discovery и создаёт completeness diagnostic.

Playground route намеренно выходит из обычного shell Design Lab. Application Sidebar, Directory Panel и workspace header на нём не рендерятся. Desktop использует только постоянный левый controls rail и полноразмерный Canvas. Mobile открывается на Canvas; полупрозрачная Settings-кнопка у нижнего стартового края вызывает overlay rail, который закрывается через Done, scrim или Escape и возвращает весь viewport результату.

## D-039 — Playground Inspector использует явный DOM handoff contract

**Статус:** заменено D-044, 2026-07-20.

Playground получает общий Inspector в нижнем правом углу. На desktop активный режим показывает hover-preview, а click/tap закрепляет выбранный element и copyable popover. Selection перехватывает pointer/click до product action: inspected button, link или control не меняет state и не выполняет navigation. Движение pointer не сбрасывает закреплённый popover. Когда selection закреплён, следующий click по surface только закрывает popover и не выбирает новую цель; ещё один click создаёт следующий selection. Escape также сначала снимает selection. При включённом Inspector все явно размеченные Component roots сразу получают тихий фиолетовый пунктир толщиной 2px, а named slots — тихий розовый пунктир, чтобы composition была видна до выбора цели. Identity не зависит от interface accent: выбранный Component root получает усиленный стабильный фиолетовый пунктир `color.inspection.component`, named slot — розовый пунктир `color.inspection.slot`, обычный element — нейтральный пунктир. Текстовый kind label дублирует цветовую семантику.

Определение Component не читает приватные поля React Fiber и не пытается считать любой вложенный element частью ближайшего Component. Production root явно распространяет `inspectionAttributes(ComponentName, publicProps)`, а named slot — `slotAttributes(slotName)` из `@design-lab/system/inspection`. Slot владеет caller-supplied subtree, поэтому вложенный SVG path иконки резолвится в ближайший explicit slot; Component identity на unmarked descendants не распространяется. Автор передаёт только безопасный сериализуемый публичный subset без callbacks, credentials и application state; helpers создают общий `data-dl-component` / `data-dl-props` / `data-dl-slot` contract. Поэтому механизм остаётся переносимым на будущие Wireframes и Pages и не зависит от React runtime internals.

Inspector показывает source handoff как production `InspectorCodePopover` с `CodeBlock`. Component превращается в JSX с реальными public props. Настоящий composition slot предпочитает явный authored TSX/HTML из `inspectionSourceAttributes`: Library icon показывает canonical import и `<StarIcon />`, а не результат рендера `<svg><path>`. Только при отсутствии source metadata slot использует HTML fragment без внутренних `data-dl-*` markers. Обычный element превращается в совпавшие authored same-origin CSS declarations. Обычный текстовый `children` не считается slot автоматически; slot marker принадлежит caller-supplied composition region наподобие `leading`, `trailing`, `header` или `footer`. Исходные `width: 100%`, shorthands и `var(--token)` сохраняются; computed pixel geometry и resolved RGB не выдаются за код. Click или keyboard activation копирует весь fragment.

Первым сквозным примером служит production `Button`: Pricing Wireframe вставляет `StarIcon` через настоящий named `leading` slot. Plain label остаётся обычным Button content.

Floating controls не принадлежат scroll geometry rail. Color Picker рендерит palette через portal, выбирает доступную сторону относительно trigger, ограничивается visual viewport и использует mobile touch sizing; открытие palette не создаёт недоступное дополнительное пространство прокрутки.

## D-040 — Fullscreen Playground shell состоит из production Components

**Статус:** принято, 2026-07-19.

Fullscreen Playground не владеет параллельной одноразовой реализацией sidebar или inspection window. Production `PlaygroundControlsRail` предоставляет header, independently scrollable content и optional footer slots и используется приложением как persistent desktop rail и mobile overlay. Production `InspectorCodePopover` владеет kind identity и copyable code presentation через общий `CodeBlock`.

Canvas Background Control удалён из controls rail и закреплён отдельной плавающей surface сверху справа над Canvas. Поэтому настройка визуального поля находится рядом с самим полем, остаётся доступной при закрытом mobile Settings rail и переиспользует существующий production Component.

## D-041 — Page Wireframe использует гибридный source contract и три независимые UX-оси

**Статус:** принято, 2026-07-20.

Page-level Wireframe является отдельной filesystem entity, а не lifecycle-состоянием Component и не Page. Каноническая папка `<source>/wireframes/<category>/<WireframeName>/` содержит `wireframe.json`, соседний typed `<WireframeName>.wireframe.tsx`, optional SCSS, README и CHANGELOG. JSON владеет машиночитаемыми layouts, controls, saved states и user-flow graph; TSX владеет реальным render и может собираться из production Components активной Library. Central renderer registry и entity switch не создаются: scanner обнаруживает manifest рекурсивно, а runtime загружает manifest-declared adjacent entry через build-time glob.

Layout direction, state и flow являются независимыми axes. Layout проверяет другую information architecture, grouping, density, progressive disclosure или placement действий; косметическая смена цвета или radius не считается layout direction. Один saved state обязан воспроизводиться в разных layouts без дублирования данных. State является полным serializable snapshot typed controls; radio, Checkbox и Slider могут временно создать custom state, а точное совпадение значений возвращает saved identity.

User flow является причинно-следственным directed graph. Node ссылается на saved state, edge называет конкретное user action, screen dispatch использует стабильный action id. Node selection меняет state, Preview возвращает к экрану, Canvas поддерживает pan/zoom и видимые keyboard-доступные альтернативы. Layout, state, view и control values сериализуются в shareable route query.

Wireframe открывается fullscreen вне Application Sidebar, Directory Panel и workspace header. Production `WireframeDevPanel` остаётся плавающим слева на desktop и safe-area bottom action на mobile; production `UserFlowCanvas` владеет node/edge presentation, pan и zoom. Эталонная entity `design-lab-system/wireframes/product/Pricing` проверяет три layout-гипотезы, шесть entitlement states и переходы от отсутствующей подписки до полностью купленного token allowance.

У fullscreen Wireframe нет постоянного review toolbar: back, Screen/User flow и копирование share-link находятся внутри полупрозрачного Dev mode, который остаётся единственным внешним navigation/control action. Отдельный Inspector отвечает только за developer handoff и не дублирует review navigation. Каталог и user-flow nodes обязаны показывать один и тот же реальный adjacent renderer через inert `WireframeScreenPreview` там, где affordable по zoom-threshold LOD (D-062); на дальнем zoom допустима metadata-карточка без live-render, но не illustrative/authored thumbnail (`*.preview.tsx`). Каталог использует desktop 16:9, а расширенный responsive и Canvas contract зафиксирован в D-042. Product target actions не дублируются в Dev mode: например, Team seats выбираются на pricing screen, а Dev range моделирует расход включённых токенов.

## D-042 — Wireframe наследует product modes источника и использует бесконечный responsive User Flow

**Статус:** принято, 2026-07-20.

Product theme Wireframe не является interface preference Design Lab и не описывается вручную в `wireframe.json`. Scanner получает modes и resolved token variables из канонических token files активного Project/Library. Dev mode скрывает control при одном mode, использует `TabSwitcher` при двух-трёх и `RadioButton` group при четырёх и более. Выбранный `mode` сохраняется в URL и одинаково scope-ится на fullscreen screen и все renderer-backed previews; каталог использует default mode источника. Поэтому каждый Wireframe получает только modes своего source, а не `dark/light` Design Lab.

State node User Flow является одной graph entity, но показывает рядом две реальные responsive композиции одного renderer: desktop 16:9 и portrait mobile (при zoom ≥ порога full LOD; см. D-062). Virtual preview viewport устанавливает CSS inline-size container, поэтому mobile layout определяется представленным viewport, а не шириной внешнего браузера. Authored coordinates сохраняют topology; `UserFlowCanvas` группирует близкие x-координаты в columns и гарантирует minimum spacing между enlarged nodes и rows. Явная автоматическая нормализация layout может autosave-иться обратно в manifest через write API (D-062); silent runtime-only коррекция без персистенции по-прежнему не записывается.

Canvas не имеет конечной сеточной подложки. Grid рисуется в viewport и вычисляет position/size из текущих pan и zoom, поэтому движется вместе с graph world без видимого края. Pointer pan, two-finger pinch и trackpad pinch принадлежат Canvas; `touch-action: none` и non-passive gesture guards не позволяют жесту масштабировать страницу. Видимые Zoom out, Reset и Zoom in остаются обязательной keyboard/touch альтернативой. Folder route открывает filtered catalog только если Directory item является folder; fullscreen включается исключительно для обнаруженной Wireframe entity.

## D-043 — Fullscreen workbench actions и Inspector являются общими Library Components

**Статус:** принято, 2026-07-20.

Settings, Inspect и Dev mode не поддерживают отдельные application-local button implementations.
Production atom `WorkbenchAction` задаёт общую компактную геометрию: визуальный `24px` pill,
невидимо расширенный `44px` minimum target, theme-independent translucent glass с backdrop blur,
dashed boundary, visible focus и icon/label slots. Viewport positioning остаётся обязанностью shell
consumer. Stable neutral tone принадлежит Settings, stable inspection purple — Inspector, stable
developer orange — Dev mode.

Production organism `WorkbenchInspector` получает явный `surfaceRef` и используется одинаково в
Component Playground и fullscreen Wireframe. Он не инспектирует shell actions за пределами surface,
различает Component/slot/raw element через существующий handoff contract и компонует
`InspectorCodePopover` с `WorkbenchAction`. Application-local `PlaygroundInspector` удалён.

Эталонный Button получает соседний typed Wireframe Playground с тремя направлениями: living mesh,
solid primary и outline. Общие controls меняют square/soft/maximum radius, size, width, disabled и
motion. Mesh использует три движущихся token-driven blob слоя, standard mask declarations и
Safari-prefixed `-webkit-mask-*`; `prefers-reduced-motion` отключает ambient animation.

## D-044 — Inspector строит handoff автоматически из TSX и исходного SCSS

**Статус:** принято, 2026-07-20.

Wireframe и Component authoring не включает Inspector-разметку. Review-build AST transform
разрешает обычные static TSX imports через рекурсивно обнаруженные `component.json`, оборачивает
реальные Component callsites только в React context boundaries и получает named slots из manifest
props с `type: "slot"` или `slot: true`. Каждый native JSX host автоматически регистрирует
source id, file и line в памяти. Production DOM не получает постоянных `data-dl-component`,
`data-dl-props`, `data-dl-slot` или source-string attributes; временные outline attributes создаёт
сам Inspector только в активном review mode. React Fiber не читается.

Component и slot handoff берётся из точного authored callsite вместе с реально используемыми static
imports. Поэтому `leading={<StarIcon />}` автоматически показывает canonical icon import и JSX, а
не rendered `<svg><path>` и не строку, продублированную автором Wireframe.

Raw element использует DOM только как адрес выбранного host. Источником styles является Node:
source location ведёт к импортированному `.scss` / `.css`, SCSS parser сопоставляет authored
selectors и возвращает source fragment с file/line. `$variables`, `@use` / `@import`, mixin calls,
nesting, shorthands, percentages и `var(...)` сохраняются. CSSOM, computed pixels и resolved colors
не выдаются за исходный код.

## D-045 — Source является частью URL identity, а не только сохранённым session state

**Статус:** принято, 2026-07-20. Заменяет утверждение из `D-023` о том, что source не кодируется в URL.

Маршрут получил вид `/<module>/<sourceId>/<path>` вместо `/<module>/<path>`. Причина: как только в
workspace существует больше одной Library/Project с одинаковым filesystem path (например,
`atoms/actions/Button` в двух дизайн-системах, построенных по одной Atomic Design конвенции),
активный source, хранимый только в `localStorage`/React state, делает скопированную ссылку
недетерминированной — она резолвится против того, что выбрано в браузере открывающего, а не против
того, что имел в виду автор ссылки.

`navigate()` теперь всегда пишет текущий (или явно переданный при переключении source) `sourceId` в
URL. Прямая замена `activeProjectId` в обход `navigate()` — первичная загрузка списка sources,
создание нового Project, восстановление истории через `popstate` — канонизирует URL отдельным
эффектом-реконсилиатором, так же как уже канонизируется filesystem path сущности. `popstate`
восстанавливает активный source, а не только module и path. Locally-scoped костыль `?source=` у
Wireframes удалён — он был обходным решением ровно этой проблемы для одного module и больше не
нужен.

Старые ссылки без `sourceId` в пути продолжают открываться текущим активным/сохранённым source, как
раньше — они не ломаются, а канонизируются к полному пути при первом клиентском переходе. Полный
разбор мотивации и связанных архитектурных пробелов — `docs/12-collaboration-and-deployment.md`.

## D-046 — Deployment — это спектр, сервер не является обязательным условием

**Статус:** принято, 2026-07-20.

Design Lab не проектируется как единственно «local-first single-user tool» или единственно
«hosted multi-user product» — обе формулировки описывают одну и ту же систему в разных точках
одного спектра, без переключения формата данных между ними: чистый локальный режим (один дизайнер,
ничего не хостится, передача разработчику — обычные файлы репозитория), гибридный режим (хостед-копия
обновляется от `git push`, локальная машина продолжает работать с тем же репозиторием и может
частично обращаться к хостед-серверу за данными реального времени) и командный режим без сервера
(несколько человек независимо запускают Design Lab локально против одного git-репозитория; базой
данных становится сам GitHub — коммитящиеся файлы, увиденные после `git pull`).

Следствие: любая будущая capability, требующая координации между несколькими людьми (комментарии,
статусные сообщения, будущие уведомления), обязана иметь работающий file-backed fallback без
сервера — тот же контракт данных, что и в хостед-режиме, просто без push-доставки в реальном
времени. Сервер не становится вторым источником истины и не хранит данные, недостижимые из обычного
git checkout.

## D-047 — Обновление Design Lab не должно инвалидировать уже существующие Project/Library

**Статус:** принято, 2026-07-20.

Поскольку продукт активно развивается и рассчитан на использование месяцами и годами, выпущенное
обновление Design Lab не должно превращать валидный `component.json`/`wireframe.json`/`library.json`/
`project.json` с текущим `schemaVersion` в невалидный без явного, обратимого миграционного шага.
Новое обязательное поле в будущей версии схемы не добавляется без сопутствующей миграции; схема
версионируется явным бампом `schemaVersion`, а перевод существующих файлов на новую версию — это
видимый в git diff шаг, а не тихая runtime-нормализация. Попытка открыть файл с `schemaVersion` выше
поддерживаемого текущим сканером версии — явная диагностика, а не порча данных.

Реализовано 2026-07-20: `readManifest()` в `server/services/moduleEntities.mjs` сравнивает
`manifest.schemaVersion` с общей константой `SUPPORTED_SCHEMA_VERSION` для `component.json` и
`wireframe.json` и добавляет `schema-version-unsupported` вместо того, чтобы читать поля будущей
версии как есть. Открытый пробел: сама миграция (перевод файла со старого `schemaVersion` на новый)
ещё не реализована, потому что пока существует только одна поддерживаемая версия.

## D-048 — Невалидный manifest изолируется до одной сущности, а не роняет весь модуль

**Статус:** принято и реализовано, 2026-07-20.

`component.json`/`wireframe.json`, не проходящий `JSON.parse`, раньше приводил к необработанной
ошибке всего `/modules/:moduleId` ответа (см. пробел, зафиксированный в `05-entities-and-file-contracts.md`
до этой даты). `readManifest()` теперь оборачивает разбор в try/catch: при ошибке сущность всё равно
попадает в каталог с `id`/`name`, подставленными из пути директории, пустыми остальными полями и
diagnostic-кодом `manifest-parse-error` на этой конкретной сущности. Соседние сущности того же модуля
не затрагиваются. Покрыто тестами в `componentRelations.test.mjs`.

## D-049 — Принят канонический контракт Pages

**Статус:** принято, 2026-07-20. Частично дополнено/заменено D-050–D-055 (2026-07-21) — в частности,
отдельное поле `links[]` из этого решения заменено единым `flow.nodes[]`/`flow.edges[]` graph (D-052).
Реализация модуля Pages ещё не начата (см. `IMPLEMENTATION-CHECKLIST.md`).

`PAGE_RULES.md` фиксирует Page как финализированный, production-composed экран — точку выпуска
Wireframe → Page. Ключевые решения контракта:

- тот же гибридный паттерн, что у Wireframe: `page.json` — источник истины для identity, states,
  provenance и inter-Page graph; соседний `*.page.tsx` — источник истины для рендера;
- Page не содержит exploratory blocks — только реальные Library Components; layout-сравнение
  остаётся исключительно задачей Wireframe;
- states на Page — это data-снапшоты одного committed layout (empty/loading/error/populated и т.д.),
  а не layout directions;
- `derivedFromWireframe` — необязательная ссылка на исходный Wireframe/layout/state; создание Page
  из Wireframe — явное действие автора, Design Lab не мутирует файлы Wireframe при графации;
- `links[]` — облегчённый sitemap-graph между Pages (реальная product-навигация), отдельный от
  user-flow Canvas Wireframe: без authored координат, без layout branching;
- те же diagnostic-гарантии, что D-047/D-048: `manifest-parse-error`, `schema-version-unsupported`,
  плюс Page-специфичные коды (`page-entry-missing`, `page-link-invalid`,
  `page-derived-from-wireframe-invalid` и т.д.), перечисленные в `PAGE_RULES.md`.

## D-050 — Page получает авторский production `route` как hand-off metadata, а не литеральный маршрут Design Lab

**Статус:** принято, 2026-07-21.

`page.json` получает поле `route` (плюс опциональные `routeParams[]` для динамических сегментов) —
путь, который автор предполагает для страницы в реальном продукте (`/billing`, `/`). Это чистая
hand-off metadata для фронтендеров, а не путь, который Design Lab обязан буквально обслуживать как
свой собственный роут.

Fullscreen review внутри Design Lab **зеркалирует** этот `route`, когда он не пересекается с
зарезервированными top-level сегментами модулей Design Lab (`components`, `wireframes`, `pages`,
`tokens`, `palette`, `assets`, `fonts`, `rules`, `decisions` и другие reserved module id). Цель —
дать ощущение «браузинга настоящего сайта» внутри review, а не только каталога дизайн-инструмента.

Canonical filesystem-путь Page (`/pages/<category-path>/<PageName>`) остаётся отдельным и всегда
резолвится в Page card (см. D-053) независимо от `route` — это стабильный discovery-адрес, который
не может сломаться из-за пользовательского выбора `route`.

## D-051 — При конфликте `route` с зарезервированным модулем Design Lab всегда выигрывает Design Lab

**Статус:** принято, 2026-07-21.

Если авторский `route` совпадает с зарезервированным top-level сегментом модуля Design Lab (например,
Page с `route: "/components"`), Design Lab никогда не позволяет этому route перекрыть собственную
навигацию. Вместо жёсткой ошибки сохранения — тихий откат: fullscreen review для этой Page использует
filesystem-путь, а на самой Page появляется diagnostic `page-route-conflicts-reserved-module`.

Это решение сознательно выбрано вместо блокировки сохранения манифеста (чтобы не мешать автору
работать) и вместо полного игнорирования конфликта (чтобы автор узнал о нём и мог переименовать
route, если это важно для реального хендоффа).

## D-052 — Единый flow graph вместо отдельных `states[]`+`links[]`; controls как у Wireframe

**Статус:** принято, 2026-07-21. Заменяет модель `links[]` из D-049.

Page получает `controls[]` — тот же typed control registry, что у Wireframe (`radio`/`boolean`/`range`
с `visibleWhen`), но описывающий domain/data-условия (авторизация, тариф, права), а не layout-варианты.
`states[]` — именованные снапшоты полных комбинаций значений `controls[]`, с той же snapshot-identity
логикой, что у Wireframe.

Один `flow.nodes[]`/`flow.edges[]` graph заменяет отдельное поле `links[]`: nodes ссылаются на states
этой же Page с authored координатами, а edges бывают двух видов — `{ kind: "state", stateId }` для
внутреннего перехода и `{ kind: "page", pageId, condition? }` для cross-Page навигации. `condition` —
необязательная пара `{ controlId, value }`, которая делает переход зависимым от текущего значения
control. Это напрямую покрывает пример из обсуждения: кнопка «Профиль» ведёт на Auth Page, когда
`authenticated = false`, и на Profile Page, когда `authenticated = true` — два edges с
взаимоисключающими `condition` от одного action-node.

## D-053 — Page открывается через промежуточную Page card, а не сразу fullscreen

**Статус:** принято, 2026-07-21.

В отличие от Wireframe (который открывается прямо в fullscreen), клик по Page в каталоге сначала
открывает inline **Page card**: описание, список действий/переходов (производных от `flow.edges[]`)
и diagnostics. Явное действие на карточке уже открывает fullscreen review (маршрут — см. D-050/D-051).

Diagnostics на карточке группируются по коду и могут быть индивидуально acknowledged только через
явное действие с обязательным текстовым `reason`; результат пишется в новое поле манифеста
`diagnosticsAcknowledged[]` (`{ code, entityRef?, reason, acknowledgedAt }`) и диагностика остаётся
видимой в приглушённом виде, а не исчезает — история решения аудируема через git diff.

Это решение вводит жёсткое агентское правило (зафиксировано в `PAGE_RULES.md`): Codex, Claude и любые
другие агенты никогда не заполняют `diagnosticsAcknowledged[]` от имени пользователя. Если diagnostic
неустраним, агент обязан явно объяснить причину и получить подтверждение пользователя перед тем, как
предложить (не выполнить самостоятельно) acknowledge. Мотивация — сценарий, прямо описанный в
обсуждении: агент чинит 95 из 100 diagnostics, а по оставшимся 5 должен спросить пользователя, а не
тихо их скрыть.

## D-054 — Pages остаются mock-first; реальная связь с API — неформализованный escape hatch

**Статус:** принято, 2026-07-21.

`page.json` не получает схему для API/backend-интеграции. По умолчанию все data-условия страницы
выражаются через `controls[]`/`states[]` с моковыми значениями, которые задаёт автор — это остаётся
предсказуемым и безопасным для review сценарием.

Если автору Page всё же нужна настоящая связь с API, он реализует её как обычный код в
`*.page.tsx` — Design Lab не строит для этого отдельный adapter/hook-контракт и не пытается
визуализировать live request/response данные. Design Lab не запрещает это, но и не берёт на себя
моделирование этой связи: решение сознательно оставляет эту дверь открытой, но неформализованной, а
не строит третий data-layer поверх `controls[]`/`states[]`.

## D-055 — Sitemap между Pages: authored per-Page Canvas + derived агрегированный граф

**Статус:** принято, 2026-07-21.

Связи между Pages индексируются на двух уровнях одновременно:

- **Per-Page Canvas** — переиспользует контракт Wireframe user-flow Canvas (authored координаты,
  pan/pinch zoom, arrow+label edges, keyboard/reduced-motion) и рисует `flow.nodes[]`/`flow.edges[]`
  именно этой Page, включая cross-Page edges как выходные узлы;
- **Агрегированный sitemap** — derived (не authored) view на уровне каталога Pages, который сервер
  собирает из `flow.edges[]` с `kind: "page"` всех обнаруженных Pages одного source, по аналогии с
  тем, как уже вычисляются `usedBy`/`usedInExamplesBy` для Components. Это исключает рассинхронизацию
  между общим site-graph и отдельными per-Page графами. Из-за произвольного числа страниц
  агрегированный граф использует auto-layout, а не authored координаты.

Per-Page Canvas идёт в одном контракте с остальной частью Page (переиспользует существующую
Wireframe Canvas-инфраструктуру); агрегированный sitemap — первый пункт Next-уровня в
`IMPLEMENTATION-CHECKLIST.md`, так как это отдельная новая UI-поверхность.

## D-057 — Route-зеркалирование Page реализовано; root `/` не зеркалируется; sourceId всегда впереди

**Статус:** принято, 2026-07-21. Закрывает пробел, оставленный D-050: сам URL зеркалирования не был
реализован при первой реализации Pages (fullscreen review всегда использовал filesystem-путь +
`/review`), несмотря на то что диагностика конфликтов (D-051) была на месте.

Теперь fullscreen review реально открывается на `/pages/<sourceId><route>` (например
`/pages/design-lab-system/login`), когда авторский `route` не конфликтует с зарезервированным
модулем (D-051). Ограничения, подтверждённые на практике:

- **Литеральный `route: "/"` не зеркалируется.** `/pages/<sourceId>` без дальнейшего пути
  зарезервирован за открытием каталога Pages этого source — если позволить Page с `route: "/"`
  занять этот же адрес, теряется однозначный способ просто открыть каталог. Такая Page всегда
  открывается на filesystem-пути + `/review`; её `route` остаётся видимым как hand-off metadata на
  Page card, просто не становится буквальным URL в самом Design Lab.
- **`sourceId` всегда стоит перед зеркалированным route, а не наоборот.** Design Lab физически не
  может подать один и тот же путь двум разным Library/проектам одновременно — `/<module>/<sourceId>/`
  это неотделимый префикс. Отсюда прямое следствие: коллизии авторских `route` МЕЖДУ разными Library
  структурно невозможны (у каждой свой `sourceId` в адресе), даже если обе назвали Page `/checkout`.
  Полноценный роутинг «как на настоящем сайте» (буквальный корень `/`) в принципе недостижим внутри
  многотул-/мультибиблиотечного workspace — это осознанно принятое ограничение, а не баг.
- Зеркалированный `route` имеет приоритет над идентично named папкой того же модуля (например Page
  с `route: "/account"` лежит в filesystem-папке `account/`) — резолвинг сперва проверяет совпадение
  с чьим-то `mirroredRoute`, и только потом падает на обычное дерево навигации модуля.

## D-056 — Где живут зависимости внешней Library

**Статус:** первоначальный эксперимент удалён 2026-07-26; общее решение принято в D-083.

Точечные alias, runtime-исключения и миграторы под одну конкретную Library запрещены: они создают
ложную поддержку и постепенно превращают shell в набор частных интеграций. Dependency declaration
принадлежит ближайшему реальному `package.json` source, lock/install environment может находиться
выше в workspace, а adapter cache хранится отдельно и остаётся derived. Полная ownership-модель,
attach-mode и lifecycle закреплены в D-083 и `docs/19-dependencies-and-libraries.md`.

## D-058 — Context gateway: raster/video assets импортятся как package export, а не `/api/` URL; browse, batch get, did-you-mean, Wireframe/Page как context kinds

**Статус:** принято, 2026-07-21.

После редизайна трёх демонстрационных Pages (`Home`, `Auth`, `Account`) через MCP/CLI обнаружился
набор проблем discovery-слоя. Единственная из них, которая реально нарушала "production
copy-paste" инвариант — Pages ссылались на raster-картинки через `/api/sources/<sourceId>/asset-previews/...`,
runtime-маршрут каталога Design Lab, а не production-контракт. Остальные — improvements навигации
поверх той же файловой системы, без второго source of truth. Решено пофиксить всё разом:

- **Asset import для image/video.** `library.json` получил новое поле `assetImport` (по аналогии с
  `componentImport`/`iconImport`), `package.json` — wildcard export `"./assets/*": "./assets/*"`.
  `contextGateway.mjs` теперь возвращает для raster/video того же `details.import`, что и для
  code-native icon: `import modernWorkspace from '@design-lab/system/assets/images/stock/modern-workspace.jpg'`.
  Символ импорта — механический camelCase от имени файла, не авторская таблица имён. Три Pages
  переведены на этот импорт; production build подтверждён (Vite корректно бандлит raster-файлы как
  хэшированные assets).
- **`cssVar` у токенов.** `get` на token теперь возвращает `details.cssVar`/`details.cssUsage`,
  выведенные из `token.path` той же заменой `.`→`-`, что использует `build-tokens.mjs` при генерации
  `tokens/generated/tokens.css` — правило одно, дублирования нет.
- **`designlab_browse` / `npm run designlab -- browse`.** Новый способ discovery поверх уже
  существующего `getModuleNavigation()` (использовался только Directory Panel): проход по
  каноническому дереву путей component/token/asset/wireframe/page на один сегмент за раз (`color` →
  `color.accent` → `color.accent.primary`), без угадывания id и без чтения полного плоского каталога.
  Никакой второй индекс не заведён — это тот же `getModuleEntities`/навигационное дерево, что уже
  питает UI.
- **Batch `get`.** `designlab_get` принимает `refs[]` (MCP) / несколько позиционных ref'ов (CLI) и
  возвращает `{ entities, errors }` одним вызовом; один плохой ref не валит остальные.
- **Did-you-mean на dead ref.** 404 у `get` теперь включает до трёх похожих existing ref того же
  kind (fuzzy dice-similarity на id), вместо голого "not found".
- **Wireframe и Page — полноправные context kinds.** Добавлены в `CONTEXT_KINDS`, ищутся через
  `search`/резолвятся через `get` так же, как Component/Token/Asset/Font. Manifest получил тот же
  опциональный набор `aliases`/`useWhen`/`avoidWhen`, что у `component.json` (документировано в
  `WIREFRAME_RULES.md`/`PAGE_RULES.md`). Резолвленная сущность также несёт `compositionUses` — список
  Component-символов, реально импортированных в `*.wireframe.tsx`/`*.page.tsx`, вычисленный тем же
  static-import-сканером, что и `uses`/`usedBy` у Component (`parseComponentSourceImports`), — не
  authored и не может протухнуть. Это даёт агенту готовый composition recipe вместо одного `usedBy`,
  ведущего только в Workbench.

Явно не сделано в этом проходе (осознанно отложено, не забыто): embeddings/browse для Fonts и
knowledge-сущностей (Rules/Decisions/Prompts/Docs — у них нет сопоставимого filesystem-дерева),
обратная связь Component → Page/Wireframe (`usedInPages`), кэш-инвалидация через watcher вместо
rescan-on-request.

## D-059 — Inspector: четвёртая identity `asset` для resolved image/video import; авто-derived image dimensions/aspect ratio

**Статус:** принято, 2026-07-21.

Инспектор (`WorkbenchInspector`) уже умел показывать resolved import для иконки внутри manifest
slot (`leading={<StarIcon />}` → import + JSX), но это была не icon-специфичная логика — это
generic `referencedImports` над authored slot-выражением. Дырка была в другом: **raster `<img>`
вне manifest slot** (типичный случай — hero-картинка в Page/Wireframe) вообще не получал этот
handoff, только authored SCSS. Плюс отдельно — в `.meta.json` картинок не было соотношения сторон,
хотя факт полностью derivable из самого файла.

Оба фикса продолжают тот же принцип "факт, который можно вычислить из файла, никогда не
authored":

- **Inspector asset identity.** `inspectionTransform.mjs` теперь сканирует **любой** host-тег
  (`img`/`video`/`source`, в принципе любой lowercase JSX host) на атрибуты `src`/`poster`/`href`;
  если значение — `JSXExpressionContainer`, чей текст матчит локальный import binding (тот же
  regex-heuristic `referencedImports`, что уже используют slot'ы), в `source.asset` кладётся
  import statement + строка использования (`src={heroImage}`). Работает независимо от того,
  объявлен ли элемент как manifest slot — не нужен второй contract на уровне `component.json`.
  Литеральная string URL не даёт `asset` вообще (не выдумываем факт, которого нет). Новая tealовая
  `--color-inspection-asset` identity (outline + popover) — четвёртая рядом с purple
  Component/pink slot/neutral element. `WorkbenchInspector.inspectElement` порядок приоритета:
  slot → component → asset → element/SCSS.
- **Image dimensions/aspect ratio — derived, не authored.** `moduleEntities.mjs` читает заголовок
  файла через `image-size` (zero-dep, sync, без декодирования полного пикселя) и добавляет
  `width`/`height`/`aspectRatio` (GCD-reduced `"W:H"`, например `"2:3"`)/`orientation` на discovered
  Asset entity. Это те же derived-факты, что уже запрещено дублировать в `.meta.json` (dimensions,
  extension, path, preview URL — правило было в `ASSET_RULES.md` и раньше, теперь оно применено на
  практике). `orientation`/`aspectRatio` также попадают в `tags` — бесплатный semantic search
  ("landscape photo", "square avatar") без единой authored строки.
- **Video duration — осознанно НЕ сделано.** В отличие от image dimensions (один header read),
  надёжная длительность требует реального декодирования контейнера — это either `ffprobe`/`ffmpeg`
  (тяжёлая системная зависимость) либо неполный parser под каждый codec/container. У
  `design-lab-system` пока нет ни одного video-ассета, то есть добавлять эту зависимость
  спекулятивно, без доказанной необходимости, — не тот compromise. Отложено до первого реального
  video asset.

Затронутые файлы: `design-lab/scripts/inspectionTransform.mjs` (+тесты),
`libraries/design-lab-system/inspection/index.ts`, `WorkbenchInspector.tsx/.scss`,
`InspectorCodePopover.tsx/.scss`, `tokens/semantic/core.tokens.json` (`color.inspection.asset`),
`design-lab/server/services/moduleEntities.mjs` (+ новая зависимость `image-size` в
`design-lab/package.json`), `contextGateway.mjs` (asset description/tags).

## D-061 — User-flow Canvas: аудит и развилки

**Статус:** частично закрыт решениями D-062, 2026-07-21. Исходный аудит и trade-offs —
`docs/13-user-flow-canvas-exploration.md`.

Мультиагентный аудит подтвердил по коду ряд находок и развернул 5 тем. Решения по четырём
продуктовым развилкам — в D-062. Фаза 0 (Select/Preview/pan, edge geometry, валидация flow)
реализована без дополнительного подтверждения.

## D-062 — User-flow Canvas: принятые продуктовые решения (2026-07-21)

**Статус:** принято, 2026-07-21.

### 1. LOD / память — вариант A (zoom-threshold)

На User-flow Canvas вводится деградация детализации по эффективному zoom:

- **близко** — desktop + mobile, живой adjacent renderer;
- **средне** — только desktop;
- **далеко** — metadata-карточка (название, описание, eyebrow), без `WireframeScreenPreview`.

Переформулировать D-041 / `rules/WIREFRAME_RULES.md`: «тот же реальный adjacent renderer»
означает пиксельно точное происхождение там, где affordable по LOD; на дальнем zoom допустима
карточка без live-render, но не illustrative/authored thumbnail (`*.preview.tsx`). Safety-net
бюджет живых mount'ов — опционально вторым шагом после измерения.

### 2. Site-wide navigation — вариант A (иерархия уровней)

**Aggregated sitemap** как Level 0: derived, Pages-only, auto-layout, компактные Page-карточки
без live dual-viewport. Per-Page flow Canvas — Level 1; Page card / fullscreen review — Level 2.
Wireframe в site-wide граф не включается. Единый «мега-граф» со всеми states всех Pages не
делаем.

Auto-layout: hand-rolled layered/Sugiyama-style без новых npm-зависимостей; dagre — fallback
при ревью.

### 3. Canvas → файл — autosave автоматической геометрии, не ручной drag-редактор

Запись координат/подписей в `wireframe.json` / `page.json` идёт **автоматически** (debounced
autosave после алгоритмической нормализации layout). Ручная правка координат на Canvas не
является целевым сценарием.

D-042 сужается: запрет «не записывать derived geometry» остаётся для silent runtime-only
коррекции без персистенции; **явная автоматическая нормализация** (collision-safe / auto-layout
pass), результат которой должен быть стабилен в git, **может** записываться в manifest через
write API (ещё не реализован).

### 4. Trigger-based edges — runtime-корреляция без изменений production TSX

Подсветка «эта кнопка → это ребро» — через **runtime-корреляцию** `action id → DOM` при клике в
review (inspection registry / session-scoped map). В `<PageName>.page.tsx` **не** добавляются
атрибуты, selectors или объявления «для графа» — copy-paste Page в prod не тащит Design Lab
graph machinery.

Существующие `onAction({ id: '…' })` в Page TSX — production hand-off контракт; `flow.edges[].action`
в JSON — review/navigation metadata; связь edge↔DOM — только Design Lab runtime.

## D-060 — `components/blocks/**` как semantic-категория page sections

**Статус:** принято, 2026-07-21.

В default `design-lab-system` вводится semantic-категория `components/blocks/**` для крупных,
production-ready секций страниц (например маркетинговый Hero/Nav). Это не отдельный
entity kind и не новый module/tab: блоки остаются обычными Components с тем же
`component.json`/TSX/SCSS/preview/stories/README/CHANGELOG контрактом.

Идея такая: если разметка перестаёт быть exploratory и начинает многократно переиспользоваться
в `pages/**`, её секционируют и выносят в `components/blocks/**`, а Page собирает
композицию из реальных библиотечных блоков и атомов/молекул.

Затронутые файлы: `COMPONENT_RULES.md`, новые блоки `MarketingNav`/`MarketingHero`,
`libraries/design-lab-system/pages/marketing/Home/Home.page.tsx`.

## D-063 — Hard Mode и self-inspection Design Lab (2026-07-23)

**Статус:** принято и реализовано, 2026-07-23.

`WorkbenchInspector` получает неперсистентный `Hard Mode`, доступный только при активном Inspect.
Он временно форсирует neutral gray background на обнаруженных Component/slot/asset roots через
`!important`, удваивает purple/pink/teal identity outlines и показывает neutral toggle красным
только во включённом состоянии. Выключение Inspect сбрасывает Hard Mode; URL, manifests, tokens
проверяемого source и production-разметка не меняются.

Тот же `WorkbenchInspector` монтируется на root обычного Design Lab shell. Vite inspection
transform теперь обрабатывает и `design-lab/src/**`, используя закрытый runtime source id
`__design-lab-app` только в in-memory descriptors. Для application source transform работает в
узком `componentsOnly` режиме: оборачивает импортированные Library Component callsites, но не raw
DOM hosts. Поэтому Hard Mode показывает hardcoded-разметку как незакрашенные промежутки, не
добавляя wrapper/ref на каждый shell `div` и `span`; raw application SCSS handoff намеренно не
предоставляется. Ручных marker attributes, второго registry, DOM polling или `MutationObserver`
нет. Закрытый Inspector не выполняет обход DOM, а Hard Mode не применяет стили.

## D-064 — Component symbol derived из entry; manifest name опционален (2026-07-23)

**Статус:** принято и реализовано, 2026-07-23.

У Component разделены техническая и отображаемая идентичности. Import/export symbol всегда
механически derived из basename production `entry`: `ComponentCard.tsx` → `ComponentCard`.
Опциональный `component.json.name` — только display copy и не участвует в AST lookup. Поэтому
`"Component Card"` и `"ComponentCard"` одинаково относятся к `ComponentCard.tsx` и не могут
конфликтовать с экспортом. Если `name` отсутствует, каталог humanize'ит derived symbol либо имя
директории для wireframe-only Component: `ComponentCard` → `Component Card`.

Design Lab не записывает derived name обратно в manifest при запуске: это устраняет обязательное
поле и лишние git-diffs, сохраняя filesystem как source of truth. Inspector, relations, canonical
imports и context gateway используют один shared `componentIdentity` helper, чтобы symbol/display
правила не расходились между compile-time и server scanners.

## D-065 — Self-audit shell и catalog fragments становятся Components (2026-07-23)

**Статус:** принято и реализовано, 2026-07-23.

Фрагменты собственного интерфейса Design Lab, обнаруженные Hard Mode как application-local
разметка, вынесены в единственный source of truth `design-lab-system`: `WorkspaceHeader`,
`WorkspaceStage`, `ModulePage`, `CatalogGroup` и `TokenTable`. Приложение отвечает за данные и
композицию, а библиотечные Components — за повторяемую структуру, responsive layout и визуальные
правила этих поверхностей.

`CatalogGroup` задаёт единый header для групп Components, Assets, Wireframes и Pages. Его контент
получает token-driven горизонтальный inset, согласованный со скруглёнными карточками; отдельные
component/asset варианты больше не поддерживаются. Таблица Tokens также является настоящим
Component с rows как данными и selection callback как поведением. Fonts намеренно не входят в
этот проход и сохраняют текущую реализацию.

## D-066 — Generic Table, catalog Cards/List и завершение self-inspection (2026-07-23)

**Статус:** принято и реализовано, 2026-07-23.

Узкий `TokenTable` удалён: Tokens использует generic production Component `Table`. Его контракт
принимает typed rows и произвольные column renderers, поддерживает локальную или controlled
сортировку, compact/comfortable density, selected/hover/focus/empty states и keyboard row
activation. Таблица не знает о Tokens; token path, type, swatch и mode value остаются данными и
cell-композицией приложения.

Каталоги Components и Palette получают общий session-local layout mode `cards | list`, по
умолчанию `cards`. Переключатель собирается существующим `TabSwitcher` из канонических
`CardsViewIcon` и `ListViewIcon`; List-представления обоих каталогов используют тот же `Table`.
Контракт намеренно пригоден для последующего подключения Assets, Wireframes и Pages без нового
layout registry или параллельной таблицы.

Self-inspection обычной оболочки Design Lab, введённый D-063 как временный аудит, завершён и
отключён: root `App` больше не монтирует `WorkbenchInspector`. Inspector и Hard Mode сохраняются
на предназначенных review-поверхностях Components, Wireframes и Pages. `CatalogGroup` сохраняет
card-aligned inline inset, но декоративный divider под его header удалён.

## D-067 — TabSwitcher option content и канонические theme icons (2026-07-23)

**Статус:** принято и реализовано, 2026-07-23.

`TabSwitcherOption` явно поддерживает три content-контракта: text-only (`label`), icon-and-text
(`icon` + `label`) и icon-only (`icon` + обязательный `accessibleLabel`). Оба визуальных варианта
поддерживают этот API. `segmented` используется для Cards/List и других view modes; компактный
`toggle` остаётся для знакомых парных режимов вроде Light/Dark.

Размер option icons принадлежит самому `TabSwitcher`: `iconSize` задаёт единый размер SVG внутри
контрола независимо от размера кнопки и touch target. По умолчанию это 14px для `small` и 16px для
`medium`; компактные Cards/List и Light/Dark в shell используют 12px.

Unicode-символы темы в Design Lab shell удалены. Light/Dark используют автоматически
обнаруживаемые code-native Assets `LightThemeIcon` и `DarkThemeIcon`; Cards/List продолжает
использовать `CardsViewIcon` и `ListViewIcon`, но передаёт их через semantic `icon` prop, а не как
неразличимый `label` ReactNode.

## D-068 — Entity-level Component captures для AI visual review (2026-07-23)

**Статус:** принято и реализовано, 2026-07-23.

AI не навигирует по Design Lab shell ради визуальной проверки Component. Локальный read-only MCP и
CLI получают entity-level capture contract: `info` возвращает все реально обнаруженные из tokens
режимы выбранного Project/Library и ids соседних executable Stories; `preview` рендерит только
реальную область Component Card preview размером `260×150` CSS px; `story` рендерит только
`.dl-story-canvas__stage` выбранной Story размером `600×180` CSS px. Оба изображения снимаются при
DPR 2 (`520×300` и `1200×360` физических пикселей) в непрозрачный lossless PNG.

Количество и имена design-system modes не ограничены. `sourceMode` выбирается из канонических
token modes активного source и независимо управляет Component variables; `interfaceTheme` имеет
только `dark | light` и управляет Design Lab surface. Фиксированный Story viewport не растягивается
под контент: horizontal/vertical overflow возвращается как diagnostic metadata вместе с console
errors, точной геометрией, bytes и SHA-256. Renderer использует headless Chromium и прямой DOM crop;
промежуточные screenshots приложения не попадают в model context.

`info` также вычисляет рекомендуемый `interfaceTheme` для каждого source mode по luminance его
канонического canvas/surface token. Независимость осей сохраняется: противоположный фон разрешён
для намеренного contrast testing, но metadata явно предупреждает, что Component может стать
неразличимым. Агент использует рекомендацию по умолчанию и отклоняется от неё только осознанно.

## D-069 — Inline Playground controls, shared Story Canvas и compact source handoff (2026-07-25)

**Статус:** частично заменено D-071, 2026-07-25.

Inline Playground в Component Workbench изначально был переведён на тот же автоматически
обнаруженный `*.playground.tsx`, что и fullscreen route. D-071 отменяет это смешение: adjacent
Playground остаётся wireframing artifact отдельного route, а detail возвращается к production
Component с controls из manifest props. Компактная информационная полоса при отсутствии
редактируемого production-контракта сохраняется.

Canvas background preference едина для inline Playground и всех Story Canvas на той же
Component page. Каждый Story меняет эту общую preference плавающим control в правом верхнем углу
самого stage, и все Canvas обновляются синхронно.

Первоначальная реализация показывала под Story только canonical import из filesystem scanner.
D-071 расширяет этот handoff до imports плюс реальный TSX всех examples. Headerless `CodeBlock`
примыкает к stage без внешнего padding, по умолчанию ограничивает длинный фрагмент тремя строками и
держит Copy вместе с expand/collapse внутри code surface. Copy всегда копирует полный source.

## D-070 — Compact adaptive selectors и progressive Component reference (2026-07-25)

**Статус:** selector density заменена D-073; progressive reference остаётся принято, 2026-07-26.

`TabSwitcher` на phone viewport увеличивает визуальный control не более чем на 4px относительно
desktop. Для наборов, не помещающихся по ширине, caller явно выбирает `overflow="wrap"` или
`overflow="scroll"`; видимый scrollbar остаётся desktop-only. Выбранный segment перемещается
анимированным measured indicator, включая строки после переноса, с отключением motion через
`prefers-reduced-motion`.

Component Reference показывает relation graph по disclosure и начинает в свёрнутом состоянии.
Каждая relation group имеет фиксированную высоту примерно 2,5 карточки и собственный вертикальный
scroll. File inventory больше не занимает верхний reference panel: отдельный
`ComponentReferenceFiles` завершает Component detail после Changelog.

## D-071 — Production Component Playground отделён от Wireframe Playground (2026-07-25)

**Статус:** принято и реализовано, 2026-07-25.

Component detail показывает production Component Playground: реальную реализацию через соседний
Story renderer и общий набор редактируемых controls, производный от `component.json` props,
defaults и representative Story values. Props rail находится справа. Реализация не содержит
switch по component id и работает одинаково для автоматически обнаруженных Libraries.

`ComponentName.playground.tsx` не участвует в inline detail. Это отдельный wireframing/ideation
artifact и fullscreen route, поэтому действие явно называется Wireframe Playground. Отсутствие
production Story или поддерживаемых editable props заменяет inline Canvas узкой информационной
полосой, но не смешивает его с experimental renderer.

Story handoff содержит не только canonical Component import, но и TSX каждого показанного example.
Первоначальное требование вручную задавать `source` и дополнительные `imports` для slots, icons,
composition и renderer transforms заменено автоматическим rendered-tree анализом в D-074.
Story header больше не резервирует фиксированные 72px, а kind располагается рядом с названием.

## D-072 — Canvas Background Control использует compact disclosure (2026-07-25)

**Статус:** принято и реализовано, 2026-07-25.

Canvas Background Control по умолчанию показывает только выбранный background mode. Hover на
pointer-устройствах и keyboard focus раскрывают все варианты с коротким переходом; production
`TabSwitcher` используется в размере `small`. Reduced motion сохраняет disclosure без анимации.
На touch первый tap только раскрывает варианты, следующий выбирает mode или открывает picker, а tap
за пределами control возвращает collapsed-состояние. Все выбранные swatches занимают одну и ту же
позицию; gaps между скрытыми options не участвуют в collapsed layout.

Контрол остаётся overlay в правом верхнем углу Canvas. Story Canvas и Playground не резервируют
под него дополнительный top padding: содержимое Canvas сохраняет одинаковую safe area независимо
от наличия background control.

## D-073 — Production Component geometry не зависит от viewport (2026-07-26)

**Статус:** принято и реализовано, 2026-07-26.

Явный размер production Component означает одну и ту же геометрию на desktop и mobile. Viewport
media queries не меняют control height, padding, typography, gaps, row density или внутренний touch
target. Это отменяет mobile enlargement из прежних shell/input решений и ограничение роста
`TabSwitcher` на `+4px` из D-070. `Input`, `Select`, `TabSwitcher`, `ColorPicker`, semantic tree,
Canvas background control и shell controls используют собственный выбранный размер без phone
remapping.

Responsive composition сохраняется: узкая поверхность может менять колонки, переносить или
скроллить набор, ограничивать popover visual viewport, переставлять overlay, скрывать вторичную
metadata или превращать rail в drawer. Эти изменения не создают вторую density вложенных
Components.

Story source handoff намеренно остаётся тихим: `pre` внутри Story `CodeBlock` имеет opacity `0.2` в
покое и `1` при hover, focus-within или раскрытом состоянии. Copy/disclosure actions остаются
полностью видимыми, а `CodeBlock` экспонирует root state `dl-code-block--expanded`.

## D-074 — Story handoff выводится из фактического renderer tree (2026-07-26)

**Статус:** принято и реализовано, 2026-07-26; заменяет ручной source-контракт из D-071.

Story handoff не требует дублировать JSX и imports в metadata каждого примера. Review-build transform
для любого `*.stories.ts(x)` сопоставляет статически импортированные production Components и
code-native icon assets с canonical public package imports. Поддерживаются как прямые относительные
imports, так и library barrel imports; сопоставление выводится из `library.json`, `component.json` и
файловой структуры, без switch по Component id или имени icon.

Workbench один раз вызывает `renderStoryExample` для каждого примера. Тот же React node одновременно
рендерится в Story stage и сериализуется в copy-ready TSX, поэтому resolved props, text children,
ReactNode slots, вложенные icons, host composition и renderer transforms не расходятся с видимым
примером. Внутренние review wrappers прозрачно разворачиваются. `source` и `imports` сохраняются как
явный escape hatch для намеренно несериализуемых примеров, но обычная composition больше не обязана
поддерживать параллельную строковую реализацию.

## D-075 — Token formats нормализуются adapters, а retrieval раскрывается от общего к частному

**Статус:** принято, adapter/retrieval foundation и миграция токенов реализованы, 2026-07-26.

Design Lab не навязывает подключённым Projects и Libraries одну авторскую таксономию, разбиение по
файлам или JSON leaf syntax. Канонической filesystem boundary остаётся `tokens/**`: произвольные
внешние директории не конфигурируются, но поддерживаемая существующая token system переносится в
эту boundary без обязательного переименования собственных paths и групп. Format adapters
распознают Design Lab `value/type`, DTCG-style `$value/$type` и расширяемый набор legacy/plain JSON
dialects и приводят их к одной производной `TokenEntity` model. Raw document, его dialect, paths,
modes и reference expressions остаются source of truth; чтение никогда не конвертирует и не
перезаписывает их молча. Явная миграция формата в будущем обязана показать diff до записи.

Normalizer хранит stable ref, logical path, type, raw и resolved values, source format/location,
modes, reference chain, semantic metadata и diagnostics. References разрешаются между файлами;
broken links, cycles, duplicate identities и type mismatches изолируются до конкретного источника и
не ломают весь Tokens module. UI, MCP, CLI и generated outputs являются adapters этого одного
normalized catalog, а не отдельными scanners и registries.

AI retrieval следует filesystem-first progressive disclosure:
`source → folder/layer → document → group → token`. Browse промежуточного узла возвращает только
структуру, counts, modes и diagnostics. Scoped search использует path/type/value и доступные
`description`, `aliases`, `useWhen`, `avoidWhen`, `tags`, возвращает компактные refs, после чего
полные token entities или reference chains загружаются только явным get/batch-get. Весь token catalog
не передаётся модели одним контекстом. Semantic metadata остаётся необязательной ради совместимости:
она ожидается у неоднозначных semantic/component roles, но self-explanatory primitive не обязан
повторять literal value в description.

Собственный `design-lab-system` использует рекомендуемые слои
`primitives / semantic / components`. Это convention библиотеки, не обязательная структура для
чужих sources: Directory Panel строит дерево из реально найденных каталогов и документов и не
содержит списка названий слоёв. Primitive space token называется по фактическому значению в
пикселях; одно значение хранится один раз. Padding, margin и gap не получают независимые числовые
шкалы: назначение появляется в semantic layout roles и component tokens. Component token sizes
используют `s | m | l`; миграция публичных Component props на расширяемый ряд
`xs | s | m | l | xl | 2xl` остаётся отдельным совместимым изменением API.

Первый read-only срез реализует adapter registry для Design Lab `value/type` и DTCG-style
`$value/$type`, wrapped/unwrapped trees, inherited group type, `$root`, native theme overrides,
raw/resolved mode maps и exact cross-file references. Parse errors, unsupported/mixed documents,
duplicate paths, missing/ambiguous/circular references, reference type mismatch и orphan mode
overrides возвращаются как scoped diagnostics. MCP/CLI получили `browse view=files|paths` и scoped
`search --within`; существующий logical-path browse и token refs сохранены. Legacy/custom adapters,
embedded/composite reference resolution, line/column locations, usage impact и любые write/build
операции остаются следующими этапами.

## D-076 — Token identity, storage и dialect разделены; UI имеет Tokens и Files projections

**Статус:** принято и реализовано, 2026-07-26.

Универсальность Tokens module не означает попытку угадать смысл любого JSON. Каждый format adapter
явно извлекает три независимых факта: каноническое имя токена из правил исходного dialect,
физический token document внутри `tokens/**` и сам dialect. Эти данные вычисляются из одного source
и не образуют второй authored registry. Неизвестный dialect остаётся видимым diagnostic document,
пока для него не появится adapter.

Directory Panel больше не смешивает filesystem folder, token document, JSON group и token leaf под
одной иконкой папки. Tokens module имеет две производные проекции одного normalized catalog:
`Tokens` показывает только logical hierarchy и совпадает с именами в таблице; `Files` показывает
реальные каталоги, полные имена `*.tokens.json`, typed groups и leaves. Таблица явно показывает
`Stored in`. Названия слоёв и папок не перечислены ни в server, ни в application UI.

Поддерживаемые layouts и будущий write contract подробно закреплены в
`docs/14-token-architecture.md`. Создание токена не требует от пользователя понимать внутренний
scanner: имя/type/value обязательны, target document опционален или предвыбран из Files view, а
запись разрешена только через write adapter выбранного dialect с preview точного JSON diff.

## D-077 — Table получает управляемую ширину колонок, Tokens — Comment и рабочий порядок

**Статус:** принято и реализовано, 2026-07-26.

Generic production Component `Table` остаётся data-agnostic, но его column contract теперь
поддерживает authored width, min/max constraints и opt-out из resizing. По умолчанию divider между
двумя колонками перераспределяет их общую ширину вместо роста всей таблицы. Pointer drag и
keyboard Left/Right используют один алгоритм; double-click или Home возвращает authored layout.
Optional width snapshots позволяют consumer сохранить раскладку без localStorage внутри Component.

Tokens остаётся consumer-композицией этого общего контракта. Порядок колонок отражает рабочий
приоритет: `Token → Type → Value → Stored in → Comment`; Comment выводится непосредственно из
optional `TokenEntity.description`, поэтому новая колонка не создаёт второй metadata registry.

## D-078 — Zebra остаётся возможностью Table, Copy — действием token cell

**Статус:** принято и реализовано, 2026-07-26.

Generic `Table` получает opt-in `striped`, а не скрытое чередование строк во всех consumers.
Полоса намеренно слабее hover и selected state; Tokens включает её для длинного registry.

Copy не встраивается в generic Table API: первая token cell сама резервирует компактный action slot
слева от logical path, поэтому текст не прыгает при появлении действия. Иконка раскрывается при
row hover и keyboard focus, остаётся доступной на touch-only устройствах и копирует ровно тот
logical token path, который показан пользователю. Успешное действие получает визуальное состояние
и объявляется через live region; filesystem path и storage layer в копируемую строку не входят.

## D-079 — Все automatic Story handoff используют один structural source printer

**Статус:** принято и реализовано, 2026-07-26.

Форматирование handoff не зависит от пробелов и переносов в `*.stories.ts(x)` и не настраивается для
отдельных Components. Один printer получает уже сериализованную структуру фактического React tree:
короткий читаемый JSX остаётся в одной строке, а длинные tags, props, массивы, объекты и nested JSX
раскладываются рекурсивно с двухпробельным отступом, trailing commas и границей строки 100 символов.
Соседние examples разделяются пустой строкой. Поэтому простой Button не раздувается вертикально, а
Table с rows/columns больше не превращается в несколько нечитаемых длинных строк.

Явный `example.source` остаётся escape hatch и считается намеренно authored fragment. Обычные Story
не должны использовать его только ради форматирования: automatic rendered-tree handoff уже получает
единый readable output.

## D-080 — Library хранит Dialog primitive, blocking Stories начинаются с launcher

**Статус:** принято и реализовано, 2026-07-26.

`CreateProjectDialog` больше не является entity дизайн-системы: проектные тексты, name field,
validation и create action образуют product-specific application composition. Library экспортирует
только generic `Dialog`, который владеет native modal semantics, backdrop, heading/description
relations, sizes, content/footer slots, dismissal policy, focus entry и focus restoration. Приложение
собирает создание проекта из `Dialog`, `Input` и `Button` без второго modal implementation.

Любой Component, который открывает modal, fullscreen, top-layer или другую workspace-blocking
поверхность, в Workbench сначала рендерит launcher и остаётся закрытым при входе на route. После
открытия dismissible surface показывает Close и поддерживает заявленные Escape/backdrop paths.
Required flow может запретить passive dismissal, но Story всё равно обязана дать явное действие,
которое завершает fixture и возвращает пользователя к документации. Workbench Back никогда не
считается допустимым единственным выходом из Component Story.

## D-081 — Один Design Lab поддерживает platform implementations через adapters и capabilities

**Статус:** принято, 2026-07-26; foundation реализован, runtime/generation phases продолжаются.

Design Lab не выпускается отдельными React, Vue, SwiftUI или Compose-приложениями. Product shell,
Catalog, Workbench, Canvas, tokens, docs, search и AI остаются общими. Конкретная Component
implementation обнаруживается и, когда возможно, исполняется platform/framework adapter'ом в
изолированном runtime. UI показывает только фактически доступные capabilities: catalog, contract,
static/live preview, controls, inspection, composition, capture, handoff и native validation.
Отсутствие максимального уровня не скрывает Component и не ломает соседние entities.

`component.json + TSX` сохраняется как совместимый первый adapter, но перестаёт считаться конечным
универсальным определением Component. Целевое basic discovery использует существующие ecosystem
contracts и не требует обязательного Design Lab metadata-файла, когда identity уже можно вывести
из package exports, framework metadata, Storybook CSF, Custom Element registration, SwiftUI
`#Preview` или Compose `@Preview`. Optional metadata разрешает неоднозначность и добавляет семантику,
не дублируя вычислимые факты.

Конкретная React/Vue/SwiftUI/Compose реализация остаётся `ComponentImplementation` со своим API.
Optional `ComponentFamily` связывает implementations одной продуктовой роли и даёт переключение и
сравнение, но не создаёт ложную общую props-схему. Физически разные Library могут входить в одно
family после явного подтверждения человека.

Первоначально здесь предполагался ранний editable web surrogate → generated SwiftUI/Compose
handoff с обязательным source diff-review. D-082 исправляет две ошибки этого порядка: native
заморожен до полного web coverage, а designer review является визуальным. Защита source и diff
остаются внутренней/Developer-mode механикой, не пользовательским сценарием дизайнера.

Полный порядок и Definition of Done закреплены в
`docs/16-multiplatform-implementation-plan.md`; техническое обоснование и первичные источники — в
`docs/15-multiplatform-components-exploration.md`.

Первый реализованный срез добавил normalized adapter/capability/contract response без breaking
изменения старого Component API; strong-evidence manifest-free discovery для TSX, Vue, Svelte,
Custom Elements, SwiftUI и Compose; external browser preview; capability-gated Workbench;
explicit same-source `family` switcher; и read-only Swift/Kotlin/source handoff с provenance и
path confinement. Это не закрывает изолированные Vue/Svelte runtimes, cross-Library family,
генерацию SwiftUI/Compose, diff/write protection или native build/capture — они остаются явно
незакрытыми пунктами `docs/16-multiplatform-implementation-plan.md`.

## D-082 — Сначала полностью закрывается web; code review не входит в designer flow

**Статус:** принято, 2026-07-26; уточняет и ограничивает порядок D-081.

Основной пользователь Design Lab — дизайнер с AI-подпиской, который может не понимать код вообще.
Поэтому обязательный review Swift/Kotlin/C# diff дизайнером был ошибочной постановкой. Designer
подтверждает визуальный результат, состояния, переходы, responsive behavior и понятные platform
warnings. Exact source, diff, provenance, generated hash, build logs и разрешение конфликтов
остаются внутренней защитой или optional Developer mode.

До native-разработки Design Lab полностью закрывает web. Framework-neutral должны стать не только
Components, но также Wireframes и Pages: React, Vue, Svelte и Custom Elements используют один shell,
Canvas и semantic entity contracts, но исполняются своими изолированными adapters. Текущие TSX,
`*.wireframe.tsx` и `*.page.tsx` сохраняются как React compatibility path, а не универсальный
обязательный source format.

Tokens, Palette, Fonts и ordinary Assets не дублируются по web frameworks. Tokens имеют один
semantic source и web output, Palette остаётся представлением color tokens, Fonts используют общий
registry/files, Assets — общую filesystem inventory. Adapter различия относятся к loading и
handoff, а не к новым React/Vue/Svelte sources of truth.

Native roadmap открывается только после Web Definition of Done и включает не только iOS/Android,
но также macOS и Windows tracks (.NET/C# и, отдельно, C++/native Windows). Каждый track требует
собственных platform rules, validation toolchain и native-specialized agent reasoning. Для native
настоящая platform implementation является основной технической реальностью; web representation —
дополнение для дизайнерского просмотра, а не источник, диктующий SwiftUI/Compose/.NET architecture.

Полная последовательность, границы shared modules и Web Definition of Done записаны в
`docs/17-web-first-platform-strategy.md`.

## D-083 — Dependencies принадлежат существующему package environment, adapters отделены

**Статус:** принято, 2026-07-26; реализация не начата.

Product dependencies Component/Wireframe/Page implementation объявляются ближайшим реальным
`package.json`, который владеет source. Существующий lockfile и package-manager install root
определяют resolved versions; в monorepo lockfile может находиться выше конкретного package. Design
Lab не создаёт второй dependency manifest или lockfile только ради собственной logical Library и
не просит дизайнера указывать путь к `node_modules`.

Framework/runtime/inspection adapters, принадлежащие самому Design Lab, хранятся в отдельном
rebuildable managed cache и не записываются в product dependencies. Никакого silent install при
открытии Catalog нет. Подготовка preview является явным действием, а discovery и документация
остаются доступны без готового runtime.

В canonical greenfield source owning package root может совпадать с Project/Library root. В
существующем attached repository ownership сохраняет фактическую package/workspace структуру.
Подробная модель и оставшиеся UX/security вопросы закреплены в
`docs/19-dependencies-and-libraries.md`; attach-first следствия — в
`docs/20-embedded-install-and-attach-mode.md`.

## D-084 — Embedded install использует dual onboarding и отдельный локальный порт

**Статус:** принято, 2026-07-26; foundation реализуется.

Основной install footprint — package/CLI плюс одна видимая integration folder `design-lab/` и
маленькие управляемые root hooks. Существующий production source остаётся на месте; удалить или
перенести его setup не может без отдельного явного согласования. Derived adapter/runtime cache
находится в `design-lab/.cache/` и не является source of truth.

Onboarding имеет два равноправных входа над одним setup plan. В приложении он открывается из
`Create Project`: пользователь выбирает подключение существующей системы или чистый старт, видит
простое read-only резюме найденного и отдельно подтверждает запись. Agent-first onboarding работает
до первого запуска UI через CLI и root `AGENTS.md` pointer; будущий MCP action должен вызывать тот
же service, а не создавать второй setup pipeline. Правило требует от агента сначала
объяснить простым языком, что найдено и какие файлы будут созданы или изменены, затем запросить у
пользователя подтверждение. Флаг подтверждения не выводится из scan автоматически.

Design Lab и приложение команды являются разными локальными процессами. Design Lab публикует свой
настраиваемый loopback port; dev server продукта продолжает использовать собственный port. Setup не
переписывает port приложения и не проксирует его без отдельной будущей integration. В dev-сборке
внутренний API может использовать второй private loopback port за Vite proxy, но пользователь
открывает один Design Lab origin.

## D-085 — Mount resolver един для Catalog и AI; multiple roots получают source-relative identity

**Статус:** принято и реализовано, 2026-07-26.

`designlab.config.json` хранит только relative mount roots. Один resolver выполняет normalization,
source containment и перевод между filesystem path и публичным entity path для Components,
Wireframes, Pages, Tokens, Fonts и Assets. Absolute POSIX/Windows paths, `..`, ambiguous multi-mount
paths и выход за source root отклоняются до чтения или записи. Catalog, Directory tree, asset
streaming, source handoff, manifest PATCH и MCP/CLI/AI context используют этот resolver; отдельные
трактовки paths для разных consumers запрещены.

Filesystem symlinks не являются обходом boundary: scanners не индексируют symlink entries, а
прямое чтение/запись проверяет real path source, mount и target перед операцией.

Для одного mount entity path остаётся коротким и relative к этому mount, сохраняя текущие canonical
IDs и удобные routes. Если у одного module kind несколько mounts, storage identity становится
source-relative и включает mount path: например, `packages/react/src/Button` и
`packages/vue/src/Button`. Это предотвращает молчаливую коллизию framework roots, не вводя aliases,
symlinks или перенос файлов. Authored semantic ids внутри manifests по-прежнему должны быть
уникальны в пределах одного source; duplicate across mounts остаётся видимым diagnostic, потому что
автоматический alias сломал бы authored Page flows, relations и handoff semantics.

Embedded source восстанавливается из `design-lab/designlab.config.json`, даже если derived registry
пуст или удалён. Build-time `libraries/*` runtime registries намеренно не расширяются произвольными
globs: следующий Web gate — isolated runtime adapter protocol, сначала для сохранения React без
регрессий, затем для Vue и Svelte.

## D-086 — Framework считается готовым только по feature parity; capture принадлежит runtime

**Статус:** принято, 2026-07-26; protocol, React capture bridge, runtime profiles и lifecycle
supervisor реализованы, child launcher/adapters продолжаются.

Основной web runtime — managed isolated runtime на `source + technology + package environment` с
external URL как явным escape hatch. Один shell Design Lab управляет React, Vue, Svelte и другими
adapters через versioned serializable protocol; отдельные продукты или MCP-команды на framework не
создаются.

Framework support не считается готовым по одному discovery или demo preview. Для Components
обязательны live render, Stories, serializable controls/state/events, token modes, localized errors,
HMR, handoff и одинаковый UI/CLI/MCP capture path для Component preview/story. Затем тот же adapter
может отдельно закрыть web-rendering Wireframes и Pages: states, controls, flow/navigation,
fullscreen и errors/HMR. MCP capture Wireframes/Pages в текущий scope не входит. Deep inspection и ecosystem
metadata могут различаться по глубине, но каждая заявленная capability обязана быть проверена.

Capture surface объявляет сам runtime: kind, opaque selector, CSS geometry и DPR после readiness.
Playwright/MCP не знают React/Vue/Svelte DOM internals. Если bridge отсутствует, capability
`capture` отсутствует и пользователь получает понятное unsupported. Запрещено молча снимать fallback
thumbnail, static image или arbitrary external URL как настоящую implementation.

Текущий React capture переведён на этот descriptor как compatibility bridge. Vue получил первую
реальную isolated Component vertical в D-087; Svelte остаётся неподдержанным. Полный supported
status всё равно зависит от matrix из `docs/21-web-runtime-feature-parity.md`.

Уточнение после полного coupling audit: реализованный capture descriptor намеренно покрывает
Component preview/story. Настоящий Vue compiler fixture теперь реализован в D-087; Svelte compiler,
framework-aware source printing/Inspector и полностью adapter-neutral authoring rules ещё не
реализованы. Полный перечень доказательств и gaps закреплён в
`docs/22-web-stack-coupling-audit.md`.

Runtime profile имеет stable identity из source, technology и ближайшего owning package root.
Framework package/version разрешается из существующего package environment, lockfile может
принадлежать workspace выше package. Supervisor лениво coalesces параллельный start, принимает
только loopback origin, локализует start/exit error, поддерживает restart/dispose и не меняет
состояние соседнего profile. Первая lifetime policy держит готовый profile до закрытия Design Lab
или явного dispose; automatic idle shutdown откладывается до измерения реального потребления.

## D-087 — Nuxt UI доказывает один shell и source-owned Vue runtime без ложной parity

**Статус:** принято и реализовано как первая Vue Component vertical, 2026-07-26.

Design Lab остаётся одним React shell. Vue не получает отдельное приложение: managed child runtime
запускает source `vite.config.*`, Vue plugin и optional `runtimeSetup` из owning package environment,
а shell общается с ним через serializable URL/protocol и isolated iframe. Launcher резолвит Vite
от source package, поэтому версия shell Vite не подменяет версию пользовательского проекта.

Committed `nuxt-ui-system` использует настоящий Nuxt UI standalone Vue setup и четыре реальные SFC
Components. Он доказывает Catalog preview, production Playground с props, отдельный draft
Playground, Stories, arbitrary token modes, HMR, basic Vue usage handoff, direct relations и
Component preview/story captures
через общий capture service. MCP scope остаётся только Component preview/story; Wireframe/Page MCP
capture из этого решения не следует.

Source runtime обязан адаптировать общие semantic token roles к собственным переменным framework
library, не копируя значения во второй authored theme registry. Для Nuxt UI fixture это явный bridge
из `--ds-color-*` в `--ui-*`; Vue runtime также выставляет `.light`/`.dark` только для одноимённых
source modes. Поэтому Nuxt internals действительно меняются вместе с выбранной темой, а произвольная
`Sunset Gray` остаётся обычным source-authored mode с красно-оранжевым accent.

`.stories.json` и `.playground.json` являются optional Design Lab enrichment конкретной fixture,
а не новым обязательным контрактом для любого Vue repository. Существующая Vue implementation
может оставаться на месте; будущий ecosystem adapter сможет читать её native/CSF metadata.

Vue пока не объявляет `events`, `resize` или `inspection`: runtime ещё не передаёт event/state
telemetry, basic SFC printer не покрывает slots/complex values, deep Inspector отсутствует, а
fonts/ordinary Assets не доказаны в browser E2E. Fullscreen Playground уже сохраняет выбранные
variant, source theme и изменённые controls в URL; более широкая URL persistence остальных runtime
states и compile/runtime error fixtures остаются открыты. Wireframes/Pages и Svelte — следующие
отдельные web phases, а не обещания этой вертикали.

## D-088 — Vue surface остаётся частью одного Canvas, а runtime и dependencies изолированы

**Статус:** принято и реализовано для Vue Component vertical, 2026-07-26.

Managed iframe не рисует собственный фон в Catalog, Workbench Story или Playground: внешний shell
остаётся владельцем Canvas и его grid/solid background. Product mode управляет только token values
и не выводится эвристически в browser `color-scheme`. Только capture request передаёт
`captureSurface=true` и получает непрозрачный token-driven фон, необходимый для стабильного PNG.
Catalog preview принимает фактическую ширину карточки; capture geometry задаётся viewport снаружи,
а не фиксированной шириной runtime root, которая могла обрезать композицию в узкой карточке.
Поскольку Catalog не даёт пользователю product-mode control, его миниатюры используют token-declared
default mode активной Library. Название interface theme не участвует в этом выборе.

Изменение serializable args/state отправляется в уже загруженный iframe versioned сообщениями
`setArgs`/`setState`; URL и document не пересоздаются на каждый ввод. Managed runtime подтверждает
`ready`/`rendered`, локализует ошибки и делает не более двух автоматических retry. Catalog preview
является inert: iframe исключён из tab order и не перехватывает click карточки.

Смена source theme после первого `ready` аналогично отправляется через `setMode` вместе с resolved
CSS variables. Она не сбрасывает runtime state, не запрашивает новый iframe URL и не показывает
`Preparing Vue preview…`; этот initial state допустим только при первом запуске или настоящем
перезапуске runtime. Та же live-state труба обновляет draft variant через `setState` без reload.

`nuxt-ui-system` исключён из root wildcard workspace и владеет собственным manifest, lockfile и
derived `node_modules`. Полный `nuxt` не устанавливается; настоящий `@nuxt/ui` сохраняется целиком,
поскольку копирование отдельного внутреннего SFC превратило бы fixture в неподдерживаемый fork его
styles, composables и transitive dependencies. Child runtime резолвит exact `vue` entry из source,
не захватывая `vue-demi` широким alias.

Basic Vue handoff использует реальный default import package export и генерирует SFC Story usage.
`ActionField.vue` композиционно импортирует настоящие Button и Input, поэтому Workbench показывает
проверяемые `Uses`/`Used by`, а не демонстрационную metadata-связь. Slots, complex values, native
ecosystem metadata и deep Inspector остаются capability gaps.

## D-089 — Interface theme, Canvas background и source theme являются тремя независимыми осями

**Статус:** принято и реализовано для Component Workbench/Stories/Playground, 2026-07-26.

Тема оболочки Design Lab стилизует только приложение. Она никогда не выбирает тему просматриваемой
дизайн-системы, не меняет Canvas background и не интерпретирует имена вроде `dark`, `black` или
`blue`. Исходная тема при открытии берётся из `defaultMode` token document активного source; при
нескольких документах используется первый явно объявленный default в стабильном filesystem order.

Canvas background остаётся отдельной визуальной проверкой: dark grid, light grid или custom solid.
Раскрывающийся Canvas Background Control показывает две подписанные строки — Background и Theme.
Theme строится из всех token modes активного Project/Library и не ограничена парой light/dark:
`blue`, `red`, `white` и другие source-authored значения являются равноправными.

Один выбранный source theme синхронно применяется к production Playground и всем Stories текущего
Component. При переходе в fullscreen Playground текущий выбор переносится в route query и одинаково
восстанавливается React и Vue runtime. Managed iframe остаётся прозрачным; opaque token canvas
создаётся только capture contract, а не UI theme или source theme.

После первого запуска Vue iframe source theme меняется in-place командой `setMode`. Стабильный iframe
и Vue app сохраняются между переключениями; новый process, параллельный iframe и промежуточный
loading state для этого не создаются.

Framework library может иметь собственный слой semantic CSS variables (`--ui-*` у Nuxt UI), но он
обязан ссылаться на resolved variables текущего source mode. Этот bridge является adapter code, а не
второй палитрой и не причиной ограничивать Theme control значениями `light`/`dark`.

Deep link сначала доверяет source id из URL, а не сохранённой ранее Library. Асинхронные ответы
предыдущего source после переключения отбрасываются, поэтому React/Vue catalogs и Workbench не могут
смешаться из-за гонки загрузки.
