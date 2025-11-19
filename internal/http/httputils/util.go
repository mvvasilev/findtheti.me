package httputils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Attempt to deserialize the request body,
// or on failure set the error on the gin context and abort with 400 Bad Request
func DeserializeBodyOrErrorBadRequest[T any](c *gin.Context, dto *T) (*T, error) {
	err := c.ShouldBindBodyWithJSON(dto)

	if err != nil {
		SetErrorAndAbort(c, http.StatusBadRequest, err)
		return nil, err
	}

	return dto, nil
}

// Set the gin context error and response body using the standard error dto
func SetErrorAndAbort(c *gin.Context, status int, err error) {
	c.Error(err)
	c.AbortWithStatusJSON(status, NewErroneousResponse(status, err))
}

func OK[T any](c *gin.Context, result *T) {
	RespondWithBody(c, http.StatusOK, result)
}

func RespondWithBody[T any](c *gin.Context, status int, result *T) {
	c.JSON(
		status,
		NewResponse(status, result),
	)
}
