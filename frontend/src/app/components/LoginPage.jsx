import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Lock,
    Mail,
    Moon,
    Sun,
} from "lucide-react";

import { useTheme } from "./ThemeProvider";
import { authApi } from "../services/authApi";
import logo from "../../assets/images/jumpstart-logo.webp";


export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { theme, toggleTheme } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // =====================================================
    // SAFE BACK NAVIGATION
    // =====================================================

    const goBackSafely = (fallbackPath = "/dashboard") => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate(fallbackPath, { replace: true });
    };


    // =====================================================
    // EXISTING SESSION CHECK
    // =====================================================

    useEffect(() => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");

        const user = JSON.parse(
            localStorage.getItem("currentUser") || "{}"
        );

        if (token) {
            const redirectPath =
                location.state?.from?.pathname ||
                sessionStorage.getItem("redirectAfterLogin") ||
                (
                    user?.role === "superadmin" ||
                    user?.role === "admin"
                        ? "/admin"
                        : "/dashboard"
                );

            sessionStorage.removeItem("redirectAfterLogin");

            navigate(redirectPath, {
                replace: true,
            });
        }
    }, [location.state, navigate]);


    // =====================================================
    // LOGIN
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        console.log("=== LOGIN START ===");


        if (!email) {
            setError("Please enter your work email.");
            return;
        }


        if (!email.includes("@")) {
            setError(
                "Please enter a valid organisational email address."
            );
            return;
        }


        if (!password.trim()) {
            setError("Please enter your password.");
            return;
        }


        setLoading(true);


        try {
            const response = await authApi.login({
                email,
                password,
            });


            // =================================================
            // FIRST LOGIN
            // =================================================

            if (response?.first_login) {
                localStorage.setItem(
                    "verification_email",
                    response.email || email
                );

                sessionStorage.removeItem(
                    "redirectAfterLogin"
                );

                navigate("/create-password", {
                    state: {
                        email:
                            response.email || email,

                        isFirstLogin: true,
                    },
                });

                return;
            }


            // =================================================
            // SUCCESSFUL LOGIN
            // =================================================

            if (response?.token) {
                localStorage.setItem(
                    "token",
                    response.token
                );

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        response.user || {}
                    )
                );


                const redirectPath =
                    location.state?.from?.pathname ||
                    sessionStorage.getItem(
                        "redirectAfterLogin"
                    ) ||
                    (
                        response.user?.role === "superadmin" ||
                        response.user?.role === "admin"
                            ? "/admin"
                            : "/dashboard"
                    );


                sessionStorage.removeItem(
                    "redirectAfterLogin"
                );


                navigate(redirectPath, {
                    replace: true,
                });


                return;
            }


            // =================================================
            // FORCE PASSWORD CHANGE
            // =================================================

            if (response?.force_password_change) {
                navigate("/password-expired", {
                    state: {
                        email,
                    },
                });

                return;
            }


            setError(
                response?.message ||
                "Login failed. Please try again."
            );
        }

        catch (err) {
            setError(
                err?.response?.data?.error ||
                err?.payload?.error ||
                err?.message ||
                "Unable to sign in. Please check your credentials."
            );
        }

        finally {
            setLoading(false);
        }
    };


    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="jyc-login-page">

            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
                type="button"
                onClick={() =>
                    goBackSafely("/login")
                }
                className="jyc-login-back"
                aria-label="Go back"
            >
                <ArrowLeft size={23} />
            </button>


            {/* =================================================
                THEME CONTROL
            ================================================= */}

            <div className="jyc-login-theme">

                <button
                    type="button"
                    className={
                        theme === "light"
                            ? "active"
                            : ""
                    }
                    onClick={() => {
                        if (theme !== "light") {
                            toggleTheme();
                        }
                    }}
                    aria-label="Light mode"
                    title="Light mode"
                >
                    <Sun size={21} />
                </button>


                <button
                    type="button"
                    className={
                        theme === "dark"
                            ? "active"
                            : ""
                    }
                    onClick={() => {
                        if (theme !== "dark") {
                            toggleTheme();
                        }
                    }}
                    aria-label="Dark mode"
                    title="Dark mode"
                >
                    <Moon size={21} />
                </button>

            </div>


            {/* =================================================
                LOGIN CARD
            ================================================= */}

            <main className="jyc-login-card">


                {/* =============================================
                    BRAND
                ============================================= */}

                <div className="jyc-login-brand">

                    <div className="jyc-login-logo">

                        <img
                            src={logo}
                            alt="JumpStart Your Career"
                        />

                    </div>


                    <h1 className="jyc-login-brand-title">
                        Jumpstart{" "}
                        <span>
                            Connect
                        </span>
                    </h1>


                    <div className="jyc-login-brand-subtitle">

                        <span>
                            People
                        </span>

                        <i />

                        <span>
                            Workspace
                        </span>

                        <i />

                        <span>
                            Communication
                        </span>

                    </div>

                </div>


                {/* =============================================
                    GOLD DIVIDER
                ============================================= */}

                <div className="jyc-login-divider" />


                {/* =============================================
                    WELCOME
                ============================================= */}

                <div className="jyc-login-welcome">

                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Sign in to your organisational workspace
                    </p>

                </div>


                {/* =============================================
                    ERROR
                ============================================= */}

                {error && (

                    <div className="jyc-login-error">

                        {error}

                    </div>

                )}


                {/* =============================================
                    FORM
                ============================================= */}

                <form
                    onSubmit={handleSubmit}
                >


                    <div className="jyc-login-fields">


                        {/* EMAIL */}

                        <div className="jyc-login-field">

                            <Mail
                                size={21}
                                className="jyc-login-field-icon"
                            />


                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="Organisational email"
                                autoComplete="email"
                                spellCheck="false"
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="jyc-login-field">

                            <Lock
                                size={20}
                                className="jyc-login-field-icon"
                            />


                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Password"
                                autoComplete="current-password"
                            />


                            <button
                                type="button"
                                className="jyc-login-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                title={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >

                                {showPassword ? (

                                    <EyeOff
                                        size={20}
                                    />

                                ) : (

                                    <Eye
                                        size={20}
                                    />

                                )}

                            </button>

                        </div>

                    </div>


                    {/* =========================================
                        SIGN IN BUTTON
                    ========================================= */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="jyc-login-submit"
                    >

                        {loading ? (

                            <>

                                <span className="jyc-login-spinner" />

                                <span>
                                    Authenticating...
                                </span>

                            </>

                        ) : (

                            <>

                                <span>
                                    Sign in
                                </span>

                                <ArrowRight
                                    size={23}
                                />

                            </>

                        )}

                    </button>


                </form>


                {/* =============================================
                    FORGOT PASSWORD
                ============================================= */}

                <button
                    type="button"
                    className="jyc-login-forgot"
                    onClick={() =>
                        navigate(
                            "/forgot-password"
                        )
                    }
                >
                    Forgot your password?
                </button>


                {/* =============================================
                    SECURITY PANEL
                ============================================= */}

                <div className="jyc-login-security">

                    <div className="jyc-login-security-icon">

                        <ShieldCheck
                            size={34}
                        />

                    </div>


                    <div>

                        <strong>
                            Secure access
                        </strong>


                        <span>
                            Your data is protected with
                            enterprise-grade security and
                            organisational controls.
                        </span>

                    </div>

                </div>


            </main>

        </div>
    );
}

