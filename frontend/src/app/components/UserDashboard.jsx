import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LogOut,
  User,
  Bell,
  Moon,
  Sun,
  Layers,
  MessageSquare,
  Users,
  CalendarDays,
} from "lucide-react";

import { useTheme } from "./ThemeProvider";
import { Messages } from "./admin/Messages";
import { Workspaces } from "./admin/Workspaces";
import { UsersAccess } from "./admin/UsersAccess";
import { LeavePage } from "./LeavePage";
import logo from "../../assets/images/jumpstart-logo.webp";

const EMPLOYEE_TABS = [
  {
    id: "workspaces",
    label: "Workspaces",
    icon: Layers,
    description: "Groups you're a part of",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    description: "Your conversations",
  },
  {
    id: "leave",
    label: "Leave",
    icon: CalendarDays,
    description: "Request and track your leave",
  },
];

const HR_TABS = [
  {
    id: "workspaces",
    label: "Workspaces",
    icon: Layers,
    description: "Create and manage company workspaces",
  },
  {
    id: "employees",
    label: "Employees",
    icon: Users,
    description: "Onboard and manage employees",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    description: "Your conversations",
  },
  {
    id: "leave",
    label: "Leave",
    icon: CalendarDays,
    description: "Manage department leave requests",
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
}

export function UserDashboard({ tab = "workspaces" }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const activeTab = tab || "workspaces";

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "{}"
  );

  const isHR = ["hr", "human resources", "human resource", "hr manager", "hr officer"].includes(
    (currentUser.role || currentUser.role_name || "").trim().toLowerCase()
  );

  const userName =
    currentUser.first_name && currentUser.last_name
      ? `${currentUser.first_name} ${currentUser.last_name}`
      : localStorage.getItem("userName") || "Account";

  const TABS = isHR ? HR_TABS : EMPLOYEE_TABS;

  const active =
    TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Top nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-40">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
            <img src={logo} alt="JumpStart Logo" className="w-full h-full object-contain" />
          </div>

          <span className="font-semibold text-foreground">
            Jumpstart Connect
          </span>

        </div>

        <div className="flex items-center gap-3">

          <button
            className="relative w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Bell
              size={16}
              className="text-muted-foreground"
            />

            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun
                size={16}
                className="text-muted-foreground"
              />
            ) : (
              <Moon
                size={16}
                className="text-muted-foreground"
              />
            )}
          </button>

          <button onClick={() => navigate("/profile")} className="flex items-center gap-2.5 pl-3 border-l border-border text-left hover:opacity-80 transition-opacity" title="Open profile">

            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User
                size={14}
                className="text-primary"
              />
            </div>

            <div className="hidden sm:block">

              <p className="text-xs font-medium text-foreground leading-none">
                {userName}
              </p>

              <p className="text-xs text-muted-foreground mt-0.5">
                {isHR ? "Human Resources" : "Member"}
              </p>

            </div>

          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <LogOut size={14} />

            Sign out
          </button>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-8">

          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

          <div className="relative">

            <h1 className="text-2xl font-bold text-foreground mb-1">
              {getGreeting()}
              {userName ? `, ${userName}` : ""}
            </h1>

            <p className="text-muted-foreground text-sm">
              {isHR
                ? "Manage employees and company workspaces."
                : "Here's what's happening across your workspaces today."}
            </p>

          </div>

        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit">

          {TABS.map((tab) => {

            const Icon = tab.icon;

            const isActive = tab.id === activeTab;
            const routeMap = {
              workspaces: "/dashboard/workspaces",
              employees: "/dashboard/employees",
              messages: "/dashboard/messages",
              leave: "/dashboard/leave",
            };

            return (
              <button
                key={tab.id}
                onClick={() => navigate(routeMap[tab.id] || "/dashboard/workspaces")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >

                <Icon size={15} />

                {tab.label}

              </button>
            );

          })}

        </div>

        {/* Active section */}
        <div>

          <div className="flex items-center gap-2.5 mb-4">

            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">

              {(() => {
                const Icon = active.icon;

                return (
                  <Icon
                    size={15}
                    className="text-primary"
                  />
                );
              })()}

            </div>

            <div>

              <h2 className="text-sm font-semibold text-foreground leading-none">
                {active.label}
              </h2>

              <p className="text-xs text-muted-foreground mt-0.5">
                {active.description}
              </p>

            </div>

          </div>

          <div className="rounded-3xl border border-border bg-card p-1 transition-shadow hover:shadow-lg hover:shadow-black/5">

            <div className="p-5">

              {activeTab === "workspaces" && (
                <Workspaces />
              )}

              {activeTab === "employees" && isHR && (
                <UsersAccess />
              )}

              {activeTab === "messages" && (
                <Messages />
              )}

              {activeTab === "leave" && (
                <LeavePage />
              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}