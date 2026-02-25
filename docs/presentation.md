---
marp: true
theme: default
paginate: true
style: |
  section { font-size: 26px; }
  h2 { color: #2563eb; }
  .theory { font-size: 22px; color: #475569; }
---

# Разработка REST API биржи Event-услуг на Laravel

**Раздел 1: Введение и Архитектура**


---

## Слайд 1 — Титульный

# Разработка REST API биржи Event-услуг на Laravel

- Биржа услуг для мероприятий (фотографы, диджеи и др.)
- REST API на Laravel
- Аутентификация, заказы, каталог услуг


---

## Слайд 2 — Обзор проекта

### Проблематика
- Нет единой площадки для поиска исполнителей event-услуг
- Сложно сравнить цены и портфолио
- Ручное согласование заказов и оплаты

### Цели
- Каталог услуг с фильтрами и поиском
- Создание и управление заказами
- Разделение ролей: заказчик / исполнитель

### Бизнес-требования
- Регистрация и аутентификация пользователей
- CRUD услуг (исполнители), заказы (заказчики)
- Валидация дат, статусы заказов, уведомления

**Зачем формулировать так:** чёткое разделение «проблема → цель → требования» помогает не раздувать scope и проверять, что каждая фича закрывает реальную потребность.


---

## Слайд 3 — Технологический стек

| Компонент | Технология | Зачем |
|-----------|------------|--------|
| Язык | **PHP 8.3+** | Типизация, enum, readonly — меньше багов, быстрее разработка |
| Фреймворк | **Laravel 11** | Готовая маршрутизация, ORM, валидация, API — не изобретаем велосипед |
| БД | **PostgreSQL** | Надёжность, JSON-поля, полнотекстовый поиск, лицензия без ограничений |
| API-токены | **Laravel Sanctum** | Лёгкая токен-аутентификация для SPA и мобильных клиентов (без OAuth2) |
| Дополнительно | Eloquent, миграции, API Resources | Единый слой работы с БД, версионирование схемы, единый формат ответов API |


---

## Слайд 4 — Схема БД (ER-диаграмма)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  services   │       │   orders    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │───┐   │ id          │
│ name        │   │   │ user_id     │───┼───│ client_id   │
│ email       │   └───│ category    │   └───│ service_id  │
│ password    │       │ name        │       │ event_date  │
│ role        │       │ price       │       │ status      │
└─────────────┘       │ ...        │       │ ...         │
                      └─────────────┘       └─────────────┘
                       BelongsTo user       BelongsTo client, service
                       HasMany orders       HasMany (для статистики)
```

**Связи:** User → Services (1:N), User → Orders как client (1:N), Service → Orders (1:N).

**Зачем ER и внешние ключи:** схема явно описывает, «кто кому принадлежит» и что при удалении (например, пользователя) делать с его услугами и заказами. FK в БД гарантируют целостность и не дают «висеть» заказу без услуги или услуге без пользователя.


---

## Слайд 5 — Endpoints Map

### User
- `POST /api/v1/register` — регистрация
- `POST /api/v1/login` — получение токена

### Services
- `GET /api/v1/services` — список (фильтры: category, price)
- `GET /api/v1/services/{id}` — одна услуга
- `POST/PUT/DELETE /api/v1/services` — CRUD (авторизованный исполнитель)

### Orders
- `GET /api/v1/orders` — мои заказы
- `POST /api/v1/orders` — создать заказ (клиент)

```php
// routes/api.php
Route::prefix('v1')->middleware('throttle:60,1')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('services', ServiceController::class)->except(['index', 'show']);
        Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
    });
});
```

**Почему REST:** ресурсы (users, services, orders) отображаются в URL; HTTP-методы (GET/POST/PUT/DELETE) задают действие. Фронт и мобильные клиенты работают по одному контракту, кэширование и прокси понимают GET.


---

# Раздел 2: Инфраструктура и Настройка


---

## Слайд 6 — Инициализация

- Установка: `composer create-project laravel/laravel backend`
- Настройка **.env**: `DB_CONNECTION=pgsql`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Запуск: `php artisan serve`, миграции: `php artisan migrate`

**Зачем .env:** секреты и настройки окружения не попадают в git; на dev/stage/prod — разные файлы. Laravel читает конфиг из .env, в коде используем `config('database.connections.pgsql')`.


---

## Слайд 7 — Миграции

- **services:** id, user_id (FK), category, name, description, price, timestamps
- **orders:** id, client_id (FK → users), service_id (FK → services), event_date, status, timestamps
- Внешние ключи: `$table->foreignId('user_id')->constrained()->cascadeOnDelete();`

```php
// create_services_table.php
Schema::create('services', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('category');
    $table->string('name');
    $table->text('description')->nullable();
    $table->decimal('price', 10, 2);
    $table->timestamps();
});
```

**Что такое миграции и зачем:** это версионирование схемы БД в коде. Каждый файл — один шаг (создание/изменение таблиц). Команда `migrate` применяет только новые миграции. Команда откатывает изменения. В команде все получают одинаковую схему без ручного SQL. `cascadeOnDelete` — при удалении пользователя БД сама удалит его услуги (или можно запретить удаление, если есть заказы).


---

## Слайд 8 — Модели и связи

**User:**
- `hasMany(Service::class)`
- `hasMany(Order::class, 'client_id')`

**Service:**
- `belongsTo(User::class)`
- `hasMany(Order::class)`

**Order:**
- `belongsTo(User::class, 'client_id')`
- `belongsTo(Service::class)`

```php
// User.php
public function services(): HasMany
{
    return $this->hasMany(Service::class);
}
public function orders(): HasMany
{
    return $this->hasMany(Order::class, 'client_id');
}
```

**Зачем связи в Eloquent:** вместо ручных JOIN и разборки массивов пишем `$order->service->name` и `$user->services`. Laravel сам подставляет правильные внешние ключи. Второй аргумент у `hasMany(Order::class, 'client_id')` нужен, потому что ключ не `user_id`, а `client_id` — явно задаём имя FK.


---

## Слайд 9 — Наполнение (Seeding)

- **Factory** для User (роли: customer, performer), Service (категории), Order (статусы)
- В **DatabaseSeeder**: исполнители с услугами, заказчики, тестовые заказы

**Что такое Factory и зачем:** Factory — описание «как сгенерировать одну сущность» (с Faker: имена, цены, даты). Seeder вызывает фабрики и заполняет БД. Зачем: локальная разработка без ручного ввода, одинаковые тестовые данные у всех, автоматические тесты с предсказуемыми данными. Запуск: `php artisan db:seed` (часто после `migrate:fresh --seed`).


---

## Слайд 10 — API-версионирование

- Маршруты в префиксе **v1**: → `/api/v1/services`, `/api/v1/orders`

```php
// routes/api.php (Laravel автоматически добавляет префикс /api)
Route::prefix('v1')->middleware('throttle:60,1')->group(function (): void {
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{service}', [ServiceController::class, 'show']);
    // ...
});
```

**Зачем версионировать API:** контракт с клиентами (фронт, мобильные приложения) со временем меняется: новые поля, другие форматы, смена правил. Если менять один и тот же URL, старые клиенты ломаются. Версия в URL (v1, v2) позволяет: оставить v1 для старых клиентов, ввести v2 с новым контрактом, постепенно мигрировать и потом отключить v1.


---

# Раздел 3: Реализация Core API


---

## Слайд 11 — Resource Controllers

- `php artisan make:controller Api/V1/ServiceController --api` → методы: index, store, show, update, destroy
- **OrderController**: store, index, show (не полный CRUD — заказчик не удаляет заказы через API по ТЗ)

```php
// ServiceController — методы из --api
public function index(Request $request): AnonymousResourceCollection
public function store(StoreServiceRequest $request): JsonResponse
public function show(Service $service): ServiceResource
public function update(UpdateServiceRequest $request, Service $service): ServiceResource
public function destroy(Service $service): JsonResponse
```

**Что такое resource-контроллер и зачем:** один контроллер отвечает за один ресурс (услуга, заказ). Стандартный набор действий CRUD соответствует HTTP-методам и одному маршруту (например, `GET /services` → index, `POST /services` → store). Код остаётся предсказуемым, меньше дублирования, проще тестировать и документировать.


---

## Слайд 12 — Листинг услуг

- Фильтр по категории: `Service::query()->when($request->category, fn($q) => $q->where('category', ...))`
- По цене: `whereBetween('price', [$min, $max])`
- Пагинация: `->paginate(15)`

```php
// ServiceController@index
$query = Service::query()
    ->when($request->filled('category'), fn ($q) => $q->where('category', $request->category))
    ->when($request->filled('price_min'), fn ($q) => $q->where('price', '>=', $request->price_min))
    ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->search.'%'));
$services = $query->paginate(min((int) $request->get('per_page', 15), 50));
```

**Зачем when(), пагинация:** `when()` добавляет условие в запрос только если параметр передан — один экшен и для «все услуги», и для «только категория X». Пагинация ограничивает объём ответа и нагрузку на БД; Laravel отдаёт в JSON мета с `current_page`, `total`, `per_page` — фронт может рисовать постраничную навигацию.


---

## Слайд 13 — Поиск (Search)

- Параметр `?search=...`; в запросе — условие по имени (и при необходимости по description).

```php
// ServiceController@index (фрагмент)
->when($request->filled('search'), fn ($q) =>
    $q->where('name', 'like', '%' . $request->search . '%'))
```

**Почему LIKE и когда чего хватает:** LIKE подходит для простого «содержит подстроку» по имени/описанию. Минусы: не ранжирование, чувствительность к регистру (в PostgreSQL можно `ILIKE`). Для сложного поиска по тексту позже подключают полнотекстовый поиск (PostgreSQL tsvector или Elasticsearch).


---

## Слайд 14 — Создание заказа

- **OrderController@store**: валидация (StoreOrderRequest), создание заказа, возврат 201 + Resource.

```php
// OrderController@store
public function store(StoreOrderRequest $request): JsonResponse
{
    $order = Order::create([
        'client_id' => $request->user()->id,
        'service_id' => $request->validated('service_id'),
        'event_date' => $request->validated('event_date'),
        'status' => Order::STATUS_NEW,
    ]);
    $order->load(['service', 'client']);
    return (new OrderResource($order))->response()->setStatusCode(201);
}
```

**Зачем client_id из auth():** заказчик не должен подставлять в запросе «от чьего имени» заказ — это берётся из токена. Иначе клиент мог бы создавать заказы «от имени» другого пользователя. Идемпотентность и повторные запросы при необходимости обрабатываем отдельно (например, проверка дубликата заказа на ту же дату/услугу).


---

## Слайд 15 — Валидация

- `php artisan make:request StoreOrderRequest`; правила: service_id (exists:services,id), event_date (date, after:today)
- В контроллере: `public function store(StoreOrderRequest $request)` — Laravel сам валидирует до входа в метод.

```php
// StoreOrderRequest.php
public function authorize(): bool
{
    return (bool) $this->user();
}
public function rules(): array
{
    return [
        'service_id' => ['required', 'integer', 'exists:services,id'],
        'event_date' => ['required', 'date', 'after:today'],
    ];
}
```

**Зачем Form Request:** правила валидации выносятся из контроллера в отдельный класс — контроллер не раздувается, правила переиспользуются и легче тестировать. При ошибке Laravel возвращает 422 и JSON с полями ошибок; фронт может показать их у полей формы. `exists:services,id` проверяет, что услуга есть в БД — защита от поддельных id.


---

## Слайд 16 — API Resources (Трансформация)

- **ServiceResource**: скрывать email исполнителя до оплаты/принятия заказа; **OrderResource**: единый формат (id, status, event_date, service, client).
- Условная логика: скрываем email исполнителя, пока запрос не от владельца услуги.

```php
// ServiceResource::toArray()
'performer' => $this->when($request->user()?->id === $this->user_id, fn () => [
    'id' => $this->user->id,
    'name' => $this->user->name,
    'email' => $this->user->email,
]),
```

**Что такое API Resource и зачем:** это слой трансформации модели в JSON. Вместо того чтобы в контроллере собирать массивы вручную, описываем «как модель выглядит в API» в одном месте. Плюсы: не отдаём лишнее (пароли, внутренние id), единый формат для всех эндпоинтов, легко менять контракт (например, скрыть email до оплаты) без правок в десятке мест.


---

## Слайд 17 — Обработка ошибок

- В **Exception Handler** для API-запросов (Accept: application/json или префикс /api) возвращаем JSON.
- 404: `{"message": "Resource not found"}`; 422: `{"errors": {"field": ["..."]}}`; 401/403 — единый стиль.

```php
// bootstrap/app.php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->shouldRenderJsonWhen(function (Request $request, \Throwable $e) {
        return $request->is('api/*') || $request->expectsJson();
    });
})
```

**Зачем единый формат ошибок:** фронт и мобильные приложения обрабатывают ошибки по одному контракту: код ответа + тело с message/errors. Не смешиваем HTML-страницы ошибок Laravel с JSON — проверяем в Handler, что запрос к API, и отдаём только JSON, иначе клиенту сложно парсить ответ.


---

# Раздел 4: Безопасность и Доступ


---

## Слайд 18 — Аутентификация (Sanctum)

- Регистрация/логин: создание User или проверка credentials → выдача токена `$user->createToken('auth')->plainTextToken`.
- Клиент шлёт заголовок: `Authorization: Bearer {token}`.

```php
// AuthController@register (после создания User)
$token = $user->createToken('auth')->plainTextToken;
return response()->json([
    'user' => $user->only(['id', 'name', 'email', 'role']),
    'token' => $token,
    'token_type' => 'Bearer',
], 201);
```

**Что такое Sanctum и зачем:** лёгкая токен-аутентификация для API (SPA, мобильные приложения). Не OAuth2 — просто «логин/пароль → токен», токен хранится на клиенте и передаётся в заголовке. Middleware `auth:sanctum` по токену находит пользователя. Зачем токены: HTTP без состояния; каждый запрос с токеном идентифицирует пользователя без сессий и cookies.


---

## Слайд 19 — Middleware

- На маршруты создания/редактирования заказов и услуг вешаем группу: `Route::middleware('auth:sanctum')->group(...)`.
- Без валидного токена — 401 Unauthorized.

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function (): void {
    Route::apiResource('services', ServiceController::class)->except(['index', 'show']);
    Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
});
```

**Что такое middleware и зачем:** это слой «до контроллера». Запрос сначала проходит через middleware: проверка токена, логирование, смена локали. Если `auth:sanctum` не находит пользователя по токену — запрос дальше не идёт, сразу ответ 401. Так мы не дублируем проверку «залогинен ли пользователь» в каждом методе контроллера.


---

## Слайд 20 — Авторизация (Policies)

- **ServicePolicy**: update/delete только если пользователь — владелец; в контроллере: `$this->authorize('update', $service);` → иначе 403.

```php
// ServicePolicy.php
public function update(User $user, Service $service): bool
{
    return $user->id === $service->user_id;
}
public function delete(User $user, Service $service): bool
{
    return $user->id === $service->user_id;
}
// В контроллере: $this->authorize('delete', $service);
```

**Аутентификация vs авторизация:** аутентификация — «кто ты» (токен → пользователь). Авторизация — «разрешено ли тебе это действие» (может ли этот пользователь редактировать эту услугу). Policy инкапсулирует правило: «редактировать услугу может только её владелец». Вызов `authorize()` в одном месте — код контроллера остаётся простым, правила прав централизованы и тестируемы.


---

## Слайд 21 — Роли

- Поле **role** в users: `customer`, `performer`. Создание услуг — только performer; создание заказов — customer (или оба, по ТЗ).
- Проверка: в Policy или Middleware `abort_if($user->role !== 'performer', 403)`.

**Зачем роли:** разное поведение для разных типов пользователей без смешивания логики. Middleware «только performer» на маршруты создания услуг; заказ заказа может создавать customer (и при необходимости performer). Роли храним в БД (поле role), при росте числа ролей можно перейти на таблицу roles и связь many-to-many.


---

## Слайд 22 — Rate Limiting

- На API: `throttle:60,1` (60 запросов в минуту). На login/register — жёстче: `throttle:5,1`.

```php
// routes/api.php
Route::prefix('v1')->middleware('throttle:60,1')->group(function (): void {
    Route::middleware('throttle:5,1')->group(function (): void {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });
    // остальные маршруты — 60/мин
});
```

**Что такое rate limiting и зачем:** ограничение числа запросов с одного источника за период. Защита: от перебора паролей (brute force), от злоупотребления API одним клиентом, от простых DDoS-сценариев. Laravel считает запросы по ключу (например, по IP или по user id при auth:sanctum) и при превышении лимита возвращает 429 Too Many Requests. Лимиты можно задать в маршрутах или в RateLimiter.


---

# Раздел 5: Продвинутые фичи


---

## Слайд 23 — Загрузка медиа

- **Laravel Storage** (диск local или s3): загрузка файлов портфолио к услуге; в БД — путь или JSON массив путей.
- Эндпоинт: `POST /api/v1/services/{id}/media`, валидация: image, max:5120 (размер в KB).

**Зачем Storage, а не public/uploads:** абстракция над файловой системой — один код для локального диска и для S3. Файлы не кладём в public без контроля: загрузка через контроллер, проверка типа и размера, при необходимости подпись URL с истекающей ссылкой. В продакшене часто используют S3/CDN — меняем только диск в конфиге.


---

## Слайд 24 — Статусная модель заказа

- Статусы: **New** → **Accepted** (исполнитель принял) → **Completed**.
- Смена статуса в контроллере с проверкой допустимых переходов.

**Зачем явная модель состояний:** запрещаем «перепрыгивать» (например, из New сразу в Completed) и неразрешённые действия (клиент не переводит в Accepted). В коде: разрешённые переходы (массив или enum), проверка в методе смены статуса. При необходимости — события при смене (например, уведомление), история статусов в отдельной таблице для аудита.


---

## Слайд 25 — Уведомления

- Событие **OrderCreated** → слушатель или модель вызывает уведомление исполнителю. Каналы: Email (Mailable), Telegram (Bot API / notification driver). Класс: `NewOrderNotification`.

**Зачем события и отдельные уведомления:** контроллер создаёт заказ и не знает, как и кому слать письма/Telegram. Логика «кому что отправить» в Notification; каналы (mail, telegram, sms) добавляются без изменения контроллера. События развязывают «создали заказ» и «отправили уведомление» — проще тестировать и добавлять новые каналы.


---

## Слайд 26 — Тестирование (Feature tests)

- **Pest** или **PHPUnit**: HTTP-тесты к маршрутам API. Примеры: валидный запрос → 201; невалидная дата → 422; без токена → 401.

```php
// tests/Feature/Api/OrderApiTest.php
$this->actingAs($customer, 'sanctum')
    ->postJson('/api/v1/orders', [
        'service_id' => $service->id,
        'event_date' => now()->addWeeks(2)->format('Y-m-d'),
    ])
    ->assertStatus(201)
    ->assertJsonPath('data.status', 'new');
```

**Зачем feature-тесты API:** проверяем сценарий целиком: маршрут + middleware + валидация + контроллер + ответ. При рефакторинге уверены, что контракт API не сломался. Тесты заменяют ручные проверки в Postman и документируют ожидаемое поведение. База в тестах — in-memory SQLite или транзакции с откатом.


---

## Слайд 27 — Документация (Scramble / OpenAPI)

- **Scramble** — автогенерация OpenAPI 3.1 из кода Laravel (без аннотаций): маршруты, Form Request, Resources → актуальная спецификация.
- Маршруты: `GET /docs/api` — UI документации, `GET /docs/api.json` — OpenAPI JSON. По умолчанию доступны в `local`.

```php
// composer require dedoc/scramble
// config/scramble.php: api_path => 'api', info (title, version, description)
// AppServiceProvider: добавить Bearer (Sanctum) в security схемы
Scramble::afterOpenApiGenerated(fn ($openApi) => $openApi->secure(
    SecurityScheme::http('bearer', 'JWT')->as('sanctum')
));
```

**Зачем живая документация:** фронт и мобильные разработчики видят эндпоинты, параметры, схемы запросов/ответов. Генерация из кода — документация не устаревает. OpenAPI — автогенерация клиентов, контрактное тестирование.


---

# Раздел 6: Итоги и Деплой


---

## Слайд 28 — Оптимизация

- **Eager Loading**: в листинге заказов — `with(['service', 'client'])`, чтобы избежать N+1 запросов.
- Индексы БД по полям фильтрации и сортировки: category, price, event_date, status.
- Кэширование: редко меняющиеся данные (категории, счётчики) — по необходимости.

```php
// OrderController@index
$orders = Order::query()
    ->where('client_id', auth()->id())
    ->with(['service', 'client'])
    ->latest()
    ->paginate(15);
```

**Что такое N+1 и зачем with():** при выводе 20 заказов с именами услуг без `with()` Laravel сделает 1 запрос за заказы и 20 за услуги — всего 21. С `with('service')` — два запроса (заказы + все нужные услуги одним запросом). Индексы ускоряют WHERE и ORDER BY; кэш снижает нагрузку на БД для справочников.


---

## Слайд 29 — Deployment

- **Docker**: образ приложения (PHP-FPM + Nginx), контейнер БД (PostgreSQL), при необходимости — воркеры очередей.
- **CI/CD**: на push — тесты, линтеры; успешный пайплайн → деплой на staging/production.
- Перед продакшеном: `php artisan config:cache`, `route:cache`, `view:cache` — меньше обращений к диску.

**Зачем кэши конфига и маршрутов:** в продакшене конфиг и список маршрутов не меняются при каждом запросе. Без кэша Laravel каждый раз читает файлы; с кэшем — один раз при деплое. Очереди выносят тяжёлые задачи (почта, уведомления) из HTTP-запроса — ответ быстрее, фоновая работа идёт в воркерах.


---

## Слайд 30 — Заключение

- Реализовано: REST API биржи event-услуг — каталог, заказы, аутентификация, роли, уведомления, тесты и документация.
- Стек: Laravel 11, PostgreSQL, Sanctum; версионирование API, валидация, Resources, Policies, оптимизация и деплой.

**Итог:** от постановки задачи и схемы БД до безопасного API с понятным контрактом и возможностью масштабирования (очереди, кэш, индексы). Дальше — **QA**, контакты и репозиторий.

**Спасибо за внимание!**
