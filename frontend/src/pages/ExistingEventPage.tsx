import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Event, createEvent } from '../types/Event';
import Grid from '@mui/material/Unstable_Grid2'
import { Button, TextField, Typography } from "@mui/material";
import AvailabilityPicker from "../components/AvailabilityPicker";
import dayjs from "dayjs";
import utils from "../utils";

export default function ExistingEventPage() {
    let { eventId } = useParams();

    const [event, setEvent] = useState<Event>(createEvent());

    useEffect(() => {
        fetch(`/api/events/${eventId}`)
            .then(resp => resp.json())
            .then(resp => setEvent({
                name: resp.result?.name,
                description: resp.result?.description,
                fromDate: dayjs.utc(resp.result?.from_date),
                toDate: dayjs.utc(resp.result?.to_date),
                eventType: resp.result?.event_type,
                snowflakeId: resp.result?.snowflake_id,
                duration: resp.result?.duration
            }));
    }, [eventId]);

    return (
        <Grid container sx={{ p: 2 }} spacing={1}>
            <Grid xs={12}>
                <Typography>You've been invited to...</Typography>
            </Grid>
            <Grid xs={12}>
                <Typography variant="h4">{ event.name }</Typography>
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
                    (event.fromDate !== null && event.toDate !== null && event.eventType !== null) &&
                    <AvailabilityPicker 
                        fromDate={event.fromDate}
                        toDate={event.toDate}
                        eventType={event.eventType}
                        availabilityDurationInMinutes={event.duration}
                    />
                }
            </Grid>
            <Grid xs={0} md={3}></Grid>
            <Grid xs={12} md={6} container spacing={1}>
                <Grid xs={12} sm={9}>
                    <TextField
                        sx={{ width: "100%" }}
                        // TODO
                        // value={event.description}
                        // onChange={(e) => {
                        //     event.description = e.target.value;
                        //     setEvent({...event});
                        // }}
                        label="Your Name"
                    />
                </Grid>
                <Grid xs={12} sm={3}>
                    <Button sx={{ width: "100%", height: "100%" }} variant="contained">
                        <Typography>Submit</Typography>
                    </Button>
                </Grid>
            </Grid>
            <Grid xs={0} md={3}></Grid>
        </Grid>
    );
}