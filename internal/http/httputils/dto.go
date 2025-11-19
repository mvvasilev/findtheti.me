package httputils

type ErrorDto struct {
	Message string `json:"message"`
}

type UniversalResponseDto[T any] struct {
	Status int       `json:"status"`
	Error  *ErrorDto `json:"error" binding:"omitempty"`
	Result T         `json:"result" binding:"omitempty"`
}

func NewErroneousResponse(status int, err error) *UniversalResponseDto[any] {
	return &UniversalResponseDto[any]{
		Status: status,
		Error: &ErrorDto{
			Message: err.Error(),
		},
	}
}

func NewResponse[T any](status int, result T) *UniversalResponseDto[T] {
	return &UniversalResponseDto[T]{
		Status: status,
		Result: result,
	}
}
