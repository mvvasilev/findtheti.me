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
		return gorm.G[Event](tx).Create(ctx, event)
	})
}

func (r *Repository) FindBySnowflakeId(ctx context.Context, snowflake string) (*Event, error) {
	return dbutils.QueryInTx(ctx, func(tx *gorm.DB) (*Event, error) {
		event, err := gorm.G[Event](tx).Where("snowflake_id = ?", snowflake).First(ctx)
		return &event, err
	})
}
