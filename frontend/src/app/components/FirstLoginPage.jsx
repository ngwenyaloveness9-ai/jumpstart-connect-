import { useNavigate, useLocation } from "react-router";
import { ArrowRight, Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import logo from "../../assets/images/jumpstart-logo.webp";

export function FirstLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const email = location.state?.email ?? "";
  const name = location.state?.name ?? "there";

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

      <div className="w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-12">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-primary rounded-full blur-3xl opacity-30"></div>

            <img
              src={logo}
              alt="JumpStart Logo"
              className="relative w-20 h-20 object-contain"
            />
          </div>

          <span className="text-foreground font-semibold text-xl mt-4">
            Jumpstart Connect
          </span>
        </div>

        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={34} className="text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Welcome, {name}!
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          This is your first time signing in to Jumpstart Connect.
        </p>

        <p className="text-muted-foreground text-sm leading-relaxed mb-10">
          Before you continue, you need to create a secure password for your
          account.
        </p>

        <div className="bg-primary/5 border border-primary/15 rounded-xl px-5 py-4 mb-8 text-left space-y-3">
          {[
            "At least 8 characters",
            "One uppercase and one lowercase letter",
            "At least one number",
            "At least one special character (e.g. ! @ # $)",
          ].map((req) => (
            <div key={req} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{req}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() =>
            navigate("/create-password", {
              state: { email, isFirstLogin: true },
            })
          }
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/15"
        >
          Create my password <ArrowRight size={16} />
        </button>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Having trouble?{" "}
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