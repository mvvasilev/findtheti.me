import { AvailabilityDay, UserAvailabilityHeatmap } from "../types/Availabilities";
import utils from "../utils";
import { Box, Card, Divider, Tooltip, Typography } from "@mui/material";
import { EventTypes } from "../types/Event";
import AvailabilityPickerHour from "./AvailabilityPickerHour";
import "./css/AvailabilityPicker.css";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import React, { useMemo } from "react";
import { InfoOutlined } from "@mui/icons-material";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

const AvailabilityPickerDay = (props: {
    day: AvailabilityDay,
    eventType: String,
    halfHourDisplayHeight: number,
    availabilityHeatmap: UserAvailabilityHeatmap,
    onMouseEnterHalfhour: (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: dayjs.Dayjs) => void,
    onMouseClickHalfhour: (day: AvailabilityDay, time: dayjs.Dayjs, isDelete: boolean) => void
}) => {

    const generateHours = useMemo((): JSX.Element[] => {
        let hours: JSX.Element[] = [];
    
        for (var i = 0; i < 24; i++) {
            let fullHourTime = props.day.forDate.hour(i);
            let halfHourTime = utils.createHalfHourFromFullHour(fullHourTime);

            hours.push(
                <AvailabilityPickerHour 
                    key={fullHourTime.unix()}
                    disabled={props.day.disabled}
                    dateTime={fullHourTime}
                    halfHourDisplayHeight={props.halfHourDisplayHeight}
                    currentTotalRespondents={props.availabilityHeatmap.maxNumberOfRespondents}
                    fullHourAvailableNames={props.availabilityHeatmap.getNamesAt(fullHourTime.unix())}
                    halfHourAvailableNames={props.availabilityHeatmap.getNamesAt(halfHourTime.unix())}
                    isFullHourSelected={props.day.availableTimes.some(a => utils.dayjsIsBetweenUnixExclusive(a.fromTime, fullHourTime, a.toTime))}
                    isHalfHourSelected={props.day.availableTimes.some(a => utils.dayjsIsBetweenUnixExclusive(a.fromTime, halfHourTime, a.toTime))}  
                    onMouseEnterHalfhour={(e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: dayjs.Dayjs): void => {
                        if (props.day.disabled) {
                            return;
                        }

                        props.onMouseEnterHalfhour(e, time);
                    }} 
                    onMouseClickOnHalfhour={(time: dayjs.Dayjs, isDelete: boolean): void => {
                        if (props.day.disabled) {
                            return;
                        }
                        
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
                    height={"50px"}
                >
                    <Typography>
                    {
                        (props.eventType === EventTypes.WEEK) && props.day.forDate.format("dddd")
                    }
                    {
                        (props.eventType === EventTypes.DAY) && "Any Day"
                    }
                    {
                        (props.eventType === EventTypes.DATE_RANGE || props.eventType === EventTypes.SPECIFIC_DATE) && props.day.forDate.format("LL")
                    }
                    {   
                        props.day.disabled &&
                        <Tooltip 
                            title={props.day.disabled ? "This day is disabled and only shown as a result of timezone differences between yourself and another respondent" : ""} 
                            placement="top" 
                            arrow
                        >
                            <InfoOutlined sx={{ ml: 1 }} fontSize="inherit" />
                        </Tooltip>
                    }
                    </Typography>
                </Box>

            <Divider></Divider>

            {generateHours}

        </Card>
    );
};

export default AvailabilityPickerDay;