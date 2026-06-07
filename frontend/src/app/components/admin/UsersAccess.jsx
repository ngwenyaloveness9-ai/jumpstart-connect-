import { useState } from "react";
import { Search, Plus, MoreHorizontal, UserCheck, UserX, Mail, Download, Edit2, Trash2, Shield, ChevronDown, } from "lucide-react";
const ROLES = ["All Roles", "System Admin", "Administrator", "Employee", "Viewer", "Board Owner"];
const DEPTS = ["All Departments", "Technology", "Operations", "HR", "Finance", "IT", "Projects"];
const STATUSES = ["All", "Active", "Inactive", "Pending"];
const USERS = [
    { id: 1, name: "W. Magagula", email: "w.magagula@jumpstartyourcareer.co.za", role: "System Admin", dept: "Technology", status: "active", joined: "Jan 2026", last: "2m ago", twofa: true },
    { id: 2, name: "S. Dlamini", email: "s.dlamini@jumpstartyourcareer.co.za", role: "Administrator", dept: "Operations", status: "active", joined: "Feb 2026", last: "1h ago", twofa: true },
    { id: 3, name: "T. Mokoena", email: "t.mokoena@jumpstartyourcareer.co.za", role: "Employee", dept: "HR", status: "active", joined: "Feb 2026", last: "3h ago", twofa: false },
    { id: 4, name: "K. Nkosi", email: "k.nkosi@jumpstartyourcareer.co.za", role: "Viewer", dept: "Finance", status: "inactive", joined: "Jan 2026", last: "5d ago", twofa: false },
    { id: 5, name: "L. Zulu", email: "l.zulu@jumpstartyourcareer.co.za", role: "Board Owner", dept: "IT", status: "active", joined: "Mar 2026", last: "30m ago", twofa: true },
    { id: 6, name: "N. Khumalo", email: "n.khumalo@jumpstartyourcareer.co.za", role: "Employee", dept: "Projects", status: "active", joined: "Mar 2026", last: "2h ago", twofa: false },
    { id: 7, name: "P. Ndlovu", email: "p.ndlovu@jumpstartyourcareer.co.za", role: "Employee", dept: "Operations", status: "pending", joined: "Apr 2026", last: "—", twofa: false },
    { id: 8, name: "R. Mthembu", email: "r.mthembu@jumpstartyourcareer.co.za", role: "Administrator", dept: "HR", status: "active", joined: "Apr 2026", last: "1d ago", twofa: true },
    { id: 9, name: "B. Sithole", email: "b.sithole@jumpstartyourcareer.co.za", role: "Viewer", dept: "Finance", status: "active", joined: "May 2026", last: "6h ago", twofa: false },
    { id: 10, name: "C. Hadebe", email: "c.hadebe@jumpstartyourcareer.co.za", role: "Employee", dept: "IT", status: "pending", joined: "May 2026", last: "—", twofa: false },
];
const STATUS_STYLE = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    inactive: "bg-[#2A2A2A] text-[#666] border-[#333]",
    pending: "bg-[#F5C518]/10 text-[#F5C518] border-[#F5C518]/20",
};
const ROLE_COLORS = {
    "System Admin": "text-red-400",
    "Administrator": "text-orange-400",
    "Board Owner": "text-[#F5C518]",
    "Employee": "text-blue-400",
    "Viewer": "text-[#666]",
};
export function UsersAccess() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Roles");
    const [deptFilter, setDeptFilter] = useState("All Departments");
    const [statusFilter, setStatusFilter] = useState("All");
    const [openMenu, setOpenMenu] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Employee");
    const [inviteDept, setInviteDept] = useState("Technology");
    const filtered = USERS.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "All Roles" || u.role === roleFilter;
        const matchDept = deptFilter === "All Departments" || u.dept === deptFilter;
        const matchStatus = statusFilter === "All" || u.status === statusFilter;
        return matchSearch && matchRole && matchDept && matchStatus;
    });
    return (<div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">Users & Access</h1>
          <p className="text-[#F5C518] text-xs mt-0.5">Manage platform users, roles, and access permissions</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 bg-[#F5C518] text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">
          <Plus size={15}/> Add Member
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
            { label: "Total Users", value: USERS.length, color: "#F5C518" },
            { label: "Active", value: USERS.filter((u) => u.status === "active").length, color: "#4ADE80" },
            { label: "Pending", value: USERS.filter((u) => u.status === "pending").length, color: "#FBBF24" },
            { label: "2FA Enabled", value: USERS.filter((u) => u.twofa).length, color: "#60A5FA" },
        ].map((s) => (<div key={s.label} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4">
            <div className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[#444] text-xs">{s.label}</div>
          </div>))}
      </div>

      {/* Filters */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full bg-[#0D0D0D] border border-[#1E1E1E] text-white pl-9 pr-4 py-2 rounded-xl text-xs placeholder-[#333] focus:outline-none focus:border-[#F5C518]/40 transition-all"/>
        </div>
        {[
            { label: "Role", value: roleFilter, options: ROLES, set: setRoleFilter },
            { label: "Dept", value: deptFilter, options: DEPTS, set: setDeptFilter },
            { label: "Status", value: statusFilter, options: STATUSES, set: setStatusFilter },
        ].map((f) => (<div key={f.label} className="relative">
            <select value={f.value} onChange={(e) => f.set(e.target.value)} className="appearance-none bg-[#0D0D0D] border border-[#1E1E1E] text-[#888] text-xs px-3 py-2 pr-8 rounded-xl focus:outline-none focus:border-[#F5C518]/40 transition-all cursor-pointer">
              {f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"/>
          </div>))}
        <button className="flex items-center gap-1.5 text-[#555] text-xs border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-2 rounded-xl hover:border-[#2A2A2A] hover:text-white transition-all ml-auto">
          <Download size={13}/> Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                {["User", "Role", "Department", "Status", "2FA", "Last Active", "Joined", ""].map((h) => (<th key={h} className="text-left text-[#444] font-medium px-4 py-3">{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (<tr key={user.id} className="border-b border-[#0D0D0D] hover:bg-[#141414] transition-all group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#F5C518]/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#F5C518] text-[9px] font-bold">{user.name.split(" ").map((n) => n[0]).join("")}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-[#444] text-[10px]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${ROLE_COLORS[user.role] || "text-[#888]"}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{user.dept}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLE[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.twofa ? (<Shield size={13} className="text-green-400"/>) : (<Shield size={13} className="text-[#333]"/>)}
                  </td>
                  <td className="px-4 py-3 text-[#555]">{user.last}</td>
                  <td className="px-4 py-3 text-[#555]">{user.joined}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-white p-1">
                        <MoreHorizontal size={14}/>
                      </button>
                      {openMenu === user.id && (<div className="absolute right-0 top-7 z-20 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 w-44 shadow-xl">
                          {[
                    { icon: Edit2, label: "Edit User", color: "text-white" },
                    { icon: Mail, label: "Send Reset Link", color: "text-white" },
                    { icon: user.status === "active" ? UserX : UserCheck, label: user.status === "active" ? "Deactivate" : "Activate", color: user.status === "active" ? "text-orange-400" : "text-green-400" },
                    { icon: Trash2, label: "Remove User", color: "text-red-400" },
                ].map((action) => (<button key={action.label} onClick={() => setOpenMenu(null)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-[#2A2A2A] transition-all ${action.color}`}>
                              <action.icon size={13}/> {action.label}
                            </button>))}
                        </div>)}
                    </div>
                  </td>
                </tr>))}
            </tbody>
          </table>
          {filtered.length === 0 && (<div className="text-center text-[#444] py-10 text-sm">No users match your filters.</div>)}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-white font-semibold text-base mb-1">Invite New User</h2>
            <p className="text-[#444] text-xs mb-5">Only approved organisational email domains are permitted.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Email Address</label>
                <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@jumpstartyourcareer.co.za" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#888] block mb-1.5">Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all">
                    {["Employee", "Administrator", "Board Owner", "Viewer"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#888] block mb-1.5">Department</label>
                  <select value={inviteDept} onChange={(e) => setInviteDept(e.target.value)} className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all">
                    {["Technology", "Operations", "HR", "Finance", "IT", "Projects"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 border border-[#2A2A2A] text-[#888] py-2.5 rounded-xl text-sm hover:text-white hover:border-[#3A3A3A] transition-all">Cancel</button>
              <button onClick={() => setShowInviteModal(false)} className="flex-1 bg-[#F5C518] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">Send Invite</button>
            </div>
          </div>
        </div>)}
    </div>);
}
