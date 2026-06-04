import { useState } from "react";
import { Shield, Key, Lock, Wifi, AlertTriangle, CheckCircle, XCircle, RefreshCw, Eye, EyeOff, Save } from "lucide-react";
function Toggle({ enabled, onChange }) {
    return (<button onClick={onChange} className={`relative w-10 h-5 rounded-full transition-all ${enabled ? "bg-[#F5C518]" : "bg-[#2A2A2A]"}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`}/>
    </button>);
}
const SECURITY_EVENTS = [
    { user: "W. Magagula", event: "Successful login via SSO", ip: "196.25.x.x", time: "2m ago", type: "success" },
    { user: "Unknown", event: "Failed login attempt (3 tries)", ip: "41.0.x.x", time: "14m ago", type: "warning" },
    { user: "K. Nkosi", event: "Account locked — max attempts exceeded", ip: "196.35.x.x", time: "1h ago", type: "danger" },
    { user: "S. Dlamini", event: "Off-site access OTP generated", ip: "102.0.x.x", time: "2h ago", type: "info" },
    { user: "System", event: "IP whitelist updated by admin", ip: "—", time: "3h ago", type: "info" },
    { user: "L. Zulu", event: "2FA enrolled on device", ip: "196.25.x.x", time: "5h ago", type: "success" },
];
const IP_RULES = [
    { range: "196.25.0.0/16", label: "HQ Network", status: "allowed" },
    { range: "10.0.0.0/8", label: "Internal VPN", status: "allowed" },
    { range: "41.0.0.0/8", label: "Blocked — External ISP", status: "blocked" },
];
export function SecurityAuth() {
    const [policies, setPolicies] = useState({
        twofa: true,
        sso: true,
        scim: false,
        ipRestrictions: true,
        sessionTimeout: true,
        passwordComplexity: true,
        offsiteOtp: true,
        auditLogging: true,
    });
    const [sessionMins, setSessionMins] = useState("30");
    const [minPassLen, setMinPassLen] = useState("12");
    const [showSecret, setShowSecret] = useState(false);
    const [saved, setSaved] = useState(false);
    const toggle = (key) => setPolicies((p) => ({ ...p, [key]: !p[key] }));
    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };
    return (<div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Security & Authentication</h1>
          <p className="text-[#444] text-xs mt-0.5">Configure access policies, 2FA, SSO, IP restrictions, and session controls</p>
        </div>
        <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "bg-[#F5C518] text-black hover:bg-[#E6B800]"}`}>
          {saved ? <><CheckCircle size={15}/> Saved!</> : <><Save size={15}/> Save Changes</>}
        </button>
      </div>

      {/* Security score */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-semibold">Security Score</h3>
          <span className="text-[#F5C518] text-xs">Last assessed: today</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1E1E1E" strokeWidth="8"/>
              <circle cx="40" cy="40" r="32" fill="none" stroke="#F5C518" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 32 * 0.78} ${2 * Math.PI * 32 * 0.22}`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-bold">78%</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            {[
            { label: "2FA Enforced", ok: true },
            { label: "SSO Active", ok: true },
            { label: "SCIM Provisioning", ok: false },
            { label: "IP Restrictions", ok: true },
            { label: "All Admins 2FA", ok: false },
            { label: "Session Timeout", ok: true },
        ].map((item) => (<div key={item.label} className="flex items-center gap-2 text-xs">
                {item.ok ? <CheckCircle size={13} className="text-green-400 flex-shrink-0"/> : <XCircle size={13} className="text-orange-400 flex-shrink-0"/>}
                <span className={item.ok ? "text-[#888]" : "text-[#666]"}>{item.label}</span>
              </div>))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Policy toggles */}
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5 space-y-1">
          <h3 className="text-white text-sm font-semibold mb-4">Access Policies</h3>
          {[
            { key: "twofa", icon: Shield, label: "Require 2FA", desc: "Mandatory two-factor for all accounts" },
            { key: "sso", icon: Key, label: "SSO / SAML Login", desc: "Allow sign-in via approved identity provider" },
            { key: "scim", icon: RefreshCw, label: "SCIM Provisioning", desc: "Auto-sync users from identity provider" },
            { key: "ipRestrictions", icon: Wifi, label: "IP Restrictions", desc: "Limit access to trusted network ranges" },
            { key: "sessionTimeout", icon: Lock, label: "Session Timeout", desc: "Auto-expire inactive sessions" },
            { key: "passwordComplexity", icon: Shield, label: "Password Complexity", desc: "Enforce minimum password standards" },
            { key: "offsiteOtp", icon: AlertTriangle, label: "Off-site OTP Control", desc: "Require OTP for off-site access requests" },
            { key: "auditLogging", icon: Eye, label: "Audit Logging", desc: "Log all authentication and access events" },
        ].map((item) => (<div key={item.key} className="flex items-center justify-between py-3 border-b border-[#0D0D0D] last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F5C518]/10 flex items-center justify-center">
                  <item.icon size={13} className="text-[#F5C518]"/>
                </div>
                <div>
                  <div className="text-white text-xs font-medium">{item.label}</div>
                  <div className="text-[#444] text-[10px]">{item.desc}</div>
                </div>
              </div>
              <Toggle enabled={policies[item.key]} onChange={() => toggle(item.key)}/>
            </div>))}
        </div>

        <div className="space-y-4">
          {/* Session & password settings */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Policy Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Session Timeout (minutes)</label>
                <input type="number" value={sessionMins} onChange={(e) => setSessionMins(e.target.value)} className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Minimum Password Length</label>
                <input type="number" value={minPassLen} onChange={(e) => setMinPassLen(e.target.value)} className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-1.5">SSO Entity ID / Client Secret</label>
                <div className="relative">
                  <input type={showSecret ? "text" : "password"} defaultValue="jyc-sso-secret-2026-prod" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
                  <button onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors">
                    {showSecret ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* IP whitelist */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">IP Allowlist / Blocklist</h3>
            <div className="space-y-2 mb-3">
              {IP_RULES.map((rule) => (<div key={rule.range} className="flex items-center justify-between bg-[#0D0D0D] rounded-xl px-3 py-2.5 border border-[#1A1A1A]">
                  <div>
                    <div className="text-white text-xs font-mono">{rule.range}</div>
                    <div className="text-[#444] text-[10px]">{rule.label}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${rule.status === "allowed" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {rule.status}
                  </span>
                </div>))}
            </div>
            <button className="flex items-center gap-1.5 text-xs text-[#F5C518] hover:text-[#E6B800] transition-colors">
              <Key size={12}/> Add IP Rule
            </button>
          </div>
        </div>
      </div>

      {/* Security events */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
        <h3 className="text-white text-sm font-semibold mb-4">Recent Security Events</h3>
        <div className="space-y-1">
          {SECURITY_EVENTS.map((ev, i) => {
            const colors = { success: "text-green-400", warning: "text-yellow-400", danger: "text-red-400", info: "text-blue-400" };
            const icons = { success: CheckCircle, warning: AlertTriangle, danger: XCircle, info: Shield };
            const Icon = icons[ev.type];
            return (<div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#141414] transition-all">
                <Icon size={13} className={colors[ev.type]}/>
                <div className="flex-1 min-w-0">
                  <span className="text-white text-xs font-medium">{ev.user}</span>
                  <span className="text-[#555] text-xs"> — {ev.event}</span>
                </div>
                <span className="text-[#333] text-[10px] font-mono">{ev.ip}</span>
                <span className="text-[#333] text-[10px] flex-shrink-0">{ev.time}</span>
              </div>);
        })}
        </div>
      </div>
    </div>);
}
