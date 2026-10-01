# Карта проекта и честный статус

> Срез: 2026-10-02. Входная точка для человека и AI-агента после перерыва. [Оглавление](README.md) · [собственный интерфейс](25-interface-system-and-installation.md) · [следующие шаги](26-vision-and-next-steps.md).

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

- Локальные React/Vite UI и Node API запускаются вместе через [`scripts/dev.mjs`](../design-lab/scripts/dev.mjs). До старта проверяются активные System/Skin и typed application contract; несовместимая System даёт явную ошибку и recovery команды. UI слушает `DESIGN_LAB_PORT` (по умолчанию `5317`), API — `DESIGN_LAB_API_PORT` (по умолчанию `4173`); конфигурация в [`vite.config.ts`](../design-lab/vite.config.ts) и [`server/index.mjs`](../design-lab/server/index.mjs).
- Есть project/source registry, module-specific каталог и filesystem discovery. Основные модули, Workbench, React Components, Wireframes и Pages имеют реальные интерфейсы. Подробные возможности и пробелы перечислены в [checklist](IMPLEMENTATION-CHECKLIST.md).
- Онбординг умеет сканировать существующий репозиторий, предложить относительные mounts и создать `design-lab/designlab.config.json` с копиями правил. CLI и UI используют [`setupService.mjs`](../design-lab/server/services/setupService.mjs). Запись требует отдельного подтверждения в сценарии setup; исходники подключаемого проекта не переносятся. После применения read-only self-check проверяет config, mounts, rules, AGENTS pointer и контракт скопированной System, возвращая структурированные диагностики.
- Есть локальный AI context gateway, CLI и read-only MCP, поиск, source handoff и захват изображений компонентов. См. [AI context](09-ai-context-and-mcp.md) и [API](11-server-api.md).
- Собственный интерфейс потребляет `@design-lab/system/*` из одного активного слота и показывает эту Library как источник сущностей. Во внешнем проекте это `design-lab/system/`. Для визуальных пакетов реализованы CLI create/validate/install/use/list/doctor/reset; см. [объяснение](25-interface-system-and-installation.md).
- Локальный npm tarball устанавливается в чистый внешний Git-проект. Проверены scan/apply без переноса исходного Component, отдельные порты, UI в браузере, сохранение правок при установке новой версии пакета с изменённым default template, переключение System и reset. Браузерный fixture дополнительно меняет `Button.scss` в проектной System и проверяет один результат в shell и реальном Workbench Canvas. Команды: `npm run test:package --workspace=design-lab` и `npm run test:package:browser --workspace=design-lab`.
- Отдельный пустой внешний Git-проект проходит `Start clean` (`setup --mode managed`): получает managed mounts, одну project-owned System, успешный `doctor`, а установленный CLI запускает UI и API с независимыми портами. Это подтверждает greenfield setup/dev; Settings repair покрывает отсутствующие managed rules/pointer, перенесённые relative mounts и повреждённый config при наличии last-good копии. Read-only `designlab footprint` перечисляет setup files, project-owned System/mounts и дополнительные файлы перед будущим uninstall; само удаление ещё не реализовано.
- Внешний fixture создаёт полный fork System, меняет анатомию `Button`, добавляет SVG asset, проверяет `system validate`, устанавливает fork и в браузере видит новую разметку и загруженный SVG одновременно в shell и Workbench. Созданный через Design Lab fork сохраняет baseline default и может применить безопасное обновление без потери собственного ID и локальных файлов; пересечение правок блокирует весь upgrade. Проверена одна React-вертикаль; миграция будущих breaking contracts пока не реализована.
- Для Vue доказаны isolated runtime, реальный Nuxt UI source, modes, часть controls и capture. Это **не** означает полную parity с React; [матрица](21-web-runtime-feature-parity.md) описывает границы.

Стандартный внешний вид собственной System восстановлен после экспериментального Glass-варианта.
Текущий фокус — удобное авторство и замена полной System, включая структуру Components и assets;
визуальный редизайн исключён из текущей цели по [D-096](DECISIONS.md). Текущий прогресс и
следующий пользовательский результат отслеживаются в [плане поставки](28-delivery-board.md).
Новые app-local визуальные CSS/SCSS декларации и прямые inline TSX styles блокируются проверками;
501 CSS-декларация в baseline (420 остались после переносов Canvas, Settings Panel и catalog presentation) и 9 inline-деклараций зафиксированы для review в
[аудите ownership](27-interface-style-ownership-audit.md), а не как
подтверждение, что весь визуал уже перенесён в System.

## Что пока нельзя считать готовым

- Пакет ещё `private`: установка по имени из npm registry и release channel отсутствуют. Проверен локальный tarball с npm на macOS; другие ОС и package managers ещё не проверены.
- Файловый setup и attach реализованы не до конца как end-to-end продукт: общий mount resolver ещё нужно протянуть через watcher и часть runtime/scanner поверхностей; uninstall и восстановление старой установки без last-good config остаются задачами. Settings показывает состояние config, mounts, rules, AGENTS pointer и System structure; подтверждаемый repair восстанавливает отсутствующие managed rules/pointer, выбранные относительные mounts и config из last-good копии. Полный typecheck даёт соседний System doctor. См. [embedded install](20-embedded-install-and-attach-mode.md) и [checklist](IMPLEMENTATION-CHECKLIST.md#активный-foundation-gate-embedded-installation-и-attach-first-sources).
- Vue не закрыла всю web feature matrix; Svelte runtime ещё не начат. React System Stories/Preview/Playground в embedded режиме берутся из project-owned папки, но остальные React sources и Wireframe/Page всё ещё используют build-time eager registries. См. [аудит](22-web-stack-coupling-audit.md).
- Settings умеет создать неактивную полную System от bundled default или текущей активной папки, выбрать папку проекта просмотром каталогов либо внешнюю папку с компьютера без ввода пути, проверить её, установить после подтверждения и восстановить default со snapshot. Для Skin есть выбор папки проекта, создание, проверка, установка, выбор сохранённой версии и сброс; внешняя Skin-папка пока требует пути. Изменение CSS загружается после перезапуска. Установка Skin/System сверяет staging-копию с отпечатком просмотренных файлов и требует повторной проверки, если папка изменилась. README новых пакетов и локальные правила ведут через этот UI; CLI остаётся запасным и автоматизируемым путём. Ошибки TypeScript теперь показывают конкретные файлы, строки и TS-коды отдельно для System и её потребителей в приложении; полный лог остаётся в technical details. Буквальные JS/TS imports, `import()` и `new URL(..., import.meta.url)`, а также локальные CSS/SCSS `url()` отсутствующих медиа и шрифтов System выявляются до установки. [Галерея сообщества](23-interface-skins-systems-and-gallery.md#community-distribution-and-gallery) запланирована.
- Read-only `system diff` показывает файловые и Component отличия от bundled default. Settings также показывает diff проверенной папки до её установки; в development checkout эталоном служит активная System. Для default-derived папки `system upgrade` использует сохранённую базу, блокирует весь update при неразрешённом конфликте и валидирует результат до активации. Settings показывает обе текущие версии конфликтующего файла и позволяет явно оставить свою или взять bundled для каждого конфликта. Слияние содержимого обеих версий в редакторе и миграции контрактов остаются открытыми. Полная System обязана удовлетворять [application contract](../design-lab/interface-system-contract.json).
- Settings показывает проверку активной System, read-only diff и трёхсторонний план обновления default. После установки, восстановления или обновления полной System нужен перезапуск приложения. Автоматического разрешения конфликтов нет по [D-095](DECISIONS.md).
- Rules/Decisions/Prompts как полноценные UI-модули, embeddings, hosted collaboration, Figma integration и нативные платформы остаются следующими фазами; статус отдельных вертикалей смотрите в [checklist](IMPLEMENTATION-CHECKLIST.md).

## Как читать противоречия

История решений длиннее текущего кода. Например, ранние [D-001/D-005](DECISIONS.md) описывали обязательные canonical roots, а D-083–D-085 приняли attach-in-place. D-091 сначала предполагало несколько активных Libraries; D-092 заменило эту часть одним слотом. Старые фразы в ранних roadmap и checklist-секциях не следует читать как актуальный контракт без этих поправок.

## Быстрый запуск в этом checkout

Из корня репозитория: `npm install`, затем `npm run dev`. Для диагностики пакета интерфейса: `npm run designlab -- system doctor`. Для всех тестов: `npm test`; для сборки: `npm run build`. Локальный tarball и установка во внешний fixture описаны в [инструкции](25-interface-system-and-installation.md).
