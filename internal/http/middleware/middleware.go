package middleware

import (
	"findthetime/internal/dbutils"
	"findthetime/internal/http/httputils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewGORMMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		tx := db.Begin()

		ctx.Request = ctx.Request.WithContext(dbutils.ContextWithTx(ctx.Request.Context(), tx))

		// In the event of a panic, rollback the transaction
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
				// Re-panic after rollback
				panic(r)
			}
		}()

		ctx.Next()

		// If the context contains errors, rollback
		if len(ctx.Errors) > 0 {
			tx.Rollback()
			return
		}

		// If no panic has occurred, and no errors are present in the context, commit the transaction
		tx.Commit()
	}
}

func NewUniversalDtoMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {

		// In the event of a panic, catch it and return a UniversalResponseDto
		defer func() {
			if r := recover(); r != nil {
				ctx.JSON(500, &httputils.UniversalResponseDto[any]{
					Status: 500,
					Error: &httputils.ErrorDto{
						Message: "Internal Server Error",
					},
				})

				// Re-panic afterwards
				panic(r)
			}
		}()

		ctx.Next()
	}
}
