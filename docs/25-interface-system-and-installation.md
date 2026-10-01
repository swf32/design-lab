# Собственная интерфейсная система и установка

> [Оглавление](README.md) · [текущий статус](24-project-map-and-status.md) · [видение и задачи](26-vision-and-next-steps.md) · [формальный контракт пакетов](23-interface-skins-systems-and-gallery.md).

## Что хочет получить пользователь

Дизайнер видит интерфейсную систему самого Design Lab в каталоге Design Lab. Когда он меняет её токен или реальный компонент, Workbench показывает этот компонент, а приложение использует **тот же исходник**. Изменение собственной системы не требует синхронной правки второй копии UI. Другой автор может собрать полноценную System со своей структурой Components, SVG, изображениями и токенами и установить её; человеку, не желающему пользоваться CLI, нужна возможность заменить одну понятную папку. Design Lab как инструмент должен устанавливаться в чужой репозиторий и запускаться/останавливаться на отдельном настраиваемом порту, подобно локальному Storybook.

## Три разные вещи

| Понятие | Что меняет | Сегодня |
| --- | --- | --- |
| **Design Lab package** | Исполняемый инструмент: приложение, API, CLI и adapters. | Локальный npm tarball устанавливается в чужой репозиторий; package ещё `private` и не опубликован в registry. |
| **Interface System** | Полную активную Library собственного UI: React Components, icons, tokens, supporting entrypoints. | В development checkout — [`libraries/design-lab-system/`](../libraries/design-lab-system/); после установки — `design-lab/system/` проекта. |
| **Skin** | CSS/token слой поверх активной System без замены Component code. | Версионный pack с CLI и Settings create/inspect/install/use/reset. |

Пользовательская дизайн-система проекта, подключённая через source mounts, — четвёртый объект. Она может быть React, Vue или иной web stack; её темы не выбирают тему самого интерфейса Design Lab. См. [D-089](DECISIONS.md) и [платформенную матрицу](21-web-runtime-feature-parity.md).

## Текущий поток данных

```text
libraries/design-lab-system/       ← один активный исходник
  ├─ components/                 → @design-lab/system/components
  ├─ assets/icons/               → @design-lab/system/icons
  ├─ tokens/generated/tokens.css → @design-lab/system/tokens.css
  └─ library.json                → discovery как Library
           ↓
Design Lab shell + каталог/Workbench
```

Реальные импорты видны в [`App.tsx`](../design-lab/src/App.tsx) и [`main.tsx`](../design-lab/src/main.tsx); aliases указывают на активный слот в [`vite.config.ts`](../design-lab/vite.config.ts). Генерируемые component/icon indexes не являются второй редактируемой Library. Семантическая композиция shell принадлежит System Components; маршруты, данные и callbacks остаются в приложении по [D-090](DECISIONS.md).

Это устраняет конкретный класс дублирования: не нужно держать одну копию компонентов для каталога и другую для оболочки. Токены и стили в dev идут через Vite; переключение **целой System** требует перезапуска dev/build, поскольку меняется executable source. Во внешнем fixture изменение токена обновило реальный shell, а изменение `Button.scss` одновременно обновило shell Button и настоящий Button в Workbench Canvas через HMR без ошибок браузера.

Полноэкранный React/Vue concept Playground теперь использует тот же `WorkbenchPlayground` из активной System, что и Component Workbench: фон Canvas, плавающий control и stage presentation не поддерживаются второй копией в приложении. Route state, source renderer и открытие мобильной панели остаются поведением приложения. Browser fixture проверяет React fullscreen Canvas и mobile overlay; Vue runtime capture проверяется отдельно.

## Что делает существующий installer

[`interfacePacks.mjs`](../design-lab/server/services/interfacePacks.mjs) создаёт, проверяет и устанавливает Skin или полную System. Для System валидируются manifest, относительные entrypoints, обязательные exports из [`interface-system-contract.json`](../design-lab/interface-system-contract.json) и typecheck приложения. Выбранный пакет копируется в один физический слот, предварительно сохраняется snapshot; неактивные версии лежат в управляемом cache. В embedded проекте выбор хранится в `design-lab/.cache/interface.json`, а в development checkout — в `design-lab/.designlab/interface.json`. CLI документирован в [корневом README](../README.md) и [контракте пакетов](23-interface-skins-systems-and-gallery.md).

В установленном проекте автор может заменить `design-lab/system/` вручную и выполнить `npx designlab system doctor`; если папка несовместима, приложение может перестать запускаться до восстановления. CLI `system install <папка>` проверяет совместимость и сохраняет snapshot до активации. В Settings можно создать полную неактивную копию текущей System в новой папке: scaffold переименует pack/library, добавит локальные правила и проверит контракт. README и локальные правила новой Skin/System теперь ведут через Settings: выбрать папку, проверить, установить после подтверждения, перезапустить и при необходимости восстановить default/очистить Skin. CLI указан как необязательный путь автоматизации и восстановления сломанного интерфейса. Папку проекта можно выбрать просмотром каталогов или указать локальный путь. Просмотр не выходит за корень проекта; для внешней папки пока нужен путь. Относительный путь считается от корня проекта. Предыдущая System сохраняется как snapshot. Для загрузки нового исполняемого кода нужен перезапуск Design Lab.

Автоматический внешний fixture доказывает более широкий сценарий, чем смена токенов: CLI или Settings создаёт fork, автор меняет структуру `Button` и добавляет импортируемый SVG asset, после чего проверка и установка проходят. Браузерная проверка создаёт System через Settings и видит новые DOM-элементы и загруженный SVG в shell и Workbench от одной активной папки. Валидатор до установки проверяет наличие статически импортированных медиа и шрифтов в JS/TS исходниках System, включая `@design-lab/system/assets/*`, а также локальные `url()` в CSS/SCSS; Settings показывает исходный файл и недостающий asset. Динамически вычисленные пути пока не входят в эту проверку. Это проверка React-адаптера и текущего application contract, а не обещание автоматической миграции всех будущих версий.

Settings показывает совместимость активной System и её read-only отличия от bundled default, включая Components и отдельные authored файлы. Диагностику можно повторить кнопкой без терминала. Здесь же можно создать, проверить и установить полную System из локальной папки или восстановить bundled default с сохранением snapshot текущей папки. При ошибке проверки Skin/System Settings показывает следующий шаг для известных случаев (например, неверный manifest, отсутствующий entrypoint или export, несовместимая версия), перечень недостающих exports и раскрываемые технические детали. Ошибки TypeScript-контракта выводятся как ограниченный список с файлом, строкой и TS-кодом; он различает исходники System и код Design Lab, который её потребляет. Полный вывод компилятора остаётся доступным под Technical details. Для Skin доступен отдельный цикл создания, проверки, установки, выбора сохранённой версии и сброса; CSS загружается после перезапуска. Если сломанная System или Skin препятствует использованию приложения, восстановление остаётся доступно через CLI `system reset` или `theme reset`.

Проверка выбранной System в Settings теперь показывает её read-only diff до установки. Во внешнем проекте эталон — bundled default, а в development checkout без отдельной default-копии — активная System. Проверка Skin/System запоминает отпечаток файлов выбранной папки. При установке Design Lab сверяет с ним уже скопированный пакет и повторно валидирует его; если папка поменялась после просмотра, активная версия сохраняется и Settings просит проверить папку снова. CLI остаётся пригодным для прямой установки без предварительного UI-просмотра.

Текущий default look восстановлен после Glass-эксперимента. Приоритет — сменяемость полноценного
исполняемого System-пакета, а не новый визуальный стиль; см. [D-094](DECISIONS.md).

## Принятое направление для устанавливаемого пакета

После установки в чужой проект активная **редактируемая** System живёт в одной видимой папке самого проекта. Пакет Design Lab поставляет default System как начальное содержимое, но runtime, каталог и Workbench читают **одну активную project-owned папку**. Её можно хранить в Git и заменить вручную; после ручной замены совместимость проверяется командой `system doctor`. Это [D-093](DECISIONS.md). Реализованный путь — `design-lab/system/` внутри integration folder: setup копирует туда default System, а resolver и каталог используют эту папку. Локальный tarball установлен и проверен в чистом внешнем Git-проекте. Публикация в registry, миграции версий и полноценное удаление интеграции ещё не сделаны.

Установка новой версии tarball не перезаписывает пользовательские изменения этой папки. Default System хранится как template внутри пакета (`vendor/default-system/`) и используется для начального копирования и явного `system reset`. Read-only `system diff` сравнивает активную System с template текущей версии пакета и показывает добавленные, отсутствующие и изменённые authored файлы и Components; `system diff <folder>` проверяет отдельную папку. Это двустороннее сравнение, полезное и для произвольной System.

Для папки, созданной из default, технический `design-lab-baseline.json` фиксирует хеши исходных authored файлов и версию. `system upgrade` / Settings показывают трёхсторонний план: файлы, изменённые только в новой поставке, только локально, одновременно с обеих сторон и уже совпавшие. При любом несовпадающем пересечении весь upgrade блокируется по [D-095](DECISIONS.md). Для применения CLI требует `--apply --confirm --fingerprint` из свежего preview; Settings показывает план и диалог подтверждения. Перед заменой активной папки Design Lab собирает staging-копию, регенерирует производные файлы, проверяет полный System contract и сохраняет snapshot. После применения нужен restart. Без baseline автоматическое обновление недоступно; для кастомной System нужна её собственная процедура обновления. При конфликте Settings даёт открыть read-only сравнение текущего локального файла и файла из bundled default. Для удалённых, бинарных и слишком больших файлов отображается только статус; baseline хранит хеши, поэтому это не трёхсторонний просмотр содержимого. После ручной правки нужно повторно проверить план. Файловый алгоритм пока не заменяет миграции будущих breaking contracts и не даёт UI для записи разрешённого конфликта. При повреждении активной System recovery — явный `system reset`, без скрытого UI kernel. См. [System rules](../rules/SYSTEM_RULES.md).

## Отдельная установка Design Lab

[Embedded/attach proposal](20-embedded-install-and-attach-mode.md) определяет одну видимую `design-lab/` integration folder в пользовательском repository и относительные mounts существующих исходников. [`setupService.mjs`](../design-lab/server/services/setupService.mjs) создаёт config, локальные rules и System. После применения read-only self-check проверяет config, mounts, rules, AGENTS pointer и System contract/typecheck; результат возвращается в `selfCheck` с `{ ok, diagnostics }`. После установки Settings показывает повторяемую проверку интеграции с путями и следующим шагом для каждой проблемы. Repair сначала показывает план, затем после подтверждения восстанавливает только отсутствующие локальные rule copies и managed AGENTS pointer; изменённые файлы, config, mounts и System не перезаписываются. Полный typecheck остаётся в System doctor. CLI из локального tarball запускает приложение на портах `DESIGN_LAB_PORT`/`DESIGN_LAB_API_PORT`; clean external fixture проверен. Registry publication, миграции breaking contracts и uninstall ещё не проверены.

Целевой пользовательский цикл:

1. Установить Design Lab как dependency/tool в существующий repo.
2. Запустить read-only scan; увидеть найденные Components/Tokens/Assets/Fonts/Wireframes/Pages и предлагаемые относительные mounts.
3. Выбрать `Connect existing` или `Start clean`, посмотреть список записываемых файлов и подтвердить применение.
4. Получить одну активную редактируемую папку interface System и независимый локальный сервер.
5. Менять System в каталоге и видеть изменения в оболочке; установить чужую System через UI/CLI или заменить эту папку с проверкой.
6. Обновлять Design Lab package отдельно от авторской System; получать явные диагностики несовместимости.

Первый рабочий цикл локального tarball:

```bash
# В checkout Design Lab: собрать локальный архив
npm pack --workspace=design-lab
# В корне другого Git-проекта: установить архив и подключить исходники
npm install /путь/к/design-lab-0.1.0.tgz
npx designlab setup --name "My Project"         # read-only план
npx designlab setup --name "My Project" --apply --confirm
npx designlab system doctor
npx designlab system diff                       # только отчёт, без записи
npx designlab dev
```

Порты меняются через `DESIGN_LAB_PORT` и `DESIGN_LAB_API_PORT`. Остановить оба процесса можно `Ctrl-C`. Для регрессии локальной установки используются `npm run test:package --workspace=design-lab` и браузерный `npm run test:package:browser --workspace=design-lab`. Первый fixture теперь включает отдельный пустой Git-проект: `setup --mode managed`, создание активной System, `doctor` и запуск UI/API. Браузерному fixture нужен Chromium для Playwright или Chrome на macOS; путь к своему браузеру можно передать через `DESIGN_LAB_BROWSER_PATH`.

## Открытые детали реализации

- Публикация и установка по имени из registry, включая release/version policy.
- Проверка clean install на других ОС и package managers; текущая проверка проведена с npm на macOS.
- Как обновление пакета выполняет безопасный трёхсторонний merge и мигрирует versioned interface contract; текущий `system diff` только показывает двусторонние отличия.
- Когда изменение Component требует HMR, reload или restart; пользователь должен видеть честный статус.
- Как расширить первый UI create/install/validate/doctor до выбора источника вне проекта без ручного пути и более понятных диагностик. Папки внутри проекта уже выбираются через Settings.
- Как поддерживать полный System fork без принудительного ручного копирования каждого нового optional Component; текущий `system diff` даёт файловый отчёт, но не синхронизирует fork.

Рабочие задачи для этих пунктов находятся в [приоритетном плане](26-vision-and-next-steps.md) и [checklist](IMPLEMENTATION-CHECKLIST.md).
