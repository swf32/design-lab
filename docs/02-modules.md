# Home

Главная страница проекта.

Содержит:

- документацию;

- описание проекта;

- инструкции;

- информацию для разработчиков;

- информацию для дизайнеров.

Если раздел пустой — объясняет, как им пользоваться.

## Навигация и deep links

Каждый module открывается по собственному корневому пути: `/home`, `/components`, `/wireframes`, `/pages`, `/assets`, `/palette`, `/tokens` и `/fonts`. Маршрут — `/<module>/<sourceId>/<path>`: активный Project/Library является частью самого пути, а не только сохранённым session state (см. `D-045` в `DECISIONS.md`, заменяет более раннее решение не кодировать source в URL). Это гарантирует, что ссылка на сущность остаётся стабильной, даже если у нескольких библиотек совпадает filesystem path (например, `atoms/actions/Button` в двух разных дизайн-системах) — открывающий ссылку человек не зависит от того, какой source был активен в его собственном браузере ранее.

Вложенный semantic/filesystem path продолжает URL модуля и source. Папка открывает отфильтрованный каталог, например `/components/design-lab-system/atoms/navigation`. Entity использует тот же контракт: `/components/design-lab-system/atoms/navigation/SidebarTab` открывает Component Workbench, а `/assets/design-lab-system/icons/TokensIcon` оставляет пользователя в Assets и выделяет соответствующую карточку.

Ссылка не содержит внутренний entity id и остаётся пригодной для копирования. Browser Back/Forward и прямое открытие URL восстанавливают активный source, module, folder scope и entity selection. Workbench Back использует ту же session history: Component, открытый из `All`, возвращается в `All`, а переход по dependency relation возвращается к исходному Component. Поэтому действие стабильно называется `Back`, а не именем вычисленного filesystem parent. Оно рендерится общей Library-кнопкой с полноценной control-height зоной нажатия и видимым keyboard focus. Только у прямой deep link без предыдущего Design Lab entry Back открывает корень активного module. Будущие сущности Wireframes и Pages используют тот же path-based contract.

## Directory navigation

Directory Panel показывает только semantic entities активного модуля. Реальные папки по умолчанию свёрнуты, поэтому первый экран содержит virtual rows и папки верхнего уровня. Стрелка disclosure только раскрывает или сворачивает ветку; отдельный tap по label выбирает folder scope и меняет URL.

Поиск включён по умолчанию и показывает совпавшие сущности вместе с их родительскими папками. Icon coloring и future actions также включены по умолчанию, но каждый capability отключается отдельным prop. Клик по entity icon открывает общий Color Picker; выбранный presentation color сохраняется локально по source, kind и canonical path и не записывается в filesystem или design tokens. Trailing More control проявляется только при hover/focus и резервирует системный slot для будущих entity actions.

На ширине телефона Application Sidebar и Directory Panel объединяются в modal navigation drawer поверх одноколоночного Workspace. Drawer открывается из постоянного workspace header, имеет явный Close, закрывается по backdrop и Escape, а выбор module, source, folder или entity сразу возвращает пользователя к контенту. Desktop сохраняет совместную изменяемую ширину двух navigation panels; resize handle на телефоне отсутствует.

Мобильный Workspace использует один вертикальный scroll owner внутри активного Module/Workbench. Catalog cards складываются в одну колонку на узком телефоне и в две в landscape; token rows и props API переходят из широких таблиц в двухстрочные карточки. Header и content сохраняют минимум `16px` боковых gutters, соседние catalog groups разделены усиленным vertical rhythm. Safe-area insets, touch targets не меньше `44px`, поля высотой минимум `48px` с текстом `16px` и отсутствие горизонтального overflow являются частью shell contract.

## Components

Основа Design Lab.

Каждый компонент существует как обычная папка.

Внутри могут находиться:

- основной компонент;

- preview;

- stories;

- changelog;

- документация;

- дополнительные файлы.

Design Lab автоматически отображает:

- визуальное превью;

- Playground;

- Storybook-представление;

- код;

- документацию;

- props;

- состояния;

- зависимости;

- где используется компонент;

- что использует сам компонент.

Component lifecycle использует `wireframe`, `in-progress` и `ready`. Catalog показывает статус production `Chip` рядом с названием карточки. Если status отсутствует или неизвестен, entity остаётся доступной, а Workbench показывает completeness diagnostic.

Соседний `ComponentName.playground.tsx` автоматически создаёт `/components/<path>/playground`. Playground является отдельным fullscreen typed multi-variant review mode без Application Sidebar, Directory Panel и workspace header. На desktop остаются только постоянный левый controls rail и Canvas; на mobile первым показывается Canvas, а полупрозрачная neutral `WorkbenchAction` Settings снизу слева открывает dismissible overlay rail. Canvas Background Control плавает сверху справа над Canvas. Варианты переключаются по stable ids, controls строятся из общего registry, а активный variant, mode и значения сериализуются в URL. Production `WorkbenchInspector` с фиолетовым dashed `WorkbenchAction` снизу справа включает hover-preview на desktop и pinned selection по click/tap. Review-build AST transform автоматически связывает обычные TSX imports с найденными Component manifests, определяет slots из manifest props и регистрирует host source locations без авторских `data-dl-*` или строк-дублей. Component даёт точный authored JSX callsite, named slot — его authored TSX и canonical imports, обычный DOM element — исходный SCSS/CSS из Node analyzer с `$variables`, mixins, nesting, `100%` и `var(...)`, а не CSSOM/computed pixels/RGB. Wireframe-only Component может существовать без production implementation, preview и Stories; после выбора направления он дополняется production-файлами в той же папке и проходит lifecycle до `ready`.

Workbench начинает detail с автоматически вычисленного Component Reference: канонический package import через production `CodeBlock`, полный список фактически найденных файлов и четыре группы прямых связей. `Uses` / `Used by` строятся из production implementation, а `Examples use` / `Used in examples by` — только из импортов соседнего story module, исключая уже известные production dependencies. Это позволяет, например, показать Button как production dependency Create Project Dialog, но Button внутри Story Canvas — только как зависимость примера.

Story JSX не хранится в `ModuleView`. Manifest указывает соседний `*.stories.ts(x)`, который экспортирует metadata `stories` и исполняемый `renderStoryExample`; Workbench автоматически находит модуль по filesystem directory. Добавление нового Component со Story не требует правки application registry или switch по component id.

Preview использует площадь карточки только для узнаваемой иллюстрации компонента. Название принадлежит нижнему overlay Component Card, а category, source entry и variant count остаются catalog/detail metadata и не повторяются внутри preview как заголовки, badges или легенды. Текст внутри иллюстрации остаётся только там, где он является частью изображаемого UI.

Preview строится от реального implementation, а не от названия компонента. По умолчанию он показывает один крупный representative specimen и один главный visual contract; дополнительные состояния допустимы только для объяснения одной оси поведения. Родительский shell, выдуманные controls и декоративное заполнение карточки запрещены, если они не принадлежат самому компоненту. Сравниваемые элементы получают явные общие линии, а оптическое центрирование и заявленное выравнивание проверяются внутри фактической Component Card в dark и light themes.

Preview area владеет общим видимым safe area: `spacing.4` по горизонтали и `spacing.3` по вертикали. Full-width specimen учитывает собственные padding и border через `border-box` и не касается края карточки. Edge-to-edge допустим только как явно объявленное исключение, когда контакт с краем является определяющим поведением самого компонента.

Component Card не добавляет отдельный footer к высоте preview: название лежит поверх нижнего token-driven gradient, а card height совпадает с preview area. Карточка не имеет border и визуального hover treatment, сохраняет постоянную заливку и радиус `12px` на всех углах. Keyboard focus остаётся явно видимым. Grid каталога использует `spacing.1` между карточками.

## Storybook

Design Lab должен максимально повторять опыт работы со Storybook.

Причина проста:

если команда использует Storybook, переход должен быть практически бесшовным.

## Компонент как объект

Компонент — не просто TSX-файл.

Это полноценная сущность продукта.

Production implementation импортирует соседний `ComponentName.scss`; scanner автоматически добавляет этот файл в component entity как `style`, а Workbench показывает его в полном списке файлов рядом с implementation, manifest, preview, stories, docs и changelog. Тот же scanner читает статические TypeScript/TSX imports и строит прямой dependency graph; `import type` не считается runtime usage. Preview import production Component считается нарушением illustrative preview contract и выводится как diagnostic, а не смешивается с production или example graph. Общего реестра component CSS и package-wide `styles.css` нет. Catalog-only стили объявляются непосредственно в `ComponentName.preview.tsx` и не загружаются как часть production-компонента. `npm run format:styles` форматирует оба вида CSS, а `npm run check:styles` не допускает возврата однострочных style sources и повторных селекторов в одном cascade context.

Для него должны существовать:

- история;

- документация;

- playground;

- варианты;

- использование;

- зависимости;

- превью;

- связи.

## Wireframes

Wireframes — это черновые варианты страниц.

Основная задача:

генерировать множество решений одной проблемы.

Например:

10 вариантов экрана.

Каждый вариант может иметь:

- состояния;

- переключатели;

- параметры;

- dev-панель.

Wireframe предназначен для обсуждения и аналитики.

Канонический Wireframe использует гибридный контракт: `wireframe.json` хранит layout directions, typed controls, saved states и directed user-flow graph, а соседний `*.wireframe.tsx` рендерит варианты из реальных Library Components и exploratory blocks. Layout, state и flow не смешиваются: один state можно сравнивать в разных информационных архитектурах, а flow объясняет, какое действие переводит в следующий state.

Fullscreen review route сохраняет layout, state, Screen/User flow view, mode активной Library и serializable values в URL. Постоянного toolbar нет: полупрозрачный orange dashed Dev mode является единственным внешним navigation/control action и содержит back, Screen/User flow, share link, product mode, saved states и typed controls. Отдельный purple dashed Inspector снизу справа отвечает только за developer handoff и использует тот же production `WorkbenchInspector`, что Component Playground. Одна product theme не создаёт control, две-три используют Tab Switcher, четыре и больше — Radio Buttons; interface theme Design Lab не влияет на этот список. Каталог использует default source mode, а каждая flow node показывает рядом реальные desktop 16:9 и portrait mobile screens одного adjacent renderer. Infinite Canvas автоматически раздвигает близкие authored columns/rows, двигает и масштабирует ослабленную бесконечную сетку, поддерживает pan и pinch-to-zoom без page zoom. Product target actions, например Team seats, остаются внутри страницы, а не дублируются Dev controls. Category folder остаётся filtered catalog route и не открывается как Wireframe entity.

## Pages

Page — итоговая, production-composed страница продукта: точка выпуска пайплайна Wireframe → Page. В отличие от Wireframe у неё нет `layouts[]` и exploratory local blocks — ровно одна committed композиция, собранная только из реальных Library Components; если экрану всё ещё нужно сравнение layout-направлений, это остаётся задачей Wireframe.

Канонический Page использует тот же гибридный контракт, что Wireframe: `page.json` хранит identity, авторский production `route`, `controls[]`/`states[]` для domain/data-условий (авторизация, тариф, права) и единый flow graph, а соседний `*.page.tsx` рендерит реальную композицию. `controls[]`/`states[]` — это не layout-варианты, а такие условия, как «пользователь авторизован», «подписка активна» или «список пуст», и они переключаются в Dev mode так же, как у Wireframe.

Flow graph у Page объединяет два вида переходов в одной структуре: внутренние (между states этой же страницы) и cross-Page (`kind: "page"`, с необязательным `condition` на значение control) — например, кнопка «Профиль» ведёт на страницу авторизации для неавторизованного пользователя и на страницу профиля для авторизованного. Per-Page Canvas переиспользует Wireframe user-flow Canvas; отдельный derived (не authored) агрегированный sitemap на уровне каталога Pages автоматически собирает cross-Page edges всех страниц источника в единый граф навигации по сайту.

`route` — это hand-off metadata для фронтендеров, а не литеральный маршрут внутри самого Design Lab: fullscreen review зеркалирует его, когда он не пересекается с зарезервированными top-level модулями Design Lab (`components`, `wireframes`, `pages`, ...); при конфликте Design Lab тихо откатывается на filesystem-путь и поднимает diagnostic — зарезервированные маршруты Design Lab всегда выигрывают.

Открытие Page из каталога не сразу попадает в fullscreen: сначала открывается inline **Page card** с описанием, списком действий/переходов и diagnostics. Diagnostic можно acknowledge только явным действием с обязательным текстовым `reason`, который сохраняется в `diagnosticsAcknowledged[]` и остаётся видимым (приглушённым, а не скрытым) — это аудируемая история в git, а не тихая настройка. AI-агенты никогда не заполняют это поле от имени пользователя без явного запроса и объяснения, почему diagnostic неустраним.

`page.json` не описывает связь с реальным API: по умолчанию всё mock-first через `controls[]`/`states[]`; если автору страницы всё же нужен настоящий network-вызов, это обычный код в `*.page.tsx` без отдельного Design Lab-контракта.

## Инспектор

Pages используют тот же production `WorkbenchInspector`, что Component Playground и Wireframe. При наведении/выборе можно увидеть:

- какой Component используется — с покровным фиолетовым пунктиром на его корне;
- какие named slots заняты — с розовым пунктиром;
- какие props переданы и какие токены применены;
- исходный authored CSS/SCSS фрагмент, а не computed-значения;
- возможность одним действием скопировать весь handoff-фрагмент.

Поскольку Page не содержит exploratory blocks, любой обнаруженный «сырой» элемент без owning Component — сигнал, что в Library всё ещё не хватает нужного Component.

## Assets

Хранилище всех ресурсов проекта.

Поддерживаются:

- SVG;

- TSX-иконки;

- изображения;

- видео;

- любые дополнительные медиа.

Компоненты не владеют приватными захардкоженными иконками. Новая продуктовая иконка добавляется в канонический `assets/icons/` выбранной Library, экспортируется как code-native asset и только затем импортируется в implementation, preview или stories.

При создании Project Design Lab формирует три канонические верхнеуровневые папки: `assets/icons/`, `assets/images/` и `assets/videos/`. Они задают понятный исходный порядок, но внутри них пользователь свободно создаёт собственные категории и любую глубину вложенности.

Assets автоматически обнаруживает поддерживаемые SVG/TSX icons, raster images и video files. Directory Panel показывает папки и asset entities, а правая область — `AssetCard` с реальным raster thumbnail или type-specific presentation.

## Palette

Palette — визуальное представление цветовой системы.

Основные возможности:

- просмотр палитры;

- копирование цветов;

- отображение семантических цветов;

- отображение примитивов.

Palette рассматривается как отдельный слой поверх Tokens.

## Tokens

Все дизайн-токены проекта:

- цвета;

- размеры;

- spacing;

- radius;

- shadows;

- typography;

- любые другие значения.

## Fonts

Раздел типографики.

Показывает:

- H1-H6;

- размеры;

- веса;

- стили;

- возможность быстро копировать токены.

## Rules

Правила проекта.

Здесь должны храниться:

- инструкции;

- AI Rules;

- code rules;

- рекомендации.

Желательно использовать Markdown.
