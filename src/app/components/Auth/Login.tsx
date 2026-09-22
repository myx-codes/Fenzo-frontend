import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  ArrowForwardRounded as ArrowIcon,
  CheckRounded as CheckIcon,
  LockOutlined as LockIcon,
  PersonOutlineRounded as PersonIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useHistory, useLocation } from "react-router-dom";
import { useGlobals } from "../../hooks/useGlobals";
import { Messages } from "../../../lib/config";
import "../../../css/auth.css";

const loginBenefits = [
  "Track every order in one place",
  "Keep your favorites close",
  "Enjoy a faster checkout",
];

export function Login() {
  const history = useHistory();
  const location = useLocation();
  const { login, t } = useGlobals();

  const [userNick, setUserNick] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!userNick.trim() || !userPassword) {
      setError(Messages.errorValidation);
      return;
    }

    setLoading(true);
    try {
      await login({ userNick: userNick.trim(), userPassword });
      const requestedPath = new URLSearchParams(location.search).get("redirect");
      const safeRedirect = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/";
      history.replace(safeRedirect);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          Messages.errorLogin
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-labelledby="login-heading">
        <aside className="auth-story" aria-label="FENZO membership benefits">
          <div className="auth-brand">
            <span className="auth-brand-mark" aria-hidden="true">F</span>
            <span>FENZO</span>
          </div>

          <div className="auth-story-copy">
            <p className="auth-eyebrow">Welcome back</p>
            <h1 className="auth-story-title">
              Your favorites are <span>waiting.</span>
            </h1>
            <p className="auth-story-description">
              Sign in to continue shopping, follow your orders, and discover picks
              chosen around what you love.
            </p>
          </div>

          <div className="auth-benefits">
            {loginBenefits.map((benefit) => (
              <div className="auth-benefit" key={benefit}>
                <span className="auth-benefit-icon" aria-hidden="true">
                  <CheckIcon sx={{ fontSize: 18 }} />
                </span>
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="auth-form-column">
          <div className="auth-form-wrap">
            <p className="auth-form-eyebrow">Member access</p>
            <h2 className="auth-form-title" id="login-heading">
              {t("loginTitle")}
            </h2>
            <p className="auth-form-subtitle">
              Enter your details to continue to your FENZO account.
            </p>

            {error && (
              <Alert
                className="auth-alert"
                id="login-error"
                severity="error"
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <Box className="auth-form" component="form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="login-username">
                  {t("username")}
                </label>
                <TextField
                  className="auth-field"
                  id="login-username"
                  fullWidth
                  value={userNick}
                  onChange={(event) => setUserNick(event.target.value)}
                  placeholder="your_username"
                  required
                  autoComplete="username"
                  disabled={loading}
                  inputProps={{
                    "aria-describedby": error ? "login-error" : undefined,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ fontSize: 20 }} aria-hidden="true" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="login-password">
                  {t("password")}
                </label>
                <TextField
                  className="auth-field"
                  id="login-password"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={userPassword}
                  onChange={(event) => setUserPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  inputProps={{
                    "aria-describedby": error ? "login-error" : undefined,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 20 }} aria-hidden="true" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          aria-pressed={showPassword}
                          onClick={() => setShowPassword((visible) => !visible)}
                          edge="end"
                          size="small"
                          disabled={loading}
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 19 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 19 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <Button
                className="auth-submit"
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={!loading ? <ArrowIcon /> : undefined}
              >
                {loading ? (
                  <>
                    <CircularProgress size={19} color="inherit" sx={{ mr: 1 }} />
                    {t("signingIn")}
                  </>
                ) : (
                  t("login")
                )}
              </Button>

              <div className="auth-switch">
                <span className="auth-switch-text">Don&apos;t have an account?</span>{" "}
                <Button
                  className="auth-switch-button"
                  type="button"
                  onClick={() => history.push("/signup")}
                  disabled={loading}
                >
                  {t("signUp")}
                </Button>
              </div>
            </Box>

            <p className="auth-legal">
              By signing in, you agree to FENZO&apos;s terms and privacy policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
