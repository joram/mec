import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import getTheme from "./theme";
import { ThemeContextProvider, useThemeMode } from "./context/ThemeContext";

function AppWithTheme() {
  const { mode } = useThemeMode();
  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <AppWithTheme />
      </ThemeContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
