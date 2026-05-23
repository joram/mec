import { createTheme, Theme } from "@mui/material/styles";

const GOS_BLUE = "#1e3a5f";
const GOS_BLUE_DARK = "#0f2140";
const GOS_BLUE_LIGHT = "#e8f0f9";
const GOS_AMBER = "#d4861a";

const getTheme = (mode: "light" | "dark"): Theme => {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: GOS_BLUE,
        dark: GOS_BLUE_DARK,
        light: GOS_BLUE_LIGHT,
        contrastText: "#ffffff",
      },
      secondary: {
        main: GOS_AMBER,
        contrastText: "#ffffff",
      },
      background: {
        default: isLight ? "#f5f5f5" : "#121212",
        paper: isLight ? "#ffffff" : "#1e1e1e",
      },
      text: {
        primary: isLight ? "#1a1a1a" : "#ffffff",
        secondary: isLight ? "#555555" : "#b0b0b0",
      },
    },
    typography: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      h1: { fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, letterSpacing: "-0.01em" },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 4 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            padding: "10px 24px",
            fontSize: "0.9375rem",
          },
          containedPrimary: {
            backgroundColor: GOS_BLUE,
            "&:hover": { backgroundColor: GOS_BLUE_DARK },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: GOS_BLUE,
            boxShadow: "none",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.30)",
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
            "&:hover": {
              boxShadow: isLight ? "0 4px 16px rgba(0,0,0,0.15)" : "0 4px 16px rgba(0,0,0,0.40)",
              transform: "translateY(-2px)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 4 },
        },
      },
    },
  });
};

export default getTheme;
