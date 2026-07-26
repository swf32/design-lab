# Web runtime feature parity: что обязаны уметь React, Vue и Svelte

**Статус:** обязательный Web Definition of Done, принят 2026-07-26. Первый protocol/capture
bridge реализован для текущего React runtime; isolated React, Vue и Svelte runtimes ещё не готовы.
Полный source audit и точные границы уже проверенного находятся в
`22-web-stack-coupling-audit.md`.

## Зачем нужен отдельный gate

Поддержка framework не считается готовой, если Design Lab только нашёл файл или сумел один раз
показать Component. Иначе Vue/Svelte становятся урезанным вторым классом: карточка есть, а Stories,
controls, states, inspection и MCP screenshot молча не работают.

Одна возможность имеет одно и то же пользовательское значение во всех adapters. Если adapter её
не реализовал, он не публикует capability. Shell и MCP показывают понятное `unsupported`, а не
React fallback, чужой thumbnail или успешный ответ с неправильным изображением.

## Честное текущее состояние

| Возможность                             | React сейчас               | Vue/Svelte сейчас       | Что должно стать общим                            |
| --------------------------------------- | -------------------------- | ----------------------- | ------------------------------------------------- |
| Discovery, Directory                    | да                         | basic file discovery да | exports/metadata analyzers ещё нужны              |
| Catalog authored preview                | да через eager React glob  | нет, generic fallback   | runtime preview + provenance                      |
| Raw source handoff, search, MCP get     | да                         | да при найденном source | canonical usage/relations ещё adapter-specific    |
| Живой Component preview                 | eager React graph          | нет                     | isolated runtime `render`                         |
| Stories                                 | React Story module         | нет                     | adapter читает/нормализует framework story source |
| Props/state controls                    | React Story props          | нет                     | serializable args/state contract                  |
| Preview/Story screenshot через CLI/MCP  | React compatibility bridge | нет                     | runtime-owned capture surface                     |
| Wireframe/Page render, states и flow    | eager TSX registries       | нет                     | те же runtime messages, другой entity kind        |
| Runtime errors и HMR                    | общий Vite graph           | нет                     | isolated diagnostics/HMR на runtime profile       |
| Tokens, Palette, Fonts, ordinary Assets | общий source               | общий source            | runtime loading надо доказать E2E                 |
| TSX code-native icons                   | да                         | нет                     | SVG source или framework-specific asset family    |

В частности, arbitrary `previewUrl` сегодня даёт живой iframe, но не объявляет `capture`: без
bridge Design Lab не может гарантировать readiness, выбранное состояние и точную поверхность.

## Один protocol вместо отдельных продуктов

Shell не вызывает `ReactDOM`, `createApp` или Svelte `mount` напрямую. Он отправляет versioned JSON
messages конкретному runtime profile:

- commands: `handshake`, `render`, `setArgs`, `setState`, `setMode`, `capture`, `inspect`, `dispose`;
- events: `ready`, `rendered`, `event`, `resize`, `captureReady`, `inspection`, `error`, `disposed`;
- capabilities: Component preview/story/playground, Wireframe/Page render, controls, events, resize,
  capture, inspection и HMR.

Profile выбирается по `source + technology + package environment`. Vue adapter внутри себя
использует Vue `createApp()/unmount()`, Svelte adapter — собственные `mount/unmount`, React adapter —
React root. Для shell и MCP это одна и та же serializable труба.

Protocol не пытается унифицировать framework internals. Props/emits/slots/snippets, deep Inspector
и story ingestion остаются adapter-specific, но нормализованный результат и честная capability
одинаковы.

## Как работает screenshot

```text
MCP/CLI capture
  → находит Component и его runtime profile
  → runtime рендерит нужные Story/args/mode
  → runtime сообщает captureReady и descriptor поверхности
  → Playwright проверяет readiness, размер и overflow
  → снимает объявленную поверхность
  → возвращает PNG + adapter/profile/capabilities + diagnostics
```

Descriptor принадлежит runtime, а не MCP: entity/view, opaque `selector`, CSS width/height и DPR.
Поэтому capture service не должен знать React CSS-классы. Текущий React Component renderer уже
отвечает для preview/story. Wireframe/Page не являются MCP capture targets в текущем продукте.
Vue/Svelte должны вернуть тот же descriptor; отдельные `capture_vue` и `capture_svelte` команды
запрещены.

Capture никогда не подменяется красивой заглушкой. Если Vue runtime не поддерживает Story capture,
MCP возвращает capability error. Catalog всё равно может показать Component и исходники.

## Definition of Done для web adapter

### Components

Framework adapter считается поддержанным только когда integration fixtures доказывают:

1. Discovery и stable identity в single-package и multi-mount source.
2. Live preview реальной implementation, token mode, fonts/assets и predictable resize.
3. Минимум одна Story, serializable props/args, event и state update.
4. Localized compile/runtime error: соседний runtime и shell продолжают работать.
5. HMR после изменения source без ручного перезапуска всего Design Lab.
6. Preview и Story capture через тот же UI route, CLI и MCP tool.
7. Source handoff указывает настоящую framework implementation.
8. Отсутствующие inspect/controls/story capabilities видимы и не имитируются.

### Wireframes и Pages

После Component parity тот же adapter в отдельной фазе должен поддержать реальные framework renderers для
Wireframe и Page: state snapshots, typed controls, token modes, flow/navigation events, fullscreen,
resize и errors/HMR. Manifest semantics и user-flow graph остаются общими; React,
Vue и Svelte файлы не обязаны иметь одинаковый синтаксис.

### Общие модули

Tokens, Palette, Fonts и ordinary Assets проходят отдельный cross-framework fixture, который
доказывает, что все runtimes читают один semantic source. Допускается adapter-specific loader или
generated CSS, но не вторая Vue/Svelte копия значений.

## Обязательная test matrix

| Проверка                 | React    | Vue      | Svelte   |
| ------------------------ | -------- | -------- | -------- |
| Component preview + HMR  | required | required | required |
| Story + args/state/event | required | required | required |
| UI preview capture       | required | required | required |
| CLI/MCP preview capture  | required | required | required |
| CLI/MCP Story capture    | required | required | required |
| token modes/fonts/assets | required | required | required |
| isolated error           | required | required | required |
| Wireframe states/flow    | later web phase | later web phase | later web phase |
| Page states/navigation   | later web phase | later web phase | later web phase |

Deep Inspector может иметь разную глубину, но matrix проверяет, что заявленная глубина совпадает с
реальностью. Новая framework badge не выпускается, пока обязательные строки для соответствующего
этапа не зелёные.

## Порядок реализации

1. Закончить protocol host и перенести React Components, Wireframes и Pages из eager globs без
   регрессий.
2. Подключить Vue Component adapter и прогнать всю Component matrix, включая MCP capture.
3. Подключить Vue Wireframe/Page renderers.
4. Повторить те же gates для Svelte.
5. Добавить Custom Elements; external URL оставить escape hatch с capability negotiation.

Такой порядок медленнее, чем показать один Vue demo, но не создаёт три разных Design Lab и не
оставляет скрытый React-only хвост в каждой следующей функции.

## Первичные технические опоры

- [Vite JavaScript API: controlled `createServer`](https://vite.dev/guide/api-javascript)
- [Vue Application API: `createApp`, `mount`, `unmount`](https://vuejs.org/api/application.html)
- [Svelte runtime reference](https://svelte.dev/docs/svelte)
- [Playwright locator screenshots](https://playwright.dev/docs/screenshots)
