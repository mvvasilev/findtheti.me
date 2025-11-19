package main

import (
	"findthetime/internal/server"
	"log"
	"os"
)

func main() {
	port, ok := os.LookupEnv("FTT_API_PORT")

	if !ok {
		log.Panicln("Must provide FTT_API_PORT")
	}

	url, ok := os.LookupEnv("FTT_API_DB_URL")

	if !ok {
		log.Panicln("Must provide FTT_API_DB_URL")
	}

	migrationLoc, ok := os.LookupEnv("FTT_API_SQL_MIGRATIONS_LOCATION")

	if !ok {
		log.Panicln("Must provide FTT_API_SQL_MIGRATIONS_LOCATION")
	}

	server.StartFindTheTimeApiServer(port, url, migrationLoc)
}
