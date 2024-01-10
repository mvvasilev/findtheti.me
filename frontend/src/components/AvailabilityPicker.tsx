import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { MouseEvent, useEffect, useState } from "react";
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import utils from "../utils";
import { EventTypes } from "../types/Event";
import "./css/AvailabilityPicker.css";
import classNames from 'classnames';
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
    width: number,
    height: number
}

const HALFHOUR_DISPLAY_HEIGHT: number = 15;

const Hour = (props: {
    dateTime: Dayjs,
    isFullHourSelected: boolean,
    isHalfHourSelected: boolean,
    onMouseEnterHalfhour: (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: Dayjs) => void,
    onMouseClickOnHalfhour: (time: Dayjs) => void
}) => {
    let isEvenHour = props.dateTime.hour() % 2 == 0;

    return (
        <Box 
            className={classNames({ "hour-light": isEvenHour, "hour-dark": !isEvenHour })}
        >
            <Box
                className={classNames("full-hour", { "selected-availability": props.isFullHourSelected })}
                height={HALFHOUR_DISPLAY_HEIGHT}
                onMouseEnter={(e) => props.onMouseEnterHalfhour(e, props.dateTime)}
                onClick={(_) => props.onMouseClickOnHalfhour(props.dateTime)}
            >
                <Typography className={"noselect time-text"}>
                    { utils.formatTimeFromHourOfDay(props.dateTime.hour(), 0) }
                </Typography>
            </Box>
            <Box
                className={classNames("half-hour", { "selected-availability": props.isHalfHourSelected })}
                height={HALFHOUR_DISPLAY_HEIGHT}
                onMouseEnter={(e) => props.onMouseEnterHalfhour(e, props.dateTime.add(30, "minutes"))}
                onClick={(_) => props.onMouseClickOnHalfhour(props.dateTime.add(30, "minutes"))}
            />
        </Box>
    );
}

const isSelectedAvailability = (day: AvailabilityDay, time: Dayjs): boolean => {
    return day.availableTimes.some(t => t.fromTime.unix() <= time.unix() && time.unix() <= t.toTime.unix());
}

const Day = (props: {
    day: AvailabilityDay,
    eventType: String,
    onMouseEnterHalfhour: (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: dayjs.Dayjs) => void,
    onMouseClickHalfhour: (day: AvailabilityDay, time: dayjs.Dayjs) => void
}) => {

    const generateHours = (): JSX.Element[] => {
        let hours: JSX.Element[] = [];

        for (var i = 0; i < 24; i++) {
            let time = props.day.forDate.set("hour", i);
            hours.push(
                <Hour 
                    key={time.unix()}
                    dateTime={time}
                    isFullHourSelected={isSelectedAvailability(props.day, time)}
                    isHalfHourSelected={isSelectedAvailability(props.day, time.set("minutes", 30))}  
                    onMouseEnterHalfhour={(e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: dayjs.Dayjs): void => {
                        props.onMouseEnterHalfhour(e, time);
                    }} 
                    onMouseClickOnHalfhour={(time: dayjs.Dayjs): void => {
                        props.onMouseClickHalfhour(props.day, time);
                    }}            
                />
            );
        }

        return hours;
    }

    return (
        <Card
            
            key={props.day.forDate.format()} 
            className={"day-card"}
            variant="outlined"
        >
            <Box
                sx={{ width: "100%" }}
                padding={1}
            >
                {
                    (props.eventType === EventTypes.WEEK) &&
                    <Typography>
                        { props.day.forDate.format("dddd") }
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
                        { props.day.forDate.format("LL") }
                    </Typography>
                }
            </Box>

            <Divider></Divider>

            {generateHours()}

        </Card>
    );
}

const AvailabilityPicker = (props: { 
    fromDate: Dayjs, 
    toDate: Dayjs, 
    eventType: String,
    availabilityDurationInMinutes: number
}) => {

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

    const createAvailabilitiesBasedOnUnspecifiedInitialDate = (numberOfDays: number, tz: string) => {
        createAvailabilitiesBasedOnInitialDate(dayjs.tz("1970-01-05 00:00:00", tz), numberOfDays);
    }

    const createAvailabilitiesBasedOnInitialDate = (date: Dayjs, numberOfDays: number) => {
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

    const displayGhostPeriod = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: Dayjs) => {
        let timeInMinutes = (time.hour() * 60) + time.minute();
        let timeLeftInDayLessThanDuration = (timeInMinutes + props.availabilityDurationInMinutes) > 24 * 60;

        if (timeLeftInDayLessThanDuration) {
            return;
        }

        let scrollTop = document.getElementById('availability-picker')?.scrollTop ?? 0;
        let scrollLeft = document.getElementById('availability-picker')?.scrollLeft ?? 0;

        // @ts-ignore
        const element = e.target.getBoundingClientRect();

        setGhostPreviewProps({
            // @ts-ignore
            top: e.target?.offsetTop - scrollTop,
            // @ts-ignore
            left: e.target?.offsetLeft - scrollLeft,
            width: element.width,
            height: (props.availabilityDurationInMinutes/60) * 2 * HALFHOUR_DISPLAY_HEIGHT
        })
    }

    const createAvailability = (day: AvailabilityDay, time: Dayjs) => {
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

    return (
        <Box
            className={"availability-parent-box"}
        >
            <Stack
                id="availability-picker" 
                direction="row" 
                spacing={1} 
                justifyContent={"safe center"} 
                className={"availability-parent-stack"}
                onScroll={(_) => setGhostPreviewProps(null)}
            >
                {
                    days.map(day => 
                        <Day 
                            key={day.forDate.unix()}
                            day={day} 
                            eventType={props.eventType} 
                            onMouseEnterHalfhour={(e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: dayjs.Dayjs) => {
                                displayGhostPeriod(e, time);
                            }} 
                            onMouseClickHalfhour={(day: AvailabilityDay, time: dayjs.Dayjs) => {
                                createAvailability(day, time);
                            }} 
                        />
                    )
                }
            </Stack>
            {
                (ghostPreviewProps !== null) &&
                <Box
                    className={"ghost-box"}
                    top={ghostPreviewProps?.top}
                    left={ghostPreviewProps?.left}
                    width={ghostPreviewProps?.width}
                    height={ghostPreviewProps?.height}
                >
                </Box>
            }
        </Box>
    );
}

export default AvailabilityPicker;
