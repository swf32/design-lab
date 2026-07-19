# Design Lab

Локальная основа Design Lab: React-интерфейс на TypeScript + SCSS и Node.js runtime для доступа к файловой системе workspace.

## Запуск

```bash
cd design-lab
npm install
npm run dev
```

- UI: `http://localhost:5173`
- локальный Node.js API: `http://127.0.0.1:4173`

## Проверка production-сборки

```bash
cd design-lab
npm run build
```

## Структура

- `design-lab/src/` — React-интерфейс и SCSS.
- `design-lab/server/` — локальный Node.js API, registry проектов и filesystem gateway.
- `design-lab/scripts/dev.mjs` — запускает API и Vite вместе.
- `libraries/design-lab-system/` — редактируемая дизайн-система самого приложения и её единственный source of truth.
- `projects/` — дизайн-системы по каноническому файловому контракту Design Lab.
- `docs/` — product definition проекта.

Node runtime предоставляет:

- `GET /api/health`;
- `GET /api/projects` и `POST /api/projects`;
- `GET /api/projects/:id/tree?module=components`;
- первичное представление `GET /api/entities?projectId=…&module=…`.

Новый Project создаётся автоматически в соседнем с приложением `projects/<название>/`. Пользователь вводит только название; выбирать директории не нужно. Design Lab читает сущности только из канонических каталогов Project/Library и не адаптируется к произвольной структуре существующего репозитория. Следующий этап — shared entity contracts и вертикальный срез Tokens: scanner → normalization → API → UI → watcher.
