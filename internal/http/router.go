package http

import (
	"findthetime/internal/http/handlers"

	"github.com/gin-gonic/gin"
)

func CreateHttpApiRouter(
	eventController *handlers.EventController,
	availabilityController *handlers.AvailabilityController,
	gormMiddleware gin.HandlerFunc,
	errorHandlingMiddleware gin.HandlerFunc,
) *gin.Engine {
	r := gin.Default()
	r.SetTrustedProxies(nil)

	r.Use(errorHandlingMiddleware, gormMiddleware)

	r.Static("/assets", "./frontend/dist/assets")
	r.StaticFile("/", "./frontend/dist/index.html")
	r.StaticFile("/index.html", "./frontend/dist/index.html")

	// Event routes
	r.GET("/api/events/:event_id", eventController.FetchEvent)
	r.POST("/api/events", eventController.CreateEvent)

	// Availability routes
	r.GET("/api/events/:event_id/availabilities", availabilityController.FetchAvailability)
	r.POST("/api/events/:event_id/availabilities", availabilityController.CreateAvailability)

	return r
}
