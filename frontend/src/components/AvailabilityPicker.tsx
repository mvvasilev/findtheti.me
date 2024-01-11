import { Box, Stack } from "@mui/material";
import { MouseEvent, useState } from "react";
import "./css/AvailabilityPicker.css";
import { AvailabilityDay, OthersDay, OthersDays } from "../types/Availabilities";
import utils from "../utils";
import AvailabilityPickerDay from "./AvailabilityPickerDay";
import dayjs, { Dayjs } from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

const HALFHOUR_DISPLAY_HEIGHT: number = 15;

type GhostPreviewProps = {
    top: number,
    left: number,
    width: number,
    height: number
}

const AvailabilityPicker = (props: { 
    days: AvailabilityDay[], 
    setDays: (days: AvailabilityDay[]) => void, 
    othersAvailabilities: OthersDays[],
    eventType: String,
    availabilityDurationInMinutes: number,
}) => {
    
    const [ghostPreviewProps, setGhostPreviewProps] = useState<GhostPreviewProps | null>();

    const displayGhostPeriod = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: Dayjs) => {
        let timeInMinutes = (time.hour() * 60.0) + time.minute();
        let timeLeftInDayLessThanDuration = (timeInMinutes + props.availabilityDurationInMinutes) > 24.0 * 60.0;

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
            height: ((props.availabilityDurationInMinutes/60.0) * 2 * (HALFHOUR_DISPLAY_HEIGHT + 0.5))
        })
    }

    const deleteAvailability = (day: AvailabilityDay, time: Dayjs) => {
        let existingTime = day.availableTimes.findIndex(t => utils.dayjsIsBetweenUnixExclusive(t.fromTime, time, t.toTime));

        if (existingTime >= 0) {
            console.log(`delete ${existingTime} from`, day)

            day.availableTimes.splice(existingTime, 1);

            props.setDays([...props.days]);
        }
    }

    const changeAvailability = (day: AvailabilityDay, time: Dayjs, isDelete: boolean) => {
        if (isDelete) {
            deleteAvailability(day, time);

            return;
        }

        let fromTime = time;
        let toTime = time.add(props.availabilityDurationInMinutes, "minutes");

        let existingTimeContainingFrom = day.availableTimes.findIndex(t => utils.dayjsIsBetweenUnixInclusive(t.fromTime, fromTime, t.toTime));
        let existingTimeContainingTo = day.availableTimes.findIndex(t => utils.dayjsIsBetweenUnixInclusive(t.fromTime, toTime, t.toTime));

        // the newly created availability crosses another single one. Both have the same from and to. Do nothing.
        if (existingTimeContainingFrom >= 0 && existingTimeContainingTo >= 0 && existingTimeContainingFrom === existingTimeContainingTo) {
            return;
        }

        // the newly created availability crosses 2 existing ones. Combine all of them into a single one.
        if (existingTimeContainingFrom >= 0 && existingTimeContainingTo >= 0 && existingTimeContainingFrom !== existingTimeContainingTo) {
            let newFrom = day.availableTimes[existingTimeContainingFrom].fromTime;
            let newTo = day.availableTimes[existingTimeContainingTo].toTime;

            day.availableTimes.splice(existingTimeContainingFrom, 1);
            day.availableTimes.splice(existingTimeContainingTo, 1);

            day.availableTimes.push({
                fromTime: newFrom,
                toTime: newTo
            });

            props.setDays([...props.days]);

            return;
        }

        // The newly created availability from is within an existing one. Combine the 2 into one.
        if (existingTimeContainingFrom >= 0 && existingTimeContainingTo < 0) {
            let newFrom = day.availableTimes[existingTimeContainingFrom].fromTime;

            day.availableTimes.splice(existingTimeContainingFrom, 1);

            day.availableTimes.push({
                fromTime: newFrom,
                toTime: toTime
            });

            props.setDays([...props.days]);

            return;
        }

        // The newly created availability to is within an existing one. Combine the 2 into one.
        if (existingTimeContainingFrom < 0 && existingTimeContainingTo >= 0) {
            let newTo = day.availableTimes[existingTimeContainingTo].toTime;

            day.availableTimes.splice(existingTimeContainingTo, 1);

            day.availableTimes.push({
                fromTime: fromTime,
                toTime: newTo
            });

            props.setDays([...props.days]);

            return;
        }

        day.availableTimes.push({
            fromTime: fromTime,
            toTime: toTime
        });

        props.setDays([...props.days]);
    }

    return (
        <Box
            className={"availability-parent-box"}
            onContextMenu={(e) => e.preventDefault()}
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
                    props.days.map(day => 
                        <AvailabilityPickerDay 
                            key={day.forDate.unix()}
                            day={day} 
                            eventType={props.eventType} 
                            halfHourDisplayHeight={HALFHOUR_DISPLAY_HEIGHT}
                            othersAvailabilityDay={props.othersAvailabilities.map(a => {
                                return {
                                    userName: a.userName,
                                    availableTimes: a.days.find(d => d.forDate.unix() === day.forDate.unix())?.availableTimes ?? []
                                } as OthersDay;
                            })}
                            onMouseEnterHalfhour={(e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: dayjs.Dayjs) => {
                                displayGhostPeriod(e, time);
                            }} 
                            onMouseClickHalfhour={(day: AvailabilityDay, time: dayjs.Dayjs, isDelete: boolean) => {
                                changeAvailability(day, time, isDelete);
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
