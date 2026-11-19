import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import logo from "../../assets/images/jumpstart-logo.webp";
import "../../styles/jyc-landing.css";

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  const setLight = () => {
    if (theme !== "light") {
      toggleTheme();
    }
  };

  const setDark = () => {
    if (theme !== "dark") {
      toggleTheme();
    }
  };

  return (
    <main
      className={`jyc-intro ${
        theme === "light" ? "light" : "dark"
      }`}
    >

      <div className="jyc-intro-overlay" />

<div className="jyc-intro-waves" aria-hidden="true">
  <span className="wave wave-1" />
  <span className="wave wave-2" />
  <span className="wave wave-3" />
  <span className="wave wave-4" />
</div>

      <div
        className="jyc-intro-bubbles"
        aria-hidden="true"
      >
        <span className="bubble bubble-1" />
        <span className="bubble bubble-2" />
        <span className="bubble bubble-3" />
        <span className="bubble bubble-4" />
        <span className="bubble bubble-5" />
        <span className="bubble bubble-6" />
        <span className="bubble bubble-7" />
        <span className="bubble bubble-8" />
        <span className="bubble bubble-9" />
        <span className="bubble bubble-10" />
      </div>

      <div className="jyc-intro-theme">

        <button
          type="button"
          className={
            theme === "light"
              ? "active"
              : ""
          }
          onClick={setLight}
          aria-label="Light mode"
        >
          <Sun size={20} />
        </button>

        <button
          type="button"
          className={
            theme === "dark"
              ? "active"
              : ""
          }
          onClick={setDark}
          aria-label="Dark mode"
        >
          <Moon size={20} />
        </button>

      </div>

      <section className="jyc-intro-content">

        <div className="jyc-intro-logo-wrap">
          <img
            src={logo}
            alt="JumpStart Your Career"
            className="jyc-intro-logo"
          />
        </div>

        <h1>
          JumpStart Connect
        </h1>

        <div className="jyc-intro-tagline">

          <span className="line" />

          <span>
            Leaving No One Behind.
          </span>

          <span className="line" />

        </div>

        <div className="jyc-intro-footer">

          <span className="line" />

          <span>
            Empowering careers, one connection at a time
          </span>

          <span className="line" />

        </div>

      </section>

    </main>
  );
}

