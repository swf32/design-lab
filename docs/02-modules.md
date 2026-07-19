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

Каждый module открывается по собственному корневому пути: `/home`, `/components`, `/wireframes`, `/pages`, `/assets`, `/palette`, `/tokens` и `/fonts`.

Вложенный semantic/filesystem path продолжает URL модуля. Папка открывает отфильтрованный каталог, например `/components/atoms/navigation`. Entity использует тот же контракт: `/components/atoms/navigation/SidebarTab` открывает Component Workbench, а `/assets/icons/TokensIcon` оставляет пользователя в Assets и выделяет соответствующую карточку.

Ссылка не содержит внутренний entity id и остаётся пригодной для копирования. Browser Back/Forward и прямое открытие URL восстанавливают активный module, folder scope и entity selection. Workbench Back использует ту же session history: Component, открытый из `All`, возвращается в `All`, а переход по dependency relation возвращается к исходному Component. Поэтому действие стабильно называется `Back`, а не именем вычисленного filesystem parent. Оно рендерится общей Library-кнопкой с полноценной control-height зоной нажатия и видимым keyboard focus. Только у прямой deep link без предыдущего Design Lab entry Back открывает корень активного module. Будущие сущности Wireframes и Pages используют тот же path-based contract.

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

## Pages

Pages — итоговые страницы продукта.

Они ближе всего к production.

Для них возможны:

- состояния;

- просмотр структуры;

- просмотр используемых компонентов;

- инспектор;

- CSS;

- props;

- changelog;

- взаимодействие между страницами.

## Инспектор

Для Pages предполагается инспектор наподобие DevTools.

При наведении можно увидеть:

- какой компонент используется;

- какие props выбраны;

- какие токены применены;

- CSS;

- возможность быстро скопировать нужную информацию.

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
