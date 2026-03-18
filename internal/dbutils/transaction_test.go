package dbutils

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestContextWithTxAndTxFromContext_RoundTrip(t *testing.T) {
	tx := &gorm.DB{}
	ctx := ContextWithTx(context.Background(), tx)

	found, ok := TxFromContext(ctx)

	assert.True(t, ok)
	assert.Same(t, tx, found)
}

func TestTxFromContext_NoTransaction(t *testing.T) {
	found, ok := TxFromContext(context.Background())

	assert.False(t, ok)
	assert.Nil(t, found)
}

func TestRunInTx_NoTransactionInContext(t *testing.T) {
	err := RunInTx(context.Background(), func(tx *gorm.DB) error {
		t.Fatalf("task should not be called without a transaction")
		return nil
	})

	assert.EqualError(t, err, "No transaction to be found in context")
}

func TestRunInTx_UsesTransactionFromContext(t *testing.T) {
	tx := &gorm.DB{}
	called := false

	err := RunInTx(ContextWithTx(context.Background(), tx), func(got *gorm.DB) error {
		called = true
		assert.Same(t, tx, got)
		return nil
	})

	assert.NoError(t, err)
	assert.True(t, called)
}

func TestQueryInTx_NoTransactionInContext(t *testing.T) {
	got, err := QueryInTx(context.Background(), func(tx *gorm.DB) (string, error) {
		t.Fatalf("query should not be called without a transaction")
		return "", nil
	})

	assert.Empty(t, got)
	assert.EqualError(t, err, "No transaction to be found in context")
}

func TestQueryInTx_UsesTransactionFromContext(t *testing.T) {
	tx := &gorm.DB{}

	got, err := QueryInTx(ContextWithTx(context.Background(), tx), func(found *gorm.DB) (string, error) {
		assert.Same(t, tx, found)
		return "ok", nil
	})

	assert.NoError(t, err)
	assert.Equal(t, "ok", got)
}
