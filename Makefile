.PHONY: help
help:
	@echo "Available targets:"
	@echo "  help             - Display this help message"
	@echo "  build            - Build fttapi"
	@echo "  migration name=? - Create new db migration ( provide name )"

.PHONY: build
build:
	rm -rf target
	mkdir -p target
	go build -v -o ./target ./...

.PHONY: migration
migration:
	migrate create -ext sql -dir migrations $(name)

docker:
	docker build -t fttapi .

docker-compose:
	docker-compose up -e PG_PASS=findthetime -e PG_DB=findthetime -e PG_USER=findthetime 