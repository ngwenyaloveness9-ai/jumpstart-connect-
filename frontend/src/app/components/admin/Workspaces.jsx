import { useState, useEffect, useCallback } from "react";
import { Plus, LayoutGrid, List, Users, Layers, MoreHorizontal, Search, Settings, Eye, Trash2, Lock, Loader2, ShieldCheck } from "lucide-react";
import { groupsApi } from "../../services/groupsApi";
import { WorkspaceEnvironment } from "./workspace/WorkspaceEnvironment";
const STATUS_STYLES = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  restricted: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  archived: "bg-[#2A2A2A] text-[#777] border-[#333]",
};

const DEPT_COLORS = ["#60A5FA", "#F5C518", "#F472B6", "#4ADE80", "#A78BFA", "#FB923C"];

function colorForDept(id) {
  return DEPT_COLORS[id % DEPT_COLORS.length];
}

export function Workspaces() {
  const currentUser =
  JSON.parse(localStorage.getItem("currentUser")) ||
  JSON.parse(localStorage.getItem("user"));

const userRole = currentUser?.role || "";
const userDepartment = currentUser?.department || "";

const canCreateWorkspace =
  userRole === "SuperAdmin" ||
  userRole === "System Administrator" ||
  userRole === "Organization Administrator";
    
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const [workspaces, setWorkspaces] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Department");
  const [newDepartment, setNewDepartment] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [autoAssign, setAutoAssign] = useState(true);
  const [autoAdmin, setAutoAdmin] = useState(true);
const [selectedWorkspace, setSelectedWorkspace] = useState(null);

const openWorkspace = (workspace) => {
    setSelectedWorkspace(workspace);
};

const closeWorkspace = () => {
    setSelectedWorkspace(null);
};
  const loadData = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      throw new Error("No logged-in user found");
    }

    const res = await groupsApi.list(currentUser.id);

    setWorkspaces(Array.isArray(res.groups) ? res.groups : []);
    setDepartments([]);
  } catch (err) {
    console.error("Failed to load workspaces:", err);
    setError("Couldn't load workspaces.");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (departments.length && !newDepartment) {
      setNewDepartment(String(departments[0].id));
    }
  }, [departments, newDepartment]);

  const visibleWorkspaces = workspaces;

const filtered = visibleWorkspaces.filter((w) =>
  w.name?.toLowerCase().includes(search.toLowerCase()) ||
  w.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
  w.department_name?.toLowerCase().includes(search.toLowerCase())
);

if (selectedWorkspace) {
    return (
        <WorkspaceEnvironment
            workspace={selectedWorkspace}
            messages={selectedWorkspace.messages || []}
            announcements={selectedWorkspace.announcements || []}
            members={selectedWorkspace.members || []}
            currentUser={currentUser}
            onBack={closeWorkspace}
        />
    );
}

  const resetCreateForm = () => {
    setNewName("");
    setNewType("Department");
    setNewDepartment(departments[0] ? String(departments[0].id) : "");
    setVisibility("private");
    setAutoAssign(true);
    setAutoAdmin(true);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await groupsApi.create({
        name: newName.trim(),
        type: newType,
        department: newDepartment || null,
        visibility,
        auto_assign: autoAssign,
        auto_admin: autoAdmin,
      });
      setShowCreate(false);
      resetCreateForm();
      await loadData();
    } catch (err) {
      console.error("Failed to create workspace:", err);
      setError("Couldn't create the workspace. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    setOpenMenu(null);
    try {
      await groupsApi.remove(id);
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Failed to delete workspace:", err);
      setError("Couldn't delete the workspace. Please try again.");
    }
  };

  const totalBoards = workspaces.reduce((a, w) => a + (w.boards_count ?? 0), 0);
  const totalMembers = workspaces.reduce((a, w) => a + (w.members_count ?? 0), 0);
  const restrictedCount = workspaces.filter((w) => w.status === "restricted").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#555]">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading workspaces…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Workspaces</h1>
          <p className="text-[#444] text-xs mt-0.5">Departmental and program-level containers for all work</p>
        </div>
        {canCreateWorkspace && (
  <button
    onClick={() => setShowCreate(true)}
    className="flex items-center gap-2 bg-[#F5C518] text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all"
  >
    <Plus size={15} />
    New Workspace
  </button>
)}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline hover:text-red-300">Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Workspaces", value: filtered.length, color: "#F5C518" },
          { label: "Total Boards", value: totalBoards, color: "#60A5FA" },
          { label: "Total Members", value: totalMembers, color: "#4ADE80" },
          { label: "Restricted", value: restrictedCount, color: "#FB923C" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4">
            <div className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[#444] text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces..."
            className="w-full bg-[#111111] border border-[#1E1E1E] text-white pl-9 pr-4 py-2 rounded-xl text-xs placeholder-[#333] focus:outline-none focus:border-[#F5C518]/40 transition-all"
          />
        </div>
        <div className="flex items-center bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
          <button onClick={() => setView("grid")} className={`p-2 transition-all ${view === "grid" ? "bg-[#F5C518]/10 text-[#F5C518]" : "text-[#444] hover:text-white"}`}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setView("list")} className={`p-2 transition-all ${view === "list" ? "bg-[#F5C518]/10 text-[#F5C518]" : "text-[#444] hover:text-white"}`}>
            <List size={15} />
          </button>
        </div>
      </div>

      {!filtered.length && (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-10 text-center text-[#444] text-sm">
          No workspaces match your search.
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ws) => {
            const color = colorForDept(ws.department_id ?? ws.id ?? 0);
            return (
              <div key={ws.id} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5 hover:border-[#2A2A2A] transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                      <Layers size={16} style={{ color }} />
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">{ws.name}</div>
                      <div className="text-[#444] text-[10px]">{ws.group_type}{ws.description ? ` · ${ws.description}` : ""}</div>
                    </div>
                  </div>
                  <div className="relative">
                    <button onClick={() => setOpenMenu(openMenu === ws.id ? null : ws.id)} className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-white transition-all">
                      <MoreHorizontal size={15} />
                    </button>
                    {openMenu === ws.id && (
                      <div className="absolute right-0 top-6 z-20 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 w-40 shadow-xl">
                        <button onClick={() => setOpenMenu(null)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-[#2A2A2A] transition-all text-white">
                          <Eye size={13} /> View Workspace
                        </button>
                        <button onClick={() => setOpenMenu(null)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-[#2A2A2A] transition-all text-white">
                          <Settings size={13} /> Settings
                        </button>
                        <button onClick={() => handleDelete(ws.id)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-[#2A2A2A] transition-all text-red-400">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border ${STATUS_STYLES[ws.status] ?? STATUS_STYLES.active}`}>
                    {ws.status ?? "active"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#666]">
                    {ws.visibility === "private" ? <Lock size={10} /> : <ShieldCheck size={10} />}
                    {ws.visibility === "private" ? "Private" : "Public"}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3 text-xs text-[#555]">
                  <div className="flex items-center gap-1"><Users size={11} /> {ws.members_count ?? 0} members</div>
                  <div className="flex items-center gap-1"><Layers size={11} /> {ws.boards_count ?? 0} boards</div>
                </div>

                <div className="flex items-center justify-between">

  <button
    onClick={() =>
      setExpanded(expanded === ws.id ? null : ws.id)
    }
    className="text-xs text-[#F5C518] hover:text-[#E6B800] transition-colors"
  >
    {expanded === ws.id
      ? "Hide boards ↑"
      : `View boards (${ws.boards_count ?? 0}) ↓`}
  </button>

  <button
    onClick={() => openWorkspace(ws)}
    className="px-4 py-2 rounded-lg bg-[#F5C518] text-black hover:bg-[#E6B800] transition-all"
  >
    Open Workspace
  </button>

</div>
                {expanded === ws.id && (
                  <div className="mt-3 space-y-1.5">
                    {(ws.boards ?? []).length === 0 && (
                      <div className="text-[10px] text-[#333]">No boards yet.</div>
                    )}
                    {(ws.boards ?? []).map((b) => (
                      <div key={b.id ?? b} className="flex items-center gap-2 text-xs text-[#888] bg-[#0D0D0D] rounded-lg px-3 py-1.5 border border-[#1A1A1A]">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        {b.name ?? b}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                {["Workspace", "Department", "Admin", "Members", "Boards", "Visibility", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-[#444] font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ws) => {
                const color = colorForDept(ws.department_id ?? ws.id ?? 0);
                return (
                  <tr key={ws.id} className="border-b border-[#0D0D0D] hover:bg-[#141414] transition-all group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                          <Layers size={12} style={{ color }} />
                        </div>
                        <span className="text-white font-medium">{ws.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#888]">
  {ws.description ?? "—"}
</td>
                    <td className="px-4 py-3 text-[#888]">{ws.admin_name ?? "Unassigned"}</td>
                    <td className="px-4 py-3 text-[#888]">{ws.members_count ?? 0}</td>
                    <td className="px-4 py-3 text-[#888]">{ws.boards_count ?? 0}</td>
                    <td className="px-4 py-3 text-[#888] capitalize">{ws.visibility ?? "private"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLES[ws.status] ?? STATUS_STYLES.active}`}>
                        {ws.status ?? "active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(ws.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-red-400 transition-all"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
     {canCreateWorkspace && showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-white font-semibold text-base mb-1">Create Workspace</h2>
            <p className="text-[#444] text-xs mb-5">Workspaces organise boards by department, program, or business unit.</p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Workspace Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Marketing"
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all"
                />
              </div>
     
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Workspace Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all"
                >
                  {["Department", "Program", "Restricted", "Temporary"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#888] block mb-1.5">Department</label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all"
                >
                  {departments.length === 0 && <option value="">No departments found</option>}
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#888] block mb-1.5">Visibility</label>
                <div className="flex bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl overflow-hidden">
                  {["private", "public"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVisibility(v)}
                      className={`flex-1 py-2 text-xs capitalize transition-all ${visibility === v ? "bg-[#F5C518]/10 text-[#F5C518]" : "text-[#666] hover:text-white"}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-[#888] cursor-pointer">
                <input type="checkbox" checked={autoAssign} onChange={(e) => setAutoAssign(e.target.checked)} className="accent-[#F5C518]" />
                Automatically add department members
              </label>

              <label className="flex items-center gap-2.5 text-xs text-[#888] cursor-pointer">
                <input type="checkbox" checked={autoAdmin} onChange={(e) => setAutoAdmin(e.target.checked)} className="accent-[#F5C518]" />
                Make Head of Department workspace admin
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
  onClick={handleCreate}
  disabled={creating || !newName.trim()}
  className="flex-1 bg-[#F5C518] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
  {creating && <Loader2 size={14} className="animate-spin" />}
  {creating ? "Creating…" : "Create"}
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}