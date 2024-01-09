import { Stack, Typography } from '@mui/material';

export default function Footer() {
    return (
        <Stack 
            sx={{ height: "50px" }}
            direction="column"
            justifyContent="center"
        >
            <Typography align="center">
                Created by <a href="https://mvvasilev.dev">mvvasilev</a> | <a href="https://github.com/mvvasilev/findtheti.me">Github</a>
            </Typography>
        </Stack>
    );
}