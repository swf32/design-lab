# Карта проекта и честный статус

> Срез: 2026-09-30. Входная точка для человека и AI-агента после перерыва. [Оглавление](README.md) · [собственный интерфейс](25-interface-system-and-installation.md) · [следующие шаги](26-vision-and-next-steps.md).

## Идея в одном абзаце

Design Lab — локальное, ориентированное на дизайнеров рабочее пространство для дизайн-систем, живущих в коде и файловой системе. Оно помогает увидеть токены, палитру, шрифты, ассеты, компоненты, вайрфреймы и страницы как связанные сущности; проверить реальные состояния и исходники; дать AI проверяемый контекст. Существующий репозиторий должен подключаться без переноса файлов. Для новой системы допустима управляемая структура. Приложение открывается отдельно от пользовательского приложения и не обязано менять его dev server.

## Что есть в репозитории

| Место | Назначение |
| --- | --- |
| [`design-lab/src/`](../design-lab/src/) | React shell, маршрутизация, модули, Workbench и браузерные adapters. |
| [`design-lab/server/`](../design-lab/server/) | Локальный HTTP API, сканирование, source mounts, setup, runtimes, interface packs, MCP. |
| [`design-lab/scripts/designlab.mjs`](../design-lab/scripts/designlab.mjs) | CLI для setup, контекста AI, capture, Skin/System. |
| [`libraries/design-lab-system/`](../libraries/design-lab-system/) | Активная Library собственного интерфейса в development checkout и источник default template для локального npm tarball. Во внешнем проекте активная папка — `design-lab/system/`. |
| [`libraries/nuxt-ui-system/`](../libraries/nuxt-ui-system/) | Реальная Vue/Nuxt Library, используемая для проверки изолированного runtime. |
| [`rules/`](../rules/) | Канонические контракты сущностей. |
| [`docs/`](README.md) | Видение, решения, исследования и план работ. |

## Реализовано и проверяется кодом

- Локальные React/Vite UI и Node API запускаются вместе через [`scripts/dev.mjs`](../design-lab/scripts/dev.mjs). UI слушает `DESIGN_LAB_PORT` (по умолчанию `5317`), API — `DESIGN_LAB_API_PORT` (по умолчанию `4173`); конфигурация в [`vite.config.ts`](../design-lab/vite.config.ts) и [`server/index.mjs`](../design-lab/server/index.mjs).
- Есть project/source registry, module-specific каталог и filesystem discovery. Основные модули, Workbench, React Components, Wireframes и Pages имеют реальные интерфейсы. Подробные возможности и пробелы перечислены в [checklist](IMPLEMENTATION-CHECKLIST.md).
- Онбординг умеет сканировать существующий репозиторий, предложить относительные mounts и создать `design-lab/designlab.config.json` с копиями правил. CLI и UI используют [`setupService.mjs`](../design-lab/server/services/setupService.mjs). Запись требует отдельного подтверждения в сценарии setup; исходники подключаемого проекта не переносятся. После применения read-only self-check проверяет config, mounts, rules, AGENTS pointer и контракт скопированной System, возвращая структурированные диагностики.
- Есть локальный AI context gateway, CLI и read-only MCP, поиск, source handoff и захват изображений компонентов. См. [AI context](09-ai-context-and-mcp.md) и [API](11-server-api.md).
- Собственный интерфейс потребляет `@design-lab/system/*` из одного активного слота и показывает эту Library как источник сущностей. Во внешнем проекте это `design-lab/system/`. Для визуальных пакетов реализованы CLI create/validate/install/use/list/doctor/reset; см. [объяснение](25-interface-system-and-installation.md).
- Локальный npm tarball устанавливается в чистый внешний Git-проект. Проверены scan/apply без переноса исходного Component, отдельные порты, UI в браузере, сохранение правок при установке новой версии пакета с изменённым default template, переключение System и reset. Браузерный fixture дополнительно меняет `Button.scss` в проектной System и проверяет один результат в shell и реальном Workbench Canvas. Команды: `npm run test:package --workspace=design-lab` и `npm run test:package:browser --workspace=design-lab`.
- Отдельный пустой внешний Git-проект проходит `Start clean` (`setup --mode managed`): получает managed mounts, одну project-owned System, успешный `doctor`, а установленный CLI запускает UI и API с независимыми портами. Это подтверждает greenfield setup/dev; repair покрывает только отсутствующие managed rules/pointer. Read-only `designlab footprint` перечисляет setup files, project-owned System/mounts и дополнительные файлы перед будущим uninstall; само удаление ещё не реализовано.
- Внешний fixture создаёт полный fork System, меняет анатомию `Button`, добавляет SVG asset, проверяет `system validate`, устанавливает fork и в браузере видит новую разметку и загруженный SVG одновременно в shell и Workbench. Проверена одна React-вертикаль; удобное сравнение fork с будущим default и миграция контракта пока не реализованы.
- Для Vue доказаны isolated runtime, реальный Nuxt UI source, modes, часть controls и capture. Это **не** означает полную parity с React; [матрица](21-web-runtime-feature-parity.md) описывает границы.

Стандартный внешний вид собственной System восстановлен после экспериментального Glass-варианта.
Текущий фокус — удобное авторство и замена полной System, включая структуру Components и assets;
визуальный редизайн отложен по [D-094](DECISIONS.md).

## Что пока нельзя считать готовым

- Пакет ещё `private`: установка по имени из npm registry и release channel отсутствуют. Проверен локальный tarball с npm на macOS; другие ОС и package managers ещё не проверены.
- Файловый setup и attach реализованы не до конца как end-to-end продукт: общий mount resolver ещё нужно протянуть через watcher и часть runtime/scanner поверхностей; uninstall и исправление config/mounts остаются задачами. Settings показывает состояние config, mounts, rules, AGENTS pointer и System structure, а также подтверждаемый repair только отсутствующих managed rules/pointer; полный typecheck даёт соседний System doctor. См. [embedded install](20-embedded-install-and-attach-mode.md) и [checklist](IMPLEMENTATION-CHECKLIST.md#активный-foundation-gate-embedded-installation-и-attach-first-sources).
- Vue не закрыла всю web feature matrix; Svelte runtime ещё не начат. React System Stories/Preview/Playground в embedded режиме берутся из project-owned папки, но остальные React sources и Wireframe/Page всё ещё используют build-time eager registries. См. [аудит](22-web-stack-coupling-audit.md).
- Settings умеет создать полную System как неактивную копию текущей, выбрать папку проекта просмотром каталогов, проверить её, установить после подтверждения и восстановить default со snapshot. Для Skin есть тот же выбор папки, создание, проверка, установка, выбор сохранённой версии и сброс; изменение CSS загружается после перезапуска. Известные ошибки проверки показывают следующий шаг и технические детали; статические JS/TS импорты и локальные CSS/SCSS `url()` отсутствующих медиа и шрифтов System выявляются до установки. [Галерея сообщества](23-interface-skins-systems-and-gallery.md#community-distribution-and-gallery) запланирована.
- Read-only `system diff` показывает файловые и Component отличия от bundled default. Для default-derived папки `system upgrade` использует сохранённую базу, блокирует весь update при конфликте и валидирует результат до активации. Ручной UI для разрешения конфликтов и миграции контрактов остаются открытыми. Полная System обязана удовлетворять [application contract](../design-lab/interface-system-contract.json).
- Settings показывает проверку активной System, read-only diff и трёхсторонний план обновления default. После установки, восстановления или обновления полной System нужен перезапуск приложения. Автоматического разрешения конфликтов нет по [D-095](DECISIONS.md).
- Rules/Decisions/Prompts как полноценные UI-модули, embeddings, hosted collaboration, Figma integration и нативные платформы остаются следующими фазами; статус отдельных вертикалей смотрите в [checklist](IMPLEMENTATION-CHECKLIST.md).

## Как читать противоречия

История решений длиннее текущего кода. Например, ранние [D-001/D-005](DECISIONS.md) описывали обязательные canonical roots, а D-083–D-085 приняли attach-in-place. D-091 сначала предполагало несколько активных Libraries; D-092 заменило эту часть одним слотом. Старые фразы в ранних roadmap и checklist-секциях не следует читать как актуальный контракт без этих поправок.

## Быстрый запуск в этом checkout

Из корня репозитория: `npm install`, затем `npm run dev`. Для диагностики пакета интерфейса: `npm run designlab -- system doctor`. Для всех тестов: `npm test`; для сборки: `npm run build`. Локальный tarball и установка во внешний fixture описаны в [инструкции](25-interface-system-and-installation.md).
