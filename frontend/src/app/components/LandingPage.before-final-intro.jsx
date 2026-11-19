import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import "../../styles/jyc-landing.css";

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const isLight = theme === "light";
  const bubbles = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className={`jyc-landing-page ${isLight ? "light" : "dark"}`}>
      <div className="jyc-landing-bg-lines" />
      <div className="jyc-africa-dots" />

      <div className="jyc-landing-bubbles">
        {bubbles.map((n) => (
          <span key={n} className="bubble" />
        ))}
      </div>

      <div className="jyc-landing-shell">
        <div className="jyc-landing-topbar">
          <div className="jyc-landing-brand">
            <div className="jyc-landing-brand-mark">JC</div>
            <div className="jyc-landing-brand-text">
              <div className="jyc-landing-brand-title">
                Jumpstart <span className="accent">Connect</span>
              </div>
              <div className="jyc-landing-brand-subtitle">
                Leaving no one behind
              </div>
            </div>
          </div>

          <div className="jyc-landing-theme-toggle">
            <button
              type="button"
              className={isLight ? "active" : ""}
              onClick={() => !isLight && toggleTheme()}
              aria-label="Switch to light mode"
              title="Light mode"
            >
              ?
            </button>
            <button
              type="button"
              className={!isLight ? "active" : ""}
              onClick={() => isLight && toggleTheme()}
              aria-label="Switch to dark mode"
              title="Dark mode"
            >
              ?
            </button>
          </div>
        </div>

        <section className="jyc-landing-hero">
          <div className="jyc-landing-main jyc-landing-glass">
            <div className="jyc-landing-eyebrow">People • Workspace • Communication</div>

            <h1>
              Empowering teams <br />
              through <span className="accent">connection</span>
            </h1>

            <p>
              Jumpstart Connect brings together people, workspaces,
              collaboration and communication into one beautiful digital
              experience for your organisation.
            </p>

            <div className="jyc-landing-actions">
              <button
                type="button"
                className="jyc-btn-primary"
                onClick={() => navigate("/login")}
              >
                Get started
              </button>

              <button
                type="button"
                className="jyc-btn-secondary"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </div>

            <div className="jyc-landing-pills">
              <div className="jyc-landing-pill">Smart workspaces</div>
              <div className="jyc-landing-pill">Employee access</div>
              <div className="jyc-landing-pill">Team messaging</div>
              <div className="jyc-landing-pill">Leave management</div>
            </div>
          </div>

          <aside className="jyc-landing-side jyc-landing-glass">
            <div className="jyc-stat-grid">
              <div className="jyc-stat-card">
                <div className="jyc-stat-value">01</div>
                <div className="jyc-stat-label">Unified platform</div>
              </div>

              <div className="jyc-stat-card">
                <div className="jyc-stat-value">24/7</div>
                <div className="jyc-stat-label">Connected teams</div>
              </div>

              <div className="jyc-stat-card">
                <div className="jyc-stat-value">100%</div>
                <div className="jyc-stat-label">Role-based access</div>
              </div>

              <div className="jyc-stat-card">
                <div className="jyc-stat-value">Live</div>
                <div className="jyc-stat-label">Communication flow</div>
              </div>
            </div>

            <div className="jyc-landing-note">
              <div className="jyc-landing-note-title">Why it feels different</div>
              <p>
                A premium command-centre style landing page with glowing golden
                energy, dotted Africa identity and floating bubbles that make
                the platform feel alive.
              </p>
            </div>
          </aside>
        </section>

        <section className="jyc-landing-bottom">
          <div className="jyc-mini-card jyc-landing-glass">
            <strong>Workspaces</strong>
            <span>Create structured departments and organise teams clearly.</span>
          </div>

          <div className="jyc-mini-card jyc-landing-glass">
            <strong>Messages</strong>
            <span>Communicate instantly with accessible conversations and team flow.</span>
          </div>

          <div className="jyc-mini-card jyc-landing-glass">
            <strong>People</strong>
            <span>Support secure access, onboarding and smooth collaboration.</span>
          </div>
        </section>
      </div>
    </div>
  );
}
