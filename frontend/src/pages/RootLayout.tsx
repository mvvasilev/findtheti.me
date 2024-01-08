import { ThemeProvider } from "@emotion/react";
import { Box, CssBaseline, createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
      mode: 'dark',
    }
});

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>

            <Box
                component="main"
                sx={{
                    position: "absolute",
                    top: "0",
                    left: "50%",
                    transform: "translate(-50%, 0)",
                    width: {
                        xs: "100%",
                        lg: "1000px"
                    }
                }}
            >
                {props.children}
            </Box>
        </ThemeProvider>
    );
};