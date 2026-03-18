package handlers

import (
	"errors"
	"net/http"
	"regexp"
	"time"

	domain "findthetime/internal/domain/availability"
	errs "findthetime/internal/domain/errors"
	"findthetime/internal/http/httputils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateAvailabilitiesDto struct {
	Availabilities []CreateAvailabilityDto `json:"availabilities" binding:"required,min=1"`
	UserEmail      *string                 `json:"user_email"`
	UserName       string                  `json:"user_name" binding:"required"`
}

type CreateAvailabilityDto struct {
	FromDate time.Time `json:"from_date" binding:"required"`
	ToDate   time.Time `json:"to_date" binding:"required"`
}

type AvailabilityDto struct {
	ID       uint      `json:"id"`
	FromDate time.Time `json:"from_date"`
	ToDate   time.Time `json:"to_date"`
	UserName string    `json:"user_name"`
}

type AvailabilityController struct {
	service *domain.Service
}

func NewAvailabilityController(service *domain.Service) *AvailabilityController {
	return &AvailabilityController{service: service}
}

func (ac *AvailabilityController) CreateAvailability(c *gin.Context) {
	eventId := c.Param("event_id")

	if !validEventId(eventId) {
		httputils.SetErrorAndAbort(c, http.StatusBadRequest, errs.New("Invalid event_id"))
		return
	}

	dto, err := httputils.DeserializeBodyOrErrorBadRequest(c, &CreateAvailabilitiesDto{})

	if err != nil {
		return
	}

	periods := make([]domain.CreateAvailabilityPeriod, 0, len(dto.Availabilities))

	for _, availability := range dto.Availabilities {
		periods = append(periods, domain.CreateAvailabilityPeriod{
			FromDate: availability.FromDate,
			ToDate:   availability.ToDate,
		})
	}

	err = ac.service.CreateAvailability(c.Request.Context(), &domain.CreateAvailabilityCommand{
		EventSnowflakeId: eventId,
		Availabilities:   periods,
		UserEmail:        dto.UserEmail,
		UserName:         dto.UserName,
		UserIP:           clientIP(c),
	})

	if err != nil {
		status := http.StatusUnprocessableEntity

		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		}

		httputils.SetErrorAndAbort(c, status, err)
		return
	}

	httputils.OK(c, &struct{}{})
}

func (ac *AvailabilityController) FetchAvailabilities(c *gin.Context) {
	eventId := c.Param("event_id")

	if !validEventId(eventId) {
		httputils.SetErrorAndAbort(c, http.StatusBadRequest, errs.New("Invalid event_id"))
		return
	}

	result, err := ac.service.FindByEventSnowflakeId(c.Request.Context(), eventId)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		}

		httputils.SetErrorAndAbort(c, status, err)
		return
	}

	dtos := make([]AvailabilityDto, 0, len(result))

	for _, availability := range result {
		dtos = append(dtos, AvailabilityDto{
			ID:       availability.ID,
			FromDate: availability.FromDate,
			ToDate:   availability.ToDate,
			UserName: availability.UserName,
		})
	}

	httputils.OK(c, &dtos)
}

func validEventId(eventId string) bool {
	if eventId == "" {
		return false
	}

	matched, _ := regexp.MatchString("^[a-zA-Z0-9]+$", eventId)
	return matched
}

func clientIP(c *gin.Context) string {
	if ip := c.GetHeader("X-Real-IP"); ip != "" {
		return ip
	}

	return c.Request.RemoteAddr
}
