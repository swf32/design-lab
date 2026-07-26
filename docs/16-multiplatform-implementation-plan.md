# Multiplatform Components: implementation plan

**Статус:** web phases активны; native phases заморожены решением D-082 до выполнения Web
Definition of Done из `17-web-first-platform-strategy.md`.

Ближайшая цель — одно приложение Design Lab, которое полноценно исполняет Components, Wireframes и
Pages разных web frameworks без копий самого Design Lab и без обязательной перекладки
пользовательских файлов в один framework-specific шаблон. Native/desktop-native сохраняются в
roadmap, но не конкурируют с web за текущую реализацию.

Исследование, ограничения и первичные источники собраны в
[`15-multiplatform-components-exploration.md`](15-multiplatform-components-exploration.md).
Варианты runtime architecture и точное значение lifecycle разобраны в
[`18-web-runtime-architecture-options.md`](18-web-runtime-architecture-options.md); выбор ещё не
принят.

## Неподвижные продуктовые требования

- [x] Design Lab остаётся одним приложением и одним Workbench shell.
- [x] React, Vue, Svelte, Custom Elements, browser/Wasm, SwiftUI и Compose не требуют отдельных
      вариантов приложения.
- [x] Базовое discovery стремится работать без обязательного Design Lab metadata-файла.
- [x] Существующие ecosystem contracts используются раньше собственных: package exports,
      framework metadata, Storybook CSF, `#Preview`, `@Preview` и preview URLs.
- [x] Неизвестная technology остаётся видимой как catalog entity и не ломает соседние entities.
- [x] Поддержка capability-based: отсутствие live preview не скрывает Component.
- [x] Web и native implementations одной роли связываются через optional Component Family, но не
      получают ложный единый props API.
- [x] Designer review является визуальным; source diff/hash/build logs не являются обязательным
      дизайнерским действием.
- [x] Для будущего native track web representation является дополнением, а platform-native
      implementation и platform rules — основной технической реальностью.
- [x] Native code никогда не перезаписывает ручные изменения молча; эта защита работает внутри
      системы или в Developer mode.
- [x] Двусторонняя автоматическая синхронизация web <-> native не проектируется.

## Phase 0 — безопасная миграционная основа

- [x] Добавить normalized `ComponentImplementation` с `platform`, `technology`, `adapter`,
      `locator`, `contract` и `capabilities`.
- [x] Сохранить текущую форму Component API на время миграции, добавляя новые поля без breaking
      удаления существующих.
- [x] Ввести server-side adapter registry; текущий `component.json + TSX` scanner становится
      `react-manifest` adapter, а не универсальной моделью.
- [x] Ввести capability vocabulary: `catalog`, `contract`, `static-preview`, `live-preview`,
      `controls`, `inspection`, `composition`, `capture`, `handoff`, `native-validation`.
- [x] Добавить scoped diagnostics для adapter detection, ambiguous identity, unavailable runtime и
      unsupported capability.
- [x] Добавить contract tests на backward compatibility существующих React Components.
- [x] Добавить fixtures минимум для React, manifest-free TSX, Vue SFC, Svelte, Custom Element,
      external preview, SwiftUI и Compose discovery.

### Exit criteria

- [x] Все текущие Components обнаруживаются с прежними id/routes/imports.
- [x] Каждый Component API response сообщает platform, technology, adapter и capabilities.
- [x] Ошибка одного adapter не ломает catalog другого adapter.

## Phase 1 — discovery без обязательного `component.json`

- [x] Отделить entity identity от директории: implementation может быть export, SFC, Custom
      Element, Swift `View`, Kotlin `@Composable` function или external locator.
- [x] Определить adapter evidence и confidence; inference никогда не записывается в source молча.
- [x] React/JSX adapter обнаруживает публичные PascalCase exports и исключает tests, stories,
      previews, playgrounds, types и private helpers.
- [ ] Vue adapter обнаруживает `.vue` SFC и public package exports.
- [ ] Svelte adapter обнаруживает `.svelte` Components и exports.
- [ ] Custom Elements adapter обнаруживает `customElements.define` и, когда присутствует,
      Custom Elements Manifest.
- [ ] Swift adapter обнаруживает `View` implementations и `#Preview` evidence.
- [ ] Compose adapter обнаруживает `@Composable` functions и `@Preview` evidence.
- [ ] Generic browser adapter обнаруживает declared external preview/build target.
- [ ] Optional source-level configuration разрешает только неоднозначность roots/build/runtime;
      она не перечисляет каждый Component вторым registry.
- [x] Directory Panel строится из фактических locators и не содержит hardcoded framework folders.

### Exit criteria

- [x] Component без `component.json` появляется в Catalog при достаточном framework evidence.
- [ ] Optional metadata улучшает identity/semantics, но его удаление возвращает entity к derived
      состоянию, а не скрывает её.

## Phase 2 — изолированные web runtimes

- [ ] Убрать пользовательский Library code из eager Vite graph приложения Design Lab.
- [ ] Определить единый iframe/process protocol: `ready`, `render`, `setArgs`, `event`, `resize`,
      `error`, `capture`, `inspect`, `dispose`.
- [ ] Изолировать dependencies, global CSS и runtime errors по source/adapter.
- [ ] React adapter воспроизводит текущие Preview/Story/Playground возможности.
- [ ] Project Components получают тот же runtime path, что Library Components.
- [x] External URL adapter показывает любой browser-renderable target без deep inspection.
- [ ] Custom Elements adapter поддерживает properties, attributes, events и slots.
- [ ] Vue adapter поддерживает SFC props/emits/slots и live preview.
- [ ] Svelte adapter поддерживает props/events/snippets/slots и live preview.
- [ ] Angular adapter добавляется после проверки dependency injection/build cost.
- [ ] Generic Go/Wasm target запускается через external browser harness; Design Lab не придумывает
      Component API там, где source его не предоставляет.
- [ ] Watcher перезапускает только затронутый runtime.
- [ ] Runtime install/build command требует явного первого разрешения и показывает logs/errors.

### Exit criteria

- [ ] React и минимум один non-React implementation одновременно открываются в одном Design Lab.
- [ ] Ошибка/несовместимая dependency одного runtime не роняет shell или соседнюю Library.
- [x] Пользователь не запускает отдельный Design Lab для другого framework.

## Phase 3 — framework-neutral Workbench

- [x] Workbench выбирает UI по capabilities, а не по `tsx`/React assumptions.
- [ ] Catalog различает authored, generated, external и fallback preview.
- [ ] Controls используют normalized serializable contract и сохраняют platform-specific raw type.
- [ ] Source panel показывает правильный язык и canonical usage для активной implementation.
- [x] Inspector имеет adapter-specific depth; отсутствие deep inspection объясняется, а не
      имитируется.
- [ ] Capture работает для любого browser runtime через общий surface contract.
- [ ] Storybook CSF ingestion использует существующие Stories без обязательного переписывания в
      Design Lab Story format.
- [ ] URL сохраняет implementation/platform/technology и активное состояние.
- [ ] Поиск и MCP возвращают capabilities и не обещают недоступные действия.

### Exit criteria

- [ ] Одна Component detail page переключается между двумя web implementations.
- [x] Controls/Inspector отображаются только когда adapter реально их поддерживает.

## Phase 4 — Component Family

- [x] Ввести optional semantic `ComponentFamily` отдельно от implementation identity.
- [ ] Предлагать family candidates по имени, semantic metadata и соседству, но не связывать молча.
- [ ] Поддержать связь implementations из физически разных Library.
- [ ] Добавить platform/technology switcher и comparison view. (Переключатель внутри одной source
      готов; comparison view и cross-Library выбор ещё не готовы.)
- [ ] Tokens, anatomy, variants, states и guidance могут быть family-level; code API остаётся
      implementation-level.
- [ ] Search/MCP умеют вернуть family и выбрать подходящую implementation по target platform.
- [ ] Rename/move implementation не теряет подтверждённую family relation без diagnostic.

### Exit criteria

- [ ] Web, iOS и Android Button видны как одно семейство с тремя честными implementations.
- [x] У implementations могут быть разные props и разные capability levels.

## Phase 4.5 — Web Wireframes и Pages

- [ ] Заменить TSX-only runtime registry общим renderer adapter locator.
- [ ] Сохранить текущие `*.wireframe.tsx` и `*.page.tsx` как React compatibility adapters.
- [ ] Добавить Vue Wireframe/Page renderers с теми же serializable layouts, states, controls и flow.
- [ ] Добавить Svelte Wireframe/Page renderers с теми же serializable layouts, states, controls и
      flow.
- [ ] Определить Custom Elements/browser-boundary composition для screen-level entities.
- [ ] Перенести fullscreen review, catalog previews и flow previews на общий runtime protocol.
- [ ] Сделать inspection/handoff capability-gated и framework-specific по глубине.
- [ ] Удалить React-only assumptions из Wireframe/Page rules, API, MCP и generated usage.

### Exit criteria

- [ ] В одной source одновременно открываются React и Vue либо Svelte Page/Wireframe.
- [ ] `wireframe.json`/`page.json` semantics не дублируются для каждого framework.
- [ ] Падение одного screen runtime не роняет Canvas, sitemap или соседнюю implementation.

## Phase 5 — native design handoff (заморожено до Web Definition of Done)

До открытия этой фазы отдельно выбирается platform track и native-specialized agent/toolchain.
Designer подтверждает native render и platform warnings, а не читает exact source diff. Код, diff,
provenance, hash и build logs доступны системе и Developer mode. Web representation является
дополнительной visual surface; она не считается основной native implementation.

- [ ] Определить editable web surrogate как optional design implementation, а не production native
      runtime.
- [ ] Добавить SwiftUI и Compose code generators/adapters с deterministic formatting.
- [ ] Generated code хранит provenance: source implementation, generator version, generated hash и
      last confirmed source revision.
- [ ] Regeneration всегда показывает exact diff до записи.
- [ ] Modified generated file блокирует silent overwrite и предлагает regenerate, keep или detach.
- [ ] `detached` implementation остаётся обычным authored source и больше не управляется generator.
- [ ] Handoff UI показывает язык, imports, component body/usage и platform notes. (Исходник, язык,
      provenance и platform warning готовы; отдельные imports/usage ещё не нормализованы.)
- [ ] Добавить accessibility, dynamic type/font scaling, platform controls и gesture caveats.
- [ ] AI generation следует тем же preview/diff/write правилам, что deterministic generator.

### Exit criteria

- [ ] Дизайнер меняет visual representation и получает проверяемый native render с понятным
      описанием различий и platform warnings.
- [ ] Разработчик копирует platform code, не принимая его за молча проверенный production artifact.
- [ ] Ручное изменение native code невозможно потерять из-за regeneration.

## Phase 6 — native validation и captures (заморожено до Web Definition of Done)

- [ ] Swift adapter проверяет доступность macOS/Xcode toolchain.
- [ ] Swift build validation использует публичные `xcodebuild`/Simulator interfaces.
- [ ] Swift static capture хранится как derived cache с environment metadata.
- [ ] Compose adapter проверяет Gradle/JDK/Android toolchain.
- [ ] Compose использует существующие `@Preview` и, когда доступно, Preview Screenshot Testing.
- [ ] Native validation/capture запускается только явно и показывает стоимость/прогресс/logs.
- [ ] Compare view различает web surrogate и native capture.
- [ ] Capture cache инвалидируется по source, tokens, dependencies, toolchain и device configuration.
- [ ] Interactive Simulator/Emulator streaming рассматривается только после измерения спроса.

### Exit criteria

- [ ] Минимум одна SwiftUI и одна Compose implementation получают platform-native static capture.
- [ ] Отсутствующий toolchain деградирует до handoff/static capability без падения Component.

## Phase 7 — Native Wireframes, Pages и AI (заморожено до Web Definition of Done)

- [ ] Wireframe/Page объявляет target runtime/platform через implementation selection, а не через
      отдельный entity kind.
- [ ] Cross-framework web composition разрешается только через browser-native boundary или explicit
      wrapper; Design Lab не создаёт ложный общий tree.
- [ ] Native Wireframe/Page использует web design composition и platform handoff до появления
      native composition adapter.
- [ ] AI выбирает Component implementation по source, platform, technology и capabilities.
- [ ] MCP exposes family/implementation relations, exact locators и available operations.
- [ ] Rules могут быть platform-specific и family-level без обязательной общей intersection schema.
- [ ] Export/handoff сохраняет provenance и предупреждения о surrogate/generated artifacts.

## Не строить

- [x] Не создавать отдельные приложения Design Lab для разных frameworks.
- [x] Не создавать универсальный source AST/transpiler для React/Vue/SwiftUI/Compose.
- [x] Не требовать конвертировать все web Components в Custom Elements.
- [x] Не поддерживать один общий dependency graph для всех пользовательских Library.
- [x] Не выдавать generated Swift/Kotlin за проверенный production code.
- [x] Не проектировать silent two-way web/native synchronization.
- [x] Не блокировать catalog entity из-за отсутствия Preview, Stories, docs или live runtime.

## Общая Definition of Done

- [ ] Один запуск Design Lab показывает несколько frameworks/platforms одновременно.
- [x] Текущие React Library продолжают работать без массовой миграции.
- [x] Базовое discovery хотя бы для React/Vue/Svelte/Custom Elements/SwiftUI/Compose не требует
      обязательного per-Component Design Lab manifest.
- [ ] Runtime и dependency failure локализованы до одной implementation/source.
- [ ] Web Component можно открыть live; native Component можно спроектировать, получить handoff и
      проверить static native capture.
- [ ] Component Family объединяет продуктовую семантику, не скрывая различия platform APIs.
- [ ] Ни один generated/native файл не перезаписывается молча; designer flow подтверждает visual
      result, а source-level разрешение конфликта остаётся в Developer mode.
- [ ] Docs, tests, MCP/CLI и UI описывают одинаковые capability guarantees.
