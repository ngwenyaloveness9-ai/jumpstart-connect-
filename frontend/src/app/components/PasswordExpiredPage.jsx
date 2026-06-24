import { useNavigate, useLocation } from "react-router";
import { Clock, ArrowRight, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function PasswordExpiredPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const email = location.state?.email ?? "";
  const daysExpired = location.state?.daysExpired ?? 0;

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
        <div className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              JC
            </span>
          </div>

          <span className="text-foreground font-semibold text-xl">
            Jumpstart Connect
          </span>
        </div>

        <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
          <Clock size={34} className="text-orange-400" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Password expired
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          Your password expired
          {daysExpired > 0
            ? ` ${daysExpired} day${daysExpired !== 1 ? "s" : ""} ago`
            : ""}.
        </p>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          For your security, Jumpstart Connect requires passwords to be updated
          every{" "}
          <span className="text-foreground font-medium">90 days</span>. Please
          set a new password to continue.
        </p>

        <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl px-5 py-4 mb-8 text-left">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-orange-400 font-medium">
              Security notice:
            </span>{" "}
            Regular password changes protect your account from unauthorised
            access. Your new password cannot match any of your last 5 passwords.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/create-password", {
              state: {
                email,
                isReset: false,
              },
            })
          }
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/15 mb-3"
        >
          Update my password <ArrowRight size={16} />
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-transparent text-muted-foreground border border-border py-3.5 rounded-xl font-medium hover:text-foreground hover:border-foreground/30 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Sign out
        </button>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Need help?{" "}
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