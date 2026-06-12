import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft, Shield, Lock, Mail, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { authApi } from "../services/authApi";
import logo from "../../assets/images/jumpstart-logo.webp";

export function LoginPage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

        if (token) {
            navigate("/admin", { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        console.log("=== LOGIN START ===");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        if (!email.includes("@")) {
            setError("Please enter a valid organisational email address.");
            return;
        }

        setLoading(true);

        try {
            console.log("Sending login request...");
            console.log("Email:", email);

            const response = await authApi.login({
                email,
                password,
            });

            console.log("Login response:", response);

            if (response?.token) {
                console.log("Token received:", response.token);

                localStorage.setItem("token", response.token);
                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(response.user || {})
                );

                navigate("/admin", { replace: true });
                return;
            }

            setError(response?.message || "Login failed. Please try again.");
        }
        catch (err) {
            console.error("LOGIN ERROR");
            console.error(err);
            console.error("MESSAGE:", err.message);
            console.error("PAYLOAD:", err.payload);
            console.error("RESPONSE:", err.response);

            setError(
                err.payload?.error ||
                err.message ||
                "Unable to sign in. Please check your credentials."
            );
        }
        finally {
            setLoading(false);
            console.log("=== LOGIN END ===");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative p-8">
            {/* Theme Toggle Button */}
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

            {/* Login form */}
            <div className="w-full max-w-md relative">
                {/* Back button */}
                <button
                    onClick={() => navigate("/")}
                    className="absolute -top-12 left-0 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-20 h-20 bg-primary rounded-full blur-2xl opacity-30"></div>

                        <img
                            src={logo}
                            alt="JumpStart Logo"
                            className="relative w-16 h-16 object-contain"
                        />
                    </div>

                    <span className="text-foreground font-semibold text-xl mt-3">
                        Jumpstart Connect
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
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

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm text-muted-foreground">
                                Password
                            </label>

                            <a
                                href="#"
                                className="text-xs text-primary hover:opacity-80 transition-opacity"
                            >
                                Forgot password?
                            </a>
                        </div>

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
                    </div>

                    {/* 2FA notice */}
                    <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
                        <Shield
                            size={15}
                            className="text-primary mt-0.5 flex-shrink-0"
                        />

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Two-factor authentication may be required for your
                            account. Ensure you have access to your authenticator app.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/15 mt-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    Access is restricted to approved organisational domains only.{" "}
                    <a href="#" className="text-primary/70 hover:text-primary">
                        Contact IT Support
                    </a>
                </p>
            </div>
        </div>
    );
}