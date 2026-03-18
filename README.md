![Project screenshot](project-image.png)

https://findtheti.me is a scheduling assistant with a Go API, a React/Vite frontend, and a PostgreSQL database.

## Stack

- Go 1.25
- Gin
- GORM
- PostgreSQL
- React 18
- Vite
- Docker / Docker Compose

## Features

- Create scheduling events with several event types
- Submit participant availability windows for an event
- Fetch events and their submitted availability
- Run database migrations automatically on API startup

## Configuration

The API expects these environment variables:

| Variable | Required | Description |
| --- | --- | --- |
| `FTT_API_PORT` | Yes | Port for the application to use, for example `:8080` |
| `FTT_API_DB_URL` | Yes | PostgreSQL connection string |
| `FTT_API_SQL_MIGRATIONS_LOCATION` | Yes | Migration source, usually `file://migrations` |
| `GIN_MODE` | No | Gin mode, typically `debug` or `release` |
| `E2E_FTT_API_BASE_URL` | No | Base URL used by the e2e test suite |
| `PG_USER` | No | Used by `compose.yml` for local PostgreSQL setup |
| `PG_PASS` | No | Used by `compose.yml` for local PostgreSQL setup |
| `PG_DB` | No | Used by `compose.yml` for local PostgreSQL setup |

See [.env.example](/home/mvv/Workspace/findtheti.me/.env.example) for a working local example.

## Run With Docker Compose

The quickest local setup is Docker Compose:

```sh
make docker-compose
```

`compose.yml` reads values from `.env`, so copy [.env.example](/home/mvv/Workspace/findtheti.me/.env.example) to `.env` first and adjust credentials.

## Run Locally

### Backend

1. Create a PostgreSQL database.
2. Create a `.env` file in the project root based on [.env.example](/home/mvv/Workspace/findtheti.me/.env.example).
3. Ensure `FTT_API_DB_URL` points to the database.
4. Run the API:

```sh
go run ./cmd/fttapi-svc
```

On startup the service opens the database connection, applies migrations from `migrations/`, and serves:

- `POST /api/events`
- `GET /api/events/:event_id`
- `POST /api/events/:event_id/availabilities`
- `GET /api/events/:event_id/availabilities`

### Frontend

In a second terminal:

```sh
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8080` by default. If you change the backend port, update [frontend/vite.config.ts](/home/mvv/Workspace/findtheti.me/frontend/vite.config.ts).

## Build

### Production Docker image

```sh
make docker
```

### GitHub Container Registry

The repository includes a GitHub Actions workflow at [.github/workflows/docker-publish.yml](/home/mvv/Workspace/findtheti.me/.github/workflows/docker-publish.yml) that builds the top-level `Dockerfile`.

### Local binaries and frontend bundle

```sh
make build
make frontend
```

Build outputs are written to `target/` and `frontend/dist/`.

## Tests

Run unit and integration-style tests in `internal/`:

```sh
make test
```

Run end-to-end tests against a running instance:

```sh
make e2e
```

`make e2e` requires `E2E_FTT_API_BASE_URL` to point to a live server.ss
