# Dependencies and Libraries

**Статус:** основная ownership-модель принята 2026-07-26 (D-083). Открыты UX и install-policy
детали. Продолжает D-056 и runtime-анализ из `18-web-runtime-architecture-options.md`.

## Зачем это отдельная поверхность

Framework-neutral runtime невозможно сделать надёжно, если Design Lab не понимает, какие packages
нужны каждой Project/Library, установлены ли они, совместимы ли версии и какая локальная Library
предоставляет импортируемый package.

Designer-first интерфейс не должен требовать читать `package.json` или terminal output. В активной
source нужна поверхность **Dependencies & Libraries**, которая отвечает простыми словами:

- что использует эта дизайн-система;
- что уже готово для preview;
- чего не хватает;
- какая зависимость является другой локальной Design Lab Library;
- какая проблема мешает только preview, а какая — самой source;
- какое явное действие подготовит runtime.

Это не marketplace и не новый package manager. Design Lab читает существующие ecosystem manifests
и lockfiles, запускает выбранный package manager и нормализует результат для UI.

## Две разные сущности

### Packages

Обычные packages из npm-compatible ecosystem: `vue`, `react`, `motion`, `cmdk`,
`react-aria-components`, framework plugins и так далее.

Их canonical declaration — существующий `package.json` source. Design Lab не создаёт второй
`dependencies.json`.

UI различает:

- `dependencies` — нужны implementation во время выполнения;
- `peerDependencies` — ожидаются от host/runtime;
- `devDependencies` — tooling/build/test, не обязательно нужны для preview;
- imported but undeclared — source импортирует package, которого нет в manifest;
- declared but unavailable — manifest есть, но runtime environment не подготовлен;
- version conflict — требования source и adapter несовместимы;
- optional dependency — отсутствие допустимо до использования конкретной capability.

### Design Lab Libraries

Локальные переиспользуемые дизайн-системы из `libraries/*`: например Northstar может использовать
`@design-lab/system`.

Design Lab связывает такую зависимость автоматически, когда package name в `package.json` совпадает
с `packageName` обнаруженной `library.json`. Это derived relation, а не ручной список Libraries.

UI показывает:

- имя и версию Library;
- local/external status;
- кто её использует;
- какие Components/Tokens/Assets доступны;
- готов ли её runtime;
- есть ли version mismatch.

## Где хранится declaration и где лежат файлы

Фраза «установить в папку дизайн-системы» имеет два смысла.

### Semantic ownership

Да: dependency должна быть объявлена в реальном package root, который владеет source. Для
canonical Library это может выглядеть так:

```text
libraries/klyp/
├── library.json
├── package.json       ← Klyp объявляет свои dependencies здесь
├── package-lock.json  ← если npm и принято per-source locking
├── components/
├── wireframes/
└── pages/
```

В attached repository package root не обязан совпадать с папкой Design Lab или logical source.
Например, Components могут лежать в `packages/ui/src`, declaration — в `packages/ui/package.json`,
а общий workspace lockfile — в корне monorepo. Design Lab использует существующую ownership, а не
создаёт новый manifest/lockfile для формального соответствия собственной структуре.

Нельзя записывать Vue dependency в `design-lab/package.json` только потому, что Design Lab должен
показать Vue Component. И нельзя устанавливать package внутрь папки одного Component.

### Physical installation

Не обязательно. Текущий root `package.json` объявляет `workspaces: ["design-lab", "libraries/*"]`.
npm workspaces связывает локальные packages и может размещать/hoist dependencies в общем root
`node_modules`. Официальная npm documentation прямо описывает root workspace как единое управление
несколькими nested packages и автоматическое linking при `npm install`.

Поэтому сегодня:

```text
libraries/klyp/package.json      ← ownership Klyp
node_modules/motion/             ← файл физически может лежать в общем root
```

Это удобно, но не является строгой dependency isolation. Две Libraries могут случайно видеть
hoisted package, который они не объявили, а изменение общего lockfile затрагивает весь workspace.

## Вариант A — общий root workspace

Все Libraries остаются npm workspaces, зависимости объявляются в их `package.json`, но один root
`npm install` и `package-lock.json` управляют общим деревом.

### Плюсы

- Уже работает в текущем repository.
- Один install и один lockfile.
- npm автоматически связывает локальные Libraries.
- Меньше повторяющихся packages на диске.
- Удобно для Design Lab System, который dogfood'ится самим приложением.

### Минусы

- Не даёт той изоляции, ради которой выбирается отдельный runtime.
- Hoisting может скрыть undeclared dependencies.
- Конфликт одной Library меняет общий install plan.
- Тяжёлая Library утяжеляет общий workspace.
- Нельзя честно сказать, что удаление одной source удаляет только её environment.
- Чужой package install может запустить lifecycle scripts в общем workspace.

Этот вариант годится для самого репозитория Design Lab, но плохо масштабируется на независимые
пользовательские Libraries.

## Вариант B — source-local package environment

Каждая пользовательская Project/Library является самостоятельным package root со своим
`package.json`, своим lockfile и своим `node_modules`. Root workspaces больше не поглощают все
`libraries/*`; внутренний `design-lab-system` может остаться специальным dogfooding workspace.

### Плюсы

- Простая и честная ownership model.
- Version resolution и lockfile принадлежат одной source.
- Bare imports естественно резолвятся от source к её `node_modules`.
- Удаление source удаляет и её derived environment.
- Runtime failure и dependency changes локализованы.
- Existing migrated project может сохранить свой package manager и lockfile.

### Минусы

- Одинаковые packages могут повторяться на диске.
- У каждой source свой install lifecycle.
- Нужно определять npm/pnpm/yarn/bun по lockfile и не смешивать их.
- Локальные связи между Libraries нужно резолвить явно, без автоматического root workspace hoist.
- Source folder получает большой ignored `node_modules`.
- Ветки могут менять lockfile независимо от manifest и требовать repair.

## Вариант C — Design Lab-managed runtime store

Source хранит только manifest/lock или вообще только imports, а Design Lab собирает runtime
environment в derived store:

```text
.designlab/runtimes/<source-id>/<profile>/
├── package.json
├── lock/cache metadata
└── node_modules/
```

### Плюсы

- Source folders остаются чистыми.
- Design Lab может полностью пересобрать environment.
- Runtime adapter packages отделены от product dependencies.
- Удобно удалять cache и диагностировать runtime profile.
- Можно применять единую security/install policy.

### Минусы

- Появляется расстояние между authored `package.json` и реально запущенным environment.
- Риск создать второй скрытый dependency registry.
- Разработчику сложнее воспроизвести preview вне Design Lab.
- Generated lock/cache нельзя выдавать за source-controlled reproducibility.
- Нужно копировать/link dependencies и поддерживать package-manager differences.
- Если Design Lab сам выводит dependencies только из imports, он может ошибиться с optional,
  dynamic и conditionally exported packages.

Как единственный source of truth этот вариант противоречит filesystem-first философии. Как derived
adapter/cache поверх authored manifest — допустим.

## Рекомендация

**Source-owned declaration + existing lock/environment + managed adapter cache.** Решение принято
пользователем 2026-07-26.

- Ближайший реальный owning `package.json` владеет product dependencies.
- Существующий supported lockfile/install root определяет package manager и точные версии. В
  monorepo он может быть выше package root; Design Lab не создаёт второй lockfile.
- User/third-party sources не должны автоматически делить общий root workspace environment.
- `node_modules` остаётся derived и ignored; его physical path вычисляется package resolver'ом и не
  вводится дизайнером вручную.
- Design Lab-owned Vue/Svelte/inspection bridge packages живут в отдельном managed adapter cache и
  не записываются в product dependencies.
- Local Design Lab Libraries связываются по `packageName`, а не через второй ручной registry.
- `design-lab-system` может остаться частью root workspace как особый dogfooding source; это не
  становится правилом для всех пользовательских Libraries.

Так вкладка Dependencies показывает реальную ownership, а runtime получает настоящую isolation.

## Предлагаемая UI-модель

В активной source появляется один module `Dependencies` с двумя views.

### Packages

| Поле | Смысл для пользователя |
| --- | --- |
| Package | Название, например `vue` |
| Purpose | Runtime, peer requirement или tooling |
| Requested | Диапазон из `package.json` |
| Resolved | Версия из lock/environment |
| Status | Ready, missing, conflict, install required, unsupported |
| Used by | Components/Wireframes/Pages, derived из imports |

Действия: `Prepare preview`, `Repair`, `Open details`. `Install` как низкоуровневое слово можно
оставить Developer mode. Designer видит результат: что будет скачано, для какой source и зачем.

### Libraries

Показывает local Design Lab Libraries и внешние design-system packages отдельно от обычных
utilities. Карточка отвечает: какая система используется, local ли она, готова ли, какие сущности
даёт и кто от неё зависит.

## Правила установки

- Никаких silent installs при простом открытии Catalog.
- Discovery и документация работают без установленного runtime.
- Первое действие `Prepare preview` явно объясняет network access и затронутую source.
- Никогда не менять root `design-lab/package.json` ради dependency пользовательской Library.
- Никогда не коммитить `node_modules` и runtime cache.
- Не исполнять install scripts без отдельной policy; package install может выполнять произвольный
  код.
- Не смешивать package managers внутри одной source.
- Не обновлять versions автоматически только потому, что registry предлагает более новую.
- Ошибка install локализуется к одной source и не скрывает её Catalog entities.
- Removal сначала показывает usages и не удаляет package, пока source imports его.

## Что уже есть

- Root npm workspace включает `libraries/*`.
- Каждая текущая Library уже имеет `package.json`.
- Klyp объявляет `react`, `motion`, `react-aria-components` и `lottie-react` в собственном manifest,
  но они устанавливаются общим root workspace.
- Northstar объявляет local `@design-lab/system` dependency.
- D-056 уже фиксирует отсутствие общей dependency policy как high-priority blocker.
- `node_modules`, `.designlab` и runtime indexes уже ignored/derived.

## Открытые продуктовые решения

1. Называется ли основной sidebar module `Dependencies`, а `Packages` и `Libraries` становятся его
   внутренними views, или это два top-level modules?
2. Может ли дизайнер запускать `Prepare preview`, или installation actions доступны только AI/
   Developer mode?
3. Разрешаем ли install scripts после отдельного предупреждения или web runtimes по умолчанию
   устанавливаются с отключёнными scripts?
4. Должен ли Project зависеть от нескольких Libraries одновременно, и как пользователь выбирает
   primary design system для generation?

## Источники

- [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)
- [npm install and lockfile behavior](https://docs.npmjs.com/cli/install/)
- [Node.js package and exports model](https://nodejs.org/api/packages.html)
