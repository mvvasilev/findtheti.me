package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"findthetime/internal/http/httputils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestValidEventId(t *testing.T) {
	assert.True(t, validEventId("abc123XYZ"))
	assert.False(t, validEventId(""))
	assert.False(t, validEventId("abc-123"))
	assert.False(t, validEventId("abc 123"))
}

func TestClientIP(t *testing.T) {
	t.Run("prefers X-Real-IP", func(t *testing.T) {
		c, _ := gin.CreateTestContext(httptest.NewRecorder())
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("X-Real-IP", "198.51.100.5")
		req.RemoteAddr = "203.0.113.10:4321"
		c.Request = req

		assert.Equal(t, "198.51.100.5", clientIP(c))
	})

	t.Run("falls back to remote addr", func(t *testing.T) {
		c, _ := gin.CreateTestContext(httptest.NewRecorder())
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = "203.0.113.10:4321"
		c.Request = req

		assert.Equal(t, "203.0.113.10:4321", clientIP(c))
	})
}

func TestCreateAvailability_InvalidEventId(t *testing.T) {
	gin.SetMode(gin.TestMode)

	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Params = gin.Params{{Key: "event_id", Value: "invalid-id"}}
	c.Request = httptest.NewRequest(http.MethodPost, "/api/events/invalid-id/availabilities", nil)

	NewAvailabilityController(nil).CreateAvailability(c)

	assert.Equal(t, http.StatusBadRequest, recorder.Code)

	var response httputils.UniversalResponseDto[any]
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Invalid event_id", response.Error.Message)
}

func TestFetchAvailability_InvalidEventId(t *testing.T) {
	gin.SetMode(gin.TestMode)

	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Params = gin.Params{{Key: "event_id", Value: "invalid-id"}}
	c.Request = httptest.NewRequest(http.MethodGet, "/api/events/invalid-id/availabilities", nil)

	NewAvailabilityController(nil).FetchAvailabilities(c)

	assert.Equal(t, http.StatusBadRequest, recorder.Code)

	var response httputils.UniversalResponseDto[any]
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Invalid event_id", response.Error.Message)
}
