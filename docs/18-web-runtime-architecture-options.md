# Web runtime architecture: варианты и lifecycle

**Статус:** managed isolated runtime + external fallback принят в D-086, 2026-07-26. Versioned
protocol/capture bridge реализован; process supervisor и isolated framework adapters ещё в работе.

Этот выбор определяет, как один Design Lab сможет одновременно показывать React, Vue, Svelte,
Custom Elements, а затем их Components, Wireframes и Pages.

## Самая простая модель

Design Lab — это один общий торговый центр. Canvas, Catalog, controls, navigation и документация —
общий зал. React, Vue и Svelte — разные кухни.

- Изолированные runtimes: у каждой кухни своё помещение и оборудование; заказ приносится в общий
  зал.
- Один общий runtime: все кухни готовят на одной плите и делят продукты.
- External-only: торговый центр ничего не готовит; пользователь сам заказывает доставку из каждого
  ресторана и сообщает адрес.

Изолированный runtime не означает процесс на каждый Component. Предлагаемая гранулярность — один
runtime на `source + runtime profile`. Например, одна Vue Library использует один Vue runtime для
всех своих Components, Wireframes и Pages. Если одна source действительно содержит React и Vue,
это два независимых runtime profiles.

## Что такое lifecycle

Lifecycle — не дополнительный сценарий дизайнера. Это внутренняя обязанность Design Lab управлять
дочерним runtime от начала до конца:

```text
не нужен → запускается → готов → обновляется → остановлен
                  ↘ ошибка → объяснение → безопасный перезапуск
```

Вариант с отдельными runtime сложнее для разработчиков Design Lab, потому что система должна:

1. Понять, какой framework нужен выбранной source.
2. Назначить свободный loopback-порт и отдельный cache directory.
3. Запустить runtime с правильной рабочей директорией и framework plugin.
4. Дождаться handshake `ready`, а не показать пустой iframe во время загрузки.
5. Передавать `render`, controls/state, token mode, события, resize, capture и errors.
6. Поддерживать HMR после изменения файла.
7. Локализовать crash: показать ошибку этой source, не уронить Design Lab.
8. Перезапустить runtime с backoff, если это имеет смысл.
9. Остановить все дочерние процессы при закрытии Design Lab и не оставить zombie processes.
10. Корректно делать это на macOS, Windows и Linux, где завершение process trees различается.

Node предоставляет асинхронный `child_process.spawn()`, события `spawn/error/exit/close`, stdout и
stderr, но отправка `SIGTERM` сама по себе не гарантирует, что процесс уже завершился; Windows также
имеет другую signal semantics. Поэтому supervisor должен хранить явное runtime state, PID/process
handle и подтверждать `close`, а не просто вызвать `kill()` и забыть.

Для дизайнера хороший lifecycle выглядит так:

1. Он открывает Vue Component.
2. Несколько секунд видит «Preparing Vue preview» только при первом запуске.
3. Получает Canvas.
4. После сохранения файла Canvas обновляется.
5. Если сборка сломана, видит понятную ошибку именно этого preview.

Порты, PID, cache и restart policy в обычном интерфейсе не показываются.

## Вариант 1 — managed isolated runtimes

Design Lab сам создаёт runtime для каждой активной `source + runtime profile`, показывает его в
iframe и общается с ним через serializable protocol.

Vite официально предоставляет JavaScript API `createServer()` с явными `root`, `configFile` и
`server.port`; framework support подключается plugins. Vite также предупреждает о разделяемом
`process.env.NODE_ENV`, когда несколько операций живут в одном Node process. Поэтому настоящая
изоляция лучше достигается отдельным child process, а не несколькими Vite servers внутри процесса
Design Lab.

### Плюсы

- Для дизайнера это единственный вариант, близкий к «запустил Design Lab и расслабился».
- React/Vue/Svelte могут использовать разные версии dependencies.
- Global CSS и HMR одного runtime не попадают в другой document.
- Crash или broken dependency одной source не обязан ломать shell и соседние sources.
- Design Lab контролирует единый handshake, loading, diagnostics, capture и cleanup.
- Components, Wireframes и Pages одной source используют один framework runtime и не дублируют
  инфраструктуру.
- Можно запускать runtime лениво и держать только реально открытые profiles.
- Текущий внешний URL остаётся естественным fallback для Go/Wasm и нестандартных build systems.

### Минусы

- Supervisor, port allocation, health checks, restart и cleanup надо написать и тестировать.
- Каждый активный runtime потребляет отдельную память и имеет собственный Vite dependency cache.
- Первый запуск source медленнее из-за dependency discovery/pre-bundling. Vite прямо указывает, что
  при первом старте он сканирует imports и pre-bundles dependencies; новая dependency может
  вызвать повторный pre-bundle и reload.
- Нужно аккуратно решить, чьи framework plugins и версии используются.
- Нужно решить, что происходит, если dependencies отсутствуют. Silent `npm install` недопустим.
- Cross-runtime inspection глубже DOM потребует protocol; прямой доступ к framework internals не
  переносится между adapters.
- Настоящая защита от произвольного локального build code ограничена: если исполнять пользовательский
  `vite.config`, его plugins работают как Node code на машине пользователя.

### Безопасная реализация

- Runtime слушает только loopback, не `0.0.0.0`.
- `allowedHosts` не ставится в `true`: документация Vite прямо предупреждает о DNS rebinding и
  раскрытии source.
- У каждого profile свой origin/port и iframe. Разный port уже создаёт browser origin boundary.
- Shell общается с iframe через проверяемый `postMessage` protocol и exact origin.
- По умолчанию используется Design Lab-controlled config с `configFile: false`, а не автоматически
  исполняется произвольный project `vite.config`.
- Runtime получает доступ только к canonical source root и необходимым shared read-only resources.
- Logs и errors сохраняются раздельно по runtime id.
- Cache является derived и удаляемым; source of truth остаётся filesystem.

## Вариант 2 — один общий Vite runtime

Все пользовательские implementations импортируются в тот же Vite graph, где работает shell Design
Lab. Фактически это расширение текущего подхода: сейчас `import.meta.glob` заранее связывает React
Components, Wireframes и Pages из `libraries/*` с приложением.

### Плюсы

- Меньше процессов, портов и supervisor-кода.
- Самый быстрый путь добавить демонстрационный Vue Component.
- Общий HMR уже существует.
- Меньше стартовых экранов и cache directories.
- Легче делать глубокий Inspector для React, потому что shell и Component находятся в одном graph.

### Минусы

- Dependency resolution общий: несовместимые версии одного пакета начинают влиять друг на друга.
- Ошибка import/transform/plugin может сломать весь Design Lab ещё до открытия Component.
- Global CSS и runtime side effects труднее изолировать.
- Добавление Vue/Svelte plugins меняет сборку самого shell.
- Каждый новый framework увеличивает общий graph и production bundle Design Lab.
- Project и Library перестают быть настоящими независимыми sources.
- В долгосрочной перспективе это почти гарантированно приводит к framework exceptions и
  allow-lists, от которых проект как раз хочет уйти.

Этот вариант подходит для быстрого прототипа, но плохо соответствует уже принятой гарантии: ошибка
одной implementation не ломает соседние entities.

## Вариант 3 — только external dev server

Design Lab ничего не собирает. Пользователь отдельно запускает `npm run dev`, Go server или другой
build target и указывает preview URL. Design Lab показывает URL в iframe.

### Плюсы

- Максимальная совместимость с существующим production setup.
- Design Lab не управляет dependencies и framework plugins.
- Почти нет build lifecycle внутри Design Lab.
- Хороший escape hatch для Angular, Go/Wasm, microfrontends и нестандартных repositories.
- Ошибки внешнего server уже изолированы от shell.

### Минусы

- Пользователь должен знать, какую команду запустить, и следить за терминалом.
- Сценарий «один запуск» исчезает.
- Design Lab сложнее отличить «server ещё запускается», «неверный URL» и «страница упала».
- Controls, events, inspection и capture требуют, чтобы внешний target добровольно реализовал
  bridge protocol.
- Port/auth/CORS/CSP могут блокировать embed.
- Existing project conventions фактически становятся скрытым обязательным контрактом.

Как основная модель это слишком developer-first. Как explicit fallback — полезно и уже частично
поддержано полем `previewUrl`.

## Сравнение

| Критерий                           | Managed isolated         | Один общий runtime            | External-only              |
| ---------------------------------- | ------------------------ | ----------------------------- | -------------------------- |
| Один запуск для дизайнера          | лучший                   | лучший                        | плохой                     |
| Изоляция dependencies              | высокая                  | низкая                        | высокая                    |
| Изоляция crash/CSS                 | высокая                  | низкая                        | высокая                    |
| Controls/inspection protocol       | контролирует Design Lab  | проще, но framework-coupled   | зависит от внешнего target |
| Память                             | выше на активный profile | ниже в начале                 | вне Design Lab             |
| Сложность реализации               | высокая                  | низкая сначала, высокая позже | низкая для preview         |
| Совместимость с экзотическим build | через fallback           | слабая                        | максимальная               |
| Соответствие философии продукта    | высокое                  | низкое в долгую               | среднее как fallback       |

## Рекомендация

Не чистый вариант 1, а **managed isolated runtime по умолчанию + external URL escape hatch**.

Design Lab-controlled runtime покрывает React, Vue, Svelte и Custom Elements. Он использует один
child process на активный `source + runtime profile`, отдельный cache и собственный loopback origin.
External URL остаётся для Go/Wasm, Angular/enterprise builds и projects, которые невозможно честно
воспроизвести нашим config.

Это дороже в реализации, но сложность находится внутри продукта, где ей и место. Дизайнер не
получает список процессов — он получает один Canvas и локализованное сообщение, если конкретный
runtime не готов.

## Что остаётся implementation policy

Эти пункты больше не блокируют выбранную архитектуру, но должны быть закрыты и протестированы по
мере реализации:

1. Config policy: только Design Lab-controlled config; project config; или controlled default с
   explicit external fallback.
2. Dependency ownership уже принято в D-083: product packages используют существующий
   `package.json`/lockfile/environment, Design Lab adapters — отдельный rebuildable cache. Остаётся
   UX явной подготовки отсутствующих dependencies.
3. Runtime lifetime: держать до закрытия Design Lab; останавливать после idle timeout; или держать
   только active source.
4. Version policy: adapter использует framework из source, совместимую версию из Design Lab или
   изолированный adapter package с version negotiation.
5. Preview trust: какие browser permissions нужны Components и какие запрещены по умолчанию.

Feature parity и запрет React-only ложноположительных capabilities закреплены в
`21-web-runtime-feature-parity.md`.

## Источники

- [Vite JavaScript API: `createServer`](https://vite.dev/guide/api-javascript)
- [Vite shared options: project root](https://vite.dev/config/shared-options)
- [Vite dependency pre-bundling](https://vite.dev/guide/dep-pre-bundling)
- [Vite server options and `allowedHosts`](https://vite.dev/config/server-options)
- [Vite plugin model](https://vite.dev/guide/using-plugins)
- [Node.js child processes](https://nodejs.org/api/child_process.html)
