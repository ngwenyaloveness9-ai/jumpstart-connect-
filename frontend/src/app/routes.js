import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { CreatePasswordPage } from "./components/CreatePasswordPage";
import { PasswordExpiredPage } from "./components/PasswordExpiredPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { UserDashboard } from "./components/UserDashboard";
import { ProfilePage } from "./components/ProfilePage";
import { RequireAuth } from "./components/RequireAuth";

const withAuth = (Component, props = {}) => {
  return function ProtectedRoute() {
    return React.createElement(
      RequireAuth,
      null,
      React.createElement(Component, props)
    );
  };
};

export const router = createBrowserRouter([
  { index: true, Component: LandingPage },

  { path: "login", Component: LoginPage },
  { path: "create-password", Component: CreatePasswordPage },
  { path: "password-expired", Component: PasswordExpiredPage },
  { path: "reset-password", Component: ResetPasswordPage },

  { path: "dashboard", Component: withAuth(UserDashboard, { tab: "workspaces" }) },
  { path: "dashboard/workspaces", Component: withAuth(UserDashboard, { tab: "workspaces" }) },
  { path: "dashboard/messages", Component: withAuth(UserDashboard, { tab: "messages" }) },
  { path: "dashboard/leave", Component: withAuth(UserDashboard, { tab: "leave" }) },
  { path: "dashboard/employees", Component: withAuth(UserDashboard, { tab: "employees" }) },

  { path: "profile", Component: withAuth(ProfilePage) },

  { path: "admin", Component: withAuth(AdminDashboard, { section: "Dashboard" }) },
  { path: "admin/dashboard", Component: withAuth(AdminDashboard, { section: "Dashboard" }) },
  { path: "admin/users", Component: withAuth(AdminDashboard, { section: "Users" }) },
  { path: "admin/workspaces", Component: withAuth(AdminDashboard, { section: "Workspaces" }) },
  { path: "admin/security", Component: withAuth(AdminDashboard, { section: "Security" }) },
  { path: "admin/automations", Component: withAuth(AdminDashboard, { section: "Automations" }) },
  { path: "admin/integrations", Component: withAuth(AdminDashboard, { section: "Integrations" }) },
  { path: "admin/audit-logs", Component: withAuth(AdminDashboard, { section: "AuditLogs" }) },
  { path: "admin/api-webhooks", Component: withAuth(AdminDashboard, { section: "ApiWebhooks" }) },
  { path: "admin/messages", Component: withAuth(AdminDashboard, { section: "Messages" }) },
  { path: "admin/leave", Component: withAuth(AdminDashboard, { section: "Leave" }) },
  { path: "admin/settings", Component: withAuth(AdminDashboard, { section: "Settings" }) },
]);