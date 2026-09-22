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
  CheckCircleOutlineRounded as CheckIcon,
  CheckRounded as BenefitIcon,
  LockOutlined as LockIcon,
  PersonOutlineRounded as PersonIcon,
  PhoneOutlined as PhoneIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useHistory } from "react-router-dom";
import { useGlobals } from "../../hooks/useGlobals";
import { Messages } from "../../../lib/config";
import "../../../css/auth.css";

interface StrengthResult {
  score: number;
  label: string;
  color: string;
}

const signupBenefits = [
  "A personal shopping space",
  "Saved products across devices",
  "Simple and secure checkout",
];

function getStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: "", color: "#e4e7ec" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: StrengthResult[] = [
    { score: 0, label: "", color: "#e4e7ec" },
    { score: 1, label: "Very weak", color: "#d92d20" },
    { score: 2, label: "Weak", color: "#f79009" },
    { score: 3, label: "Fair", color: "#f79009" },
    { score: 4, label: "Strong", color: "#12b76a" },
    { score: 5, label: "Very strong", color: "#12b76a" },
  ];

  return levels[score];
}

export function Signup() {
  const history = useHistory();
  const { signup, t } = useGlobals();

  const [userNick, setUserNick] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(userPassword);
  const passwordsMatch = confirmPassword.length > 0 && userPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && userPassword !== confirmPassword;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!userNick.trim() || !userPhone.trim() || !userPassword) {
      setError(Messages.errorValidation);
      return;
    }

    if (userPassword !== confirmPassword) {
      setError(Messages.errorPasswordMatch);
      return;
    }

    setLoading(true);
    try {
      await signup({
        userNick: userNick.trim(),
        userPhone: userPhone.trim(),
        userPassword,
      });
      history.push("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          Messages.errorUserExists
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-labelledby="signup-heading">
        <aside className="auth-story" aria-label="FENZO membership benefits">
          <div className="auth-brand">
            <span className="auth-brand-mark" aria-hidden="true">F</span>
            <span>FENZO</span>
          </div>

          <div className="auth-story-copy">
            <p className="auth-eyebrow">Start your journey</p>
            <h1 className="auth-story-title">
              Discover more. <span>Shop your way.</span>
            </h1>
            <p className="auth-story-description">
              Create your account and make every visit more personal, from saved
              finds to effortless order tracking.
            </p>
          </div>

          <div className="auth-benefits">
            {signupBenefits.map((benefit) => (
              <div className="auth-benefit" key={benefit}>
                <span className="auth-benefit-icon" aria-hidden="true">
                  <BenefitIcon sx={{ fontSize: 18 }} />
                </span>
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="auth-form-column">
          <div className="auth-form-wrap">
            <p className="auth-form-eyebrow">Create an account</p>
            <h2 className="auth-form-title" id="signup-heading">
              {t("signupTitle")}
            </h2>
            <p className="auth-form-subtitle">
              Join FENZO in a few moments. All fields marked required must be completed.
            </p>

            {error && (
              <Alert
                className="auth-alert"
                id="signup-error"
                severity="error"
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <Box className="auth-form" component="form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="signup-username">
                  {t("username")}
                </label>
                <TextField
                  className="auth-field"
                  id="signup-username"
                  fullWidth
                  value={userNick}
                  onChange={(event) => setUserNick(event.target.value)}
                  placeholder="your_username"
                  required
                  autoComplete="username"
                  disabled={loading}
                  inputProps={{
                    "aria-describedby": error ? "signup-error" : undefined,
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
                <label className="auth-field-label" htmlFor="signup-phone">
                  {t("phone")}
                </label>
                <TextField
                  className="auth-field"
                  id="signup-phone"
                  fullWidth
                  value={userPhone}
                  onChange={(event) => setUserPhone(event.target.value)}
                  placeholder="+998 90 123 45 67"
                  required
                  autoComplete="tel"
                  disabled={loading}
                  inputProps={{
                    inputMode: "tel",
                    "aria-describedby": error ? "signup-error" : undefined,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ fontSize: 20 }} aria-hidden="true" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="signup-password">
                  {t("password")}
                </label>
                <TextField
                  className="auth-field"
                  id="signup-password"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={userPassword}
                  onChange={(event) => setUserPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  inputProps={{ "aria-describedby": "password-strength signup-error" }}
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

                {userPassword && (
                  <div
                    className="auth-strength"
                    id="password-strength"
                    role="progressbar"
                    aria-label="Password strength"
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-valuenow={strength.score}
                    aria-valuetext={strength.label}
                  >
                    <div className="auth-strength-track" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((segment) => (
                        <span
                          className="auth-strength-segment"
                          key={segment}
                          style={{
                            backgroundColor:
                              strength.score >= segment ? strength.color : undefined,
                          }}
                        />
                      ))}
                    </div>
                    <p className="auth-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="signup-confirm-password">
                  {t("confirmPassword")}
                </label>
                <TextField
                  className={`auth-field${passwordsMatch ? " auth-field-success" : ""}`}
                  id="signup-confirm-password"
                  fullWidth
                  type={showConfirmation ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  error={passwordsMismatch}
                  inputProps={{
                    "aria-describedby": passwordsMismatch
                      ? "password-mismatch signup-error"
                      : "signup-error",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 20 }} aria-hidden="true" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {passwordsMatch && (
                          <CheckIcon sx={{ mr: 0.4, color: "#12b76a", fontSize: 19 }} />
                        )}
                        <IconButton
                          aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"}
                          aria-pressed={showConfirmation}
                          onClick={() => setShowConfirmation((visible) => !visible)}
                          edge="end"
                          size="small"
                          disabled={loading}
                        >
                          {showConfirmation ? (
                            <VisibilityOff sx={{ fontSize: 19 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 19 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {passwordsMismatch && (
                  <p className="auth-field-message" id="password-mismatch" role="alert">
                    {Messages.errorPasswordMatch}
                  </p>
                )}
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
                    {t("creatingAccount")}
                  </>
                ) : (
                  t("signUp")
                )}
              </Button>

              <div className="auth-switch">
                <span className="auth-switch-text">Already have an account?</span>{" "}
                <Button
                  className="auth-switch-button"
                  type="button"
                  onClick={() => history.push("/login")}
                  disabled={loading}
                >
                  {t("login")}
                </Button>
              </div>
            </Box>

            <p className="auth-legal">
              By creating an account, you agree to FENZO&apos;s terms and privacy policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
