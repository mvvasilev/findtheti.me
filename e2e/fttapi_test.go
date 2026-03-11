package e2e

import (
	"findthetime/internal/http/handlers"
	"findthetime/internal/http/httputils"
	"log"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"resty.dev/v3"
)

func NewHttpClient() *resty.Client {
	baseUrl, ok := os.LookupEnv("E2E_FTT_API_BASE_URL")

	if !ok {
		log.Fatalf("Must provide E2E_FTT_API_BASE_URL")
	}

	c := resty.New()
	c.SetBaseURL(baseUrl)

	return c
}

func TestCreateAndFetchEvent_SpecificDate(t *testing.T) {
	c := NewHttpClient()

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

	log.Printf("Response: %v\n", resp)

	response := resp.Result().(*httputils.UniversalResponseDto[*handlers.EventDto])

	log.Printf("Response: %v\n", response)

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
