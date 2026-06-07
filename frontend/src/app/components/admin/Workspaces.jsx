import { useState } from "react";
import { Plus, LayoutGrid, List, Users, Layers, MoreHorizontal, Search, Settings, Eye, Trash2, Lock } from "lucide-react";
const WORKSPACES = [
    {
        id: 1, name: "Technology", owner: "W. Magagula", members: 14, boards: 15, type: "Department",
        status: "active", created: "Jan 2026", color: "#60A5FA",
        boards_list: ["Infrastructure", "DevOps Pipeline", "Security Controls", "API Management", "SRD Tracker"],
    },
    {
        id: 2, name: "Operations", owner: "S. Dlamini", members: 22, boards: 12, type: "Department",
        status: "active", created: "Jan 2026", color: "#F5C518",
        boards_list: ["Daily Ops", "Incident Management", "Fleet Tracking", "Supplier Relations", "Compliance"],
    },
    {
        id: 3, name: "Human Resources", owner: "R. Mthembu", members: 8, boards: 8, type: "Department",
        status: "active", created: "Feb 2026", color: "#F472B6",
        boards_list: ["Recruitment Q3", "Onboarding", "Leave Management", "Performance Reviews"],
    },
    {
        id: 4, name: "Finance", owner: "K. Nkosi", members: 6, boards: 6, type: "Department",
        status: "active", created: "Feb 2026", color: "#4ADE80",
        boards_list: ["Budget 2026", "Expense Reports", "Audit Prep", "Payroll"],
    },
    {
        id: 5, name: "Projects", owner: "N. Khumalo", members: 18, boards: 11, type: "Program",
        status: "active", created: "Mar 2026", color: "#A78BFA",
        boards_list: ["Platform Rollout", "Phase 2 Workflows", "Integration Tracker", "Training Roadmap"],
    },
    {
        id: 6, name: "Executive", owner: "W. Magagula", members: 5, boards: 3, type: "Restricted",
        status: "restricted", created: "Mar 2026", color: "#FB923C",
        boards_list: ["KPI Dashboard", "Board Reports", "Strategic Planning"],
    },
];
export function Workspaces() {
    const [view, setView] = useState("grid");
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState("Department");
    const [openMenu, setOpenMenu] = useState(null);
    const filtered = WORKSPACES.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.owner.toLowerCase().includes(search.toLowerCase()));
    return (<div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">Workspaces</h1>
          <p className="text-[#F5C518] text-xs mt-0.5">Departmental and program-level containers for all work</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-[#F5C518] text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">
          <Plus size={15}/> New Workspace
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
            { label: "Total Workspaces", value: WORKSPACES.length, color: "#F5C518" },
            { label: "Total Boards", value: WORKSPACES.reduce((a, w) => a + w.boards, 0), color: "#60A5FA" },
            { label: "Total Members", value: WORKSPACES.reduce((a, w) => a + w.members, 0), color: "#4ADE80" },
            { label: "Restricted", value: WORKSPACES.filter((w) => w.status === "restricted").length, color: "#FB923C" },
        ].map((s) => (<div key={s.label} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4">
            <div className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[#444] text-xs">{s.label}</div>
          </div>))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workspaces..." className="w-full bg-[#111111] border border-[#1E1E1E] text-white pl-9 pr-4 py-2 rounded-xl text-xs placeholder-[#333] focus:outline-none focus:border-[#F5C518]/40 transition-all"/>
        </div>
        <div className="flex items-center bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
          <button onClick={() => setView("grid")} className={`p-2 transition-all ${view === "grid" ? "bg-[#F5C518]/10 text-[#F5C518]" : "text-[#444] hover:text-white"}`}>
            <LayoutGrid size={15}/>
          </button>
          <button onClick={() => setView("list")} className={`p-2 transition-all ${view === "list" ? "bg-[#F5C518]/10 text-[#F5C518]" : "text-[#444] hover:text-white"}`}>
            <List size={15}/>
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ws) => (<div key={ws.id} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5 hover:border-[#2A2A2A] transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ws.color}20` }}>
                    <Layers size={16} style={{ color: ws.color }}/>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{ws.name}</div>
                    <div className="text-[#444] text-[10px]">{ws.type}</div>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === ws.id ? null : ws.id)} className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-white transition-all">
                    <MoreHorizontal size={15}/>
                  </button>
                  {openMenu === ws.id && (<div className="absolute right-0 top-6 z-20 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 w-40 shadow-xl">
                      {[
                        { icon: Eye, label: "View Workspace" },
                        { icon: Settings, label: "Settings" },
                        { icon: Trash2, label: "Delete", danger: true },
                    ].map((a) => (<button key={a.label} onClick={() => setOpenMenu(null)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-[#2A2A2A] transition-all ${a.danger ? "text-red-400" : "text-white"}`}>
                          <a.icon size={13}/> {a.label}
                        </button>))}
                    </div>)}
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4 text-xs text-[#555]">
                <div className="flex items-center gap-1"><Users size={11}/> {ws.members} members</div>
                <div className="flex items-center gap-1"><Layers size={11}/> {ws.boards} boards</div>
                {ws.status === "restricted" && <Lock size={11} className="text-orange-400"/>}
              </div>
              <div className="text-[#333] text-[10px] mb-3">Owner: <span className="text-[#666]">{ws.owner}</span></div>
              <button onClick={() => setExpanded(expanded === ws.id ? null : ws.id)} className="text-xs text-[#F5C518] hover:text-[#E6B800] transition-colors">
                {expanded === ws.id ? "Hide boards ↑" : `View boards (${ws.boards_list.length}) ↓`}
              </button>
              {expanded === ws.id && (<div className="mt-3 space-y-1.5">
                  {ws.boards_list.map((b) => (<div key={b} className="flex items-center gap-2 text-xs text-[#888] bg-[#0D0D0D] rounded-lg px-3 py-1.5 border border-[#1A1A1A]">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: ws.color }}/>
                      {b}
                    </div>))}
                </div>)}
            </div>))}
        </div>)}

      {/* List view */}
      {view === "list" && (<div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                {["Workspace", "Type", "Owner", "Members", "Boards", "Status", "Created", ""].map((h) => (<th key={h} className="text-left text-[#444] font-medium px-4 py-3">{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ws) => (<tr key={ws.id} className="border-b border-[#0D0D0D] hover:bg-[#141414] transition-all group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${ws.color}20` }}>
                        <Layers size={12} style={{ color: ws.color }}/>
                      </div>
                      <span className="text-white font-medium">{ws.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{ws.type}</td>
                  <td className="px-4 py-3 text-[#888]">{ws.owner}</td>
                  <td className="px-4 py-3 text-[#888]">{ws.members}</td>
                  <td className="px-4 py-3 text-[#888]">{ws.boards}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${ws.status === "restricted" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
                      {ws.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#555]">{ws.created}</td>
                  <td className="px-4 py-3">
                    <button className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-white transition-all"><MoreHorizontal size={14}/></button>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>)}

      {/* Create modal */}
      {showCreate && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-white font-semibold text-base mb-1">Create Workspace</h2>
            <p className="text-[#444] text-xs mb-5">Workspaces organise boards by department, program, or business unit.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Workspace Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Marketing" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Type</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all">
                  {["Department", "Program", "Restricted", "Temporary"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-[#2A2A2A] text-[#888] py-2.5 rounded-xl text-sm hover:text-white transition-all">Cancel</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-[#F5C518] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">Create</button>
            </div>
          </div>
        </div>)}
    </div>);
}
