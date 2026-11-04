import { ThemeOptions } from "@mui/material/styles";

// CSS variables share the same type roles between MUI and page styles.
const typography: ThemeOptions["typography"] = {
  fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1: { fontSize: "var(--fz-type-page)", fontWeight: 650, lineHeight: 1.2, letterSpacing: "-0.025em" },
  h2: { fontSize: "var(--fz-type-section)", fontWeight: 650, lineHeight: 1.25, letterSpacing: "-0.02em" },
  h3: { fontSize: "var(--fz-type-heading)", fontWeight: 650, lineHeight: 1.3 },
  h4: { fontSize: "var(--fz-type-heading)", fontWeight: 650, lineHeight: 1.3 },
  h5: { fontSize: "var(--fz-type-lead)", fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: "var(--fz-type-input)", fontWeight: 600, lineHeight: 1.4 },
  body1: { fontSize: "var(--fz-type-body)", lineHeight: 1.6 },
  body2: { fontSize: "var(--fz-type-body)", lineHeight: 1.6 },
  subtitle1: { fontSize: "var(--fz-type-input)", lineHeight: 1.5 },
  subtitle2: { fontSize: "var(--fz-type-body)", fontWeight: 600, lineHeight: 1.5 },
  caption: { fontSize: "var(--fz-type-caption)", lineHeight: 1.5 },
  overline: { fontSize: "var(--fz-type-caption)", fontWeight: 600, lineHeight: 1.5, letterSpacing: "0.08em" },
  button: { fontSize: "var(--fz-type-body)", fontWeight: 600, lineHeight: 1.4, textTransform: "none" },
};

export default typography;
