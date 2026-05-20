# MEC Store

A full-stack MEC (My Equipment Closet) store with:

- **FastAPI** backend (`./api`) — items, users, sessions, cart
- **React + Material UI** frontend (`./app`) — MEC-styled
- **PostgreSQL** — items and images stored in the database
- **Docker Compose** — fully containerized

## Quick Start

```bash
# Start all services
docker compose up --build

# In a separate terminal, seed the database (runs once)
docker compose --profile seed run --rm seed
```

Services:
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

## Development

### API only (with local postgres)

```bash
cd api
pip install -r requirements.txt
DATABASE_URL=postgresql://mec:mec@localhost:5432/mec uvicorn main:app --reload
```

### Frontend only

```bash
cd app
npm install
npm run dev
```

## Seeding

The seed script loads items from the [`joram/items`](https://github.com/joram/items) Python package.
It downloads and stores item images as binary blobs in PostgreSQL.

```bash
docker compose --profile seed run --rm seed
```

This only seeds once — if items already exist in the DB it exits immediately.

## API Endpoints

### Items
- `GET /items` — paginated list (supports `?category=`, `?page=`, `?page_size=`)
- `GET /items/search?q=` — full-text search
- `GET /items/categories` — all available categories
- `GET /items/{id}` — item detail
- `GET /items/{id}/images/{image_id}` — serve stored image

### Auth
- `POST /auth/register` — create account
- `POST /auth/login` — get JWT token
- `GET /auth/me` — current user

### Cart (requires auth)
- `GET /cart` — view cart
- `POST /cart` — add item
- `PATCH /cart/{cart_item_id}` — update quantity
- `DELETE /cart/{cart_item_id}` — remove item
- `DELETE /cart` — clear cart
