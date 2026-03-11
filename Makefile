.PHONY: help
help:
	@echo "Available targets:"
	@echo "  help             - Display this help message"
	@echo "  build            - Build fttapi"
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

.PHONY: migration
migration:
	migrate create -ext sql -dir migrations $(name)

.PHONY: e2e
e2e:
	go test ./e2e

.PHONY: docker
docker:
	docker build -t fttapi .

.PHONY: docker-compose
docker-compose:
	docker compose up