package availability

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateAvailabilities_RejectsBlankUserName(t *testing.T) {
	service := NewService(NewRepository())

	err := service.CreateAvailability(context.Background(), &CreateAvailabilityCommand{
		EventSnowflakeId: "event123",
		Availabilities: []CreateAvailabilityPeriod{{
			FromDate: time.Now(),
			ToDate:   time.Now().Add(time.Hour),
		}},
		UserName: "   ",
	})

	assert.EqualError(t, err, "Missing user_name")
}

func TestCreateAvailabilities_RejectsMissingAvailabilities(t *testing.T) {
	service := NewService(NewRepository())

	err := service.CreateAvailability(context.Background(), &CreateAvailabilityCommand{
		EventSnowflakeId: "event123",
		UserName:         "Alice",
	})

	assert.EqualError(t, err, "Must provide at least one availability")
}

func TestCreateAvailabilities_RequiresTransactionAfterValidation(t *testing.T) {
	service := NewService(NewRepository())

	err := service.CreateAvailability(context.Background(), &CreateAvailabilityCommand{
		EventSnowflakeId: "event123",
		Availabilities: []CreateAvailabilityPeriod{{
			FromDate: time.Date(2026, 3, 12, 9, 0, 0, 0, time.UTC),
			ToDate:   time.Date(2026, 3, 12, 10, 0, 0, 0, time.UTC),
		}},
		UserName: "Alice",
	})

	assert.EqualError(t, err, "No transaction to be found in context")
}

func TestFindByEventSnowflakeId_RequiresTransaction(t *testing.T) {
	service := NewService(NewRepository())

	result, err := service.FindByEventSnowflakeId(context.Background(), "event123")

	assert.Nil(t, result)
	assert.EqualError(t, err, "No transaction to be found in context")
}

func TestNormalizeEmail(t *testing.T) {
	t.Run("nil remains nil", func(t *testing.T) {
		assert.Nil(t, normalizeEmail(nil))
	})

	t.Run("blank becomes nil", func(t *testing.T) {
		value := "   "
		assert.Nil(t, normalizeEmail(&value))
	})

	t.Run("trims whitespace", func(t *testing.T) {
		value := "  alice@example.com  "
		got := normalizeEmail(&value)

		if assert.NotNil(t, got) {
			assert.Equal(t, "alice@example.com", *got)
		}
	})
}

func TestNormalizeIP(t *testing.T) {
	assert.Equal(t, "", normalizeIP("   "))
	assert.Equal(t, "203.0.113.10", normalizeIP("203.0.113.10"))
	assert.Equal(t, "203.0.113.10", normalizeIP("203.0.113.10:443"))
	assert.Equal(t, "2001:db8::1", normalizeIP("[2001:db8::1]:443"))
}
