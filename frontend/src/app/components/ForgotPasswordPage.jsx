import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  Moon,
  Sun,
} from "lucide-react";

import { useTheme } from "./ThemeProvider";
import logo from "../../assets/images/jumpstart-logo.webp";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      return;
    }

    /*
      For now this restores the missing frontend page
      so Vite can compile successfully.

      We will connect this form to the existing backend
      password-reset endpoint after the project is running.
    */

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white relative overflow-hidden">

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 w-11 h-11 rounded-xl
                   border border-white/10 bg-white/5
                   flex items-center justify-center
                   hover:border-[#F5C518]/30 transition"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun size={18} className="text-[#F5C518]" />
        ) : (
          <Moon size={18} className="text-[#F5C518]" />
        )}
      </button>

      {/* Decorative glow */}
      <div
        className="absolute -top-40 -right-40 w-[520px] h-[520px]
                   rounded-full bg-[#F5C518]/10 blur-[130px]"
      />

      <div
        className="absolute -bottom-40 -left-40 w-[420px] h-[420px]
                   rounded-full bg-[#F5C518]/5 blur-[120px]"
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-[470px]">

          {/* Back */}
          <button
            onClick={() => navigate("/login")}
            className="mb-6 flex items-center gap-2 text-sm text-white/50
                       hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </button>

          <div
            className="rounded-[28px] border border-white/10
                       bg-[#151515]/95 backdrop-blur-xl
                       shadow-[0_30px_80px_rgba(0,0,0,0.45)]
                       p-8 md:p-10"
          >

            {/* Logo */}
            <div className="flex flex-col items-center text-center mb-8">

              <div className="relative mb-4">
                <div
                  className="absolute inset-0 rounded-full
                             bg-[#F5C518]/20 blur-2xl"
                />

                <img
                  src={logo}
                  alt="JumpStart Logo"
                  className="relative w-20 h-20 object-contain"
                />
              </div>

              <h2 className="text-xl font-bold">
                JumpStart{" "}
                <span className="text-[#F5C518]">
                  Connect
                </span>
              </h2>

            </div>

            {!submitted ? (
              <>
                <div className="text-center mb-7">

                  <div
                    className="w-14 h-14 rounded-2xl
                               bg-[#F5C518]/10
                               border border-[#F5C518]/20
                               flex items-center justify-center
                               mx-auto mb-4"
                  >
                    <Mail
                      size={25}
                      className="text-[#F5C518]"
                    />
                  </div>

                  <h1 className="text-3xl font-bold mb-2">
                    Forgot your password?
                  </h1>

                  <p className="text-sm text-white/50 leading-6">
                    Enter your organisational email address and
                    we'll help you reset your password.
                  </p>

                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      Organisational email
                    </label>

                    <div className="relative">

                      <Mail
                        size={17}
                        className="absolute left-4 top-1/2
                                   -translate-y-1/2 text-white/35"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="name@organisation.org"
                        required
                        className="w-full rounded-xl
                                   border border-white/10
                                   bg-black/30
                                   py-3.5 pl-11 pr-4
                                   text-sm text-white
                                   placeholder:text-white/25
                                   focus:outline-none
                                   focus:border-[#F5C518]/60
                                   focus:ring-2
                                   focus:ring-[#F5C518]/10"
                      />

                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl
                               bg-[#F5C518]
                               py-3.5
                               font-bold text-black
                               hover:bg-[#FFD84D]
                               transition
                               shadow-[0_10px_30px_rgba(245,197,24,0.12)]"
                  >
                    Continue
                  </button>

                </form>

                <div
                  className="mt-6 rounded-xl
                             border border-white/8
                             bg-white/[0.025]
                             px-4 py-4
                             flex gap-3"
                >

                  <ShieldCheck
                    size={19}
                    className="text-[#F5C518] shrink-0 mt-0.5"
                  />

                  <div>
                    <p className="text-xs font-semibold">
                      Secure password recovery
                    </p>

                    <p className="text-[11px] text-white/40 mt-1 leading-5">
                      Password reset requests are protected by
                      JumpStart Connect security controls.
                    </p>
                  </div>

                </div>
              </>
            ) : (
              <div className="text-center py-4">

                <div
                  className="w-16 h-16 rounded-full
                             bg-green-500/10
                             border border-green-500/20
                             flex items-center justify-center
                             mx-auto mb-5"
                >
                  <Mail
                    size={28}
                    className="text-green-400"
                  />
                </div>

                <h1 className="text-2xl font-bold mb-3">
                  Request received
                </h1>

                <p className="text-sm text-white/50 leading-6 mb-6">
                  Password recovery has been requested for
                  <span className="text-white font-medium">
                    {" "}{email}
                  </span>.
                </p>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full rounded-xl
                             border border-white/10
                             bg-white/5
                             py-3 text-sm
                             hover:bg-white/10 transition"
                >
                  Return to sign in
                </button>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}