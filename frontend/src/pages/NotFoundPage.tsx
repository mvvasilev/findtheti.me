import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

const NotFoundPage = () => {
    return (
        <Grid container>
            <Grid xs={12}>
                <Typography variant={"h2"}>404 Not Found!</Typography>
            </Grid>
            <Grid xs={12}>
                <Typography>Not sure what you were looking for, but you won't find it here.</Typography>
            </Grid>
        </Grid>
    );
}

export default NotFoundPage;