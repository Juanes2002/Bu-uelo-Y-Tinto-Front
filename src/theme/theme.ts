import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
    },
    secondary: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
    },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "25px",
          textTransform: "none",
          padding: "8px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});
