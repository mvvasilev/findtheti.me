package handlers

import (
	"findthetime/internal/domain/errors"
	"findthetime/internal/domain/event"
	"findthetime/internal/http/httputils"
	"net/http"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateEventDto struct {
	FromDate    *time.Time `json:"from_date"`
	ToDate      *time.Time `json:"to_date"`
	Name        string     `json:"name" binding:"required"`
	Description *string    `json:"description"`
	EventType   string     `json:"event_type" binding:"required"`
	Duration    int        `json:"duration" binding:"gte=30,lte=480"`
}

type EventDto struct {
	SnowflakeId string     `json:"snowflake_id"`
	FromDate    *time.Time `json:"from_date"`
	ToDate      *time.Time `json:"to_date"`
	Name        string     `json:"name"`
	Description *string    `json:"description"`
	EventType   string     `json:"event_type"`
	Duration    int        `json:"duration"`
}

type EventController struct {
	service *event.Service
}

func NewEventController(service *event.Service) *EventController {
	return &EventController{service}
}

func (ec *EventController) CreateEvent(c *gin.Context) {
	dto, err := httputils.DeserializeBodyOrErrorBadRequest(c, &CreateEventDto{})

	if err != nil {
		return
	}

	result, err := ec.service.CreateEvent(
		c.Request.Context(),
		&event.CreateEventCommand{
			Name:        dto.Name,
			Description: dto.Description,
			FromDate:    dto.FromDate,
			ToDate:      dto.ToDate,
			EventType:   dto.EventType,
			Duration:    dto.Duration,
		},
	)

	if err != nil {
		httputils.SetErrorAndAbort(c, http.StatusUnprocessableEntity, err)
		return
	}

	httputils.OK(c, &EventDto{
		SnowflakeId: result.SnowflakeId,
		Name:        result.Name,
		Description: result.Description,
		FromDate:    result.FromDate,
		ToDate:      result.ToDate,
		EventType:   result.EventType.Name(),
		Duration:    result.Duration,
	})
}

func (ec *EventController) FetchEvent(c *gin.Context) {
	eventId := c.Param("event_id")

	if eventId == "" {
		httputils.SetErrorAndAbort(c, http.StatusBadRequest, errors.New("Missing event_id"))
		return
	}

	if matched, _ := regexp.MatchString("^[a-zA-Z0-9]+$", eventId); !matched {
		httputils.SetErrorAndAbort(c, http.StatusBadRequest, errors.New("Invalid event_id"))
		return
	}

	result, err := ec.service.FindEventBySnowflakeId(c.Request.Context(), eventId)

	if err != nil {
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	httputils.OK(c, &EventDto{
		SnowflakeId: result.SnowflakeId,
		Name:        result.Name,
		Description: result.Description,
		FromDate:    result.FromDate,
		ToDate:      result.ToDate,
		EventType:   result.EventType.Name(),
		Duration:    result.Duration,
	})
}
