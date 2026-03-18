package availability

import (
	"time"

	"gorm.io/gorm"
)

type Availability struct {
	gorm.Model

	EventId   uint
	FromDate  time.Time
	ToDate    time.Time
	UserEmail *string
	UserIp    string
	UserName  string
}

func (Availability) TableName() string {
	return "availabilities"
}
