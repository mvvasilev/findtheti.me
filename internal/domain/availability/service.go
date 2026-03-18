package availability

import (
	"context"
	"net"
	"strings"
	"time"

	"findthetime/internal/domain/errors"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type CreateAvailabilityCommand struct {
	EventSnowflakeId string
	Availabilities   []CreateAvailabilityPeriod
	UserEmail        *string
	UserName         string
	UserIP           string
}

type CreateAvailabilityPeriod struct {
	FromDate time.Time
	ToDate   time.Time
}

func (s *Service) CreateAvailability(ctx context.Context, cmd *CreateAvailabilityCommand) error {
	if strings.TrimSpace(cmd.UserName) == "" {
		return errors.New("Missing user_name")
	}

	if len(cmd.Availabilities) == 0 {
		return errors.New("Must provide at least one availability")
	}

	event, err := s.repo.FindEventBySnowflakeId(ctx, cmd.EventSnowflakeId)

	if err != nil {
		return err
	}

	submitted, err := s.repo.FindAlreadySubmittedForEvent(ctx, event.ID, cmd.UserName, cmd.UserEmail, normalizeIP(cmd.UserIP))

	if err != nil {
		return err
	}

	if submitted {
		return errors.New("Availability already submitted")
	}

	for _, period := range cmd.Availabilities {

		if !period.FromDate.Before(period.ToDate) {
			return errors.New("Availability from_date must be earlier than to_date")
		}

		_, err := s.repo.Create(ctx, &Availability{
			EventId:   event.ID,
			FromDate:  period.FromDate.UTC(),
			ToDate:    period.ToDate.UTC(),
			UserEmail: normalizeEmail(cmd.UserEmail),
			UserIp:    normalizeIP(cmd.UserIP),
			UserName:  cmd.UserName,
		})

		if err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) FindByEventSnowflakeId(ctx context.Context, eventSnowflakeId string) ([]Availability, error) {
	return s.repo.FindByEventSnowflakeId(ctx, eventSnowflakeId)
}

func normalizeEmail(email *string) *string {
	if email == nil {
		return nil
	}

	trimmed := strings.TrimSpace(*email)
	if trimmed == "" {
		return nil
	}

	return &trimmed
}

func normalizeIP(ip string) string {
	trimmed := strings.TrimSpace(ip)
	if trimmed == "" {
		return ""
	}

	host, _, err := net.SplitHostPort(trimmed)
	if err == nil {
		return host
	}

	return trimmed
}
