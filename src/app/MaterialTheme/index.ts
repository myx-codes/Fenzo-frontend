import { createTheme } from "@mui/material/styles";
import shadow from "./shadow";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0073e9",
      dark: "#0052b3",
      light: "#eaf4ff",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffc400",
      dark: "#d99a00",
      light: "#fff7d6",
      contrastText: "#101828",
    },
    background: {
      default: "#f5f6fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#101828",
      secondary: "#667085",
    },
    divider: "rgba(16, 24, 40, 0.08)",
    success: { main: "#16855b" },
    warning: { main: "#dc8b1f" },
    error: { main: "#e52528" },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: shadow as any,
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.04 },
    h2: { fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08 },
    h3: { fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.12 },
    h4: { fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.16 },
    h5: { fontWeight: 750, letterSpacing: "-0.02em", lineHeight: 1.2 },
    h6: { fontWeight: 750, letterSpacing: "-0.015em", lineHeight: 1.25 },
    button: { fontWeight: 750, textTransform: "none" },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { minHeight: "100%", background: "#f4f6f8" },
        body: {
          minHeight: "100%",
          margin: 0,
          color: "#101828",
          background: "#f4f6f8",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "::selection": { color: "#ffffff", background: "#0073e9" },
        "*:focus-visible": {
          outline: "3px solid rgba(0, 115, 233, 0.28)",
          outlineOffset: "2px",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: { height: "auto" },
        maxWidthLg: { maxWidth: "1280px" },
        maxWidthXl: { maxWidth: "1380px" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 6,
          paddingInline: 18,
          fontWeight: 750,
          letterSpacing: 0,
          textTransform: "none",
        },
        containedPrimary: {
          boxShadow: "none",
          "&:hover": {
            background: "#0052b3",
            boxShadow: "none",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(16, 24, 40, 0.07)",
          borderRadius: 8,
          backgroundImage: "none",
          boxShadow:
            "0 1px 3px rgba(16, 24, 40, 0.04), 0 14px 38px rgba(16, 24, 40, 0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          background: "#fafafd",
          transition: "background .2s ease, box-shadow .2s ease",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 115, 233, 0.45)",
          },
          "&.Mui-focused": {
            background: "#ffffff",
            boxShadow: "0 0 0 3px rgba(0, 115, 233, 0.10)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0073e9",
          },
        },
        notchedOutline: { borderColor: "rgba(16, 24, 40, 0.12)" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 700 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 10, padding: "7px 10px", fontWeight: 650 },
      },
    },
  },
});

export default theme;
