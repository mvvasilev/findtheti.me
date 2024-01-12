import { Box, Typography } from "@mui/material";
import classNames from "classnames";
import utils from "../utils";
import "./css/AvailabilityPicker.css";
import dayjs, { Dayjs } from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import DisableableTooltip from "./DisableableTooltip";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

const AvailabilityPickerHour = (props: {
    dateTime: Dayjs,
    disabled: boolean,
    isFullHourSelected: boolean,
    isHalfHourSelected: boolean,
    halfHourDisplayHeight: number,
    currentTotalRespondents: number,
    fullHourAvailableNames: String[],
    halfHourAvailableNames: String[],
    onMouseEnterHalfhour: (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: Dayjs) => void,
    onMouseClickOnHalfhour: (time: Dayjs, isDelete: boolean) => void
}) => {
    const generateTooltipText = (names: String[]): String => {
        return `${names.length} ${names.length > 1 ? "people have" : "person has"} marked this time as available: ${names.join(", ")}`;
    }

    const determineCellColor = (isSelected: boolean, availableNames: String[], isDisabled: boolean) => {
        if (isDisabled) {
            return '#222222';
        }

        if (isSelected) {
            return '#338822';
        }

        if (availableNames.length > 0) {
            return heatMapColorforValue(availableNames.length);
        }

        return 'inherit';
    }

    const heatMapColorforValue = (value: number) => {
        var h = (1.0 - (value / props.currentTotalRespondents)) * 240
        return "hsl(" + h + ", 75%, 35%) !important";
    }

    return (
        <Box 
            //className={classNames({ "hour-light": isEvenHour, "hour-dark": !isEvenHour })}
            className={"hour-light"}
        >
            <DisableableTooltip 
                disabled={props.fullHourAvailableNames.length < 1} 
                title={generateTooltipText(props.fullHourAvailableNames)} 
                placement="top" 
                disableInteractive 
                followCursor={true} 
                arrow
                enterDelay={500}
            >
                <Box
                    sx={{
                        bgcolor: determineCellColor(props.isFullHourSelected, props.fullHourAvailableNames, props.disabled)
                    }}
                    className={classNames("full-hour", { "selected-availability": props.isFullHourSelected, "hour-disabled": props.disabled })}
                    height={props.halfHourDisplayHeight}
                    onMouseEnter={(e) => props.onMouseEnterHalfhour(e, props.dateTime)}
                    onMouseDown={(e) => {
                        if (e.button !== 0 && e.button !== 2) {
                            return;
                        }

                        props.onMouseClickOnHalfhour(props.dateTime, e.button === 2);
                    }}
                >
                    <Typography className={"noselect time-text"}>
                        { utils.formatTimeFromHourOfDay(props.dateTime.hour(), 0) }
                    </Typography>
                </Box>
            </DisableableTooltip>
            <DisableableTooltip 
                disabled={props.halfHourAvailableNames.length < 1} 
                title={generateTooltipText(props.halfHourAvailableNames)} 
                placement="top" 
                disableInteractive 
                followCursor={true} 
                arrow
                enterDelay={500}
            >
                <Box
                    sx={{
                        bgcolor: determineCellColor(props.isHalfHourSelected, props.halfHourAvailableNames, props.disabled)
                    }}
                    className={classNames("half-hour", { "selected-availability": props.isHalfHourSelected, "hour-disabled": props.disabled })}
                    height={props.halfHourDisplayHeight}
                    onMouseEnter={(e) => props.onMouseEnterHalfhour(e, utils.createHalfHourFromFullHour(props.dateTime))}
                    onMouseDown={(e) => {
                        if (e.button !== 0 && e.button !== 2) {
                            return;
                        }

                        props.onMouseClickOnHalfhour(utils.createHalfHourFromFullHour(props.dateTime), e.button === 2);
                    }}
                />
            </DisableableTooltip>
        </Box>
    );
}

export default AvailabilityPickerHour;