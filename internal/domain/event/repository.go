package event

import (
	"context"
	"findthetime/internal/dbutils"

	"gorm.io/gorm"
)

type Repository struct {
}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) Create(ctx context.Context, event *Event) (*Event, error) {
	return event, dbutils.RunInTx(ctx, func(tx *gorm.DB) error {
		return tx.WithContext(ctx).Create(event).Error
	})
}

func (r *Repository) FindBySnowflakeId(ctx context.Context, snowflake string) (*Event, error) {
	return dbutils.QueryInTx(ctx, func(tx *gorm.DB) (*Event, error) {
		var found Event
		err := tx.WithContext(ctx).Where("snowflake_id = ?", snowflake).First(&found).Error
		return &found, err
	})
}
