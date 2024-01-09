import { Stack, Typography, useTheme } from '@mui/material';

export default function Header() {
    const theme = useTheme();

    return (
        <Stack 
            sx={{ height: "100px" }}
            direction="column"
            justifyContent="center"
        >
            <a href={window.location.origin}>
                <Typography 
                    align="center"
                    sx={{
                        fontFamily: "'Bungee Spice', sans-serif",
                        [theme.breakpoints.up("xs")]: {
                            fontSize: "2em"
                        },
                        [theme.breakpoints.up("sm")]: {
                            fontSize: "4em"
                        }
                    }}
                >
                    findtheti.me
                </Typography>
            </a>
        </Stack>
    );
}