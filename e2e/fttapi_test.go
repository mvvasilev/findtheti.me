package e2e

import (
	"findthetime/internal/http/handlers"
	"findthetime/internal/http/httputils"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"resty.dev/v3"
)

func NewHttpClient(t testing.TB) *resty.Client {
	t.Helper()

	baseUrl, ok := os.LookupEnv("E2E_FTT_API_BASE_URL")

	if !ok {
		t.Skip("E2E_FTT_API_BASE_URL is not set")
	}

	c := resty.New()
	c.SetBaseURL(baseUrl)

	return c
}

func TestCreateAndFetchEvent_SpecificDate(t *testing.T) {
	c := NewHttpClient(t)

	resp, err := c.R().
		SetBody(`{
			"name": "Test",
			"description": null,
			"event_type": "SpecificDate",
			"from_date": "2020-10-10T12:13:14Z",
			"duration": 30
		}`).
		SetResult(httputils.UniversalResponseDto[*handlers.EventDto]{}).
		Post("/api/events")

	response := resp.Result().(*httputils.UniversalResponseDto[*handlers.EventDto])

	assert.Empty(t, err)
	assert.Less(t, resp.StatusCode(), 300)
	assert.GreaterOrEqual(t, resp.StatusCode(), 200)
	assert.NotEmpty(t, response.Result)
	assert.Equal(t, "Test", response.Result.Name)
	assert.Empty(t, response.Result.Description)
	assert.Equal(t, "SpecificDate", response.Result.EventType)
	assert.NotEmpty(t, response.Result.SnowflakeId)
	assert.Equal(t, "2020-10-10T12:13:14Z", response.Result.FromDate.Format(time.RFC3339))

	resp, err = c.R().
		SetResult(httputils.UniversalResponseDto[*handlers.EventDto]{}).
		Get("/api/events/" + response.Result.SnowflakeId)

	getResponse := resp.Result().(*httputils.UniversalResponseDto[*handlers.EventDto])

	assert.Empty(t, err)
	assert.Less(t, resp.StatusCode(), 300)
	assert.GreaterOrEqual(t, resp.StatusCode(), 200)
	assert.NotEmpty(t, getResponse.Result)
	assert.Equal(t, "Test", getResponse.Result.Name)
	assert.Empty(t, getResponse.Result.Description)
	assert.Equal(t, "SpecificDate", getResponse.Result.EventType)
	assert.NotEmpty(t, getResponse.Result.SnowflakeId)
	assert.Equal(t, "2020-10-10T12:13:14Z", getResponse.Result.FromDate.Format(time.RFC3339))
}

func TestCreateAndFetchAvailabilities(t *testing.T) {
	c := NewHttpClient(t)

	createEventResp, err := c.R().
		SetBody(`{
			"name": "Availability test",
			"description": null,
			"event_type": "SpecificDate",
			"from_date": "2020-10-10T12:13:14Z",
			"duration": 30
		}`).
		SetResult(httputils.UniversalResponseDto[*handlers.EventDto]{}).
		Post("/api/events")

	eventResponse := createEventResp.Result().(*httputils.UniversalResponseDto[*handlers.EventDto])

	assert.NoError(t, err)
	assert.Less(t, createEventResp.StatusCode(), 300)
	assert.NotNil(t, eventResponse.Result)

	resp, err := c.R().
		SetBody(`{
			"user_name": "Alice",
			"user_email": "alice@example.com",
			"availabilities": [
				{
					"from_date": "2020-10-10T12:00:00Z",
					"to_date": "2020-10-10T13:00:00Z"
				},
				{
					"from_date": "2020-10-10T14:00:00Z",
					"to_date": "2020-10-10T15:00:00Z"
				}
			]
		}`).
		SetHeader("X-Real-IP", "203.0.113.10").
		SetResult(httputils.UniversalResponseDto[*struct{}]{}).
		Post("/api/events/" + eventResponse.Result.SnowflakeId + "/availabilities")

	createAvailabilityResponse := resp.Result().(*httputils.UniversalResponseDto[*struct{}])

	assert.NoError(t, err)
	assert.GreaterOrEqual(t, resp.StatusCode(), 200)
	assert.Less(t, resp.StatusCode(), 300)
	assert.NotNil(t, createAvailabilityResponse.Result)

	resp, err = c.R().
		SetResult(httputils.UniversalResponseDto[*[]handlers.AvailabilityDto]{}).
		Get("/api/events/" + eventResponse.Result.SnowflakeId + "/availabilities")

	getResponse := resp.Result().(*httputils.UniversalResponseDto[*[]handlers.AvailabilityDto])

	assert.NoError(t, err)
	assert.GreaterOrEqual(t, resp.StatusCode(), 200)
	assert.Less(t, resp.StatusCode(), 300)
	if assert.NotNil(t, getResponse.Result) {
		assert.Len(t, *getResponse.Result, 2)
		assert.Equal(t, "Alice", (*getResponse.Result)[0].UserName)
		assert.Equal(t, "2020-10-10T12:00:00Z", (*getResponse.Result)[0].FromDate.Format(time.RFC3339))
		assert.Equal(t, "2020-10-10T13:00:00Z", (*getResponse.Result)[0].ToDate.Format(time.RFC3339))
		assert.Equal(t, "Alice", (*getResponse.Result)[1].UserName)
		assert.Equal(t, "2020-10-10T14:00:00Z", (*getResponse.Result)[1].FromDate.Format(time.RFC3339))
		assert.Equal(t, "2020-10-10T15:00:00Z", (*getResponse.Result)[1].ToDate.Format(time.RFC3339))
	}
}
