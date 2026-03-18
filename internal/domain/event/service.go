package event

import (
	"context"
	"findthetime/internal/domain/errors"
	"os"
	"strconv"
	"sync/atomic"
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(eventRepo *Repository) *Service {
	return &Service{
		eventRepo,
	}
}

type CreateEventCommand struct {
	FromDate    *time.Time
	ToDate      *time.Time
	Name        string
	Description *string
	EventType   string
	Duration    int
}

func (s *Service) CreateEvent(ctx context.Context, cmd *CreateEventCommand) (event *Event, err error) {
	eventType, ok := EventTypeFromName(cmd.EventType)

	if !ok {
		err = errors.Newf("Invalid event type '%s'", cmd.EventType)
		return
	}

	if eventType == SpecificDate && cmd.FromDate == nil {
		err = errors.New("SpecificDate event type supplied, but missing FromDate")
		return
	}

	if eventType == DateRange {
		if cmd.FromDate == nil || cmd.ToDate == nil {
			err = errors.New("DateRange event type supplied, but missing either FromDate or ToDate")
			return
		}

		if !cmd.FromDate.Before(*cmd.ToDate) {
			err = errors.New("Supplied FromDate is later than or equal to ToDate")
			return
		}

		if cmd.ToDate.Sub(*cmd.FromDate).Hours() < 1*24 {
			err = errors.New("Supplied ToDate is less than 1 day away from the FromDate")
			return
		}

		if cmd.ToDate.Sub(*cmd.FromDate).Hours() > 14*24 {
			err = errors.New("Supplied ToDate is more than 14 days away from the FromDate")
			return
		}
	}

	return s.repo.Create(ctx, &Event{
		SnowflakeId: generateSnowflakeId(),
		Name:        cmd.Name,
		Description: cmd.Description,
		FromDate:    cmd.FromDate,
		ToDate:      cmd.ToDate,
		EventType:   eventType,
		Duration:    cmd.Duration,
	})
}

func (s *Service) FindEventBySnowflakeId(ctx context.Context, eventId string) (*Event, error) {
	return s.repo.FindBySnowflakeId(ctx, eventId)
}

const snowflakeEpoch int64 = 1704067200000

var (
	snowflakeState  atomic.Uint64
	snowflakeNodeID = uint64(os.Getpid()) & 0x3ff
)

func generateSnowflakeId() string {
	for {
		now := uint64(time.Now().UnixMilli() - snowflakeEpoch)
		current := snowflakeState.Load()
		lastTimestamp := current >> 12
		sequence := current & 0xfff

		switch {
		case now < lastTimestamp:
			now = lastTimestamp
			sequence++
		case now == lastTimestamp:
			sequence++
		default:
			sequence = 0
		}

		if sequence > 0xfff {
			for now <= lastTimestamp {
				now = uint64(time.Now().UnixMilli() - snowflakeEpoch)
			}
			sequence = 0
		}

		next := (now << 12) | sequence
		if snowflakeState.CompareAndSwap(current, next) {
			id := (now << 22) | (snowflakeNodeID << 12) | sequence
			return strconv.FormatUint(id, 10)
		}
	}
}
