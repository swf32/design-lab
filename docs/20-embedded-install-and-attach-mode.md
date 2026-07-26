# Embedded installation and attach-first sources

**Статус:** продуктово-архитектурный анализ. Направление «Design Lab прежде всего подключается к
существующему repository и не требует переноса production source» предложено пользователем
2026-07-26. Точный install footprint ещё требует выбора; реализация не начата.

## Короткий вывод

Каша в постановке правильная. Она обнаружила не частную настройку путей, а конфликт двух разных
моделей продукта:

1. текущая модель Design Lab считает себя отдельным canonical workspace с соседними `projects/` и
   `libraries/` и требует миграции существующей системы;
2. желаемая модель ставит Design Lab внутрь существующего repository, оставляет production files
   на месте и подключает их к общему Catalog, runtime, MCP и AI search.

Для реального внедрения в команды рекомендуется вторая модель как default для существующих
repositories: **embedded install + attach in place**. Canonical layout остаётся полезным режимом для
greenfield и для новых Design Lab-only сущностей, но перестаёт быть обязательной ценой входа.

Это не отказ от filesystem-first. Исходные Components, Tokens, Pages и Assets по-прежнему являются
source of truth в своих реальных файлах. Маленький integration config сообщает только, где искать
разные виды сущностей и какой package environment ими владеет. Он не перечисляет каждую сущность и
не дублирует её содержание.

## Что подсказал Storybook, а что нельзя копировать буквально

Storybook устанавливается в существующий project, создаёт компактную `.storybook/` configuration
folder и находит Stories в других directories через globs. Во время установки он анализирует
dependencies проекта и подбирает framework configuration. Это подтверждает жизнеспособность
модели «инструмент рядом с production code, а не отдельный склад с копией production code».

Но Storybook не состоит буквально из одной папки: installer также добавляет packages, scripts и
иногда starter stories в сам project. Поэтому обещание Design Lab должно звучать честно:

- одна компактная integration folder;
- package/binary приложения устанавливается отдельно от пользовательских сущностей;
- существующий production code не переносится;
- все добавленные root-level изменения известны и удаляются командой uninstall;
- caches и indexes производны и могут быть удалены без потери исходников.

## Три модели

### A. Только canonical migration — текущая модель

Существующая система копируется или переносится в `libraries/<name>/components`, `tokens`,
`assets` и другие Design Lab directories.

**Плюсы**

- Самый простой scanner и renderer contract.
- Одинаковое дерево у всех sources.
- Легко создавать новые сущности и объяснять их расположение.

**Минусы**

- Самая высокая цена пробы продукта.
- Перенос может сломать imports, package boundaries, build scripts и git history.
- После отказа от Design Lab команде нужен обратный перенос.
- Получается скрытое требование перестроить живой repository ради инструмента.
- Противоречит философии минимального количества обязательных контрактов.

Как default для существующего repository этот вариант отклоняется. Он остаётся optional
`Migrate to managed layout` после успешного attach, если команда сама хочет стандартизацию.

### B. Только arbitrary paths без модели source

Пользователь вручную указывает любые folders для Components, Tokens и остальных modules.

**Плюсы**

- Ничего не переносится.
- Можно быстро подключить почти любое дерево.

**Минусы**

- Дизайнер часто не знает нужные paths.
- Набор отдельных path fields быстро превращается в сложную developer settings form.
- Непонятно, какой `package.json`, lockfile и runtime относятся к каждому файлу.
- Несколько packages и frameworks в monorepo становятся неоднозначными.
- Scanner может принять tests, generated code и внутренние helpers за Components.
- Absolute paths ломают переносимость repository.

Этот вариант слишком слаб как самостоятельная архитектура.

### C. Embedded attach-first + optional managed roots — рекомендация

Design Lab автоматически анализирует repository и создаёт небольшую таблицу подключений. Каждое
подключение связывает semantic module с одним или несколькими относительными roots/globs, а также с
реальным package owner. Существующие файлы остаются на месте. Если Wireframes или Design Lab Pages
ещё не существуют, продукт создаёт их в собственной managed area внутри integration folder или в
явно выбранном source directory.

**Плюсы**

- Почти нулевая цена пробы и безопасное удаление.
- Production imports и build остаются неизменными.
- Один Design Lab может показать monorepo с React, Vue, Svelte и Custom Elements.
- Тот же routing layer используют UI, watcher, runtime, MCP, CLI и AI index.
- Greenfield сохраняет красивую структуру без принуждения существующих команд к миграции.

**Минусы**

- Scanner, watcher, path security и runtime resolution становятся заметно сложнее.
- Нельзя гарантированно распознать каждый Component без ecosystem adapter или optional metadata.
- Один source может иметь несколько package environments и runtime profiles.
- Root-level agent instructions требуют отдельного маленького integration shim.
- Нужен хороший repair flow при move/rename directories.

Это управляемая сложность и правильное место сложности: её берёт продукт, а не дизайнер.

## Предлагаемый installation footprint

Рабочее дерево может выглядеть так:

```text
existing-product/
├── package.json
├── package-lock.json
├── src/
│   ├── components/
│   ├── pages/
│   └── assets/
├── packages/
│   ├── ui-vue/
│   └── tokens/
├── design-lab/                     # имя ещё не принято
│   ├── designlab.config.json       # только routing/integration facts
│   ├── rules/                      # единый authored rule set
│   ├── wireframes/                 # managed fallback, если их не было
│   ├── pages/                      # managed fallback, если их не было
│   ├── adapters/                   # только declared adapter policy/metadata
│   └── .cache/                     # ignored, полностью rebuildable
└── AGENTS.md                       # optional tiny pointer, не копия rules
```

Само приложение не следует копировать исходниками в эту папку. Предпочтительнее installable
package/CLI или desktop binary, а integration folder хранит только project-specific состояние.
Иначе каждое обновление Design Lab будет смешиваться с пользовательскими файлами и превращать
«лёгкую папочку» в vendor dump.

Строгое обещание «вообще никаких файлов вне одной папки» конфликтует с двумя полезными вещами:

1. package manager обычно записывает dependency и script в root `package.json`/lockfile;
2. coding agent, запущенный в root или в `src/`, не обязан автоматически читать rules внутри
   `design-lab/`.

Поэтому install footprint является отдельным продуктовым выбором в конце документа.

## Source mount — это не import alias

Важно не смешивать три механизма:

- **import alias** меняет то, как production code резолвит imports;
- **filesystem symlink** создаёт второе path-представление того же файла;
- **Design Lab mount** только говорит scanners, UI и runtime, где находится source.

Default — Design Lab mount. Он не меняет `tsconfig`, Vite/Webpack aliases или production imports и
не создаёт symlinks. Paths хранятся относительно repository/integration root, чтобы config работал
после clone на другом компьютере.

Conceptual config, не финальная schema:

```json
{
  "schemaVersion": 1,
  "sources": [
    {
      "id": "product-ui",
      "root": "..",
      "mounts": {
        "components": ["src/components", "packages/ui-vue/src"],
        "tokens": ["packages/tokens/src"],
        "assets": ["src/assets", "public"],
        "wireframes": ["design-lab/wireframes"],
        "pages": ["src/pages", "design-lab/pages"]
      }
    }
  ]
}
```

Config перечисляет roots, но не `Button`, `Card` или каждый token. Entity inventory остаётся
derived и rebuildable. Для ambiguous files adjacent metadata может уточнить identity и semantics,
но basic discovery не должно требовать обязательного manifest для каждого существующего
Component.

## Dependencies в существующем repository

Подтверждённая модель из `19-dependencies-and-libraries.md` уточняется для attach mode:

- dependency declaration принадлежит ближайшему реальному `package.json`, который владеет source;
- package manager и resolved versions определяются по существующему lockfile/install root;
- в monorepo declaration может находиться в `packages/ui/package.json`, а lockfile — в repository
  root; Design Lab не создаёт второй lockfile только ради формального единообразия;
- физический путь к `node_modules` не спрашивается у дизайнера и обычно вообще не хранится;
- resolver вычисляет environment через package-manager rules;
- Design Lab adapters живут в отдельном managed cache и не загрязняют product dependencies;
- runtime profile ключуется как минимум по source, framework и package environment, а не только по
  имени дизайн-системы.

Если автоматическое определение неоднозначно, UI спрашивает не «где ваш node_modules», а показывает
понятный выбор: «эти Components собираются пакетом `packages/ui`; использовать его окружение?»

## Что происходит с разными modules

### Components

React/Vue/Svelte/Custom Element adapters анализируют реальные exports, framework files, adjacent
Stories и metadata. Найденный Component сразу попадает в Catalog с тем capability level, который
можно доказать. Неясный файл остаётся diagnostic candidate, а не молча становится Component.

### Wireframes

Если у команды уже есть Design Lab Wireframes, mount подключает их на месте. Обычные application
screens нельзя автоматически выдавать за полноценные Wireframes: у них может не быть hypotheses,
layouts, saved states и flow graph. Onboarding создаёт managed `wireframes/` только когда такого
authoring layer ещё нет.

### Pages

Framework routes/screens можно обнаружить как page implementations с ограниченными capabilities.
Полноценный Design Lab Page contract — states, controls, provenance и navigation graph — появляется
только из доказуемой framework metadata или optional adjacent metadata. Новый Page может храниться
в существующем application package либо в managed area — это выбирает source adapter, не дизайнер
через ручную настройку каждого файла.

### Tokens, Palette, Fonts и Assets

Они не дублируются по React/Vue/Svelte, но attach mode всё равно влияет на discovery:

- Tokens могут жить в нескольких packages и dialects; adapters нормализуют их в один catalog.
- Palette остаётся derived semantic view над color tokens, где бы те ни лежали.
- Fonts объединяют declarations и files, сохраняя provenance реального source.
- Assets могут иметь несколько roots, но duplicate identity и public URL требуют diagnostics.

Общий semantic слой не означает один физический directory.

## Onboarding для человека, который не знает структуру repository

Onboarding не должен начинаться с пустой формы путей. Рекомендуемый flow:

1. **Определить контекст.** CLI видит, пустой это repository или существующий, но пользователь может
   переключить `Connect existing project` / `Start clean`.
2. **Read-only scan.** Deterministic analyzer читает package manifests, lockfiles, workspace config,
   framework config, exports, route conventions, Storybook config, token formats и asset roots.
3. **AI interpretation.** AI используется для неоднозначных случаев и объяснения, а не вместо
   проверяемого scanner.
4. **Человеческий итог.** «Найдено 84 Components: 61 React и 23 Vue; два token sources; 14 Pages;
   Wireframes не найдены». Paths спрятаны в `Details`.
5. **Один понятный выбор.** `Use files where they are` — default; `Copy into managed layout` —
   optional migration; `Review` — раскрывает детали.
6. **Apply plan.** Записывается integration config, создаются только отсутствующие Design Lab-owned
   directories, добавляются согласованные agent pointers и `.gitignore` entries. Production source
   не перемещается.
7. **Self-check.** UI открывает Catalog, проверяет runtime profiles, MCP index и показывает
   конкретные unresolved candidates.

Кнопка `Let AI set it up` полезна, но не может честно обещать гарантированное распознавание любого
repository. Хорошее обещание: AI делает всё сам, показывает понятный результат и просит человека
решить только настоящую неоднозначность. Внешний copyable prompt остаётся fallback, когда у Design
Lab нет встроенного agent access.

## Где должны жить правила для AI

Rules внутри `design-lab/rules/` являются единственным полным source of truth. Копировать их целиком
в repository root нельзя: копии разойдутся.

Но одной вложенной папки недостаточно для автоматического применения. Codex строит instruction
chain от repository root до текущей working directory и читает не произвольные Markdown files, а
поддерживаемые instruction filenames. Если агент работает в `src/components`, файл
`design-lab/rules/COMPONENT_RULES.md` не лежит на этом пути и сам по себе не загрузится.

Рекомендуемая интеграция:

- сохранить полные rules в `design-lab/rules/`;
- добавить или аккуратно дополнить root `AGENTS.md` коротким managed block: какие Design Lab rules
  читать перед изменением Components/Wireframes/Pages/Tokens/Assets/Fonts;
- не перезаписывать существующий `AGENTS.md` и не копировать в него полные contracts;
- для других agents использовать маленькие adapter-specific pointers (`CLAUDE.md` и другие) только
  когда пользователь включает соответствующую integration;
- MCP отдаёт те же rules и source map как structured context, но MCP connection не заменяет
  bootstrap instruction: агент сначала должен узнать, что им надо пользоваться;
- Settings/Onboarding показывает status каждой AI integration и умеет repair/remove только свой
  ограниченный managed block.

Следовательно, «всё строго в одной папке» возможно только ценой менее надёжного AI rule discovery.
Один маленький root pointer — разумный и удаляемый exception.

## Как меняются UI, MCP и search

### UI

- Source selector показывает не физическую `libraries/<id>` папку, а logical source.
- Settings получает `Source locations` с человеческим summary и developer details.
- Dependencies показывает package owner/environment каждого framework group.
- Onboarding и repair используют одну scan result model.
- Move/rename directory не роняет source целиком: affected mount получает diagnostic и rescan.

### Server и watcher

- `source.path + fixed module directory` заменяется на `source root + module mounts`.
- Все paths проходят containment check; выход за repository root требует отдельного разрешения.
- Watcher наблюдает несколько roots и invalidates только затронутый module/runtime profile.
- Entity хранит stable source id, mount id и relative provenance path.

### MCP, CLI и AI index

- Они обязаны использовать тот же source resolver, что UI, а не собственные assumptions о
  `libraries/*/components`.
- Search ref остаётся semantic/stable, а фактический path возвращается как provenance.
- Index остаётся derived и полностью rebuildable.
- Rules, dependency ownership и runtime diagnostics входят в source context.
- Arbitrary file read за пределами declared mounts не появляется.

## Что конкретно не соответствует этой модели сейчас

1. `projectRegistry.mjs` вычисляет один workspace с соседними `projects/` и `libraries/` и сканирует
   только `libraries/*/library.json`.
2. `moduleEntities.mjs`, `assetFiles.mjs`, `componentHandoff.mjs`, `manifestWrite.mjs` и другие
   services строят пути как `source.path/<fixed-module>`.
3. Frontend runtime использует build-time `import.meta.glob` только по
   `../../libraries/*/components`, `wireframes` и `pages`; произвольные attached roots нельзя
   подключить после запуска.
4. Context gateway, MCP и CLI индексируют fixed canonical directories.
5. Create Project создаёт canonical directories, но нет attach existing source и onboarding scan.
6. Нет общей schema для mounts, package environments, confidence/evidence и diagnostics.
7. Нет installer/uninstaller и managed root instruction blocks.

Это не маленький patch настроек. Нужна замена source resolution foundation до продолжения массовых
Vue/Svelte adapters; иначе каждый adapter придётся переписать после attach mode.

## Порядок реализации после продуктового решения

1. Принять install footprint и имя integration folder.
2. Ввести versioned `DesignLabInstallation` / `SourceMount` schema без UI writes.
3. Сделать единый path resolver и containment policy.
4. Перевести scanners, context gateway, MCP и CLI с fixed paths на mounts.
5. Заменить eager build-time globs на runtime adapter host, способный загружать attached roots.
6. Добавить deterministic repository scanner и scan result schema с evidence/confidence.
7. Реализовать onboarding: existing/greenfield, scan, summary, attach/copy choice, apply, self-check.
8. Добавить package environment resolver без ручного `node_modules` path.
9. Добавить managed root instruction blocks и AI integration status/repair/remove.
10. Только затем закрывать React runtime migration и Vue/Svelte/Custom Elements по Web Definition
    of Done.

## Что сейчас делать не надо

- Не переносить текущие Libraries обратно или в новые folders до принятия migration plan.
- Не добавлять ручные absolute path fields для каждого module.
- Не создавать symlinks как default integration.
- Не копировать полный rule set в несколько root instruction files.
- Не просить дизайнера выбирать `node_modules`.
- Не делать AI единственным scanner без deterministic evidence.
- Не начинать native platforms до полного web foundation.
- Не обещать распознавание любого framework/repository без adapter capability matrix.

## Продуктовый выбор: install footprint

### 1. Package/CLI + одна integration folder + маленькие root hooks — рекомендация

Installer добавляет Design Lab package/script в существующий package manager, создаёт одну
`design-lab/` или `.designlab/` folder и, с разрешения, ограниченные root instruction pointers.
`designlab uninstall` удаляет только то, что installer добавил; production source не трогается.

Это максимально близко к Storybook и даёт надёжные dependencies, команды и AI rules. Минус: это не
буквально один filesystem entry, потому что меняются `package.json`, lockfile и optional root
instructions.

### 2. Полностью self-contained `design-lab/` folder

Внутри лежат собственные package manifest, dependencies, runtime и config; root repository почти не
меняется.

Удаляется очевидно, но folder тяжёлая, dependency sharing хуже, запуск и package resolution
сложнее, а root agents всё равно не увидят вложенные rules автоматически.

### 3. Global/Desktop app + только project config folder

Приложение установлено вне repository, внутри project лежит только integration folder. Root
`package.json` не меняется; agent pointers остаются optional.

Самый чистый repository, но хуже воспроизводимость между членами команды, сложнее закрепить версию
Design Lab и CI/headless flows. Может быть хорошим дополнительным desktop distribution, но слабым
единственным team contract.

## Источники

- [Storybook installation](https://storybook.js.org/docs/get-started/install)
- [Storybook configuration and story locations](https://storybook.js.org/docs/configure/)
- [Codex custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
