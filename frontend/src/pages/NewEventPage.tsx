import { Alert, Button, MenuItem, Select, Slider, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'
import { DateTimePicker } from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"
import { Event, EventTypes, createEvent } from '../types/Event';
import utils from '../utils';

export default function NewEventPage() {
    const navigate = useNavigate(); 

    const [event, setEvent] = useState<Event>(createEvent());
    const [isEventValid, setEventValid] = useState<Boolean>(false);

    useEffect(() => {
        validateEvent();
    }, [event])

    function validateEvent(): void {
        console.log(event);
        var valid: boolean = true;

        valid &&= event.name && event.name !== "";
        valid &&= event.eventType !== EventTypes.UNKNOWN || event.eventType !== null;

        if (event.eventType === EventTypes.DATE_RANGE) {
            valid &&= event.fromDate !== null;
            valid &&= event.toDate !== null;
        }

        if (event.eventType === EventTypes.SPECIFIC_DATE) {
            valid &&= event.fromDate !== null;
        }

        setEventValid(valid);
    }

    function saveEvent() {
        fetch("/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from_date: event.fromDate?.utc().format(),
                to_date: event.toDate?.utc().format(),
                name: event.name,
                description: event.description,
                event_type: event.eventType,
                duration: event.duration
            })
        })
        .then(resp => resp.json())
        .then(resp => {
            navigate(resp.result.snowflake_id)
        })
    }

    return (
        <Grid container>
            <Grid xs={12} spacing={1}>
                <h2>Create New Event</h2>
            </Grid>
            <Grid xs={0} sm={2} md={4}></Grid>
            <Grid sx={{ p: 2 }} container spacing={1} xs={12} sm={8} md={4}>
                <Grid xs={12}>
                    <TextField
                        sx={{ width: "100%" }}
                        value={event.name}
                        onChange={(e) => {
                            event.name = e.target.value;
                            setEvent({...event});
                        }}
                        label="I'm organizing a(n)..."
                    />
                </Grid>
                <Grid xs={12}>
                    <TextField
                        sx={{ width: "100%" }}
                        value={event.description}
                        onChange={(e) => {
                            event.description = e.target.value;
                            setEvent({...event});
                        }}
                        label="More details... ( Optional )"
                    />
                </Grid>
                <Grid xs={12}>
                    <Typography>
                        Duration
                    </Typography>
                    <Slider 
                        sx={{ width: "90%" }}
                        step={30}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(val) => utils.formatMinutesAsHoursMinutes(val)}
                        marks={
                            [
                                {
                                    value: 30,
                                    label: "30m"
                                },
                                {
                                    value: 120,
                                    label: "2h"
                                },
                                {
                                    value: 240,
                                    label: "4h"
                                },
                                {
                                    value: 360,
                                    label: "6h"
                                },
                                {
                                    value: 480,
                                    label: "8h"
                                }
                            ]
                        }
                        min={30}
                        max={480}
                        value={event.duration}
                        onChange={(_, val) => {
                            event.duration = val as number;
                            setEvent({...event});
                        }}
                    />
                </Grid>
                <Grid xs={12}>
                    <Select
                        sx={{ width: "100%" }}
                        value={event.eventType}
                        onChange={(e) => {
                            event.eventType = e.target.value;
                            setEvent({...event});
                        }}
                    >
                        <MenuItem value={EventTypes.UNKNOWN} disabled>Event Type</MenuItem>
                        <MenuItem value={EventTypes.SPECIFIC_DATE}>Exact Date</MenuItem>
                        <MenuItem value={EventTypes.DATE_RANGE}>Between</MenuItem>
                        <MenuItem value={EventTypes.DAY}>Daily</MenuItem>
                        <MenuItem value={EventTypes.WEEK}>Weekly</MenuItem>
                    </Select>
                </Grid>
                {
                    event.eventType == EventTypes.SPECIFIC_DATE &&
                    <Grid xs={12}>
                        <DateTimePicker
                            sx={{ width: "100%" }}
                            value={event.fromDate}
                            onChange={(value) => {
                                event.fromDate = value ?? null;
                                setEvent({...event});
                            }}
                            label="When"
                        />
                    </Grid>
                }
                {
                    event.eventType == EventTypes.DATE_RANGE &&
                    <Grid xs={12} sm={6}>
                        <DateTimePicker
                            sx={{ width: "100%" }}
                            value={event.fromDate}
                            onChange={(value) => {
                                event.fromDate = value ?? null;
                                setEvent({...event});
                            }}
                            label="From"
                        />
                    </Grid>
                }
                {
                    event.eventType == EventTypes.DATE_RANGE &&
                    <Grid xs={12} sm={6}>
                        <DateTimePicker
                            sx={{ width: "100%" }}
                            value={event.toDate}
                            onChange={(value) => {
                                event.toDate = value ?? null;
                                setEvent({...event});
                            }}
                            label="To"
                        />
                    </Grid>
                }
                {
                    (event.eventType == EventTypes.DAY || event.eventType == EventTypes.WEEK || event.eventType == EventTypes.MONTH) &&
                    <Grid xs={12}>
                        <Alert severity={"info"}>
                            <Typography>Selecting the Day type will allow attendees to select their availability during an unspecified {event.eventType}</Typography>
                        </Alert>
                    </Grid>
                }
                <Grid xs={12}>
                    <Button 
                        disabled={!isEventValid}
                        sx={{ width: "100%" }} 
                        variant={"contained"}
                        onClick={saveEvent}
                    >
                        <Typography>Create</Typography>
                    </Button>
                </Grid>
            </Grid>
            <Grid xs={0} sm={2} md={4}></Grid>
        </Grid>
    );
}
