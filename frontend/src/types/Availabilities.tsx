import { Dayjs } from "dayjs"

export type AvailabilityTime = {
    fromTime: Dayjs,
    toTime: Dayjs
}

export type AvailabilityDay = {
    forDate: Dayjs,
    availableTimes: AvailabilityTime[]
}

export type UserAvailabilityHeatmapValue = {
    usersAvailableAtTime: String[]
}

export class UserAvailabilityHeatmap {
    private map: UserAvailabilityHeatmapValue[];
    public maxNumberOfRespondents: number;

    constructor() {
        this.map = [];
        this.maxNumberOfRespondents = 0;
    }

    addName(unixTime: number, name: String): void {
        if (this.map[unixTime] === undefined || this.map[unixTime] === null) {
            this.map[unixTime] = { usersAvailableAtTime: [] } as UserAvailabilityHeatmapValue;
        }

        this.map[unixTime].usersAvailableAtTime.push(name);

        if (this.map[unixTime].usersAvailableAtTime.length > this.maxNumberOfRespondents) {
            this.maxNumberOfRespondents = this.map[unixTime].usersAvailableAtTime.length;
        }
    }

    getNamesAt(unixTime: number): String[] {
        return this.map[unixTime]?.usersAvailableAtTime ?? [];
    }
}