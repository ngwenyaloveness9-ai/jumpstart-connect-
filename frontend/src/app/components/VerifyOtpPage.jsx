/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowLeft,
  Shield,
  RefreshCw,
  Moon,
  Sun,
} from "lucide-react";
import logo from "../../assets/images/jumpstart-logo.webp";

import { useTheme } from "./ThemeProvider";
import { authApi } from "../services/authApi";
import { routeUser } from "../utils/routeUser";

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState(
  location.state?.email ||
  localStorage.getItem("verification_email") ||
  ""
);
  const role = location.state?.role || "user";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    setCanResend(true);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;

    setOtp(next);
    setError("");

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pasted.length > 0) {
      const next = [...otp];

      pasted.split("").forEach((char, i) => {
        if (i < 6) {
          next[i] = char;
        }
      });

      setOtp(next);

      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      setCountdown(30);
      setCanResend(false);

      setOtp(["", "", "", "", "", ""]);

      inputs.current[0]?.focus();

      /*
       Future backend endpoint

       await authApi.resendOtp({
         email
       });
      */

      console.log("OTP resend requested");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await authApi.verifyOtp({
        email,
        otp: code,
      });

      console.log("OTP RESPONSE:", response);

      if (response.first_login) {
  navigate("/create-password", {
    state: {
      email,
      isFirstLogin: true
    }
  });

  return;
}

      if (response.token) {
        localStorage.setItem(
          "token",
          response.token
        );
      }

      if (response.user) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify(response.user)
        );

        navigate(
          routeUser(response.user)
        );

        return;
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Invalid OTP code."
      );
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email.includes("@")
    ? email.replace(
        /^(.{2})(.+)(@.+)$/,
        (_, a, b, c) =>
          a + "*".repeat(b.length) + c
      )
    : email;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative p-8">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun
            size={20}
            className="text-primary-foreground"
          />
        ) : (
          <Moon
            size={20}
            className="text-primary-foreground"
          />
        )}
      </button>

      <div className="w-full max-w-md relative">
        <button
          onClick={() => navigate("/login")}
          className="absolute -top-12 left-0 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to login
        </button>

        <div className="flex items-center gap-3 mb-10 justify-center">
  <img
    src={logo}
    alt="JumpStart Logo"
    className="w-14 h-14 object-contain"
  />

  <span className="text-foreground font-semibold text-xl">
    Jumpstart Connect
  </span>
</div>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield
              size={28}
              className="text-primary"
            />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Verify your identity
          </h1>
          
          <div className="mb-6">
  <label className="block text-sm text-muted-foreground mb-2">
    Email Address
  </label>

  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="employee@jumpstartyourcareer.co.za"
    className="w-full bg-input-background border border-border text-foreground px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
  />
</div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent a 6-digit code to{" "}
            <span className="text-foreground font-medium">
              {maskedEmail}
            </span>
            .
            <br />
            Enter it below to continue.
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="flex gap-3 justify-center mb-6"
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(i, e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(i, e)
                }
                className={`w-12 h-14 text-center text-xl font-bold bg-input-background border rounded-xl focus:outline-none transition-all
                ${
                  digit
                    ? "border-primary text-foreground"
                    : "border-border text-foreground"
                }
                focus:border-primary focus:ring-2 focus:ring-primary/20`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/15"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity text-sm mx-auto"
            >
              <RefreshCw size={14} />
              Resend code
            </button>
          ) : (
            <p className="text-muted-foreground text-sm">
              Resend code in{" "}
              <span className="text-foreground font-medium tabular-nums">
                {countdown}s
              </span>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Didn't receive a code?{" "}
          <a
            href="#"
            className="text-primary/70 hover:text-primary"
          >
            Contact IT Support
          </a>
        </p>
      </div>
    </div>
  );
}