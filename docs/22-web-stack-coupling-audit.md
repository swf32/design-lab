# Web stack coupling audit: что на самом деле ещё привязано к React/TSX

**Статус:** проверено по текущему source, 2026-07-26. Это gap audit, а не заявление о готовой
Vue/Svelte support.

## Что было реально проверено

Нужно различать четыре разных уровня доказательства:

| Уровень            | Что сейчас действительно проверено                                                         | Чего это не доказывает                                           |
| ------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Filesystem fixture | `.vue`/`.svelte` обнаруживаются, получают technology, mount identity и raw source handoff  | что framework compiler вообще запускался                         |
| Profile fixture    | `.vue` entry связывается с ближайшим `package.json`/lockfile и отдельным runtime profile   | что Vue package/plugin совместимы и SFC собирается               |
| Supervisor fixture | fake runtime handles проверяют coalesced start, loopback, crash isolation, restart/dispose | что реальный Vite child process стартует и корректно завершается |
| Browser end-to-end | текущий React preview реально снят Playwright Chromium через новый capture descriptor      | что Vue/Svelte preview, Story, controls или capture работают     |

Итого: **Vue/Svelte execution сегодня не проверялся и не работает**. Число unit/integration tests
не является framework parity score. Framework получает статус supported только после browser E2E
на настоящем package, compiler plugin и implementation.

На момент audit workspace не содержит установленных `vue`, `@vitejs/plugin-vue`, `svelte` или
`@sveltejs/vite-plugin-svelte`. Runtime-profile fixture намеренно получает
`framework.available: false`; это проверка честной диагностики отсутствующей dependency, а не
скрытая Vue установка.

## Найденные stack-coupled поверхности

| Поверхность                | Текущее состояние                                                                                  | Привязка                                                                       | Что обязательно сделать                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Component discovery        | `.tsx`, `.vue`, `.svelte` strong-evidence files находятся                                          | public package exports, Vue/Svelte metadata и barrel semantics ещё не читаются | ecosystem-specific export/metadata analyzers + fixtures                    |
| Catalog preview            | authored preview загружается через React `import.meta.glob`; Vue/Svelte получают generic thumbnail | `src/componentRuntime.tsx`, `*.preview.tsx`                                    | runtime preview capability; distinguish authored/generated/fallback        |
| Component detail live view | только `react-manifest` и external iframe                                                          | `componentPresentation.ts`, `ModuleView.tsx`                                   | общий RuntimeSurface для managed/external adapters                         |
| Stories                    | только Design Lab React `stories` + `renderStoryExample(): ReactNode`                              | `componentRuntime.tsx`, `ModuleView.tsx`                                       | normalized serializable Story model; Vue/Svelte/CSF ingestion              |
| Component Playground       | React Story renderer и React playground module                                                     | `componentRuntime.tsx`, `ComponentPlaygroundView.tsx`                          | protocol render + args/state; framework adapter owns mount/update/unmount  |
| Controls                   | выводятся из React Story props/manifest examples                                                   | `ModuleView.tsx`                                                               | normalized props/events/slots/snippets contract and adapter updates        |
| Story source/copy          | сериализует React nodes в JSX/TSX                                                                  | `componentRuntime.tsx`, `storySourcePrinter.mjs`                               | adapter-owned canonical usage printer for Vue/Svelte; no fake JSX          |
| Inspector                  | Babel transform instruments TS/TSX JSX callsites and React runtime registry                        | `scripts/inspectionTransform.mjs`, `@design-lab/system/inspection`             | Vue template/SFC and Svelte compiler analyzers; capability-specific depth  |
| Relations/compositionUses  | static imports parsed only as JS/TS/JSX                                                            | `moduleEntities.mjs::parseComponentSourceImports`                              | parse Vue `<script>`/template and Svelte `<script>`/markup imports         |
| Component capture          | real only for current React preview/story                                                          | `ComponentCaptureView.tsx`                                                     | real Vue/Svelte runtime surfaces and browser E2E                           |
| Wireframe runtime          | eager `*.wireframe.tsx` glob returning React nodes                                                 | `wireframes/registry.ts`, `WireframeView.tsx`                                  | runtime protocol renderer per framework                                    |
| Page runtime               | eager `*.page.tsx` glob returning React nodes                                                      | `pages/registry.ts`, `PageView.tsx`                                            | runtime protocol renderer per framework                                    |
| Wireframe/Page flows       | shell calls React renderer repeatedly and captures DOM clicks locally                              | `WireframeView`, `PageView`, `useFlowActionCapture`                            | action/event messages across iframe boundary; inert flow previews          |
| HMR/watcher                | Library code lives in shell Vite graph; attached mounts are not runtime-watched                    | eager globs; no mounted runtime watcher                                        | child Vite HMR + targeted profile restart/invalidation                     |
| Runtime errors             | React import failure может повредить общий shell graph                                             | eager globs                                                                    | iframe/process error boundary and readable adapter diagnostics             |
| External URL               | iframe exists, but no handshake, readiness, args, events, capture or inspection                    | `ModuleView.tsx` iframe                                                        | optional bridge negotiation; otherwise honest preview-only capability      |
| MCP/CLI                    | search/get/browse generic; screenshot tool намеренно Component preview/story-only и React-executable | `server/mcp/index.mjs`, `scripts/designlab.mjs`                              | capability response + Component preview/story через каждый adapter         |
| Rules/AI authoring         | Component rules and many diagnostics still require `.tsx`, ReactNode, JSX and React Story shape    | `rules/*`, `moduleEntities.mjs`                                                | adapter-neutral base contract plus framework-specific appendices           |
| Creation/scaffolding       | no framework-aware Component/Wireframe/Page creation pipeline                                      | onboarding/rules only                                                          | ask/detect target framework; create ecosystem-native files in chosen mount |
| URL identity               | selected framework implementation/runtime state is not preserved                                   | current routes identify entity only                                            | persist implementation/profile + args/state/mode without exposing ports    |

## Modules that are mostly shared — with caveats

### Tokens and Palette

Token JSON, semantic identity, modes and Palette remain one source of truth for React, Vue and
Svelte. CSS custom properties are web-compatible across them. Still required: prove that every
isolated runtime receives the same mode values and updates them without duplicating token data.

### Fonts

Font files, `fonts.json` and typography tokens are shared. Loading/injection belongs to each runtime,
so a browser fixture must verify actual computed family/weight in React, Vue and Svelte.

### Assets

Raster images, video and plain SVG are shared. **TSX code-native icons are not framework-neutral**:
Vue/Svelte cannot directly execute a React TSX icon. Options are a shared SVG source, Custom Element,
or explicit framework-specific implementations linked by semantic asset family. Design Lab must not
pretend that every item under Assets is equally executable in every framework.

### Search, filesystem and raw handoff

Mount resolution, safe file access, Catalog identity, raw source handoff and most MCP search/get are
framework-neutral. Canonical usage snippets, relations and deep inspection are not: they require
adapter-specific parsing/printing.

## Что было забыто в первом protocol slice

1. Не было настоящей Vue dependency, Vue compiler plugin или Vue browser fixture. `.vue` в temp
   directory проверял только filesystem/profile logic.
2. Не был отдельно проаудирован authoring contract: `COMPONENT_RULES.md` и server diagnostics всё
   ещё считают TSX preview/story/playground стандартом готовности.
3. Фраза «Assets общие» была слишком широкой: ordinary media общие, TSX icons — React code.
4. Relations, copied source и Inspector были объединены словом handoff, хотя raw source handoff уже
   generic, а semantic/deep handoff всё ещё JSX-specific.
5. Не была заведена настоящая framework fixture library, поэтому нельзя проверить dependency
   resolution, plugin version, HMR, CSS leakage, token/font/asset loading и process cleanup вместе.

## Обязательные реальные fixtures

Нужен committed test workspace, а не строки `.vue`/`.svelte` во временной папке:

- `fixtures/web-parity/react`, `vue`, `svelte` с реальными package manifests и framework versions;
- одинаковая семантическая Button/Card implementation, минимум одна Story, props/state/event;
- одинаковые token modes, font, SVG/raster asset и один framework-native code icon case;
- Component preview/story; Wireframe screen/flow и Page screen/navigation проверяются позже как
  отдельная web-rendering фаза, а не MCP capture contract;
- намеренная compile error и runtime error для проверки изоляции;
- HMR change, runtime restart и close cleanup;
- Playwright assertions по DOM behavior и PNG metadata/hash/geometry;
- вызов тех же captures через UI route, CLI и MCP, а не только прямую service function.

Vue/Svelte нельзя отметить supported, пока соответствующий fixture не устанавливается в чистом
environment, не запускает настоящий compiler и не проходит всю вертикаль.

## Исправленный порядок работ

1. Создать реальный React fixture и перенести его на child runtime; это baseline регрессий.
2. Подключить framework-aware Story/controls/events, Component preview/story capture и error/HMR
   tests к React baseline.
3. Создать настоящий Vue package/fixture и закрыть всю Component vertical.
4. Закрыть Vue Wireframe/Page web-rendering, relations, source printing и Inspector capability.
5. Повторить без исключений для Svelte.
6. Только после зелёной matrix удалить eager globs и назвать framework supported.

Этот audit является входом в implementation checklist. Он не требует сделать все adapters
одновременно, но запрещает терять поверхность из поля зрения.
