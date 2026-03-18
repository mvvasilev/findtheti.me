.PHONY: help
help:
	@echo "Available targets:"
	@echo "  help             - Display this help message"
	@echo "  build            - Build fttapi"
	@echo "  test             - Run all non-e2e tests"
	@echo "  migration name=? - Create new db migration ( provide name )"
	@echo "  docker           - Build the fttapi Dockerfile"
	@echo "  docker-compose   - Start fttapi and dependencies via docker-compose"

include .env
export

.PHONY: build
build:
	rm -rf target
	mkdir -p target
	go build -v -o ./target ./...

.PHONY: frontend-dev
frontend-dev:
	cd frontend && npm run dev

.PHONY: frontend
frontend:
	cd frontend && npm run build

.PHONY: migration
migration:
	migrate create -ext sql -dir migrations $(name)

.PHONY: e2e
e2e:
	go test ./e2e

.PHONY: test
test:
	go test ./internal/...

.PHONY: docker
docker:
	docker build -t fttapi .

.PHONY: docker-compose
docker-compose:
	docker compose up --build