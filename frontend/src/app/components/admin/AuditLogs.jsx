import { useState } from "react";
import { Search, Download, Shield, Key, Briefcase, Globe, Activity, User, ChevronDown, ChevronRight } from "lucide-react";
const LOG_TYPES = ["All", "security", "access", "board", "integration", "system", "user"];
const ALL_LOGS = [
    { id: 1, user: "W. Magagula", role: "System Admin", action: "Updated permission policy for IT workspace", detail: "Changed board-level access from 'Team Member' to 'Viewer' for Finance group", ip: "196.25.1.4", time: "06 Jun 2026, 08:02", type: "security" },
    { id: 2, user: "S. Dlamini", role: "Administrator", action: "Approved off-site access for K. Nkosi", detail: "Approved 48-hour OTP access window. Request ID: OTP-2026-044", ip: "196.25.1.22", time: "06 Jun 2026, 07:44", type: "access" },
    { id: 3, user: "System", role: "System", action: "2FA enforcement enabled for all admins", detail: "Policy updated via Security & Auth settings. Previous state: optional", ip: "—", time: "06 Jun 2026, 07:00", type: "system" },
    { id: 4, user: "T. Mokoena", role: "Employee", action: "Created new board: Recruitment Q3", detail: "Board added to Human Resources workspace. 4 columns configured.", ip: "196.25.1.55", time: "05 Jun 2026, 16:30", type: "board" },
    { id: 5, user: "L. Zulu", role: "Board Owner", action: "Configured webhook for Slack integration", detail: "Webhook endpoint: https://hooks.slack.com/services/***. Event: item.status_changed", ip: "196.25.1.88", time: "05 Jun 2026, 14:15", type: "integration" },
    { id: 6, user: "W. Magagula", role: "System Admin", action: "Invited new user: P. Ndlovu", detail: "Invited p.ndlovu@jumpstartyourcareer.co.za as Employee in Operations workspace", ip: "196.25.1.4", time: "05 Jun 2026, 11:00", type: "user" },
    { id: 7, user: "R. Mthembu", role: "Administrator", action: "Archived board: Recruitment Q2", detail: "Board archived after all 14 items marked Done.", ip: "196.25.1.31", time: "04 Jun 2026, 15:47", type: "board" },
    { id: 8, user: "System", role: "System", action: "IP whitelist updated", detail: "Added range 10.0.0.0/8 (Internal VPN). Removed 41.0.0.0/8.", ip: "—", time: "04 Jun 2026, 09:20", type: "security" },
    { id: 9, user: "K. Nkosi", role: "Viewer", action: "Failed login — account locked", detail: "Account locked after 5 failed attempts. Reset required.", ip: "196.35.2.10", time: "03 Jun 2026, 20:05", type: "security" },
    { id: 10, user: "N. Khumalo", role: "Employee", action: "Submitted Project Request Form", detail: "Form: New Project Intake. Created item #PRJ-058 on Projects board.", ip: "196.25.1.67", time: "03 Jun 2026, 14:12", type: "board" },
    { id: 11, user: "L. Zulu", role: "Board Owner", action: "Enrolled 2FA on new device", detail: "TOTP authenticator registered. Device: iPhone 14. Location: Johannesburg", ip: "196.25.1.88", time: "03 Jun 2026, 10:00", type: "security" },
    { id: 12, user: "S. Dlamini", role: "Administrator", action: "Deactivated user: former employee", detail: "User account suspended. All sessions terminated.", ip: "196.25.1.22", time: "02 Jun 2026, 08:45", type: "user" },
];
const TYPE_CONFIG = {
    security: { icon: Shield, color: "text-red-400", label: "Security" },
    access: { icon: Key, color: "text-[#F5C518]", label: "Access" },
    board: { icon: Briefcase, color: "text-green-400", label: "Board" },
    integration: { icon: Globe, color: "text-purple-400", label: "Integration" },
    system: { icon: Activity, color: "text-blue-400", label: "System" },
    user: { icon: User, color: "text-pink-400", label: "User" },
};
export function AuditLogs() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [expanded, setExpanded] = useState(null);
    const filtered = ALL_LOGS.filter((log) => {
        const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
            log.action.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "All" || log.type === typeFilter;
        return matchSearch && matchType;
    });
    return (<div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">Audit Logs</h1>
          <p className="text-[#F5C518] text-xs mt-0.5">Immutable activity and governance history across the platform</p>
        </div>
        <button className="flex items-center gap-2 border border-[#F5C518] text-[#888] px-4 py-2 rounded-xl text-sm hover:text-white hover:border-[#F5C518] transition-all">
          <Download size={14}/> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const count = ALL_LOGS.filter((l) => l.type === key).length;
            return (<button key={key} onClick={() => setTypeFilter(typeFilter === key ? "All" : key)} className={`bg-[#111111] border rounded-xl p-3 text-center transition-all ${typeFilter === key ? "border-[#F5C518]/30 bg-[#F5C518]/5" : "border-[#1E1E1E] hover:border-[#2A2A2A]"}`}>
              <cfg.icon size={16} className={`${cfg.color} mx-auto mb-1`}/>
              <div className="text-white text-sm font-bold">{count}</div>
              <div className="text-[#444] text-[10px]">{cfg.label}</div>
            </button>);
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." className="w-full bg-[#111111] border border-[#1E1E1E] text-white pl-9 pr-4 py-2 rounded-xl text-xs placeholder-[#333] focus:outline-none focus:border-[#F5C518]/40 transition-all"/>
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="appearance-none bg-[#111111] border border-[#1E1E1E] text-[#888] text-xs px-3 py-2 pr-8 rounded-xl focus:outline-none focus:border-[#F5C518]/40 transition-all cursor-pointer">
            {LOG_TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : TYPE_CONFIG[t]?.label || t}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"/>
        </div>
        <span className="text-[#444] text-xs ml-auto">{filtered.length} entries</span>
      </div>

      {/* Logs */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden">
        <div className="divide-y divide-[#0D0D0D]">
          {filtered.map((log) => {
            const cfg = TYPE_CONFIG[log.type];
            const isExpanded = expanded === log.id;
            return (<div key={log.id} className="hover:bg-[#141414] transition-all">
                <button className="w-full flex items-start gap-4 px-5 py-4 text-left" onClick={() => setExpanded(isExpanded ? null : log.id)}>
                  <cfg.icon size={14} className={`${cfg.color} mt-0.5 flex-shrink-0`}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white text-xs font-medium">{log.user}</span>
                      <span className="text-[#333] text-[10px]">{log.role}</span>
                    </div>
                    <span className="text-[#888] text-xs">{log.action}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[#333] text-[10px] font-mono">{log.ip}</span>
                    <span className="text-[#333] text-[10px]">{log.time}</span>
                  </div>
                  <ChevronRight size={12} className={`text-[#333] flex-shrink-0 mt-0.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}/>
                </button>
                {isExpanded && (<div className="px-5 pb-4 ml-[46px]">
                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl px-4 py-3 text-xs text-[#888] leading-relaxed">
                      {log.detail}
                    </div>
                  </div>)}
              </div>);
        })}
          {filtered.length === 0 && (<div className="text-center text-[#444] py-10 text-sm">No log entries match your filters.</div>)}
        </div>
      </div>
    </div>);
}
