import { createTheme, Theme } from "@mui/material/styles";

const MEC_GREEN = "#1a5c38";
const MEC_GREEN_DARK = "#0f3d24";
const MEC_GREEN_LIGHT = "#e8f4ee";
const MEC_ORANGE = "#e05a14";

const getTheme = (mode: "light" | "dark"): Theme => {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: MEC_GREEN,
        dark: MEC_GREEN_DARK,
        light: MEC_GREEN_LIGHT,
        contrastText: "#ffffff",
      },
      secondary: {
        main: MEC_ORANGE,
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
            backgroundColor: MEC_GREEN,
            "&:hover": { backgroundColor: MEC_GREEN_DARK },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: MEC_GREEN,
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
