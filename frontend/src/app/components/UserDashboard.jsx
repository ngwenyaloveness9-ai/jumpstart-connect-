import { useEffect, useState } from "react";
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
  FolderKanban,
} from "lucide-react";

import { useTheme } from "./ThemeProvider";
import { Messages } from "./admin/Messages";
import { Workspaces } from "./admin/Workspaces";
import { UsersAccess } from "./admin/UsersAccess";
import { LeavePage } from "./LeavePage";
import { ProjectWorkspace } from "./ProjectWorkspace";
import { messageApi } from "../services/messageApi";
import { groupsApi } from "../services/groupsApi";
import logo from "../../assets/images/jumpstart-logo.webp";


/* =========================================================
   EMPLOYEE TABS
========================================================= */

const EMPLOYEE_TABS = [
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
    description: "Projects, tasks and schedules",
  },
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


/* =========================================================
   HR TABS
========================================================= */

const HR_TABS = [
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
    description: "Department projects and task schedules",
  },
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


/* =========================================================
   GREETING
========================================================= */

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
}


/* =========================================================
   USER DASHBOARD
========================================================= */

export function UserDashboard({ tab = "workspaces" }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const activeTab = tab || "workspaces";

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "{}"
  );


  /* =======================================================
     HR ROLE CHECK
  ======================================================= */

  const isHR = [
    "hr",
    "human resources",
    "human resource",
    "hr manager",
    "hr officer",
  ].includes(
    (currentUser.role || currentUser.role_name || "")
      .trim()
      .toLowerCase()
  );


  /* =======================================================
     USER NAME
  ======================================================= */

  const userName =
    currentUser.first_name && currentUser.last_name
      ? `${currentUser.first_name} ${currentUser.last_name}`
      : localStorage.getItem("userName") || "Account";


  const TABS = isHR ? HR_TABS : EMPLOYEE_TABS;


  /* =======================================================
     CHAT NOTIFICATIONS
  ======================================================= */

  const [chatNotifications, setChatNotifications] = useState({
    directCount: 0,
    groupCount: 0,
    groupId: null,
  });


  useEffect(() => {
    let cancelled = false;

    const loadChatNotifications = async () => {
      if (!currentUser.id) return;

      try {
        const [inboxData, groupsData] = await Promise.all([
          messageApi.getThreads(currentUser.id),
          groupsApi.list(currentUser.id),
        ]);

        const unreadDirect = (inboxData?.inbox || []).filter(
          (message) => message.unread
        );

        const groups = (groupsData?.groups || []).filter(
          (group) => group.access !== "limited"
        );

        const groupResults = groups.map((group) => ({
          groupId: group.id,
          count: group.unread_count || 0,
        }));

        const unreadGroup = groupResults.find(
          (result) => result.count > 0
        );

        if (!cancelled) {
          setChatNotifications({
            directCount: unreadDirect.length,

            groupCount: groupResults.reduce(
              (total, result) => total + result.count,
              0
            ),

            groupId: unreadGroup?.groupId || null,
          });
        }
      } catch (error) {
        console.error(
          "Failed to load chat notifications:",
          error
        );
      }
    };

    void loadChatNotifications();

    const intervalId = setInterval(
      loadChatNotifications,
      15000
    );

    window.addEventListener(
      "chat-messages-read",
      loadChatNotifications
    );

    return () => {
      cancelled = true;

      clearInterval(intervalId);

      window.removeEventListener(
        "chat-messages-read",
        loadChatNotifications
      );
    };
  }, [currentUser.id]);


  /* =======================================================
     OPEN NOTIFICATIONS
  ======================================================= */

  const openChatNotifications = async () => {
    if (chatNotifications.directCount > 0) {
      await messageApi.markInboxRead(currentUser.id);

      navigate("/dashboard/messages");

      return;
    }

    if (
      chatNotifications.groupCount > 0 &&
      chatNotifications.groupId
    ) {
      navigate(
        `/dashboard/workspaces?workspaceId=${chatNotifications.groupId}`
      );

      return;
    }

    navigate("/dashboard/messages");
  };


  /* =======================================================
     CURRENT SECTION
  ======================================================= */

  const active =
    TABS.find((tabItem) => tabItem.id === activeTab) ||
    TABS[0];


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    navigate("/login", {
      replace: true,
    });
  };


  /* =======================================================
     ROUTES
  ======================================================= */

  const routeMap = {
    projects: "/dashboard/projects",
    workspaces: "/dashboard/workspaces",
    employees: "/dashboard/employees",
    messages: "/dashboard/messages",
    leave: "/dashboard/leave",
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="jyc-page min-h-screen text-white">

      {/* =====================================================
          GOLD FLOWING BACKGROUND
      ====================================================== */}

      <div
        className="jyc-background-strings"
        aria-hidden="true"
      >

        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
        >

          <defs>

            {/* Main gold gradient */}
            <linearGradient
              id="jycGoldString"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >

              <stop
                offset="0%"
                stopColor="#F5C518"
                stopOpacity="0.04"
              />

              <stop
                offset="18%"
                stopColor="#F5C518"
                stopOpacity="0.48"
              />

              <stop
                offset="50%"
                stopColor="#FFD84D"
                stopOpacity="0.80"
              />

              <stop
                offset="82%"
                stopColor="#F5C518"
                stopOpacity="0.44"
              />

              <stop
                offset="100%"
                stopColor="#F5C518"
                stopOpacity="0.04"
              />

            </linearGradient>


            {/* Softer gold gradient */}

            <linearGradient
              id="jycSoftGold"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >

              <stop
                offset="0%"
                stopColor="#FFD84D"
                stopOpacity="0"
              />

              <stop
                offset="50%"
                stopColor="#FFD84D"
                stopOpacity="0.26"
              />

              <stop
                offset="100%"
                stopColor="#FFD84D"
                stopOpacity="0"
              />

            </linearGradient>


            {/* Glow effect */}

            <filter
              id="jycGoldGlow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >

              <feGaussianBlur
                stdDeviation="3"
                result="blur"
              />

              <feMerge>

                <feMergeNode in="blur" />

                <feMergeNode in="SourceGraphic" />

              </feMerge>

            </filter>

          </defs>


          {/* =================================================
              TOP FLOWING STRINGS
          ================================================== */}

          <path
            d="
              M -80 175
              C 250 40,
                530 210,
                820 120
              C 1120 25,
                1450 170,
                2000 60
            "
            fill="none"
            stroke="url(#jycGoldString)"
            strokeWidth="2.4"
            filter="url(#jycGoldGlow)"
          />


          <path
            d="
              M -80 205
              C 280 85,
                570 235,
                870 155
              C 1190 75,
                1500 205,
                2000 110
            "
            fill="none"
            stroke="#F5C518"
            strokeOpacity="0.25"
            strokeWidth="1"
          />


          <path
            d="
              M -80 235
              C 310 125,
                610 258,
                925 190
              C 1260 118,
                1580 242,
                2000 150
            "
            fill="none"
            stroke="url(#jycSoftGold)"
            strokeWidth="0.8"
          />


          {/* =================================================
              LEFT EDGE STRINGS
          ================================================== */}

          <path
            d="
              M 4 275
              C 125 380,
                38 505,
                118 615
              C 190 720,
                78 845,
                145 1060
            "
            fill="none"
            stroke="url(#jycGoldString)"
            strokeWidth="2"
            strokeOpacity="0.90"
            filter="url(#jycGoldGlow)"
          />


          <path
            d="
              M 32 300
              C 152 400,
                70 530,
                150 642
              C 215 740,
                115 860,
                180 1050
            "
            fill="none"
            stroke="#F5C518"
            strokeWidth="0.9"
            strokeOpacity="0.25"
          />


          <path
            d="
              M 58 318
              C 176 420,
                102 552,
                178 665
              C 243 760,
                150 882,
                210 1045
            "
            fill="none"
            stroke="#FFD84D"
            strokeWidth="0.65"
            strokeOpacity="0.10"
          />


          {/* =================================================
              RIGHT EDGE STRINGS
          ================================================== */}

          <path
            d="
              M 1916 245
              C 1765 350,
                1880 480,
                1780 600
              C 1705 695,
                1825 820,
                1730 1050
            "
            fill="none"
            stroke="url(#jycGoldString)"
            strokeWidth="2.2"
            strokeOpacity="0.92"
            filter="url(#jycGoldGlow)"
          />


          <path
            d="
              M 1884 275
              C 1740 370,
                1848 500,
                1750 625
              C 1680 715,
                1795 842,
                1704 1050
            "
            fill="none"
            stroke="#FFD84D"
            strokeWidth="0.9"
            strokeOpacity="0.25"
          />


          <path
            d="
              M 1858 300
              C 1722 390,
                1818 520,
                1725 648
              C 1660 735,
                1768 860,
                1682 1045
            "
            fill="none"
            stroke="#F5C518"
            strokeWidth="0.65"
            strokeOpacity="0.10"
          />


          {/* =================================================
              MIDDLE FLOW
          ================================================== */}

          <path
            d="
              M -120 590
              C 260 455,
                590 680,
                960 565
              C 1290 462,
                1590 615,
                2040 510
            "
            fill="none"
            stroke="url(#jycGoldString)"
            strokeWidth="1.4"
            strokeOpacity="0.42"
          />


          <path
            d="
              M -120 626
              C 310 510,
                650 712,
                1010 605
              C 1340 510,
                1640 655,
                2040 560
            "
            fill="none"
            stroke="#F5C518"
            strokeWidth="0.8"
            strokeOpacity="0.10"
          />


          {/* =================================================
              LOWER FLOWING STRINGS
          ================================================== */}

          <path
            d="
              M -100 925
              C 260 760,
                590 1025,
                930 895
              C 1260 775,
                1550 995,
                2020 835
            "
            fill="none"
            stroke="url(#jycGoldString)"
            strokeWidth="2.3"
            filter="url(#jycGoldGlow)"
          />


          <path
            d="
              M -100 965
              C 310 820,
                650 1055,
                990 940
              C 1320 835,
                1610 1025,
                2020 895
            "
            fill="none"
            stroke="#F5C518"
            strokeWidth="1"
            strokeOpacity="0.22"
          />


          <path
            d="
              M -100 1003
              C 350 870,
                705 1085,
                1045 990
              C 1370 900,
                1660 1060,
                2020 945
            "
            fill="none"
            stroke="#FFD84D"
            strokeWidth="0.7"
            strokeOpacity="0.09"
          />

        </svg>

      </div>


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="jyc-header">

        <div className="jyc-container min-h-[72px] flex items-center justify-between">

          {/* Brand */}

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">

              <img
                src={logo}
                alt="JumpStart Logo"
                className="w-full h-full object-contain"
              />

            </div>


            <div className="hidden sm:block">

              <div className="font-semibold text-white">

                Jumpstart{" "}

                <span className="text-[#F5C518]">
                  Connect
                </span>

              </div>

            </div>

          </div>


          {/* Controls */}

          <div className="flex items-center gap-3">


            {/* Notification */}

            <button
              onClick={openChatNotifications}
              className="jyc-icon-button relative"
              aria-label="Open unread messages"
            >

              <Bell size={16} />


              {chatNotifications.directCount +
                chatNotifications.groupCount >
                0 && (

                <span
                  className="
                    absolute
                    -top-2
                    -right-2

                    min-w-5
                    h-5

                    px-1

                    rounded-full

                    bg-[#F5C518]

                    text-black
                    text-[10px]
                    font-bold

                    flex
                    items-center
                    justify-center
                  "
                >

                  {chatNotifications.directCount +
                    chatNotifications.groupCount >
                  99
                    ? "99+"
                    : chatNotifications.directCount +
                      chatNotifications.groupCount}

                </span>

              )}

            </button>


            {/* Theme */}

            <button
              onClick={toggleTheme}
              className="jyc-icon-button"
              aria-label="Toggle theme"
            >

              {theme === "dark" ? (

                <Sun
                  size={16}
                  className="text-[#F5C518]"
                />

              ) : (

                <Moon
                  size={16}
                  className="text-[#F5C518]"
                />

              )}

            </button>


            <div className="hidden sm:block w-px h-8 bg-white/10" />


            {/* User */}

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity"
              title="Open profile"
            >

              <div
                className="
                  w-9
                  h-9

                  rounded-full

                  bg-[#F5C518]/10

                  border
                  border-[#F5C518]/20

                  flex
                  items-center
                  justify-center
                "
              >

                <User
                  size={15}
                  className="text-[#F5C518]"
                />

              </div>


              <div className="hidden sm:block">

                <p className="text-xs font-semibold text-white leading-none">
                  {userName}
                </p>

                <p className="text-[11px] text-white/45 mt-1">

                  {isHR
                    ? "Human Resources"
                    : "Member"}

                </p>

              </div>

            </button>


            {/* Logout */}

            <button
              onClick={handleLogout}
              className="
                hidden
                md:flex

                items-center
                gap-1.5

                text-xs
                text-white/50

                hover:text-[#F5C518]

                transition-colors
              "
            >

              <LogOut size={14} />

              Sign out

            </button>

          </div>

        </div>

      </header>


      {/* =====================================================
          DASHBOARD
      ====================================================== */}

      <main className="jyc-container py-8 md:py-10 space-y-8">


        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="jyc-hero">

          <div
            className="
              jyc-hero-content

              min-h-[225px]

              flex
              items-center

              px-8
              md:px-10

              py-10
            "
          >

            <div className="max-w-2xl">


              <div className="jyc-badge mb-5">

                {isHR
                  ? "Human Resources Workspace"
                  : "JumpStart Connect"}

              </div>


              <h1
                className="
                  text-3xl
                  md:text-4xl

                  font-bold

                  text-white

                  tracking-tight

                  mb-3
                "
              >

                {getGreeting()}

                {userName
                  ? `, ${userName}`
                  : ""}

              </h1>


              <p
                className="
                  text-white/70

                  text-sm
                  md:text-base

                  leading-relaxed

                  max-w-xl
                "
              >

                {isHR
                  ? "Manage employees, company workspaces and people operations across JumpStart Connect."
                  : "Manage your workspaces, collaborate with your teams and drive impact across JumpStart Connect."}

              </p>


              <div className="flex flex-wrap gap-3 mt-6">


                <div className="jyc-hero-pill">

                  <Layers
                    size={15}
                    className="text-[#F5C518]"
                  />

                  Connected Workspace

                </div>


                <div className="jyc-hero-pill">

                  <Users
                    size={15}
                    className="text-[#F5C518]"
                  />

                  {isHR
                    ? "Human Resources"
                    : "Member"}

                </div>


              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            TABS
        ==================================================== */}

        <div className="jyc-tabs w-fit max-w-full overflow-x-auto">

          {TABS.map((tabItem) => {

            const Icon = tabItem.icon;

            const isActive =
              tabItem.id === activeTab;


            return (

              <button
                key={tabItem.id}

                onClick={() =>
                  navigate(
                    routeMap[tabItem.id] ||
                      "/dashboard/workspaces"
                  )
                }

                className={`
                  flex
                  items-center
                  gap-2

                  px-4
                  py-2.5

                  rounded-lg

                  text-sm
                  font-medium

                  whitespace-nowrap

                  transition-all

                  ${
                    isActive
                      ? "jyc-tab-active"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }
                `}
              >

                <Icon size={15} />

                {tabItem.label}


                {tabItem.id === "messages" &&
                  chatNotifications.directCount +
                    chatNotifications.groupCount >
                    0 && (

                    <span
                      className="
                        ml-1

                        min-w-5
                        h-5

                        px-1

                        rounded-full

                        bg-[#F5C518]

                        text-black
                        text-[10px]
                        font-bold

                        flex
                        items-center
                        justify-center
                      "
                    >

                      {chatNotifications.directCount +
                        chatNotifications.groupCount >
                      99
                        ? "99+"
                        : chatNotifications.directCount +
                          chatNotifications.groupCount}

                    </span>

                  )}

              </button>

            );

          })}

        </div>


        {/* ===================================================
            ACTIVE SECTION
        ==================================================== */}

        <div>

          <div className="flex items-center gap-3 mb-4">


            <div
              className="
                w-9
                h-9

                rounded-xl

                bg-[#F5C518]/10

                border
                border-[#F5C518]/10

                flex
                items-center
                justify-center
              "
            >

              {(() => {

                const Icon = active.icon;

                return (

                  <Icon
                    size={16}
                    className="text-[#F5C518]"
                  />

                );

              })()}

            </div>


            <div>

              <h2 className="text-sm font-semibold text-white leading-none">
                {active.label}
              </h2>

              <p className="text-xs text-white/45 mt-1">
                {active.description}
              </p>

            </div>


          </div>


          {/* =================================================
              ACTIVE PAGE
          ================================================== */}

          <div className="jyc-glass jyc-gold-edge rounded-[22px] p-1">

            <div className="p-5">


              {activeTab === "workspaces" && (
                <Workspaces />
              )}


              {activeTab === "projects" && (
                <ProjectWorkspace />
              )}


              {activeTab === "employees" &&
                isHR && (
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
