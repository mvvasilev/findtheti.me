import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'
import { useNavigate } from 'react-router-dom';

const ThankYouPage = () => {
    const navigate = useNavigate();

    return (
        <Grid container sx={{ p: 2 }} spacing={1}>
            <Grid xs={12}>
                <Typography variant={"h2"}>Thank You!</Typography>
            </Grid>
            <Grid xs={12}>
                <Typography>Your response has been recorded. Check in with the event organizer(s) for the exact date and time!</Typography>
            </Grid>
            <Grid xs={12}>
                <Typography>To view the available times of all attendees, feel free to <a href="#" onClick={() => navigate(-1)}>navigate back to the event page</a>.</Typography>
            </Grid>
        </Grid>
    );
}

export default ThankYouPage;