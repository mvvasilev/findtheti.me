package dbutils

import (
	"context"
	"findthetime/internal/domain/errors"

	"gorm.io/gorm"
)

type ctxKey struct{}

var DbTx = ctxKey{}

func ContextWithTx(parent context.Context, tx *gorm.DB) context.Context {
	return context.WithValue(parent, DbTx, tx)
}

func TxFromContext(ctx context.Context) (tx *gorm.DB, ok bool) {
	val := ctx.Value(DbTx)

	if val == nil {
		return nil, false
	}

	tx, ok = val.(*gorm.DB)
	return
}

type TxFunc func(tx *gorm.DB) error
type TxQuery[T any] func(tx *gorm.DB) (T, error)

func RunInTx(ctx context.Context, task TxFunc) error {
	tx, ok := TxFromContext(ctx)

	if !ok {
		return errors.New("No transaction to be found in context")
	}

	return task(tx)
}

func QueryInTx[T any](ctx context.Context, query TxQuery[T]) (T, error) {
	tx, ok := TxFromContext(ctx)

	if !ok {
		var zero T
		return zero, errors.New("No transaction to be found in context")
	}

	return query(tx)
}
