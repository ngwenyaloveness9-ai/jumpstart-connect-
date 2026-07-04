import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Mail,
  SendHorizonal,
  Moon,
  Sun,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

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
        <button
          onClick={() => navigate("/login")}
          className="absolute -top-12 left-0 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to login
        </button>

        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              JC
            </span>
          </div>

          <span className="text-foreground font-semibold text-xl">
            Jumpstart Connect
          </span>
        </div>

        {!sent ? (
          <>
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-primary" />
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">
                Forgot password?
              </h1>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Enter your organisational email and we'll send you a password
                reset link.
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
                  Email Address
                </label>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail size={16} />
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@jumpstartyourcareer.co.za"
                    className="w-full bg-input-background border border-border text-foreground pl-11 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/15"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send reset link <SendHorizonal size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-400" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              Check your inbox
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed mb-2">
              We sent a password reset link to
            </p>

            <p className="text-foreground font-medium text-sm mb-8">
              {email}
            </p>

            <div className="bg-primary/5 border border-primary/10 rounded-xl px-5 py-4 mb-8 text-left">
              <p className="text-xs text-muted-foreground leading-relaxed">
                The link expires in{" "}
                <span className="text-foreground font-medium">
                  15 minutes
                </span>
                . If you don't see the email, check your spam folder or contact
                IT Support.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/reset-password", {
                  state: { email },
                })
              }
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/15 mb-3"
            >
              Continue to reset password
            </button>

            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Use a different email
            </button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-primary/70 hover:text-primary"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}