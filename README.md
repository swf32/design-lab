# Design Lab

Локальное рабочее пространство дизайн-систем: React-интерфейс на TypeScript + SCSS и Node.js
runtime для файловой системы. [Начните с карты проекта](docs/24-project-map-and-status.md), если
возвращаетесь после перерыва; [полное оглавление](docs/README.md) связывает видение, архитектуру,
контракты и задачи. npm package ещё `private`, но локальный tarball уже можно установить в другой Git-проект.

## Запуск

```bash
npm install
npm run dev
```

- UI: `http://localhost:5317` (настраивается через `DESIGN_LAB_PORT`)
- локальный Node.js API: `http://127.0.0.1:4173` (через `DESIGN_LAB_API_PORT`)

## Проверка production-сборки

```bash
npm run build
```

## Локальная установка в другой проект

```bash
# Здесь, в checkout Design Lab
npm pack --workspace=design-lab
# В корне другого Git-проекта
npm install /путь/к/design-lab-0.1.0.tgz
npx designlab setup --name "My Project"
npx designlab setup --name "My Project" --apply --confirm
npx designlab system doctor
npx designlab repair
npx designlab dev
```

Первый `setup` показывает план без записи. Он подключает найденные исходники на месте, а редактируемую
System создаёт в `design-lab/system/` проекта. `DESIGN_LAB_PORT` и `DESIGN_LAB_API_PORT` задают
независимые порты. Повторная установка пакета сохраняет содержимое `design-lab/system/`; явный
`system reset` восстанавливает default. Подробнее — в [инструкции и границах поддержки](docs/25-interface-system-and-installation.md).
`repair` сначала показывает план восстановления только отсутствующих управляемых правил и указателя
в `AGENTS.md`; применить его можно через Settings или с `--apply --confirm --fingerprint` из плана.
После обновления пакета `npx designlab system upgrade` показывает трёхсторонний план для default System;
при конфликтах применение целиком блокируется. Такой же план доступен в Settings.

## Форматирование

```bash
npm run format
```

`format:code` приводит к единому виду JSON, TS, TSX и MJS; `format:styles` форматирует SCSS и CSS внутри component preview. Соответствующие `check:*` автоматически выполняются перед root build/test.

## Темы и альтернативные интерфейсные системы

```bash
npm run designlab -- theme create ../my-skin --name "My Skin"
npm run designlab -- theme install ../my-skin
npm run designlab -- system create ../my-system --name "My System"
npm run designlab -- system install ../my-system
npm run designlab -- system doctor
npm run designlab -- system diff
npm run designlab -- system upgrade
npm run designlab -- system upgrade --apply --confirm --fingerprint <значение-из-плана>
npm run designlab -- theme reset
npm run designlab -- system reset
```

`theme` управляет безопасным CSS/token Skin поверх активной системы. `system` физически устанавливает
полную исполняемую Library в единственный слот: `libraries/design-lab-system/` здесь или
`design-lab/system/` во внешнем проекте. Локальные папки,
`github:owner/repo#tag`, npm packages и
tarballs проходят compatibility/entrypoint validation до атомарной установки. Полный контракт и
модель community gallery описаны в `docs/23-interface-skins-systems-and-gallery.md`. Оба `create`
scaffold генерируют локальный `AGENTS.md`, понятный README, применимые rules и screenshot checklist;
Skin также получает документированный шаблон реальных публичных CSS variables.

## Структура

- `design-lab/src/views/` — route-level экраны приложения; переиспользуемых UI-компонентов внутри приложения нет.
- `design-lab/server/` — локальный Node.js API, registry проектов и filesystem gateway.
- `design-lab/scripts/dev.mjs` — запускает API и Vite вместе.
- `libraries/design-lab-system/` — единственный исполняемый слот интерфейсной системы; default и community Systems хранят исходники в отдельных репозиториях, а installer валидирует, snapshot-ит и атомарно заменяет содержимое слота.
- `libraries/design-lab-system/components/index.ts` — автоматически генерируемый package barrel из найденных `component.json`, а не ручной реестр.
- `libraries/design-lab-system/assets/icons/index.ts` — автоматически генерируемый barrel code-native иконок.
- `rules/COMPONENT_RULES.md`, `rules/WIREFRAME_RULES.md`, `rules/PAGE_RULES.md`, `rules/TOKEN_RULES.md`, `rules/ASSET_RULES.md`, `rules/FONT_RULES.md` — обязательные entity-authoring контракты для людей и агентов; `AGENTS.md`/`CLAUDE.md` в корне ссылаются на них и остаются входной точкой для агентов.
- `projects/` — дизайн-системы по каноническому файловому контракту Design Lab.
- `docs/` — product definition проекта.

Node runtime предоставляет:

- `GET /api/health`;
- `GET /api/projects` и `POST /api/projects`;
- `GET /api/projects/:id/tree?module=components`;
- первичное представление `GET /api/entities?projectId=…&module=…`.

Для нового Project доступны managed roots; для существующего репозитория setup сканирует
структуру и подключает найденные исходники по относительным mounts, не перенося их.
Это направление частично реализовано, а оставшиеся gaps перечислены в
[карте состояния](docs/24-project-map-and-status.md) и [checklist](docs/IMPLEMENTATION-CHECKLIST.md).
После установки локального tarball активная редактируемая System живёт в одной папке
пользовательского проекта ([D-093](docs/DECISIONS.md)); текущий development slot находится в
`libraries/design-lab-system/`.
