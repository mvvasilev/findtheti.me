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
    isFullHourSelected: boolean,
    isHalfHourSelected: boolean,
    halfHourDisplayHeight: number,
    namesMarkedFullHourAsAvailable: String[],
    namesMarkedHalfHourAsAvailable: String[],
    onMouseEnterHalfhour: (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>, time: Dayjs) => void,
    onMouseClickOnHalfhour: (time: Dayjs, isDelete: boolean) => void
}) => {
    const generateTooltipText = (names: String[]): String => {
        return `${names.length} ${names.length > 1 ? "people have" : "person has"} marked this time as available: ${names.join(", ")}`;
    }

    return (
        <Box 
            //className={classNames({ "hour-light": isEvenHour, "hour-dark": !isEvenHour })}
            className={"hour-light"}
        >
            <DisableableTooltip 
                disabled={props.namesMarkedFullHourAsAvailable.length < 1} 
                title={generateTooltipText(props.namesMarkedFullHourAsAvailable)} 
                placement="top" 
                disableInteractive 
                followCursor={true} 
                arrow
                enterDelay={500}
            >
                <Box
                    className={classNames("full-hour", `hour-available-${props.namesMarkedFullHourAsAvailable.length}`, { "selected-availability": props.isFullHourSelected })}
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
                disabled={props.namesMarkedHalfHourAsAvailable.length < 1} 
                title={generateTooltipText(props.namesMarkedHalfHourAsAvailable)} 
                placement="top" 
                disableInteractive 
                followCursor={true} 
                arrow
                enterDelay={500}
            >
                <Box
                    className={classNames("half-hour", `hour-available-${props.namesMarkedHalfHourAsAvailable.length}`, { "selected-availability": props.isHalfHourSelected })}
                    height={props.halfHourDisplayHeight}
                    onMouseEnter={(e) => props.onMouseEnterHalfhour(e, props.dateTime.add(30, "minutes"))}
                    onMouseDown={(e) => {
                        if (e.button !== 0 && e.button !== 2) {
                            return;
                        }

                        props.onMouseClickOnHalfhour(props.dateTime.add(30, "minutes"), e.button === 2);
                    }}
                />
            </DisableableTooltip>
        </Box>
    );
}

export default AvailabilityPickerHour;