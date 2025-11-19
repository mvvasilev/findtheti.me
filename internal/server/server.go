package server

import (
	"log"

	"findthetime/internal/domain/event"
	"findthetime/internal/http"
	"findthetime/internal/http/handlers"
	"findthetime/internal/http/middleware"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func StartFindTheTimeApiServer(port string, postgresUrl string, migrationsLoc string) {
	db, err := gorm.Open(postgres.Open(postgresUrl))

	if err != nil {
		log.Panicf("Unable to create DB session: %v", err)
	}

	migration, err := migrate.New(
		migrationsLoc,
		postgresUrl,
	)

	if err != nil {
		log.Panicf("Unable to begin database migration: %v", err)
	}

	err = migration.Up()

	if err != nil && err != migrate.ErrNoChange {
		log.Panicf("Error during database migration: %v", err)
	}

	http.CreateHttpApiRouter(
		handlers.NewEventController(
			event.NewService(event.NewRepository()),
		),
		handlers.NewAvailabilityController(),
		middleware.NewGORMMiddleware(db),
		middleware.NewUniversalDtoMiddleware(),
	).Run(port)
}
