package errors

import "fmt"

type DomainError struct {
	Message       string
	InternalError error
}

func New(msg string) *DomainError {
	return &DomainError{
		Message: msg,
	}
}

func Newf(format string, vals ...any) *DomainError {
	return &DomainError{
		Message: fmt.Sprintf(format, vals...),
	}
}

func Wrap(err error, message string) *DomainError {
	return &DomainError{
		Message:       message,
		InternalError: err,
	}
}

func Wrapf(err error, format string, vals ...any) *DomainError {
	return &DomainError{
		Message:       fmt.Sprintf(format, vals...),
		InternalError: err,
	}
}

func (d *DomainError) Error() string {
	if d.InternalError == nil {
		return d.Message
	} else {
		return d.Message + ";\n" + d.InternalError.Error()
	}
}
