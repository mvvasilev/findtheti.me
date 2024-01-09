import { ThemeProvider } from "@emotion/react";
import { CssBaseline, Divider, Paper, createTheme } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'
import GithubCorner from "react-github-corner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs";
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const theme = createTheme({
    palette: {
      mode: 'dark',
    }
});

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>

            <GithubCorner
                href={"https://github.com/mvvasilev/findtheti.me"}
                bannerColor="#FD6C6C"
                octoColor="inherit"
                size={80}
                direction="right" 
            />

            <Paper
                component="main"
                sx={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translate(-50%, 0)",
                    width: {
                        xs: "100%",
                        lg: "1000px"
                    },
                    [theme.breakpoints.up('lg')]: {
                        top: "25px",
                        width: "1000px"
                    }
                }}
            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container>
                        <Grid xs={12}>
                            <Header />
                        </Grid>
                        <Grid xs={12}>
                            <Divider></Divider>
                        </Grid>
                        <Grid xs={12}>
                            {props.children}
                        </Grid>
                        <Grid xs={12}>
                            <Divider></Divider>
                        </Grid>
                        <Grid xs={12}>
                            <Footer />
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </Paper>
        </ThemeProvider>
    );
};