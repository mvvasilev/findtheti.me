import { AvailabilityDay, UserAvailabilityHeatmap } from "../types/Availabilities";
import utils from "../utils";
import { Box, Card, Divider, Typography } from "@mui/material";
import { EventTypes } from "../types/Event";
import AvailabilityPickerHour from "./AvailabilityPickerHour";
import "./css/AvailabilityPicker.css";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import React, { useMemo } from "react";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

const AvailabilityPickerDay = (props: {
    day: AvailabilityDay,
    eventType: String,
    halfHourDisplayHeight: number,
    currentTotalRespondents: number,
    availabilityHeatmap: UserAvailabilityHeatmap,
    onMouseEnterHalfhour: (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: dayjs.Dayjs) => void,
    onMouseClickHalfhour: (day: AvailabilityDay, time: dayjs.Dayjs, isDelete: boolean) => void
}) => {

    const generateHours = useMemo((): JSX.Element[] => {
        let hours: JSX.Element[] = [];
    
        for (var i = 0; i < 24; i++) {
            let fullHourTime = props.day.forDate.set("hour", i);
            let halfHourTime = fullHourTime.add(30, "minutes");

            hours.push(
                <AvailabilityPickerHour 
                    key={fullHourTime.unix()}
                    dateTime={fullHourTime}
                    halfHourDisplayHeight={props.halfHourDisplayHeight}
                    currentTotalRespondents={props.currentTotalRespondents}
                    namesMarkedFullHourAsAvailable={props.availabilityHeatmap.getNamesAt(fullHourTime.unix())}
                    namesMarkedHalfHourAsAvailable={props.availabilityHeatmap.getNamesAt(fullHourTime.add(30, "minutes").unix())}
                    isFullHourSelected={props.day.availableTimes.some(a => utils.dayjsIsBetweenUnixExclusive(a.fromTime, fullHourTime, a.toTime))}
                    isHalfHourSelected={props.day.availableTimes.some(a => utils.dayjsIsBetweenUnixExclusive(a.fromTime, halfHourTime, a.toTime))}  
                    onMouseEnterHalfhour={(e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: dayjs.Dayjs): void => {
                        props.onMouseEnterHalfhour(e, time);
                    }} 
                    onMouseClickOnHalfhour={(time: dayjs.Dayjs, isDelete: boolean): void => {
                        props.onMouseClickHalfhour(props.day, time, isDelete);
                    }}            
                />
            );
        }

        return hours;
    }, [props.day]);

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

            {generateHours}

        </Card>
    );
};

export default AvailabilityPickerDay;