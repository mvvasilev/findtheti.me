FROM node:22-bookworm-slim AS frontend-builder

WORKDIR /fttapi/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM golang:1.25 AS backend-builder

WORKDIR /fttapi

COPY go.mod go.sum ./
RUN go mod download

COPY cmd ./cmd
COPY internal ./internal
COPY migrations ./migrations
COPY --from=frontend-builder /fttapi/frontend/dist ./frontend/dist

RUN mkdir -p target
RUN go build -v -o ./target/fttapi-svc ./cmd/fttapi-svc

FROM debian:bookworm-slim

ENV FTT_API_PORT=":8000"
ENV FTT_API_SQL_MIGRATIONS_LOCATION="file://migrations"
ENV GIN_MODE=release

WORKDIR /fttapi

COPY --from=backend-builder /fttapi/target/fttapi-svc ./target/fttapi-svc
COPY --from=backend-builder /fttapi/frontend/dist ./frontend/dist
COPY --from=backend-builder /fttapi/migrations ./migrations

CMD ["./target/fttapi-svc"]

EXPOSE 8000
