import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import utils from "../utils";
import { EventTypes } from "../types/Event";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

type AvailabilityTime = {
    fromTime: Dayjs,
    toTime: Dayjs
}

type AvailabilityDay = {
    forDate: Dayjs,
    availableTimes: AvailabilityTime[]
}

const HALFHOUR_DISPLAY_HEIGHT: number = 15;

const DAY_DISPLAY_WIDTH: String = "150px";

export default function AvailabilityPicker(props: { 
    fromDate: Dayjs, 
    toDate: Dayjs, 
    eventType: String,
    availabilityDurationInMinutes: number
}) {
    const [days, setDays] = useState<AvailabilityDay[]>([]);
    const [selectingAvailabilityForDay, setAvailabilityDayBeingSelectedFor] = useState<AvailabilityDay | null>(null);
    const [currentAvailabilityTime, setAvailabilityTime] = useState<AvailabilityTime | null>(null);

    useEffect(() => {
        let localTimezone = dayjs.tz.guess();

        let localFromDate = props.fromDate.tz(localTimezone);
        let localToDate = props.toDate.tz(localTimezone);

        switch (props.eventType) {
            case EventTypes.SPECIFIC_DATE: {
                createAvailabilitiesBasedOnInitialDate(localFromDate, 1);
                break;
            }
            case EventTypes.DATE_RANGE: {
                createAvailabilitiesBasedOnInitialDate(localFromDate, Math.abs(localFromDate.diff(localToDate, "day", false)));
                break;
            }
            case EventTypes.DAY: {
                createAvailabilitiesBasedOnUnspecifiedInitialDate(1, localTimezone);
                break;
            }
            case EventTypes.WEEK: {
                createAvailabilitiesBasedOnUnspecifiedInitialDate(7, localTimezone);
                break;
            }
        }
    }, [props]);

    useEffect(() => {
        console.log(days)
    }, [days])

    function createAvailabilitiesBasedOnUnspecifiedInitialDate(numberOfDays: number, tz: string) {
        createAvailabilitiesBasedOnInitialDate(dayjs.tz("1970-01-05 00:00:00", tz), numberOfDays);
    }

    function createAvailabilitiesBasedOnInitialDate(date: Dayjs, numberOfDays: number) {
        let availabilities: AvailabilityDay[] = [];

        for (var i: number = 0; i < numberOfDays; i++) {
            let availability: AvailabilityDay = {
                forDate: date.add(i, "day").startOf("day"),
                availableTimes: []
            }

            availabilities.push(availability);
        }

        setDays(availabilities);
    }

    function clearAvailabilityTimeSelection() {
        setAvailabilityDayBeingSelectedFor(null);
        setAvailabilityTime(null);
    }

    function beginAvailabilityTimeSelection(e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: AvailabilityDay, startTime: Dayjs) {
        setAvailabilityDayBeingSelectedFor(day);
        setAvailabilityTime({
            fromTime: startTime,
            toTime: startTime
        });
    }

    function finishAvailabilityTimeSelection(e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: AvailabilityDay) {
        if (currentAvailabilityTime === null) {
            return;
        }

        day.availableTimes.push(currentAvailabilityTime);
        setDays([...days])

        clearAvailabilityTimeSelection();
    }

    function addTimeToAvailabilityTimeSelection(e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: AvailabilityDay, time: Dayjs) {
        if (e.buttons !== 1) {
            return;
        }

        if (currentAvailabilityTime === null) {
            return;
        }

        if (currentAvailabilityTime !== null && selectingAvailabilityForDay !== null && Math.abs(selectingAvailabilityForDay.forDate.diff(time, "day")) >= 1) {
            clearAvailabilityTimeSelection();
            return;
        }

        let currentFrom = currentAvailabilityTime.fromTime;
        let currentTo = currentAvailabilityTime.toTime;

        if (time.isBefore(currentFrom)) {
            setAvailabilityTime({
                fromTime: time,
                toTime: currentTo
            })

            return;
        }

        if (time.isAfter(currentTo)) {
            setAvailabilityTime({
                fromTime: currentFrom,
                toTime: time
            })

            return;
        }
    }

    function currentAvailabilityTimeSelectionIncludes(time: Dayjs): boolean {
        if (currentAvailabilityTime === null) {
            return false;
        }

        if ((time.isAfter(currentAvailabilityTime.fromTime) && time.isBefore(currentAvailabilityTime.toTime)) || (time.isSame(currentAvailabilityTime.toTime) || time.isSame(currentAvailabilityTime.fromTime))) {
            return true;
        }

        return false;
    }

    function isTimeIncludedInAnyAvailabilityPeriod(day: AvailabilityDay, time: Dayjs): boolean {
        return day.availableTimes.some(t => t.fromTime.isBefore(time) && t.toTime.isAfter(time));
    }

    function isTimeBeginningOfAnyAvailabilityPeriod(day: AvailabilityDay, time: Dayjs): boolean {
        return day.availableTimes.some(t => t.fromTime.isSame(time));
    }

    function isTimeEndingOfAnyAvailabilityPeriod(day: AvailabilityDay, time: Dayjs): boolean {
        return day.availableTimes.some(t => t.toTime.isSame(time));
    }

    function generateDay(day: AvailabilityDay) {

        const HOVER_COLOR: String = "#004455";
        const HOUR_LIGHT_COLOR: String = "#002233";
        const HOUR_DARK_COLOR: String = "#003344";
        const HOUR_BORDER_COLOR: String = "#777";
        const ACTIVE_COLOR: String = "#223300";
        const CURRENTLY_SELECTED_COLOR: String = "#112200";
        const HOUR_TEXT_COLOR: String = "#ddd";
        const HALFHOUR_BORDER_COLOR: String = "#333";

        let hours = [...Array<String>(24)].map((_, i) => {
            let time = day.forDate.set("hour", i).set("minute", 0).set("second", 0);

            return (
                <Box 
                    key={`${i}`} 
                    sx={{ 
                        width: "100%",                             
                        borderBottom: 1,
                        borderColor: HOUR_BORDER_COLOR,
                        bgcolor: (i % 2 == 0) ? HOUR_LIGHT_COLOR : HOUR_DARK_COLOR,
                        ":hover": {
                            bgcolor: HOVER_COLOR
                        }
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            height: HALFHOUR_DISPLAY_HEIGHT,
                            borderBottom: 1,
                            borderColor: HALFHOUR_BORDER_COLOR,
                            ":active": {
                                bgcolor: ACTIVE_COLOR
                            },
                            bgcolor: currentAvailabilityTimeSelectionIncludes(time) ? CURRENTLY_SELECTED_COLOR : "inherit"
                        }}
                        onMouseDown={(e) => beginAvailabilityTimeSelection(e, day, time)}
                        onMouseUp={(e) => finishAvailabilityTimeSelection(e, day)}
                        onMouseOver={(e) => addTimeToAvailabilityTimeSelection(e, day, time)}
                    >
                        <Typography
                            className={"noselect"}
                            textAlign={"left"}
                            fontSize={"0.65em"}
                            color={HOUR_TEXT_COLOR}
                        >
                            { utils.formatTimeFromHourOfDay(i, 0) }
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: "100%",
                            height: HALFHOUR_DISPLAY_HEIGHT,
                            ":active": {
                                bgcolor: ACTIVE_COLOR
                            },
                            bgcolor: currentAvailabilityTimeSelectionIncludes(time.set("minute", 30)) ? CURRENTLY_SELECTED_COLOR : "inherit"
                        }}
                        onMouseDown={(e) => beginAvailabilityTimeSelection(e, day, time.set("minute", 30))}
                        onMouseUp={(e) => finishAvailabilityTimeSelection(e, day)}
                        onMouseOver={(e) => addTimeToAvailabilityTimeSelection(e, day, time.set("minute", 30))}
                    >
                    </Box>
                </Box>
                
            );
        })

        return (
            <Stack 
                key={day.forDate.format()} 
                direction="column"
                sx={{ 
                    minWidth: DAY_DISPLAY_WIDTH, 
                    width: DAY_DISPLAY_WIDTH
                }}
                overflow={"visible"}
            >
                <Card
                    sx={{ 
                        width: "100%", 
                        height: "fit-content", 
                        overflow: "visible" 
                    }}
                    variant="outlined"
                    onMouseLeave={(e) => clearAvailabilityTimeSelection()}
                >
                    <Box
                        sx={{ width: "100%" }}
                        padding={1}
                    >
                        {
                            (props.eventType === EventTypes.WEEK) &&
                            <Typography>
                                { day.forDate.format("dddd") }
                            </Typography>
                        }
                        {
                            (props.eventType === EventTypes.DAY) &&
                            <Typography>
                                Any Day
                            </Typography>
                        }
                        {
                            (props.eventType === EventTypes.DATE_RANGE || props.eventType === EventTypes.SPECIFIC_DATE) &&
                            <Typography>                            
                                { day.forDate.format("LL") }
                            </Typography>
                        }
                    </Box>
                    <Divider></Divider>
                    {hours}
                </Card>
            </Stack>
        );
    }

    return (
        <Stack 
            direction="row" 
            spacing={1} 
            justifyContent={"safe center"} 
            sx={{ 
                width: "100%", 
                height: "auto", 
                maxHeight: "500px",  
                overflowY: "scroll", 
                overflowX: "scroll" 
            }} 
        >
            {
                days.map(a => generateDay(a))
            }
        </Stack>
    );
}