# Собственная интерфейсная система и установка

> [Оглавление](README.md) · [текущий статус](24-project-map-and-status.md) · [видение и задачи](26-vision-and-next-steps.md) · [формальный контракт пакетов](23-interface-skins-systems-and-gallery.md).

## Что хочет получить пользователь

Дизайнер видит интерфейсную систему самого Design Lab в каталоге Design Lab. Когда он меняет её токен или реальный компонент, Workbench показывает этот компонент, а приложение использует **тот же исходник**. Изменение собственной системы не требует синхронной правки второй копии UI. Другой автор может собрать полноценную System со своей структурой Components, SVG, изображениями и токенами и установить её; человеку, не желающему пользоваться CLI, нужна возможность заменить одну понятную папку. Design Lab как инструмент должен устанавливаться в чужой репозиторий и запускаться/останавливаться на отдельном настраиваемом порту, подобно локальному Storybook.

## Три разные вещи

| Понятие | Что меняет | Сегодня |
| --- | --- | --- |
| **Design Lab package** | Исполняемый инструмент: приложение, API, CLI и adapters. | Локальный npm tarball устанавливается в чужой репозиторий; package ещё `private` и не опубликован в registry. |
| **Interface System** | Полную активную Library собственного UI: React Components, icons, tokens, supporting entrypoints. | В development checkout — [`libraries/design-lab-system/`](../libraries/design-lab-system/); после установки — `design-lab/system/` проекта. |
| **Skin** | CSS/token слой поверх активной System без замены Component code. | Версионный pack с CLI create/install/use/reset. |

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

## Что делает существующий installer

[`interfacePacks.mjs`](../design-lab/server/services/interfacePacks.mjs) создаёт, проверяет и устанавливает Skin или полную System. Для System валидируются manifest, относительные entrypoints, обязательные exports из [`interface-system-contract.json`](../design-lab/interface-system-contract.json) и typecheck приложения. Выбранный пакет копируется в один физический слот, предварительно сохраняется snapshot; неактивные версии лежат в управляемом cache. Текущий выбор хранится в `design-lab/.designlab/interface.json`. CLI документирован в [корневом README](../README.md) и [контракте пакетов](23-interface-skins-systems-and-gallery.md).

В установленном проекте автор может заменить `design-lab/system/` вручную и выполнить `npx designlab system doctor`; если папка несовместима, приложение может перестать запускаться до восстановления. CLI `system install <папка>` проверяет совместимость и сохраняет snapshot до активации. UI для этой операции пока нет.

Автоматический внешний fixture доказывает более широкий сценарий, чем смена токенов: `system create` создаёт fork, автор меняет структуру `Button` и добавляет импортируемый SVG asset, после чего `system validate` и `system install` проходят. Браузерная проверка видит новые DOM-элементы и загруженный SVG в shell и Workbench от одной активной папки. Это проверка React-адаптера и текущего application contract, а не обещание автоматической миграции всех будущих версий.

Текущий default look восстановлен после Glass-эксперимента. Приоритет — сменяемость полноценного
исполняемого System-пакета, а не новый визуальный стиль; см. [D-094](DECISIONS.md).

## Принятое направление для устанавливаемого пакета

После установки в чужой проект активная **редактируемая** System живёт в одной видимой папке самого проекта. Пакет Design Lab поставляет default System как начальное содержимое, но runtime, каталог и Workbench читают **одну активную project-owned папку**. Её можно хранить в Git и заменить вручную; после ручной замены совместимость проверяется командой `system doctor`. Это [D-093](DECISIONS.md). Реализованный путь — `design-lab/system/` внутри integration folder: setup копирует туда default System, а resolver и каталог используют эту папку. Локальный tarball установлен и проверен в чистом внешнем Git-проекте. Публикация в registry, миграции версий и полноценное удаление интеграции ещё не сделаны.

Установка новой версии tarball не перезаписывает пользовательские изменения этой папки: внешний fixture поднимает patch version инструмента, меняет его default template и проверяет, что активная System сохранила локальную правку. Default System хранится как template внутри пакета (`vendor/default-system/`) и используется для начального копирования и явного `system reset`. По-прежнему нужны сравнение с новой версией default, миграции и понятное обновление авторской System. При повреждении активной System recovery — явный `system reset`, без скрытого UI kernel. Эти требования согласуются с [D-006](DECISIONS.md), [D-090–D-092](DECISIONS.md) и [System rules](../rules/SYSTEM_RULES.md).

## Отдельная установка Design Lab

[Embedded/attach proposal](20-embedded-install-and-attach-mode.md) определяет одну видимую `design-lab/` integration folder в пользовательском repository и относительные mounts существующих исходников. [`setupService.mjs`](../design-lab/server/services/setupService.mjs) создаёт config, локальные rules и System. CLI из локального tarball запускает приложение на портах `DESIGN_LAB_PORT`/`DESIGN_LAB_API_PORT`; clean external fixture проверен. Registry publication, versioned upgrade UX и uninstall ещё не проверены.

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
npx designlab dev
```

Порты меняются через `DESIGN_LAB_PORT` и `DESIGN_LAB_API_PORT`. Остановить оба процесса можно `Ctrl-C`. Для регрессии локальной установки используются `npm run test:package --workspace=design-lab` и браузерный `npm run test:package:browser --workspace=design-lab`. Последнему нужен Chromium для Playwright или Chrome на macOS; путь к своему браузеру можно передать через `DESIGN_LAB_BROWSER_PATH`.

## Открытые детали реализации

- Публикация и установка по имени из registry, включая release/version policy.
- Проверка clean install на других ОС и package managers; текущая проверка проведена с npm на macOS.
- Как обновление пакета показывает diff, сохраняет локальные правки и мигрирует versioned interface contract.
- Когда изменение Component требует HMR, reload или restart; пользователь должен видеть честный статус.
- Как UI проводит install/validate/doctor и показывает ошибки понятным дизайнеру языком.
- Как поддерживать полный System fork без принудительного ручного копирования каждого нового optional Component; `system diff` пока в backlog.

Рабочие задачи для этих пунктов находятся в [приоритетном плане](26-vision-and-next-steps.md) и [checklist](IMPLEMENTATION-CHECKLIST.md).
