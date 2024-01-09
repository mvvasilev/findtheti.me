import { Dayjs } from "dayjs";

export type Event = {
    snowflakeId: String,
    name: String,
    description: String,
    fromDate: null | Dayjs,
    toDate: null | Dayjs,
    eventType: String,
    duration: number
};

export const EventTypes = {
    UNKNOWN: "Unknown",
    SPECIFIC_DATE: "SpecificDate",
    DATE_RANGE: "DateRange",
    DAY: "Day",
    WEEK: "Week",
    MONTH: "Month" // Unsupported atm
};

export function createEvent(): Event {
    return {
        snowflakeId: "",
        name: "",
        description: "",
        fromDate: null,
        toDate: null,
        eventType: EventTypes.UNKNOWN,
        duration: 30
    };
}