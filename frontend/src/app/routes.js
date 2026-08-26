import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { VerifyOtpPage } from "./components/VerifyOtpPage";
import { FirstLoginPage } from "./components/FirstLoginPage";
import { CreatePasswordPage } from "./components/CreatePasswordPage";
import { PasswordExpiredPage } from "./components/PasswordExpiredPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { UserDashboard } from "./components/UserDashboard";
import { ProfilePage } from "./components/ProfilePage";

export const router = createBrowserRouter([
  { index: true, Component: LandingPage },

  { path: "login", Component: LoginPage },
  { path: "verify-otp", Component: VerifyOtpPage },
  { path: "first-login", Component: FirstLoginPage },
  { path: "create-password", Component: CreatePasswordPage },
  { path: "password-expired", Component: PasswordExpiredPage },
  { path: "forgot-password", Component: ForgotPasswordPage },
  { path: "reset-password", Component: ResetPasswordPage },

  // Existing dashboards
  { path: "dashboard", Component: UserDashboard },
  { path: "profile", Component: ProfilePage },
  { path: "admin", Component: AdminDashboard },

  
]);