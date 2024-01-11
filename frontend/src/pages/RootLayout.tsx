import { ThemeProvider } from "@emotion/react";
import { Backdrop, CircularProgress, CssBaseline, Divider, Paper, createTheme } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'
import GithubCorner from "react-github-corner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import utils from "../utils";

dayjs.extend(utc);

const theme = createTheme({
    palette: {
      mode: 'dark',
    }
});

const RootLayout = (props: { children: React.ReactNode }) => {

    const [spinner, showSpinner] = useState<boolean>(false);

    useEffect(() => {
        window.addEventListener("onSpinnerStatusChange", () => {
            showSpinner(utils.isSpinnerShown());
        });
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>

            {
                <Backdrop
                    sx={{
                        color: '#fff',
                        zIndex: 2147483647
                    }}
                    open={spinner}
                >
                    <CircularProgress
                        sx={{
                            position: "absolute",
                            zIndex: 2147483647,
                            top: "50%",
                            left: "50%"
                        }}
                    />
                </Backdrop>
            }

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

            <Toaster
                toastOptions={{
                    success: {
                        style: {
                            background: '#dad7cd',
                        },
                    },
                    error: {
                        style: {
                            background: '#ff8fab',
                        },
                    },
                }}
            />
        </ThemeProvider>
    );
};

export default RootLayout;