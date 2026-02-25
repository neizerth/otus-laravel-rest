# Feature-Sliced Design (FSD)

Структура слоёв (зависимости только вниз):

```
src/
  app/              — инициализация: App, провайдеры, глобальные стили
  pages/            — страницы (home)
  widgets/          — композитные блоки (header, service-list)
  features/         — фичи (auth: логин, регистрация, контекст)
  entities/         — сущности (user, service, order): типы + API
  shared/           — переиспользуемое (api client, типы пагинации)
```

Импорты через алиас `@/`: `@/entities/service`, `@/features/auth`, `@/shared/api`.

Публичный API каждого слайса — только через `index.ts`.
