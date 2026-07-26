# Multiplatform Components: архитектурное исследование

**Статус:** исследование, решение не принято.

Этот документ сохраняет аудит текущей React-зависимости Design Lab и варианты будущей поддержки
React, Vue, Svelte, Web Components, browser/Wasm runtimes, SwiftUI и Android Compose. Он не вводит
новый файловый контракт и не меняет действующие `COMPONENT_RULES.md` или core invariants. Перед
реализацией потребуется отдельное продуктовое решение и план миграции.

## Желаемый пользовательский опыт

Пользователь запускает одно приложение Design Lab и работает в одном знакомом интерфейсе. Он не
устанавливает отдельные варианты Design Lab для React, Vue, SwiftUI или Compose. Активный Component
может иметь одну или несколько реализаций, а Workbench выбирает подходящий способ показа внутри
одного Canvas.

Design Lab не обязан давать каждой реализации одинаковые возможности. Неизвестный или нативный
Component может сначала иметь только каталог, файлы, документацию и статический preview; Web
Component может дополнительно иметь live preview, controls и Inspector. Недоступная capability не
скрывает сущность и не ломает весь модуль.

## Что поддерживается сейчас

На момент аудита в workspace найдено 184 `component.json`; 183 Component имеют production entry,
и все эти entry имеют расширение `.tsx`.

Текущая Component-модель привязана к React глубже, чем следует из общего имени сущности:

- scanner считает Component только директорией под `components/**` с обязательным
  `component.json`;
- preview загружается только как `*.preview.tsx`;
- Story возвращает `ReactNode` и использует собственный контракт `stories + renderStoryExample`;
- runtime Vite-glob загружает только `libraries/*`, но не Project Components;
- props, source printer и handoff знают о React props, `ReactNode` и TSX;
- relations и Inspector анализируют только JS/TS/JSX/TSX;
- пользовательский Library code eager-import-ится в Vite graph самого Design Lab.

Решение D-056 уже демонстрирует проблему даже внутри одного framework: сторонняя Library может иметь
собственные runtime dependencies, поэтому discovery работает для всей Library, но реальный
Workbench запускает только два специально разрешённых Component. Добавление Vue или Svelte в этот
же общий Vite graph проблему не решит, а умножит её.

Следовательно, текущая реализация поддерживает не «весь Web» и даже не любые React Components, а
подготовленные React/TSX Components, совместимые с собственным runtime-контрактом Design Lab.

## Минимум согласования

Полностью автоматическое обнаружение возможно только до границы, где начинается авторское
намерение. Design Lab может найти export, Vue SFC, Svelte file, Custom Element registration,
SwiftUI `View`, Compose `@Composable`, Storybook Story или platform preview. Он не может достоверно
угадать:

- является ли найденный symbol публичным Component или внутренним helper;
- какие обязательные данные, providers и dependencies нужны для запуска;
- какие состояния важны дизайнеру;
- являются ли разные platform implementations одной продуктовой сущностью.

Цель поэтому не «ноль контрактов вообще», а **ноль обязательных Design Lab-файлов для базового
discovery**, когда экосистема уже сообщает нужные факты. Adapter должен сначала использовать
существующие package exports, framework metadata, Storybook CSF, `#Preview`, `@Preview` и другие
нативные источники. Optional Design Lab metadata остаётся escape hatch для неоднозначных случаев и
не дублирует вычислимые факты.

## Одна система, разные runtime adapters

Design Lab остаётся одним React-приложением как продуктовый shell. Это не мешает ему показывать
Vue, Svelte или другой runtime: проверяемый Component не обязан исполняться внутри React tree
самого приложения.

```text
Design Lab shell
    -> единый Workbench protocol
        -> isolated React runtime
        -> isolated Vue runtime
        -> isolated Svelte runtime
        -> native Custom Element runtime
        -> external browser/Wasm runtime
        -> static/native capture provider
```

Каждый live web runtime работает в отдельном iframe/process и сообщает Workbench только
нормализованные capabilities: готовность, размеры, controls, события, ошибки, исходный handoff и
capture. Это изолирует framework dependencies, global styles и build configuration от приложения
Design Lab и от соседних Library.

Storybook использует схожий принцип: разные framework/renderer packages исполняют Stories внутри
preview iframe, а props/inputs извлекаются framework-specific analyzers. Design Lab может читать
существующий Storybook CSF вместо требования переписывать Story под собственный формат.

## Возможные организации Library

Обе модели допустимы и не требуют разных приложений Design Lab.

### Физически отдельные Library

```text
libraries/
    acme-react/
    acme-vue/
    acme-ios/
    acme-android/
```

Это естественно, когда implementations выпускаются разными пакетами или принадлежат разным
командам. Design Lab показывает каждую Library отдельно и может связывать их Components в общие
семейства.

### Одна семантическая Library с несколькими implementations

```text
acme-system/
    произвольные пользовательские папки и файлы
    React implementation
    Vue implementation
    SwiftUI implementation
    Compose implementation
```

Физические пути не обязаны повторять это иллюстративное дерево. Adapter строит производную
проекцию `Component -> implementations` из реально найденных файлов. Если связь нельзя доказать,
Design Lab предлагает её как гипотезу и просит человека подтвердить, а не создаёт её молча.

## Component и Component Family

Следует разделить две сущности:

- **Component Implementation** — конкретный React, Vue, SwiftUI или Compose source с честным
  platform-specific API и набором доступных capabilities;
- **Component Family** — optional semantic relation между implementations одной продуктовой роли,
  например Web Button, iOS Button и Android Button.

Family не создаёт единую искусственную props-схему и не обещает идентичное поведение. В UI она
может давать platform/technology switcher и comparison view. Связь между implementations является
одним из немногих фактов, который часто требует человеческого подтверждения.

## Web frameworks и совместное использование

React, Vue, Svelte и Angular могут полноценно поддерживаться отдельными adapters. Web Components
служат удобной optional interoperability boundary: современные React, Vue, Svelte и Angular умеют
использовать или выпускать Custom Elements. Однако Design Lab не должен требовать такой конверсии:
Shadow DOM, slots, context, SSR и framework-specific composition не становятся одинаковыми только
из-за Custom Element wrapper.

Разные frameworks могут одновременно показываться в Design Lab и запускаться в отдельных DOM
roots/iframes. Прозрачного общего component tree у них нет. Вложение одной framework realization в
другую требует Custom Element или явно написанного wrapper.

Go может участвовать в Web несколькими способами:

- серверные Go templates отдают HTML и показываются через external preview URL;
- Go/Wasm запускается в browser runtime через JS/Wasm harness;
- Go implementation публикует DOM/Custom Element boundary.

Сам язык Go не определяет Component API, поэтому Design Lab не должен угадывать его. Generic
browser adapter показывает собранный результат, а более глубокие controls/inspection появляются
только при наличии понятного runtime boundary.

## Native: два разных продукта внутри одной идеи

Для SwiftUI и Compose нужно различать **design authoring/handoff** и **настоящий native runtime**.

### Web surrogate плюс производный native handoff

Если цель — дать дизайнеру удобный Code First Canvas и полезный код разработчику, Component может
иметь:

- интерактивное web-представление, с которым работает дизайнер;
- производный SwiftUI или Compose source для handoff;
- явный статус, что native source является generated/approximate, а не проверенным production
  implementation.

При изменении web-представления Design Lab или AI обновляет native source через preview точного
diff. Это должно быть **однонаправленное обновление**. Автоматическая двусторонняя синхронизация
web <-> Swift/Kotlin создаст неразрешимые конфликты: система не сможет понять, какую из двух
разошедшихся реализаций считать источником истины.

Generated handoff нельзя молча перезаписывать после ручного изменения разработчиком. Возможные
будущие политики: regenerated diff с подтверждением, отдельный generated output или явное
`detached` состояние после передачи в production.

Такой режим значительно дешевле настоящего native rendering и уже закрывает дизайнерский сценарий
Web/iOS/Android внутри одного продукта. Его ограничение должно быть видно: SwiftUI и Compose имеют
другие layout engines, accessibility, dynamic type, platform controls, gestures и lifecycle.

### Настоящий native preview как последующая capability

SwiftUI официально preview-ится через Xcode и может запускаться через Xcode/Simulator toolchain.
Compose использует `@Preview`, Android tooling и Emulator; официальный Compose Preview Screenshot
Testing уже предоставляет Gradle tasks для generated reference images, но пока является
экспериментальным.

Реалистичная последовательность:

1. Обнаруживать SwiftUI/Compose source как Component Implementation.
2. Показывать web surrogate или platform-generated static capture.
3. Добавить optional validation native code через Xcode/Gradle build.
4. Добавить platform-native PNG/video capture.
5. Только при доказанной необходимости рассматривать interactive Simulator/Emulator streaming.

Compose Multiplatform является отдельным благоприятным случаем: если пользовательский shared
Compose UI уже имеет Web target, Design Lab может запустить настоящий Kotlin/Wasm output вместо
создания TSX-копии. Design Lab не должен автоматически превращать обычный Android-only Compose
Component в Compose Multiplatform.

## Capability levels

Поддержка не должна быть бинарной.

| Уровень | Возможность |
| --- | --- |
| Catalog | Component найден; видны platform, technology и реальные файлы |
| Contract | Извлечены props/inputs/events/slots или platform API |
| Static preview | Есть authored image или platform-generated snapshot |
| Live preview | Реализация реально исполняется в подходящем runtime |
| Controls | Workbench может изменять serializable входные значения |
| Inspection | Доступны relations, source handoff и Inspector |
| Composition | Implementation можно использовать внутри Wireframe/Page данного runtime |

Неизвестная technology остаётся видимой на Catalog-уровне. Design Lab не требует максимального
уровня, чтобы признать Component существующим.

## Предлагаемое направление реализации

До добавления Vue или native support необходимо:

1. Перестать использовать `component.json` как единственное свидетельство существования Component;
   оставить его optional enrichment/override для текущего adapter и миграции.
2. Перестать считать Component строго директорией; normalized implementation может ссылаться на
   export, SFC, Custom Element, `View`, `@Composable` function или external preview.
3. Ввести adapters для discovery, contract extraction, relations, preview, capture и inspection.
4. Перевести UI на capability-based presentation.
5. Изолировать каждый пользовательский web runtime от Vite graph Design Lab.
6. Добавить generic external URL/browser adapter и чтение существующего Storybook CSF.
7. Сохранить React как первый adapter, затем добавить Web Components, Vue/Svelte и другие adapters.
8. Добавить optional Component Family только после определения честной identity/linking модели.
9. Native начать с web surrogate/generated handoff и static capture; настоящий runtime validation
   развивать отдельно.

## Что не рекомендуется строить

- универсальный AST или transpiler React/Vue/SwiftUI/Compose;
- обязательный Design Lab layout для пользовательских component files;
- обязательную конвертацию всех web frameworks в Custom Elements;
- единую ложную props-схему для всех платформ;
- один Vite/runtime dependency graph для всех Library;
- молчаливую двустороннюю синхронизацию web и native source;
- выдачу generated Swift/Kotlin handoff за проверенный production code;
- interactive native streaming раньше catalog, handoff и static capture.

## Открытые продуктовые решения

Перед изменением контрактов нужно отдельно решить:

1. Является ли web surrogate рекомендуемым источником дизайна для native-first Component или только
   optional representation?
2. Где живёт generated Swift/Kotlin handoff и как защищается от перезаписи ручных изменений?
3. Должны ли физически разные Library связываться через Component Family?
4. Какой минимум source-level настройки допустим, если automatic adapter detection неоднозначен?
5. Какие capability levels входят в первый multiplatform срез?

## Первичные источники исследования

- [Storybook framework architecture](https://storybook.js.org/docs/9/api/new-frameworks)
- [Storybook framework feature support](https://storybook.js.org/docs/configure/integration/frameworks-feature-support)
- [Storybook preview iframe](https://storybook.js.org/docs/configure/story-rendering)
- [Storybook Component Story Format](https://storybook.js.org/docs/writing-stories/index)
- [React 19 Custom Elements support](https://react.dev/blog/2024/12/05/react-19)
- [Vue and Web Components](https://vuejs.org/guide/extras/web-components.html)
- [Svelte Custom Elements](https://svelte.dev/docs/svelte/custom-elements)
- [Angular Custom Elements](https://angular.dev/guide/elements)
- [HTML Living Standard: Custom Elements](https://html.spec.whatwg.org/dev/custom-elements.html)
- [Go WebAssembly](https://go.dev/wiki/WebAssembly)
- [SwiftUI previews in Xcode](https://developer.apple.com/documentation/swiftui/previews-in-xcode)
- [Xcode command-line tools](https://developer.apple.com/documentation/xcode/xcode-command-line-tool-reference)
- [Jetpack Compose previews](https://developer.android.com/develop/ui/compose/tooling/previews)
- [Compose Preview Screenshot Testing](https://developer.android.com/studio/preview/compose-screenshot-testing)
- [Compose Multiplatform](https://kotlinlang.org/docs/multiplatform/compose-multiplatform.html)
