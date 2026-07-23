# Design Lab

Локальная основа Design Lab: React-интерфейс на TypeScript + SCSS и Node.js runtime для доступа к файловой системе workspace.

## Запуск

```bash
cd design-lab
npm install
npm run dev
```

- UI: `http://localhost:5317`
- локальный Node.js API: `http://127.0.0.1:4173`

## Проверка production-сборки

```bash
cd design-lab
npm run build
```

## Форматирование

```bash
npm run format
```

`format:code` приводит к единому виду JSON, TS, TSX и MJS; `format:styles` форматирует SCSS и CSS внутри component preview. Соответствующие `check:*` автоматически выполняются перед root build/test.

## Структура

- `design-lab/src/views/` — route-level экраны приложения; переиспользуемых UI-компонентов внутри приложения нет.
- `design-lab/server/` — локальный Node.js API, registry проектов и filesystem gateway.
- `design-lab/scripts/dev.mjs` — запускает API и Vite вместе.
- `libraries/design-lab-system/` — редактируемая дизайн-система самого приложения и её единственный source of truth.
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

Новый Project создаётся автоматически в соседнем с приложением `projects/<название>/`. Пользователь вводит только название; выбирать директории не нужно. Design Lab читает сущности только из канонических каталогов Project/Library и не адаптируется к произвольной структуре существующего репозитория. Следующий этап — shared entity contracts и вертикальный срез Tokens: scanner → normalization → API → UI → watcher.
