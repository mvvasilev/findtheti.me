package event

import (
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGenerateSnowflakeId_ReturnsNumericId(t *testing.T) {
	snowflakeState.Store(0)

	id := generateSnowflakeId()

	parsed, err := strconv.ParseUint(id, 10, 64)
	require.NoError(t, err)
	assert.NotZero(t, parsed)
}

func TestGenerateSnowflakeId_IsUniqueAndIncreasing(t *testing.T) {
	snowflakeState.Store(0)

	const total = 1024

	seen := make(map[string]struct{}, total)
	prev := uint64(0)

	for range total {
		id := generateSnowflakeId()

		_, exists := seen[id]
		assert.False(t, exists, "duplicate snowflake id generated: %s", id)
		seen[id] = struct{}{}

		parsed, err := strconv.ParseUint(id, 10, 64)
		require.NoError(t, err)
		assert.Greater(t, parsed, prev)
		prev = parsed
	}
}
