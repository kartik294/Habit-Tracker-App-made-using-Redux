// src/styles/theme.ts

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
    },
  },
});

export default theme;
