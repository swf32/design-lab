# Граница стилей приложения и System

> Срез: 2026-09-30. [Оглавление](README.md) · [решение D-090](DECISIONS.md#d-090--визуальная-кастомизация-shell-принадлежит-design-lab-system-композиция-остаётся-в-приложении) · [приоритеты](26-vision-and-next-steps.md) · [чеклист](IMPLEMENTATION-CHECKLIST.md#visual-customization-собственного-shell-d-090).

## Что проверяется сейчас

`npm run check:app-styles` разбирает CSS/SCSS под `design-lab/src/` и останавливает новые
декларации цветов, backgrounds, borders, radii, shadows, типографики, outlines, opacity и transitions.
Сравнение идёт с построчным [списком существующих деклараций](../scripts/app-visual-style-baseline.jsonl):
путь, контекст селектора и media rule, свойство и значение. Удалять старые декларации можно;
добавлять новые или менять значения без переноса владельца в System нельзя. Проверка включена в
корневые `npm test` и `npm run build`.

`design-lab/src/styles/default-skin.css` исключён: он является намеренным источником Skin variables,
а не route-level стилем. CSS/SCSS-проверка не запрещает app-local layout declarations вроде
`display`, `grid`, `padding` и `gap`, потому что часть из них нужна
product composition и runtime geometry. Это ограничение проверки, а не разрешение заводить новый
визуальный язык в приложении.

`npm run check:app-inline-styles` теперь отдельно разбирает TS/TSX AST: прямые JSX
`style={{...}}`, объектные литералы с типом `CSSProperties` и присваивания
`element.style.property = ...`. Девять существующих визуальных записей зафиксированы в
[inline baseline](../scripts/app-inline-style-baseline.jsonl); новые или изменённые значения
блокируются в `npm test` и `npm run build`. В эту базу входят отображение цветов и шрифтов
самих пользовательских токенов, а также стили временных clipboard elements. Это не объявляет
такие стили частью System. Динамически собранные объекты `style={variable}`, вызовы функций,
`setProperty()` и layout geometry пока вне проверки; их перенос и более полный контроль остаются
открытой работой.

## Существующий долг

Текущая база содержит **501** visual declarations. Они не объявлены правильным конечным ownership;
список только фиксирует состояние, чтобы оно не росло во время миграции.

После удаления дублирующих Workbench overrides для трёх режимов Story Canvas в приложении
осталась **491** visual declaration. Затем отдельный Canvas полноэкранного React/Vue Playground
был заменён существующим `WorkbenchPlayground`: осталось **482** app-local visual
declarations. Фон, floating background control и fullscreen stage presentation принадлежат
System; приложение оставляет route state, рендерер и геометрию мобильной панели.
После переноса общей поверхности, заголовка и ведущего AI-блока Settings в `SettingsPanel`
из активной System осталось **458** app-local visual declarations. Затем оформление identity,
token/palette values, swatches и copy affordance ячеек catalog `Table` перенесено в System:
осталось **427**. Затем responsive catalog grids, group spacing и общее пустое состояние
перенесены в `ModulePage`; осталось **420**. Браузерный fixture проверяет панели, таблицы и
каталожные сетки в dark/light, keyboard focus copy и узкую ширину; workflow state и данные
остаются в приложении.
Общая прокручиваемая оболочка, header и documentation rail четырёх Component/Page Workbench
перенесены в `WorkbenchLayout` активной System без смены визуальных значений. Осталось **392**
app-local visual declarations; installed browser fixture проверяет реальный Workbench, узкую ширину
и изменение rail style через project-owned System.
Затем `WorkbenchLayout` получил единые `WorkbenchSection`, `WorkbenchMarkdown` и
`WorkbenchPropsTable`: Component и Page detail views используют одинаковые documentation groups,
Markdown и мобильную таблицу props из активной System. Осталось **353** app-local visual
declarations; остальные story/catalog роли `ModuleView` ещё открыты.
`StoryCanvas.scss` владеет оформлением Story stage; `color.canvas-grid.light-text` хранит
читаемый цвет светлой сетки для dark и light app modes. Таблица ниже показывает исходные лимиты
baseline; десять записей из `ModuleView.scss` и девять из `ComponentPlaygroundView.scss`
удалены без пересборки baseline.

| App-local stylesheet | Деклараций в базе | Следующая граница |
| --- | ---: | --- |
| [`ModuleView.scss`](../design-lab/src/views/ModuleView/ModuleView.scss) | 288 | После переноса 31 declaration из ячеек `Table` и 7 из layout/empty state остаётся переносить catalog cards и другие текстовые роли в Library Components. |
| [`SettingsView.scss`](../design-lab/src/views/SettingsView/SettingsView.scss) | 73 | После `SettingsPanel` осталось 49; вынести status, dialog и folder picker presentation. |
| [`ComponentPlaygroundView.scss`](../design-lab/src/views/ComponentPlaygroundView/ComponentPlaygroundView.scss) | 49 | Оставить orchestration/canvas geometry; визуал панели и controls передать System. |
| [`PageView.scss`](../design-lab/src/views/PageView/PageView.scss) | 40 | Общие flow hint и dev controls должны иметь Library presentation. |
| [`WireframeView.scss`](../design-lab/src/views/WireframeView/WireframeView.scss) | 38 | Объединить повторяемые Page/Wireframe patterns в System. |
| [`globals.scss`](../design-lab/src/styles/globals.scss) | 8 | Оставить reset и browser-level правила; проверить акцентный outline. |
| [`ComponentCaptureView.scss`](../design-lab/src/views/ComponentCaptureView/ComponentCaptureView.scss) | 5 | Оставить техническую геометрию захвата; текстовую роль передать System. |

Порядок миграции по эффекту: сначала catalog/Workbench patterns из `ModuleView`, затем Settings,
затем общие Page/Wireframe controls. Каждая миграция должна сохранить текущий default look и
проверить dark/light, узкую ширину, keyboard focus и реальные состояния. Визуальный редизайн
не входит в текущую цель по [D-096](DECISIONS.md#d-096--визуальный-редизайн-исключён-из-текущей-цели).

## Правило изменения базы

Если работа переносит декларацию из приложения в System, удалите её из app-local файла; проверка
примет уменьшение без обновления базы. Не пересоздавайте baseline ради прохождения CI. Если
появляется действительно новое browser-level исключение, объясните его техническую необходимость
в review и обновите конкретную строку базы. Команда `node scripts/check-app-visual-styles.mjs
--write-baseline` существует для явной пересборки после такого review, а не для обычной правки UI.
