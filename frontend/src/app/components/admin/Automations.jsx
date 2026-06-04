import { useState } from "react";
import { Plus, Zap, Trash2, Edit2, CheckCircle, Clock, AlertTriangle, ChevronRight } from "lucide-react";
function Toggle({ enabled, onChange }) {
    return (<button onClick={onChange} className={`relative w-9 h-4.5 rounded-full transition-all ${enabled ? "bg-[#F5C518]" : "bg-[#2A2A2A]"}`} style={{ height: "20px", width: "36px" }}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`}/>
    </button>);
}
const AUTOMATIONS = [
    {
        id: 1, name: "Overdue Task Escalation", trigger: "Task due date passes", action: "Notify board owner + team lead", workspace: "Operations", runs: 48, lastRun: "1h ago", enabled: true, status: "healthy",
    },
    {
        id: 2, name: "New Request Assignment", trigger: "Form submitted", action: "Create board item + assign to ops manager", workspace: "Operations", runs: 112, lastRun: "30m ago", enabled: true, status: "healthy",
    },
    {
        id: 3, name: "Off-site Access Expiry", trigger: "OTP expires", action: "Lock access + notify IT Lead", workspace: "Technology", runs: 17, lastRun: "4h ago", enabled: true, status: "healthy",
    },
    {
        id: 4, name: "Recruitment Status Update", trigger: "Item status changed to 'Interviewed'", action: "Move to 'Offer Stage' + notify HR manager", workspace: "Human Resources", runs: 9, lastRun: "2d ago", enabled: true, status: "healthy",
    },
    {
        id: 5, name: "Budget Approval Reminder", trigger: "Item stuck > 3 days", action: "Send reminder to Finance head", workspace: "Finance", runs: 6, lastRun: "1d ago", enabled: false, status: "paused",
    },
    {
        id: 6, name: "New User Welcome Email", trigger: "User account activated", action: "Send onboarding email + assign default workspace", workspace: "Technology", runs: 34, lastRun: "5h ago", enabled: true, status: "healthy",
    },
    {
        id: 7, name: "Project Completion Archive", trigger: "All items marked 'Done'", action: "Archive board + notify Project lead", workspace: "Projects", runs: 4, lastRun: "3d ago", enabled: true, status: "warning",
    },
];
const TEMPLATES = [
    { name: "Overdue Escalation", desc: "Notify owner when item passes due date", icon: AlertTriangle, color: "#FB923C" },
    { name: "Status Change Action", desc: "Trigger action when item status changes", icon: Zap, color: "#F5C518" },
    { name: "Form-to-Board", desc: "Create board items from form submissions", icon: CheckCircle, color: "#4ADE80" },
    { name: "Scheduled Reminder", desc: "Send reminders on a recurring schedule", icon: Clock, color: "#60A5FA" },
];
export function Automations() {
    const [automations, setAutomations] = useState(AUTOMATIONS);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newTrigger, setNewTrigger] = useState("");
    const [newAction, setNewAction] = useState("");
    const [newWorkspace, setNewWorkspace] = useState("Technology");
    const toggleEnabled = (id) => {
        setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, enabled: !a.enabled, status: !a.enabled ? "healthy" : "paused" } : a));
    };
    const deleteAutomation = (id) => {
        setAutomations((prev) => prev.filter((a) => a.id !== id));
    };
    const statusColor = (s) => ({
        healthy: "text-green-400 bg-green-500/10 border-green-500/20",
        paused: "text-[#666] bg-[#2A2A2A] border-[#333]",
        warning: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    }[s] || "text-[#666] bg-[#2A2A2A] border-[#333]");
    return (<div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Automations</h1>
          <p className="text-[#444] text-xs mt-0.5">No-code workflow rules that trigger actions based on events</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-[#F5C518] text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">
          <Plus size={15}/> New Automation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
            { label: "Total Rules", value: automations.length, color: "#F5C518" },
            { label: "Active", value: automations.filter((a) => a.enabled).length, color: "#4ADE80" },
            { label: "Total Runs", value: automations.reduce((s, a) => s + a.runs, 0), color: "#60A5FA" },
            { label: "Warnings", value: automations.filter((a) => a.status === "warning").length, color: "#FB923C" },
        ].map((s) => (<div key={s.label} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4">
            <div className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[#444] text-xs">{s.label}</div>
          </div>))}
      </div>

      {/* Templates */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
        <h3 className="text-white text-sm font-semibold mb-4">Quick Templates</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATES.map((t) => (<button key={t.name} onClick={() => { setNewName(t.name); setNewTrigger(""); setNewAction(""); setShowCreate(true); }} className="flex flex-col items-start gap-2 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl p-3 hover:border-[#F5C518]/30 transition-all text-left">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${t.color}15` }}>
                <t.icon size={14} style={{ color: t.color }}/>
              </div>
              <div>
                <div className="text-white text-xs font-medium">{t.name}</div>
                <div className="text-[#444] text-[10px] mt-0.5">{t.desc}</div>
              </div>
              <div className="flex items-center gap-1 text-[#F5C518] text-[10px]">Use template <ChevronRight size={10}/></div>
            </button>))}
        </div>
      </div>

      {/* Automation list */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1A1A1A]">
          <h3 className="text-white text-sm font-semibold">Active Rules</h3>
        </div>
        <div className="divide-y divide-[#0D0D0D]">
          {automations.map((auto) => (<div key={auto.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#141414] transition-all group">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${auto.enabled ? "bg-[#F5C518]/10" : "bg-[#1A1A1A]"}`}>
                <Zap size={14} className={auto.enabled ? "text-[#F5C518]" : "text-[#333]"}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">{auto.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(auto.status)}`}>{auto.status}</span>
                </div>
                <div className="text-[#555] text-xs mb-1">
                  <span className="text-[#888]">When:</span> {auto.trigger}
                </div>
                <div className="text-[#555] text-xs mb-2">
                  <span className="text-[#888]">Then:</span> {auto.action}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-[#444]">
                  <span>{auto.workspace}</span>
                  <span>{auto.runs} runs</span>
                  <span>Last: {auto.lastRun}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Toggle enabled={auto.enabled} onChange={() => toggleEnabled(auto.id)}/>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-white">
                  <Edit2 size={13}/>
                </button>
                <button onClick={() => deleteAutomation(auto.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-red-400">
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>))}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-white font-semibold text-base mb-1">Create Automation</h2>
            <p className="text-[#444] text-xs mb-5">Define a trigger event and the action to perform automatically.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Rule Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Overdue Task Escalation" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Trigger (When...)</label>
                <select className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all">
                  {["Task due date passes", "Item status changes", "Form is submitted", "Item is created", "User is added", "Item is overdue by 3+ days"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Action (Then...)</label>
                <select className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all">
                  {["Notify board owner", "Send email notification", "Move item to next status", "Create new board item", "Assign to team member", "Archive board"].map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Workspace</label>
                <select value={newWorkspace} onChange={(e) => setNewWorkspace(e.target.value)} className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all">
                  {["Technology", "Operations", "Human Resources", "Finance", "Projects"].map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-[#2A2A2A] text-[#888] py-2.5 rounded-xl text-sm hover:text-white transition-all">Cancel</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-[#F5C518] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">Create Rule</button>
            </div>
          </div>
        </div>)}
    </div>);
}
