# Proxy Service (API Gateway)

Единая точка входа CinemaAbyss. Реализует паттерн Strangler Fig: маршрутизирует запросы
между монолитом и микросервисами, позволяя переключать трафик домена movies без остановки системы.

Стек: TypeScript, Node.js 22, NestJS 11, `http-proxy-middleware`.

## Маршрутизация

| Путь | Получатель |
|---|---|
| `GET /health` | обрабатывается самим прокси (`text/plain`) |
| `/api/events/**` | events-service |
| `/api/movies/health` | movies-service (в монолите этого эндпоинта нет) |
| `/api/movies**` | monolith или movies-service по правилу миграции |
| `/api/users`, `/api/payments`, `/api/subscriptions`, прочее `/api/**` | monolith |

Правило миграции для домена movies:

- `GRADUAL_MIGRATION=true` — в movies-service уходит `MOVIES_MIGRATION_PERCENT` процентов запросов,
  остальные обслуживает монолит;
- `GRADUAL_MIGRATION=false` — весь трафик домена уходит в movies-service (миграция завершена).

Если апстрим недоступен, прокси отвечает `502` с JSON-телом `{ "status": false, "error": "Bad Gateway", ... }`.

## Переменные окружения

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `PORT` | `8000` | порт прокси |
| `MONOLITH_URL` | `http://monolith:8080` | адрес монолита |
| `MOVIES_SERVICE_URL` | `http://movies-service:8081` | адрес movies-service |
| `EVENTS_SERVICE_URL` | `http://events-service:8082` | адрес events-service |
| `GRADUAL_MIGRATION` | `true` | режим постепенной миграции |
| `MOVIES_MIGRATION_PERCENT` | `0` | процент трафика movies в микросервис (0..100) |

## Запуск

```bash
npm ci
npm run build
npm run start:prod
```

Через docker-compose из корня репозитория:

```bash
docker-compose up -d proxy-service
curl http://localhost:8000/api/movies
```