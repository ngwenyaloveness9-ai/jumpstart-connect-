import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LayoutDashboard, Users, Briefcase, Settings, Shield, Bell, Search, Zap, LogOut, Menu, X, Globe, Key, FileText, ChevronDown, Moon, Sun, MessageSquare, } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { DashboardHome } from "./admin/DashboardHome";
import { UsersAccess } from "./admin/UsersAccess";
import { Workspaces } from "./admin/Workspaces";
import { SecurityAuth } from "./admin/SecurityAuth";
import { Automations } from "./admin/Automations";
import { Integrations } from "./admin/Integrations";
import { AuditLogs } from "./admin/AuditLogs";
import { ApiWebhooks } from "./admin/ApiWebhooks";
import { AdminSettings } from "./admin/AdminSettings";
import { Messages } from "./admin/Messages";
import logo from "../../assets/images/jumpstart-logo.webp";
const INITIAL_THREADS = [
    {
      id: "thread-1",
      sender: "Client Support",
      subject: "Platform onboarding help",
      lastMessage: "Can you share the new workspace setup file?",
      time: "1h ago",
      unread: true,
      messages: [
        { id: "m1", author: "Client Support", text: "Hi, can you share the new workspace setup file?", time: "1h ago" },
        { id: "m2", author: "You", text: "Sure — I’ll attach the file in this chat now.", time: "50m ago" },
      ],
    },
    {
      id: "thread-2",
      sender: "Security Team",
      subject: "Audit export delivery",
      lastMessage: "The export is ready for your review.",
      time: "3h ago",
      unread: true,
      messages: [
        { id: "m3", author: "Security Team", text: "The audit export is ready for your review.", time: "3h ago" },
      ],
    },
    {
      id: "thread-3",
      sender: "Development",
      subject: "Weekly sync note",
      lastMessage: "Thanks — I’ll check the notes and confirm tomorrow.",
      time: "Yesterday",
      unread: false,
      messages: [
        { id: "m4", author: "Development", text: "Please review the weekly sync note attached.", time: "Yesterday" },
        { id: "m5", author: "You", text: "Thanks — I’ll check the notes and confirm tomorrow.", time: "Yesterday" },
      ],
    },
];
const SIDEBAR_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", component: "Dashboard" },
    { icon: Users, label: "Users & Access", component: "Users" },
    { icon: Briefcase, label: "Workspaces", component: "Workspaces" },
    { icon: Shield, label: "Security & Auth", component: "Security" },
    { icon: Zap, label: "Automations", component: "Automations" },
    { icon: Globe, label: "Integrations", component: "Integrations" },
    { icon: FileText, label: "Audit Logs", component: "AuditLogs" },
    { icon: Key, label: "API & Webhooks", component: "ApiWebhooks" },
    { icon: MessageSquare, label: "Messages", component: "Messages" },
    { icon: Settings, label: "Settings", component: "Settings" },
];
function renderSection(section, threads, activeThreadId, onThreadSelect, onSendMessage) {
    switch (section) {
        case "Dashboard": return <DashboardHome />;
        case "Users": return <UsersAccess />;
        case "Workspaces": return <Workspaces />;
        case "Security": return <SecurityAuth />;
        case "Automations": return <Automations />;
        case "Integrations": return <Integrations />;
        case "AuditLogs": return <AuditLogs />;
        case "ApiWebhooks": return <ApiWebhooks />;
        case "Messages": return <Messages threads={threads} activeThreadId={activeThreadId} onThreadSelect={onThreadSelect} onSendMessage={onSendMessage}/>;
        case "Settings": return <AdminSettings />;
        default: return <DashboardHome />;
    }
}
export function AdminDashboard() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [threads, setThreads] = useState(INITIAL_THREADS);
    const [activeThreadId, setActiveThreadId] = useState(INITIAL_THREADS[0].id);
    const [activeSection, setActiveSection] = useState("Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");

    const activeItem = SIDEBAR_ITEMS.find((i) => i.component === activeSection);
    const unreadCount = useMemo(() => threads.filter((thread) => thread.unread).length, [threads]);

    const handleSelectThread = (id) => {
      setThreads((prev) => prev.map((thread) => thread.id === id ? { ...thread, unread: false } : thread));
      setActiveThreadId(id);
      setActiveSection("Messages");
    };

    const handleSendMessage = (threadId, messageText, attachments, recipientEmail) => {
      const attachmentsWithUrls = (attachments || []).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
      setThreads((prev) => prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        return {
          ...thread,
          contactEmail: recipientEmail || thread.contactEmail,
          lastMessage: messageText || attachmentsWithUrls.map((a) => a.name).join(", "),
          time: "Just now",
          messages: [
            ...thread.messages,
            {
              id: `out-${Date.now()}`,
              author: "You",
              authorEmail: "you@jumpstart.local",
              text: messageText || "Sent attachments",
              time: "Just now",
              attachments: attachmentsWithUrls,
            },
          ],
        };
      }));
    };

    return (<div className="min-h-screen bg-background text-foreground flex" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (<div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}/>)}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
<div className="flex items-center justify-between p-5 border-b border-sidebar-border">
  <div className="flex items-center gap-3">
    <img
      src={logo}
      alt="JumpStart Logo"
      className="w-10 h-10 object-contain"
    />

    <div>
      <div className="text-sidebar-foreground text-sm font-semibold leading-tight">
        JumpStart Connect
      </div>

      <div className="text-muted-foreground text-[10px]">
        Super Admin
      </div>
    </div>
  </div>

  <button
    className="lg:hidden text-muted-foreground"
    onClick={() => setSidebarOpen(false)}
  >
    <X size={18} />
  </button>
</div>
        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeSection === item.component;
            return (<button key={item.label} onClick={() => { setActiveSection(item.component); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                    ? "bg-primary/10 text-primary border border-primary/15"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent border border-transparent"}`}>
                <item.icon size={16}/>
                {item.label}
              </button>);
        })}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 bg-sidebar-accent rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs">WM</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sidebar-foreground text-xs font-medium truncate">D. Mathebula</div>
              <div className="text-muted-foreground text-[10px]">Chairperson</div>
            </div>
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary transition-colors" title="Sign out">
              <LogOut size={14}/>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border flex items-center gap-4 px-5 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu size={20}/>
          </button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span>JYC Platform</span>
            <span>/</span>
            <span className="text-foreground">{activeItem?.label}</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm ml-auto md:ml-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search platform..." className="w-full bg-input-background border border-border text-foreground pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:border-primary/40 transition-all"/>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="text-muted-foreground hover:text-primary transition-colors p-2" aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <button onClick={() => setActiveSection("Messages")} className="relative text-muted-foreground hover:text-primary transition-colors p-2" aria-label="Open messages">
              <Bell size={18}/>
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {unreadCount}
              </span>
            </button>
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 text-xs cursor-pointer hover:border-primary/30 transition-all">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-[9px]">DA</span>
              </div>
              <span className="text-muted-foreground">Super Admin</span>
              <ChevronDown size={12} className="text-muted-foreground"/>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          {renderSection(activeSection, threads, activeThreadId, handleSelectThread, handleSendMessage)}
        </main>
      </div>
    </div>);
}
