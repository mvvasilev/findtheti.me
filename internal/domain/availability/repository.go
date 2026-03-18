package availability

import (
	"context"

	"findthetime/internal/dbutils"
	"findthetime/internal/domain/event"

	"gorm.io/gorm"
)

type Repository struct{}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) Create(ctx context.Context, availability *Availability) (*Availability, error) {
	return availability, dbutils.RunInTx(ctx, func(tx *gorm.DB) error {
		return tx.WithContext(ctx).Create(availability).Error
	})
}

func (r *Repository) FindByEventId(ctx context.Context, eventId uint) ([]Availability, error) {
	return dbutils.QueryInTx(ctx, func(tx *gorm.DB) ([]Availability, error) {
		var availabilities []Availability
		err := tx.WithContext(ctx).Where("event_id = ?", eventId).Find(&availabilities).Error
		return availabilities, err
	})
}

func (r *Repository) FindByEventSnowflakeId(ctx context.Context, snowflakeId string) ([]Availability, error) {
	return dbutils.QueryInTx(ctx, func(tx *gorm.DB) ([]Availability, error) {
		var availabilities []Availability

		err := tx.WithContext(ctx).
			Model(&Availability{}).
			Joins("JOIN events ON events.id = availabilities.event_id").
			Where("events.snowflake_id = ?", snowflakeId).
			Find(&availabilities).Error

		return availabilities, err
	})
}

func (r *Repository) FindAlreadySubmittedForEvent(ctx context.Context, eventId uint, userName string, userEmail *string, userIP string) (bool, error) {
	return dbutils.QueryInTx(ctx, func(tx *gorm.DB) (bool, error) {
		query := tx.WithContext(ctx).Model(&Availability{}).Where("event_id = ?", eventId)

		duplicationChecks := tx.Where("user_ip = ?", userIP).Or("user_name = ?", userName)

		if userEmail != nil && *userEmail != "" {
			duplicationChecks = duplicationChecks.Or("user_email = ?", *userEmail)
		}

		var count int64
		err := query.Where(duplicationChecks).Count(&count).Error
		return count > 0, err
	})
}

func (r *Repository) FindEventBySnowflakeId(ctx context.Context, snowflakeId string) (*event.Event, error) {
	return dbutils.QueryInTx(ctx, func(tx *gorm.DB) (*event.Event, error) {
		found, err := gorm.G[event.Event](tx).Where("snowflake_id = ?", snowflakeId).First(ctx)
		return &found, err
	})
}
