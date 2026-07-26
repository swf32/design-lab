# Web-first platform strategy

**Статус:** принято решением D-082, 2026-07-26. Этот документ задаёт порядок после
adapter/capability foundation из D-081.

## Для кого строится продукт

Основной пользователь Design Lab — дизайнер с доступом к AI, который может вообще не понимать
код. Поэтому нормальный пользовательский цикл нельзя строить вокруг чтения TSX, Swift, Kotlin,
C# или source diff.

Дизайнер подтверждает:

- визуальный результат;
- состояния и переходы;
- адаптивность;
- поведение controls;
- доступность на понятном продуктовом языке;
- соответствие правилам целевой платформы.

Source, exact diff, provenance, generated hash, build logs и защита ручных правок относятся к
внутренней безопасности системы и optional Developer mode. Они не являются обязательным шагом
дизайнера и не должны блокировать visual review.

## Жёсткий порядок

Сначала Design Lab полностью закрывает web. Native и desktop-native implementation не развиваются
параллельно с незавершённым web runtime, иначе продукт распыляется на несколько несовместимых
toolchain и наборов правил.

Web считается закрытым только когда одно запущенное приложение Design Lab одновременно работает
минимум с React, Vue, Svelte и Custom Elements и применяет ту же adapter/capability модель не только
к Components, но и к Wireframes и Pages.

После web можно отдельно проектировать platform tracks:

- Apple: iOS, iPadOS и macOS; SwiftUI как первый modern target, UIKit/AppKit как отдельные
  compatibility decisions;
- Android: Jetpack Compose как первый modern target, Android Views как отдельный compatibility
  decision;
- Windows: C#/.NET (в первую очередь WinUI/WPF/.NET MAUI после исследования реального спроса) и
  C++/native Windows как отдельный adapter/toolchain track.

Каждый native track требует собственных правил, validation toolchain и агента, который рассуждает
как разработчик этой платформы. Общая web-нейросеть не должна выдавать нереализуемый SwiftUI,
Compose, .NET или C++ только потому, что результат визуально похож в браузере.

## Web scope относится ко всем code-rendered сущностям

Framework support не заканчивается на Components.

| Entity | Что должно стать framework-neutral | Что остаётся общим |
| --- | --- | --- |
| Component | discovery, preview, stories, props/events/slots, controls, inspection, capture, handoff | Catalog, Workbench shell, capability vocabulary, semantic identity |
| Wireframe | renderer locator, states, controls, flow previews, inspection и fullscreen review | `wireframe.json` semantics, layout/state/flow model, Canvas shell |
| Page | renderer locator, states, controls, navigation, inspection и fullscreen review | `page.json` semantics, route/flow/provenance model, Page card и sitemap |

Текущие `*.tsx`, `*.wireframe.tsx` и `*.page.tsx` остаются совместимыми React adapters. Они не
становятся универсальным обязательным форматом для Vue/Svelte/Custom Elements. Framework-specific
renderer исполняется в изолированном runtime, а shell общается с ним через общий serializable
protocol.

Cross-framework composition не изображает единое React/Vue/Svelte дерево. Она возможна только
через явную browser boundary, wrapper или отдельную runtime surface.

## Tokens, Palette, Fonts и Assets

Для web frameworks эти модули не дублируются:

- Tokens имеют один canonical semantic source и один web output layer (например CSS custom
  properties), который одинаково потребляют React, Vue, Svelte и Custom Elements.
- Palette остаётся представлением color tokens и не получает framework-specific values.
- Fonts имеют общий registry и web font files; способ подключения может выполнять runtime adapter,
  но React/Vue/Svelte не получают отдельные копии font metadata.
- Raster/vector/video Assets остаются общей filesystem inventory. Code-native icons и executable
  assets могут иметь framework-specific implementations, но связываются семантически и не
  превращают весь Assets module в framework registry.

Поэтому web-first работа меняет способы loading, isolation и handoff этих сущностей, но не создаёт
новые token/palette/font/asset sources of truth.

Для native платформ вывод будет другим: semantic token source потенциально общий, а Swift/Android/
.NET resources — generated platform outputs; font registration, asset formats, scales и system
icons platform-specific. Это исследуется только после web gate и не должно заранее усложнять web
contract.

## Native representation после web gate

Для native продукта настоящая Swift/Kotlin/C#/.NET/C++ implementation и native platform rules
являются основными. Web representation — удобное дизайнерское дополнение и быстрый visual surface,
а не источник истины, который автоматически диктует native architecture.

Предполагаемый designer flow:

1. Дизайнер меняет визуальную модель или web representation.
2. Platform-specialized agent предлагает native implementation.
3. Design Lab валидирует её доступным native toolchain.
4. Дизайнер сравнивает визуальный результат, states и platform warnings.
5. Разработчик при необходимости открывает код, diff и build logs в Developer mode.

Механизм защиты исходников всё равно нужен, но работает за сценой: Design Lab не перезаписывает
ручную работу молча. Это инженерная гарантия сохранности, а не просьба дизайнеру ревьюить код.

## Web execution order

1. Общий изолированный browser runtime protocol и локализация dependency/CSS/errors.
2. Перевод текущего React Component/Wireframe/Page runtime на этот protocol без регрессий.
3. Vue Components, затем Vue Wireframes и Pages.
4. Svelte Components, затем Svelte Wireframes и Pages.
5. Custom Elements Components и browser-boundary composition.
6. External browser/Go/Wasm targets с честно ограниченными capabilities.
7. Framework-neutral controls, inspection, capture, URLs, search, MCP и developer handoff.
8. Angular — после измерения dependency/build complexity, но до открытия native implementation
   program, если он нужен для заявленного web coverage.

## Web Definition of Done

- Один Design Lab одновременно открывает React, Vue, Svelte и Custom Elements.
- Component, Wireframe и Page имеют framework-neutral entity model и runtime selection.
- Ошибка build/runtime/CSS/dependencies одной implementation не ломает shell и другие sources.
- Designer flow не требует чтения или подтверждения кода.
- Tokens, Palette, Fonts и ordinary Assets не дублируются по frameworks.
- Controls, preview, capture, inspection и handoff показываются только при реальной capability.
- Все framework assumptions, которые остались в правилах, API, MCP или UI, либо удалены, либо явно
  обозначены как React-adapter-specific.
- Native backlog не влияет на web authoring contract до отдельного принятого решения.
