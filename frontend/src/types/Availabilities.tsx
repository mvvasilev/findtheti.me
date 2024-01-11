import { Dayjs } from "dayjs"

export type AvailabilityTime = {
    fromTime: Dayjs,
    toTime: Dayjs
}

export type AvailabilityDay = {
    forDate: Dayjs,
    availableTimes: AvailabilityTime[]
}

export type OthersDays = {
    userName: String, 
    days: AvailabilityDay[]
}

export type OthersDay = {
    userName: String,
    availableTimes: AvailabilityTime[]
}