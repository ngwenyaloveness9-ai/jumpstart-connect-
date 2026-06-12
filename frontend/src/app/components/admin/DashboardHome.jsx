import { Users, Briefcase, Clock, AlertTriangle, TrendingUp, TrendingDown, CircleCheck, CircleX, MoreHorizontal, Shield, Key, Activity, Globe, } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { useEffect, useState } from "react";
import { statsApi } from "../../services/statsApi";

// Component-local loading/error state and placeholders are used until data arrives
function StatusBadge({ status }) {
    const colors = {
        active: "bg-green-500/10 text-green-400 border-green-500/20",
        inactive: "bg-[#333]/40 text-[#666] border-[#2A2A2A]",
    };
    return (<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${colors[status] || colors.inactive}`}>
      {status}
    </span>);
}
function AuditIcon({ type }) {
    const map = {
        security: { color: "text-red-400", icon: Shield },
        access: { color: "text-[#F5C518]", icon: Key },
        system: { color: "text-blue-400", icon: Activity },
        board: { color: "text-green-400", icon: Briefcase },
        integration: { color: "text-purple-400", icon: Globe },
    };
    const { color, icon: Icon } = map[type] || map.system;
    return <Icon size={13} className={color}/>;
}
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length)
        return null;
    return (<div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs">
      <p className="text-[#888] mb-1">{label}</p>
      {payload.map((p) => (<p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="text-white font-medium">{p.value}</span>
        </p>))}
    </div>);
};
export function DashboardHome() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState(null);

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          setLoading(true);
          const data = await statsApi.getDashboard();
          if (mounted) setPayload(data);
        } catch (err) {
          console.error('Failed to load dashboard:', err);
          if (mounted) setError(err.message || 'Failed to load dashboard');
        } finally {
          if (mounted) setLoading(false);
        }
      };
      load();
      return () => { mounted = false; };
    }, []);

    const STAT_CARDS = payload ? [
      { label: "Total Users", value: String(payload.stats.total_users || 0), change: "", up: true, icon: Users, color: "#F5C518" },
      { label: "Active Projects", value: String(payload.stats.active_projects || 0), change: "", up: true, icon: Briefcase, color: "#60A5FA" },
      { label: "Pending Requests", value: String(payload.stats.pending_requests || 0), change: "", up: false, icon: Clock, color: "#F472B6" },
      { label: "System Alerts", value: String(payload.stats.system_alerts || 0), change: "", up: false, icon: AlertTriangle, color: "#FB923C" },
    ] : [];

    const ACTIVITY_DATA = payload?.activity || [];
    const WORKSPACE_DATA = payload?.workspaces || [];
    const RECENT_USERS = payload?.recent_users || [];
    const AUDIT_LOGS = payload?.audit_logs || [];

    if (loading) return (<div className="p-5">Loading dashboard…</div>);
    if (error) return (<div className="p-5 text-red-400">Error: {error}</div>);

    return (<div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">System Dashboard</h1>
          <p className="text-[#F5C518] text-xs mt-0.5">JYC Platform — Overview</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
          <CircleCheck size={12}/> All Systems Operational
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (<div key={card.label} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4 hover:border-[#2A2A2A] transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon size={17} style={{ color: card.color }}/>
              </div>
              <div className={`flex items-center gap-1 text-xs ${card.up ? "text-green-400" : "text-red-400"}`}>
                {card.up ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                {card.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{card.value}</div>
            <div className="text-[#444] text-xs">{card.label}</div>
          </div>))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white text-sm font-semibold">Platform Activity</h3>
              <p className="text-[#444] text-xs">Tasks and user growth over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ACTIVITY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5C518" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#F5C518" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#444" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: "#444" }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip />}/>
              <Area type="monotone" dataKey="tasks" name="Tasks" stroke="#F5C518" strokeWidth={2} fill="url(#taskGrad)" dot={false}/>
              <Area type="monotone" dataKey="users" name="Users" stroke="#60A5FA" strokeWidth={2} fill="url(#userGrad)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="text-white text-sm font-semibold">Boards by Dept.</h3>
            <p className="text-[#444] text-xs">Active boards per workspace</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WORKSPACE_DATA} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip />}/>
              <Bar dataKey="boards" name="Boards" fill="#F5C518" radius={[4, 4, 0, 0]} fillOpacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users + Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-semibold">Recent Users</h3>
          </div>
          <div className="space-y-1">
            {RECENT_USERS.map((user) => (<div key={user.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1A1A1A] transition-all group">
                <div className="w-7 h-7 rounded-full bg-[#F5C518]/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#F5C518] text-[10px] font-bold">{user.name.split(" ").map((n) => n[0]).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium">{user.name}</div>
                  <div className="text-[#444] text-[10px]">{user.dept} · {user.role}</div>
                </div>
                <StatusBadge status={user.status}/>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-white">
                  <MoreHorizontal size={14}/>
                </button>
              </div>))}
          </div>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-semibold">Audit Log</h3>
          </div>
          <div className="space-y-1">
            {AUDIT_LOGS.map((log, i) => (<div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1A1A1A] transition-all">
                <div className="mt-0.5 flex-shrink-0"><AuditIcon type={log.type}/></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs">
                    <span className="text-white font-medium">{log.user}</span>{" "}
                    <span className="text-[#555]">{log.action}</span>
                  </div>
                  <div className="text-[#333] text-[10px] mt-0.5">{log.time}</div>
                </div>
              </div>))}
          </div>
        </div>
      </div>

      {/* System health */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
        <h3 className="text-white text-sm font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Auth Service", status: "operational", uptime: "99.98%" },
            { label: "API Gateway", status: "operational", uptime: "99.95%" },
            { label: "WebSocket", status: "operational", uptime: "99.91%" },
            { label: "Database", status: "degraded", uptime: "98.70%" },
        ].map((svc) => (<div key={svc.label} className="bg-[#0D0D0D] rounded-xl p-3 border border-[#1A1A1A]">
              <div className="flex items-center gap-2 mb-2">
                {svc.status === "operational" ? (<CircleCheck size={13} className="text-green-400"/>) : (<CircleX size={13} className="text-orange-400"/>)}
                <span className="text-xs text-white">{svc.label}</span>
              </div>
              <div className={`text-xs font-medium ${svc.status === "operational" ? "text-green-400" : "text-orange-400"}`}>
                {svc.uptime} uptime
              </div>
              <div className="mt-2 h-1 rounded-full bg-[#1E1E1E]">
                <div className={`h-full rounded-full ${svc.status === "operational" ? "bg-green-500" : "bg-orange-500"}`} style={{ width: svc.uptime }}/>
              </div>
            </div>))}
        </div>
      </div>
    </div>);
}
