package event

import (
	"time"

	"gorm.io/gorm"
)

type EventType int

const (
	SpecificDate EventType = iota
	DateRange
	Day
	Week
	Month
	Unknown
)

func EventTypeFromName(name string) (et EventType, ok bool) {
	switch name {
	case "SpecificDate":
		return SpecificDate, true
	case "DateRange":
		return DateRange, true
	case "Day":
		return Day, true
	case "Week":
		return Week, true
	case "Month":
		return Month, true
	default:
		return Unknown, false
	}
}

func (et EventType) Name() string {
	switch et {
	case SpecificDate:
		return "SpecificDate"
	case DateRange:
		return "DateRange"
	case Day:
		return "Day"
	case Week:
		return "Week"
	case Month:
		return "Month"
	default:
		return "Unknown"
	}
}

type Event struct {
	gorm.Model

	SnowflakeId string
	Name        string
	Description *string
	FromDate    *time.Time
	ToDate      *time.Time
	EventType   EventType
	Duration    int
}

func (Event) TableName() string {
	return "events"
}
