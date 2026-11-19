import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, FolderKanban, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { projectsApi } from "../services/projectsApi";

const PROJECT_STATUSES = ["Active", "On Hold", "Completed"];
const PLAN_STATUSES = ["To Do", "In Progress", "Review", "Done"];
const MANAGER_ROLES = ["manager", "department manager", "head of department", "supervisor", "head of technology", "superadmin", "admin", "administrator"];
const EVENT_COLORS = {
  project_start: "bg-emerald-500",
  project_end: "bg-rose-500",
  plan_start: "bg-sky-500",
  plan_end: "bg-amber-500",
};

const readCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "{}");
  } catch {
    return {};
  }
};

const fullName = (user) => user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email || "Unassigned";
const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "No date";
const localDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function ProjectForm({ members, currentUser, onCancel, onCreated }) {
  const isAdmin = currentUser.is_superuser || ["superadmin", "admin", "administrator"].includes(String(currentUser.role || currentUser.role_name || "").toLowerCase());
  const [form, setForm] = useState({ name: "", description: "", department: currentUser.department || "", start_date: "", end_date: "", leader_id: String(currentUser.id || ""), member_ids: [] });
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [draftMemberIds, setDraftMemberIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const change = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const toggleDraftMember = (memberId) => setDraftMemberIds((previous) => previous.includes(memberId) ? previous.filter((id) => id !== memberId) : [...previous, memberId]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await projectsApi.create({ ...form, leader_id: Number(form.leader_id), member_ids: form.member_ids.map(Number) });
      await onCreated(created);
    } catch (requestError) {
      setError(requestError.message || "Could not create the project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="border-b border-border bg-secondary/30 px-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Create a project</h3>
        <button type="button" onClick={onCancel} aria-label="Close project form" className="rounded p-1 text-muted-foreground hover:bg-secondary"><X size={16} /></button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs text-muted-foreground">Project name<input required name="name" value={form.name} onChange={change} maxLength={200} className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        {isAdmin && <label className="text-xs text-muted-foreground">Department<input required name="department" value={form.department} onChange={change} className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>}
        <label className="text-xs text-muted-foreground">Start date<input type="date" name="start_date" value={form.start_date} onChange={change} className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <label className="text-xs text-muted-foreground">End date<input type="date" name="end_date" value={form.end_date} onChange={change} className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <label className="text-xs text-muted-foreground md:col-span-2">Description<textarea name="description" value={form.description} onChange={change} rows={3} className="mt-1.5 w-full resize-y rounded border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <label className="text-xs text-muted-foreground md:col-span-2">Project leader<select required name="leader_id" value={form.leader_id} onChange={change} className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground">{members.map((member) => <option key={member.id} value={member.id}>{fullName(member)} · {member.department || "No department"}</option>)}</select></label>
        <div className="relative text-xs text-muted-foreground md:col-span-2">
          <span>Project members</span>
          <button type="button" aria-expanded={memberPickerOpen} onClick={() => { setDraftMemberIds(form.member_ids); setMemberPickerOpen((open) => !open); }} className="mt-1.5 flex w-full items-center justify-between rounded border border-border bg-background px-3 py-2.5 text-left text-sm text-foreground hover:border-primary/50">
            <span>{form.member_ids.length ? `${form.member_ids.length} member${form.member_ids.length === 1 ? "" : "s"} selected` : "Select project members"}</span>
            <ChevronDown size={15} className={`text-muted-foreground transition-transform ${memberPickerOpen ? "rotate-180" : ""}`} />
          </button>
          {form.member_ids.length > 0 && <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{members.filter((member) => form.member_ids.includes(String(member.id))).map(fullName).join(", ")}</p>}
          {memberPickerOpen && <div className="absolute z-20 mt-1 w-full rounded border border-border bg-background shadow-lg">
            <div className="max-h-64 overflow-y-auto p-1">
              {members.map((member) => <label key={member.id} className="flex cursor-pointer items-center gap-2.5 rounded px-2.5 py-2 text-sm text-foreground hover:bg-secondary/70">
                <input type="checkbox" checked={draftMemberIds.includes(String(member.id))} onChange={() => toggleDraftMember(String(member.id))} className="h-4 w-4 accent-primary" />
                <span className="min-w-0 flex-1 truncate">{fullName(member)}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{member.department || "No department"}</span>
              </label>)}
              {!members.length && <p className="px-3 py-4 text-center text-sm text-muted-foreground">No active users found.</p>}
            </div>
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="text-xs text-muted-foreground">{draftMemberIds.length} selected</span>
              <button type="button" onClick={() => { setForm((previous) => ({ ...previous, member_ids: draftMemberIds })); setMemberPickerOpen(false); }} className="rounded bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Done</button>
            </div>
          </div>}
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
      <div className="mt-4 flex justify-end"><button disabled={saving} className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"><Check size={15} />{saving ? "Creating..." : "Create project"}</button></div>
    </form>
  );
}

function PlanItemEditor({ item, members, onCancel, onSave }) {
  const [form, setForm] = useState({
    item: item?.item || "",
    description: item?.description || "",
    start_date: item?.start_date || "",
    end_date: item?.end_date || "",
    responsible_person_id: item?.responsible_person?.id ? String(item.responsible_person.id) : "",
    status: item?.status || "To Do",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const change = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, responsible_person_id: form.responsible_person_id ? Number(form.responsible_person_id) : null });
    } catch (requestError) {
      setError(requestError.message || "Could not save the implementation-plan row.");
    } finally {
      setSaving(false);
    }
  };

  return <form onSubmit={submit} className="min-w-[900px] border-b border-border bg-secondary/25 p-3">
    <div className="grid grid-cols-[1fr_1.5fr_145px_145px_1fr_130px_auto] items-start gap-2">
      <input required aria-label="Item" name="item" value={form.item} onChange={change} placeholder="Item" className="min-w-0 rounded border border-border bg-background px-2 py-2 text-xs text-foreground" />
      <textarea aria-label="Description" name="description" value={form.description} onChange={change} placeholder="Description" rows={2} className="min-w-0 resize-y rounded border border-border bg-background px-2 py-2 text-xs text-foreground" />
      <input aria-label="Start date" type="date" name="start_date" value={form.start_date} onChange={change} className="min-w-0 rounded border border-border bg-background px-2 py-2 text-xs text-foreground" />
      <input aria-label="End date" type="date" name="end_date" value={form.end_date} onChange={change} className="min-w-0 rounded border border-border bg-background px-2 py-2 text-xs text-foreground" />
      <select aria-label="Responsible person" name="responsible_person_id" value={form.responsible_person_id} onChange={change} className="min-w-0 rounded border border-border bg-background px-2 py-2 text-xs text-foreground"><option value="">Select person</option>{members.map((member) => <option key={member.id} value={member.id}>{fullName(member)}</option>)}</select>
      <select aria-label="Status" name="status" value={form.status} onChange={change} className="min-w-0 rounded border border-border bg-background px-2 py-2 text-xs text-foreground">{PLAN_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
      <div className="flex gap-1"><button disabled={saving} aria-label="Save row" title="Save row" className="rounded bg-primary p-2 text-primary-foreground disabled:opacity-60"><Check size={14} /></button><button type="button" onClick={onCancel} aria-label="Cancel" title="Cancel" className="rounded border border-border p-2 text-muted-foreground hover:bg-secondary"><X size={14} /></button></div>
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
  </form>;
}

function ProjectCalendar({ onOpenProject }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  useEffect(() => {
    let active = true;
    const start = localDateString(new Date(year, monthIndex, 1));
    const end = localDateString(new Date(year, monthIndex + 1, 0));
    projectsApi.calendar({ start, end }).then((result) => {
      if (active) setEvents(result);
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Could not load calendar events.");
    });
    return () => { active = false; };
  }, [year, monthIndex]);

  const days = useMemo(() => {
    const total = new Date(year, monthIndex + 1, 0).getDate();
    const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    return [...Array(offset).fill(null), ...Array.from({ length: total }, (_, index) => index + 1)];
  }, [year, monthIndex]);
  const byDate = useMemo(() => events.reduce((map, event) => map.set(event.date, [...(map.get(event.date) || []), event]), new Map()), [events]);
  const agenda = events.filter((event) => event.date.slice(0, 7) === `${year}-${String(monthIndex + 1).padStart(2, "0")}`);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-medium uppercase text-muted-foreground">Project schedule</p><h2 className="mt-1 text-lg font-semibold">{monthLabel}</h2></div>
        <div className="flex items-center gap-1"><button onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} aria-label="Previous month" className="rounded border border-border p-2 hover:bg-secondary"><ArrowLeft size={16} /></button><button onClick={() => setMonth(new Date())} className="rounded border border-border px-3 py-2 text-xs hover:bg-secondary">Today</button><button onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} aria-label="Next month" className="rounded border border-border p-2 hover:bg-secondary"><ArrowRight size={16} /></button></div>
      </div>
      {error && <p role="alert" className="mb-3 text-sm text-rose-600">{error}</p>}
      <div className="grid grid-cols-7 border-l border-t border-border">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day} className="border-b border-r border-border bg-secondary/40 px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground">{day}</div>)}
        {days.map((day, index) => {
          const dateKey = day ? `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
          const dayEvents = byDate.get(dateKey) || [];
          return <div key={`${dateKey || "blank"}-${index}`} className="min-h-24 border-b border-r border-border p-1.5 sm:min-h-28 sm:p-2">
            <span className={`text-xs ${dateKey === localDateString(new Date()) ? "font-bold text-primary" : "text-muted-foreground"}`}>{day || ""}</span>
            <div className="mt-1 flex flex-wrap gap-1">{dayEvents.slice(0, 4).map((event) => <span key={event.id} title={`${event.type.replaceAll("_", " ")}: ${event.title}`} className={`h-1.5 w-1.5 rounded-full ${EVENT_COLORS[event.type] || "bg-primary"}`} />)}</div>
            <div className="mt-1 space-y-0.5">{dayEvents.slice(0, 3).map((event) => <p key={event.id} title={`${event.type.replaceAll("_", " ")}: ${event.title}`} className="truncate border-l-2 border-primary/60 pl-1 text-[9px] leading-tight text-foreground sm:text-[10px]">{event.type.replaceAll("_", " ")}: {event.title}</p>)}{dayEvents.length > 3 && <p className="pl-1 text-[9px] leading-tight text-muted-foreground">+{dayEvents.length - 3} more</p>}</div>
          </div>;
        })}
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_220px]">
        <div><h3 className="mb-3 text-sm font-semibold">Schedule · {agenda.length}</h3>{agenda.length ? <ul className="divide-y divide-border">{agenda.map((event) => <li key={event.id} className="flex items-start gap-3 py-3"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${EVENT_COLORS[event.type] || "bg-primary"}`} /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{event.title}</p><p className="mt-0.5 text-xs capitalize text-muted-foreground">{event.type.replaceAll("_", " ")} · {formatDate(event.date)}</p></div><button onClick={() => onOpenProject(event.projectId)} className="text-xs font-medium text-primary hover:underline">Project</button></li>)}</ul> : <p className="py-4 text-sm text-muted-foreground">No project or implementation-plan dates this month.</p>}</div>
        <div className="space-y-2 text-xs text-muted-foreground"><h3 className="mb-3 text-sm font-semibold text-foreground">Key</h3>{[["bg-emerald-500", "Project start"], ["bg-rose-500", "Project end"], ["bg-sky-500", "Plan item start"], ["bg-amber-500", "Plan item end"]].map(([color, label]) => <p key={label} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</p>)}</div>
      </div>
    </section>
  );
}

export function ProjectWorkspace() {
  const currentUser = readCurrentUser();
  const role = String(currentUser.role || currentUser.role_name || "").trim().toLowerCase();
  const mayCreate = MANAGER_ROLES.includes(role);
  const [view, setView] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [planItems, setPlanItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingPlanItem, setEditingPlanItem] = useState(undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const selectedSummary = projects.find((project) => project.id === selectedId) || null;
  const selectedProject = selectedSummary ? {
    ...selectedSummary,
    ...(selectedProjectDetails?.id === selectedSummary.id ? selectedProjectDetails : {}),
  } : null;
  const canManageSelected = !!selectedProject?.can_access && (mayCreate || Number(selectedProject.leader?.id) === Number(currentUser.id));
  const planMembers = selectedProject ? [selectedProject.leader, ...(selectedProject.members || [])].filter((member, index, list) => member && list.findIndex((candidate) => candidate.id === member.id) === index) : [];

  const loadProjects = async (preferredId) => {
    const result = await projectsApi.list();
    setProjects(result);
    setSelectedId((previous) => preferredId || (result.some((project) => project.id === previous) ? previous : result[0]?.id || null));
  };

  useEffect(() => {
    let active = true;
    Promise.all([projectsApi.list(), projectsApi.members()]).then(([projectData, memberData]) => {
      if (active) {
        setProjects(projectData);
        setMembers(memberData);
        setSelectedId(projectData[0]?.id || null);
      }
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Could not load projects.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const projectSummary = projects.find((project) => project.id === selectedId);
    if (!selectedId || !projectSummary?.can_access) {
      setSelectedProjectDetails(null);
      return undefined;
    }
    let active = true;
    setSelectedProjectDetails(null);
    projectsApi.get(selectedId).then((project) => {
      if (active) setSelectedProjectDetails(project);
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Could not load project details.");
    });
    return () => { active = false; };
  }, [selectedId, projects]);

  useEffect(() => {
    const projectSummary = projects.find((project) => project.id === selectedId);
    if (!selectedId) {
      setPlanItems([]);
      return undefined;
    }
    if (!projectSummary?.can_access) {
      setPlanItems([]);
      return undefined;
    }
    let active = true;
    projectsApi.implementationPlan(selectedId).then((result) => { if (active) setPlanItems(result); }).catch((requestError) => { if (active) setError(requestError.message || "Could not load the implementation plan."); });
    return () => { active = false; };
  }, [selectedId, projects]);

  const visibleProjects = projects.filter((project) => (filter === "All" || project.status === filter) && `${project.name} ${project.description} ${project.department}`.toLowerCase().includes(search.toLowerCase()));
  const openProjectFromCalendar = (id) => { setView("projects"); setSelectedId(id); };
  const createProject = async (project) => { await loadProjects(project.id); setShowProjectForm(false); };
  const reloadPlanItems = async () => setPlanItems(await projectsApi.implementationPlan(selectedId));
  const savePlanItem = async (payload) => {
    if (editingPlanItem?.id) await projectsApi.updatePlanItem(editingPlanItem.id, payload);
    else await projectsApi.createPlanItem(selectedId, payload);
    await reloadPlanItems();
    setEditingPlanItem(undefined);
  };
  const deletePlanItem = async (itemId) => {
    try {
      await projectsApi.deletePlanItem(itemId);
      await reloadPlanItems();
    } catch (requestError) { setError(requestError.message || "Could not delete the implementation-plan row."); }
  };
  const updateProjectStatus = async (status) => {
    try { const updated = await projectsApi.update(selectedId, { status }); setProjects((previous) => previous.map((project) => project.id === updated.id ? { ...project, ...updated } : project)); }
    catch (requestError) { setError(requestError.message || "Could not update project status."); }
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded bg-emerald-500/10 text-emerald-600"><FolderKanban size={18} /></div><div><h1 className="text-base font-semibold">Projects</h1><p className="text-xs text-muted-foreground">Projects, implementation plans and schedules</p></div></div>
        <div className="flex items-center gap-1 rounded border border-border p-1"><button onClick={() => setView("projects")} className={`rounded px-3 py-1.5 text-xs font-medium ${view === "projects" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>Projects</button><button onClick={() => setView("calendar")} className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium ${view === "calendar" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><CalendarDays size={14} />Calendar</button></div>
      </div>
      {error && <p role="alert" className="mx-5 mt-4 rounded border border-rose-300/50 bg-rose-500/5 px-3 py-2 text-sm text-rose-600">{error}<button onClick={() => setError("")} className="float-right" aria-label="Dismiss error"><X size={16} /></button></p>}
      {view === "calendar" ? <div className="p-5"><ProjectCalendar onOpenProject={openProjectFromCalendar} /></div> : <>
        {showProjectForm && <ProjectForm members={members} currentUser={currentUser} onCancel={() => setShowProjectForm(false)} onCreated={createProject} />}
        <div className="grid min-h-[500px] lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.8fr)]">
          <aside className="border-b border-border p-4 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Project list <span className="ml-1 text-xs font-normal text-muted-foreground">{visibleProjects.length}</span></h2>{mayCreate && <button onClick={() => setShowProjectForm((previous) => !previous)} aria-label="Create project" title="Create project" className="rounded border border-border p-1.5 text-primary hover:bg-secondary"><Plus size={16} /></button>}</div>
            <label className="relative block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" className="w-full rounded border border-border bg-background py-2 pl-8 pr-3 text-xs text-foreground" /></label>
            <div className="mt-2 flex flex-wrap gap-1">{["All", ...PROJECT_STATUSES].map((status) => <button key={status} onClick={() => setFilter(status)} className={`rounded px-2 py-1 text-[11px] ${filter === status ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}>{status}</button>)}</div>
            <div className="mt-3 space-y-1">{loading ? <p className="px-2 py-6 text-center text-sm text-muted-foreground">Loading projects...</p> : visibleProjects.map((project) => <button key={project.id} onClick={() => setSelectedId(project.id)} className={`w-full rounded border px-3 py-3 text-left transition-colors ${selectedId === project.id ? "border-primary/40 bg-primary/5" : "border-transparent hover:border-border hover:bg-secondary/40"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-medium leading-snug">{project.name}</span><span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{project.status}</span></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.description || "No project description."}</p><p className="mt-2 text-[11px] text-muted-foreground">{project.department}{project.can_access && project.plan_item_count ? ` · ${project.plan_item_count} plan items` : ""}</p></button>)}{!loading && !visibleProjects.length && <p className="px-2 py-8 text-center text-sm text-muted-foreground">No projects found.</p>}</div>
          </aside>
          <section className="min-w-0 p-4 sm:p-5">
            {selectedProject ? selectedProject.can_access ? <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4"><div className="min-w-0"><p className="text-xs text-muted-foreground">{selectedProject.department} · Project {selectedProject.id}</p><h2 className="mt-1 text-xl font-semibold">{selectedProject.name}</h2><p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm text-muted-foreground">{selectedProject.description || "No project description."}</p></div>{canManageSelected && <label className="relative"><span className="sr-only">Project status</span><select value={selectedProject.status} onChange={(event) => updateProjectStatus(event.target.value)} className="appearance-none rounded border border-border bg-background py-2 pl-3 pr-8 text-xs font-medium text-foreground"><option>Active</option><option>On Hold</option><option>Completed</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /></label>}</div>
              <div className="grid gap-3 border-b border-border py-4 text-xs sm:grid-cols-3"><div><p className="text-muted-foreground">Project lead</p><p className="mt-1 font-medium">{fullName(selectedProject.leader)}</p></div><div><p className="text-muted-foreground">Schedule</p><p className="mt-1 font-medium">{formatDate(selectedProject.start_date)} – {formatDate(selectedProject.end_date)}</p></div><div><p className="text-muted-foreground">Team</p><p className="mt-1 font-medium">{selectedProject.members?.length || 0} members</p></div></div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Implementation plan <span className="ml-1 text-xs font-normal text-muted-foreground">{planItems.length}</span></h3><p className="mt-0.5 text-xs text-muted-foreground">Planned project work and responsibilities</p></div>{canManageSelected && <button onClick={() => setEditingPlanItem(null)} className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"><Plus size={14} />Add row</button>}</div>
              {editingPlanItem !== undefined && <div className="mt-3 overflow-x-auto rounded border border-border"><PlanItemEditor key={editingPlanItem?.id || "new-plan-item"} item={editingPlanItem} members={planMembers} onCancel={() => setEditingPlanItem(undefined)} onSave={savePlanItem} /></div>}
              <div className="mt-3 overflow-x-auto rounded border border-border">
                <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                  <thead className="bg-secondary/50 text-muted-foreground"><tr>{["Item", "Description", "Start date", "End date", "Responsible person", "Status", ""].map((heading, index) => <th key={`${heading}-${index}`} className="border-b border-border px-3 py-2.5 font-medium">{heading}</th>)}</tr></thead>
                  <tbody className="divide-y divide-border">
                    {planItems.map((item) => <tr key={item.id} className="align-top hover:bg-secondary/20"><td className="max-w-48 px-3 py-3 font-medium text-foreground">{item.item}</td><td className="max-w-64 whitespace-pre-wrap px-3 py-3 text-muted-foreground">{item.description || "-"}</td><td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{formatDate(item.start_date)}</td><td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{formatDate(item.end_date)}</td><td className="px-3 py-3 text-muted-foreground">{fullName(item.responsible_person)}</td><td className="px-3 py-3"><span className="rounded bg-secondary px-2 py-1 text-[11px] text-foreground">{item.status}</span></td><td className="px-3 py-2">{canManageSelected && <div className="flex gap-1"><button onClick={() => setEditingPlanItem(item)} aria-label={`Edit ${item.item}`} title="Edit row" className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"><Pencil size={14} /></button><button onClick={() => void deletePlanItem(item.id)} aria-label={`Delete ${item.item}`} title="Delete row" className="rounded p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"><Trash2 size={14} /></button></div>}</td></tr>)}
                    {!planItems.length && <tr><td colSpan="7" className="px-3 py-10 text-center text-sm text-muted-foreground">No implementation-plan rows yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </> : <div className="flex min-h-80 flex-col items-start justify-center"><p className="text-xs text-muted-foreground">{selectedProject.department} · {selectedProject.status}</p><h2 className="mt-2 text-xl font-semibold">{selectedProject.name}</h2><p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm text-muted-foreground">{selectedProject.description || "No project description."}</p><p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">Project details and implementation plan are available to the project team and department leads.</p></div> : <div className="flex min-h-80 flex-col items-center justify-center text-center"><FolderKanban size={28} className="text-muted-foreground" /><h2 className="mt-3 text-sm font-semibold">No project selected</h2><p className="mt-1 text-xs text-muted-foreground">Projects shared with you will appear here.</p>{mayCreate && <button onClick={() => setShowProjectForm(true)} className="mt-4 inline-flex items-center gap-2 rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"><Plus size={14} />Create project</button>}</div>}
          </section>
        </div>
      </>}
    </div>
  );
}