package availability

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestRepositoryCreate_RequiresTransaction(t *testing.T) {
	repo := NewRepository()
	availability := &Availability{
		EventId:   1,
		FromDate:  time.Date(2026, 3, 12, 9, 0, 0, 0, time.UTC),
		ToDate:    time.Date(2026, 3, 12, 10, 0, 0, 0, time.UTC),
		UserIp:    "203.0.113.10",
		UserName:  "Alice",
		UserEmail: nil,
	}

	got, err := repo.Create(context.Background(), availability)

	assert.Same(t, availability, got)
	assert.EqualError(t, err, "No transaction to be found in context")
}

func TestRepositoryFindByEventId_RequiresTransaction(t *testing.T) {
	repo := NewRepository()

	got, err := repo.FindByEventId(context.Background(), 1)

	assert.Nil(t, got)
	assert.EqualError(t, err, "No transaction to be found in context")
}

func TestRepositoryFindByEventSnowflakeId_RequiresTransaction(t *testing.T) {
	repo := NewRepository()

	got, err := repo.FindByEventSnowflakeId(context.Background(), "event123")

	assert.Nil(t, got)
	assert.EqualError(t, err, "No transaction to be found in context")
}

func TestRepositoryFindAlreadySubmittedForEvent_RequiresTransaction(t *testing.T) {
	repo := NewRepository()

	submitted, err := repo.FindAlreadySubmittedForEvent(context.Background(), 1, "Alice", nil, "203.0.113.10")

	assert.False(t, submitted)
	assert.EqualError(t, err, "No transaction to be found in context")
}

func TestRepositoryFindEventBySnowflakeId_RequiresTransaction(t *testing.T) {
	repo := NewRepository()

	found, err := repo.FindEventBySnowflakeId(context.Background(), "event123")

	assert.Nil(t, found)
	assert.EqualError(t, err, "No transaction to be found in context")
}
