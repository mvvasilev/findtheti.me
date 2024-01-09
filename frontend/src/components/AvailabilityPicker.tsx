import { Box, Card, Divider, Stack, Theme, Typography, useTheme } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { MouseEvent, ReactNode, useEffect, useState } from "react";
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import utils from "../utils";
import { EventTypes } from "../types/Event";
import "./css/AvailabilityPicker.css";
// import { alpha } from '@material-ui/core/styles/colorManipulator';

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

type GhostPreviewProps = {
    top: number,
    left: number,
    width: String,
    height: String
}

const HALFHOUR_DISPLAY_HEIGHT: number = 15;

const DAY_DISPLAY_WIDTH: String = "150px";

export default function AvailabilityPicker(props: { 
    fromDate: Dayjs, 
    toDate: Dayjs, 
    eventType: String,
    availabilityDurationInMinutes: number
}) {
    const theme: Theme = useTheme();

    const [days, setDays] = useState<AvailabilityDay[]>([]);
    const [ghostPreviewProps, setGhostPreviewProps] = useState<GhostPreviewProps | null>();

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

    function displayGhostPeriod(e: React.MouseEvent<HTMLDivElement, MouseEvent>, time: Dayjs) {
        let timeInMinutes = (time.hour() * 60) + time.minute();
        let timeLeftInDayLessThanDuration = (timeInMinutes + props.availabilityDurationInMinutes) > 24 * 60;

        if (timeLeftInDayLessThanDuration) {
            return;
        }

        let scrollTop = document.getElementById('availability-picker')?.scrollTop ?? 0;
        let scrollLeft = document.getElementById('availability-picker')?.scrollLeft ?? 0;

        const element = e.target.getBoundingClientRect();

        setGhostPreviewProps({
            top: e.target?.offsetTop - scrollTop,
            left: e.target?.offsetLeft - scrollLeft,
            width: element.width,
            height: `${(props.availabilityDurationInMinutes/60) * 2 * HALFHOUR_DISPLAY_HEIGHT}px`
        })
    }

    function createAvailability(day: AvailabilityDay, time: Dayjs) {
        let fromTime = time;
        let toTime = time.add(props.availabilityDurationInMinutes, "minutes");

        let existingTimeContainingFrom = day.availableTimes.findIndex(t => (t.fromTime.isBefore(fromTime) || t.fromTime.isSame(fromTime)) && (t.toTime.isAfter(fromTime) || t.toTime.isSame(fromTime)));
        let existingTimeContainingTo = day.availableTimes.findIndex(t => (t.fromTime.isBefore(toTime) || t.fromTime.isSame(toTime)) && (t.toTime.isAfter(toTime) || t.toTime.isSame(toTime)));

        // the newly created availability crosses another single one. Both have the same from and to. Do nothing.
        if (existingTimeContainingFrom >= 0 && existingTimeContainingTo >= 0 && existingTimeContainingFrom === existingTimeContainingTo) {
            return;
        }

        // the newly created availability crosses 2 existing ones. Combine all of them into a single one.
        if (existingTimeContainingFrom >= 0 && existingTimeContainingTo >= 0 && existingTimeContainingFrom !== existingTimeContainingTo) {
            let newFrom = day.availableTimes[existingTimeContainingFrom].fromTime;
            let newTo = day.availableTimes[existingTimeContainingFrom].toTime;

            day.availableTimes.splice(existingTimeContainingFrom);
            day.availableTimes.splice(existingTimeContainingTo);

            day.availableTimes.push({
                fromTime: newFrom,
                toTime: newTo
            });

            return;
        }

        // The newly created availability from is within an existing one. Combine the 2 into one.
        if (existingTimeContainingFrom >= 0 && existingTimeContainingTo < 0) {
            let newFrom = day.availableTimes[existingTimeContainingFrom].fromTime;

            day.availableTimes.splice(existingTimeContainingFrom);

            day.availableTimes.push({
                fromTime: newFrom,
                toTime: toTime
            });

            return;
        }

        // The newly created availability to is within an existing one. Combine the 2 into one.
        if (existingTimeContainingFrom >= 0 && existingTimeContainingTo < 0) {
            let newTo = day.availableTimes[existingTimeContainingFrom].toTime;

            day.availableTimes.splice(existingTimeContainingFrom);

            day.availableTimes.push({
                fromTime: fromTime,
                toTime: newTo
            });

            return;
        }

        day.availableTimes.push({
            fromTime: fromTime,
            toTime: toTime
        });

        setDays([...days])
    }

    function isSelectedAvailability(day: AvailabilityDay, time: Dayjs): boolean {
        return day.availableTimes.some(t => (t.fromTime.isBefore(time) || t.fromTime.isSame(time)) && (t.toTime.isAfter(time) || t.toTime.isSame(time)));
    }

    function generateDay(day: AvailabilityDay) {

        const HOUR_TEXT_COLOR: String = "#ddd";

        let hours = [];

        for (var i = 0; i < 24; i++) {
            let time = day.forDate.set("hour", i).set("minute", 0).set("second", 0);

            hours.push(
                <Box 
                    key={`${i}`} 
                    className={(i % 2 == 0) ? "hour-light" : "hour-dark"}
                >
                    <Box
                        className={[ 
                            "full-hour",
                            isSelectedAvailability(day, time) && "selected-availability"
                        ]}
                        height={HALFHOUR_DISPLAY_HEIGHT}
                        onMouseEnter={(e: MouseEvent<HTMLDivElement, MouseEvent>) => displayGhostPeriod(e, time)}
                        onClick={(e) => createAvailability(day, time)}
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
                        className={[ 
                            "half-hour",
                            isSelectedAvailability(day, time) && "selected-availability"
                        ]}
                        height={HALFHOUR_DISPLAY_HEIGHT}
                        onMouseEnter={(e: MouseEvent<HTMLDivElement, MouseEvent>) => displayGhostPeriod(e, time.add(30, "minutes"))}
                        onClick={(e) => createAvailability(day, time.add(30, "minutes"))}
                    >
                    </Box>
                </Box>
            );
        }

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
        <Box
            sx={{ 
                position: "relative",
                width: "100%", 
                height: "auto",
                overflow: "hidden"
            }}
        >
            <Stack
                id="availability-picker" 
                direction="row" 
                spacing={1} 
                justifyContent={"safe center"} 
                sx={{ 
                    width: "100%", 
                    height: "500px", 
                    overflowY: "scroll",
                    overflowX: "scroll"
                }}
                onScroll={(e) => setGhostPreviewProps(null)}
            >
                {
                    days.map(a => generateDay(a))
                }
            </Stack>
            {
                (ghostPreviewProps !== null) &&
                <Box
                    sx={{
                        position: "absolute",
                        top: ghostPreviewProps?.top,
                        left: ghostPreviewProps?.left,
                        width: ghostPreviewProps?.width,
                        height: ghostPreviewProps?.height,
                        bgcolor: "rgba(0, 255, 0, 0.1)",
                        border: 1,
                        borderColor: "#272",
                        borderRadius: 1,
                        m: 0,
                        p: 0,
                        pointerEvents: "none"
                    }}
                >
                </Box>
            }
        </Box>
    );
}