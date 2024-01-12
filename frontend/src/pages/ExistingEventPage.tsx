import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Event, EventTypes, createEvent } from '../types/Event';
import Grid from '@mui/material/Unstable_Grid2'
import { Button, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import AvailabilityPicker from "../components/AvailabilityPicker";
import dayjs, { Dayjs } from "dayjs";
import utils from "../utils";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import duration from 'dayjs/plugin/duration';
import { AvailabilityDay, UserAvailabilityHeatmap } from "../types/Availabilities";
import toast from "react-hot-toast";
import { ContentCopy as CopyToClipboardIcon } from '@mui/icons-material'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(duration);

export default function ExistingEventPage() {
    const navigate = useNavigate(); 

    let { eventId } = useParams();

    const [canSubmit, setCanSubmit] = useState<boolean>(false);
    const [event, setEvent] = useState<Event>(createEvent());
    const [days, setDays] = useState<AvailabilityDay[]>([]);
    const [availabilityHeatmap, setAvailabilityHeatmap] = useState<UserAvailabilityHeatmap | undefined>();
    const [userName, setUserName] = useState<String | undefined>(undefined);

    useEffect(() => {
        utils.showSpinner();

        let localTimezone = dayjs.tz.guess();
        
        Promise.all([
            utils.performRequest(`/api/events/${eventId}`)
                .then(result => setEvent({
                    name: result?.name,
                    description: result?.description,
                    fromDate: dayjs.utc(result?.from_date),
                    toDate: dayjs.utc(result?.to_date),
                    eventType: result?.event_type,
                    snowflakeId: result?.snowflake_id,
                    duration: result?.duration
                }))
                .catch(e => toast.error(e)),
        
            utils.performRequest(`/api/events/${eventId}/availabilities`)
                .then((result: [{ id: number, from_date: string, to_date: string, user_name: string }]) => {
                    let heatmap = new UserAvailabilityHeatmap();

                    const LENGTH_OF_30_MINUTES_IN_SECONDS = 1800;

                    for (const availability of result) {
                        let start = dayjs(availability.from_date).tz(localTimezone);
                        let end = dayjs(availability.to_date).tz(localTimezone);

                        let startUnix = start.unix();
                        let endUnix = end.unix();

                        for (var timeInUnix = startUnix; timeInUnix <= endUnix; timeInUnix += LENGTH_OF_30_MINUTES_IN_SECONDS) {
                            heatmap.addName(timeInUnix, availability.user_name);
                        }
                    }

                    setAvailabilityHeatmap(heatmap);
                })
                .catch(e => toast.error(e))
        ])
        .finally(() => utils.hideSpinner());;

    }, [eventId]);

    useEffect(() => {
        document.title = `findtheti.me - ${event.name}`;

        const ogTitleMeta = document.querySelector('meta[property="og:title"]');
        const ogUrlMeta = document.querySelector('meta[property="og:url"]');
        const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');

        // Update the content of the Open Graph meta tags
        if (ogTitleMeta) {
          ogTitleMeta.setAttribute('content', `findtheti.me - ${event.name}`);
        }

        if (ogDescriptionMeta) {
            ogDescriptionMeta.setAttribute('content', `${event.description || 'A simple to use scheduling assistant'}`);
        }

        if (ogUrlMeta) {
            ogUrlMeta.setAttribute('content', `${window.location.origin}/${eventId}`)
        }

    }, [event])

    useEffect(() => {
        if (event.fromDate === null || event.toDate === null || event.eventType === null) {
            return;
        }

        let localTimezone = dayjs.tz.guess();

        let localFromDate = event.fromDate.tz(localTimezone);
        let localToDate = event.toDate.tz(localTimezone);

        switch (event.eventType) {
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
    }, [event]);

    useEffect(() => {
        var valid = !utils.isNullOrUndefined(userName) && userName !== "";

        valid &&= days.some(day => day.availableTimes.length > 0);

        setCanSubmit(valid);
    }, [userName, days]);

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

    const submitAvailabilities = () => {
        utils.showSpinner();

        let body = {
            user_name: userName,
            availabilities: days.flatMap(day => day.availableTimes.map(a => {
                return {
                    from_date: a.fromTime.utc(),
                    to_date: a.toTime.utc()
                }
            }))
        };

        utils.performRequest(`/api/events/${eventId}/availabilities`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })
        .then(_ => navigate("/thank-you"))
        .catch(e => toast.error(e))
        .finally(() => utils.hideSpinner());
    };

    return (
        <Grid container sx={{ p: 2 }} spacing={1}>
            <Grid xs={12}>
                <Typography>You've been invited to...</Typography>
            </Grid>
            <Grid xs={12}>
                <Typography variant="h4" sx={{ wordBreak: "break-word" }} noWrap={false}>
                    { event.name }
                    <Tooltip
                        title={"Copy invite to clipboard"}
                        arrow
                    >
                        <IconButton onClick={() => {
                            navigator.clipboard.writeText(window.location.toString());
                            toast('Copied to clipboard', { icon: <CopyToClipboardIcon/> });
                        }}>
                            <CopyToClipboardIcon/>
                        </IconButton>
                    </Tooltip>
                </Typography>
            </Grid>
            {
                (event.description !== null) &&
                <Grid xs={12}>
                    <Typography>{ event.description }</Typography>
                </Grid>
            }
            <Grid xs={12}>
                <Typography>
                    This event lasts for { utils.formatMinutesAsHoursMinutes(event.duration) }. When will you be available to attend?
                </Typography>
            </Grid>
            <Grid xs={12}>
                {
                    (event.fromDate !== null && event.toDate !== null && event.eventType !== null && availabilityHeatmap) &&
                    <AvailabilityPicker 
                        days={days}
                        setDays={(days) => setDays(days)}
                        availabilityHeatmap={availabilityHeatmap}
                        eventType={event.eventType}
                        availabilityDurationInMinutes={event.duration}
                    />
                }
                <Typography pt={1} fontSize={"0.65em"}>
                    Date and times are in your local timezone. Left-click to select when you're available, right-click to remove the highlighted hours.
                </Typography>
            </Grid>
            <Grid xs={0} md={3}></Grid>
            <Grid xs={12} md={6} container spacing={1}>
                <Grid xs={12} sm={9}>
                    <TextField
                        sx={{ width: "100%" }}
                        value={userName || ""}
                        onChange={(e) => {
                            if (e.target.value?.length > 100) {
                                e.preventDefault();
                                return;
                            }

                            setUserName(e.target.value);
                        }}
                        label="Your Name"
                    />
                </Grid>
                <Grid xs={12} sm={3}>
                    <Button 
                        sx={{ width: "100%", height: "100%" }} 
                        variant="contained" 
                        disabled={!canSubmit}
                        onClick={(_) => submitAvailabilities()}
                    >
                        <Typography>Submit</Typography>
                    </Button>
                </Grid>
            </Grid>
            <Grid xs={0} md={3}></Grid>
        </Grid>
    );
}