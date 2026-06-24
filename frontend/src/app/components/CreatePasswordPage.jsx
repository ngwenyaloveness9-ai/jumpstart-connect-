import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  Circle,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { authApi } from "../services/authApi";
import logo from "../../assets/images/jumpstart-logo.webp";

function checkStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

const strengthLabels = {
  0: "",
  1: "Weak",
  2: "Fair",
  3: "Good",
  4: "Strong",
};

const strengthColors = {
  0: "",
  1: "bg-red-500",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-green-500",
};

const strengthTextColors = {
  0: "",
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-yellow-400",
  4: "text-green-400",
};

export function CreatePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const state = location.state || {};

  const email = state.email || "";
  const isFirstLogin = state.isFirstLogin || false;
  const isReset = state.isReset || false;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = checkStrength(password);

  const requirements = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "Uppercase and lowercase letters",
      met:
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      met: /\d/.test(password),
    },
    {
      label: "At least one special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (strength < 3) {
      setError("Please choose a stronger password.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.createPassword({
        email,
        password,
        confirm_password: confirm,
      });

      console.log(response);

      if (isReset) {
        navigate("/login", {
          state: {
            passwordReset: true,
          },
        });
        return;
      }

      navigate("/login", {
        state: {
          passwordCreated: true,
        },
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err.message ||
          "Unable to create password."
      );
    } finally {
      setLoading(false);
    }
  };

  const heading = isFirstLogin
    ? "Create your password"
    : isReset
    ? "Reset your password"
    : "Set a new password";

  const subtitle = isFirstLogin
    ? "Choose a strong password to secure your account."
    : isReset
    ? "Enter a new password for your account."
    : "Your new password must meet the security requirements below.";

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative p-8">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun size={20} className="text-primary-foreground" />
        ) : (
          <Moon size={20} className="text-primary-foreground" />
        )}
      </button>

      <div className="w-full max-w-md relative">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-primary rounded-full blur-3xl opacity-30"></div>

            <img
              src={logo}
              alt="JumpStart Logo"
              className="relative w-20 h-20 object-contain"
            />
          </div>

          <span className="text-foreground font-semibold text-xl mt-3">
            Jumpstart Connect
          </span>
        </div>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {heading}
          </h1>

          <p className="text-muted-foreground text-sm">
            {subtitle}
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              New Password
            </label>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock size={16} />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-input-background border border-border text-foreground pl-11 pr-11 py-3.5 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength >= level
                          ? strengthColors[strength]
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>

                {strength > 0 && (
                  <p className={`text-xs ${strengthTextColors[strength]}`}>
                    {strengthLabels[strength]}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock size={16} />
              </div>

              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-input-background border text-foreground pl-11 pr-11 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-1 transition-all ${
                  confirm.length > 0 && confirm !== password
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : confirm.length > 0 && confirm === password
                    ? "border-green-500/50 focus:border-green-500 focus:ring-green-500/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-4 space-y-2">
            {requirements.map((req) => (
              <div key={req.label} className="flex items-center gap-3">
                {req.met ? (
                  <CheckCircle2
                    size={14}
                    className="text-green-400 flex-shrink-0"
                  />
                ) : (
                  <Circle
                    size={14}
                    className="text-muted-foreground/40 flex-shrink-0"
                  />
                )}

                <span
                  className={`text-xs transition-colors ${
                    req.met
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/15 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              isReset ? "Reset Password" : "Set Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}