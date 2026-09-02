import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, FileText, Send, X } from "lucide-react";
import { leaveApi } from "../services/leaveApi";

const LEAVE_TYPES = ["Annual Leave", "Sick Leave", "Family Responsibility", "Study Leave", "Emergency Leave", "Other"];

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return endDate >= startDate ? Math.floor((endDate - startDate) / 86400000) + 1 : 0;
}

function roleOf(user) {
  return (user?.role || user?.role_name || "").trim().toLowerCase();
}

function isHrRole(role) {
  return ["hr", "human resources", "hr manager", "hr officer"].includes(role);
}

function isHeadRole(role) {
  return ["manager", "department manager", "head of department", "supervisor"].includes(role);
}

function isMonitorRole(role) {
  return isHrRole(role) || isHeadRole(role) || ["campus manager", "campus director", "superadmin", "admin", "administrator"].includes(role);
}

function escalationFor(request) {
  if (request.status !== "Pending") return request.status;
  if (request.approvalStage === "hr") return "Pending HR review";
  if (request.approvalStage === "campus") return "Pending Campus Manager";
  return "Pending Head of Department";
}

function StatusBadge({ request }) {
  const status = escalationFor(request);
  const style = status.startsWith("Escalated")
    ? "bg-orange-500/10 border-orange-500/20 text-orange-300"
    : status === "Approved"
      ? "bg-green-500/10 border-green-500/20 text-green-300"
      : status === "Declined"
        ? "bg-red-500/10 border-red-500/20 text-red-300"
        : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${style}`}>{status}</span>;
}

export function LeavePage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "{}");
  const role = roleOf(currentUser);
  const canMonitor = isMonitorRole(role);
  const isHr = isHrRole(role);
  const isCampusManager = ["campus manager", "campus director"].includes(role);
  const isDepartmentReviewer = ["manager", "department manager", "head of department", "supervisor", "head of technology"].includes(role);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(canMonitor ? "requests" : "request");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ type: "Annual Leave", startDate: "", endDate: "", reason: "", attachment: null });

  const department = currentUser.department || (isHr ? "Human Resources" : "");

  useEffect(() => {
    const loadRequests = () => leaveApi.list()
      .then(setRequests)
      .catch((error) => setNotice(error.message || "Unable to load leave requests."))
      .finally(() => setLoading(false));
    loadRequests();
    const interval = window.setInterval(loadRequests, 30000);
    return () => window.clearInterval(interval);
  }, []);
  const visibleRequests = useMemo(() => {
    if (!canMonitor) return requests.filter((request) => request.employeeId === currentUser.id);
    if (isHr || ["superadmin", "admin", "administrator"].includes(role)) return requests;
    return requests.filter((request) => request.department.toLowerCase() === department.toLowerCase());
  }, [canMonitor, currentUser.id, department, isHr, requests, role]);

  const submitRequest = async (event) => {
    event.preventDefault();
    const days = daysBetween(form.startDate, form.endDate);
    if (!department) {
      setNotice("Your department is missing, so a leave request cannot be submitted.");
      return;
    }
    if (!days) {
      setNotice("Choose a valid start and end date.");
      return;
    }
    if (["Study Leave", "Sick Leave"].includes(form.type) && !form.attachment) {
      setNotice("A supporting document is required for Study Leave and Sick Leave.");
      return;
    }
    // Emergency Leave does not require attachment
    try {
      const payload = new FormData();
      payload.append("type", form.type);
      payload.append("startDate", form.startDate);
      payload.append("endDate", form.endDate);
      payload.append("reason", form.reason.trim());
      if (form.attachment) payload.append("attachment", form.attachment);
      const created = await leaveApi.create(payload);
      setRequests([created, ...requests]);
      setForm({ type: "Annual Leave", startDate: "", endDate: "", reason: "", attachment: null });
      setNotice("Leave request submitted to your Head of Department.");
      setActiveView("my-requests");
    } catch (error) {
      setNotice(error.message || "Unable to submit leave request.");
    }
  };

  const updateRequest = async (id, status, declineReason = "") => {
    try {
      const updated = await leaveApi.updateStatus(id, status, declineReason);
      setRequests(requests.map((request) => request.id === id ? updated : request));
    } catch (error) {
      setNotice(error.message || "Unable to update leave request.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Leave Management</p>
          <h1 className="mt-1 text-xl font-bold text-foreground">{canMonitor ? "Leave requests" : "Request leave"}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {canMonitor ? "Monitor requests assigned to your department and track escalations." : "Submit a leave request for your department."}
          </p>
        </div>
        {!canMonitor && <button onClick={() => setActiveView("my-requests")} className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"><FileText size={14} /> My requests</button>}
      </div>

      {notice && <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs text-foreground">{notice}</div>}
      {loading && <div className="text-sm text-muted-foreground">Loading leave requests...</div>}

      {canMonitor && (
        <div className="flex gap-2 rounded-xl border border-border bg-card p-1 w-fit">
          <button onClick={() => setActiveView("requests")} className={`rounded-lg px-3 py-2 text-xs font-medium ${activeView === "requests" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Requests ({visibleRequests.length})</button>
          <button onClick={() => setActiveView("request")} className={`rounded-lg px-3 py-2 text-xs font-medium ${activeView === "request" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Submit leave</button>
        </div>
      )}

      {activeView === "request" && (
        <form onSubmit={submitRequest} className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-muted-foreground">Leave type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground">{LEAVE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="text-xs text-muted-foreground">Department<input value={department} readOnly className="mt-1.5 w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground" /></label>
            <label className="text-xs text-muted-foreground">Start date<input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></label>
            <label className="text-xs text-muted-foreground">End date<input required type="date" value={form.endDate} min={form.startDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></label>
          </div>
          <label className="block text-xs text-muted-foreground">Reason<textarea required rows="4" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Tell your Head of Department why you need leave..." className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" /></label>
          {["Study Leave", "Sick Leave"].includes(form.type) && (
            <label className="block text-xs text-muted-foreground">Supporting document<span className="text-red-400"> *</span><input type="file" required onChange={(event) => setForm({ ...form, attachment: event.target.files?.[0] || null })} className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground" /></label>
          )}
          {!["Study Leave", "Sick Leave"].includes(form.type) && (
            <label className="block text-xs text-muted-foreground">Supporting document (optional)<input type="file" onChange={(event) => setForm({ ...form, attachment: event.target.files?.[0] || null })} className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground" /></label>
          )}
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Send size={15} /> Submit leave request</button>
        </form>
      )}

      {(activeView === "requests" || activeView === "my-requests") && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[900px] text-left text-xs"><thead><tr className="border-b border-border text-muted-foreground">{["Employee", "Department", "Leave", "Dates", "Reason", "Submitted", "Status", "Action"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody>
            {visibleRequests.map((request) => { const canReview = request.status === "Pending" && ((isHr && request.approvalStage === "hr") || (isCampusManager && request.approvalStage === "campus") || (isDepartmentReviewer && request.approvalStage === "head")); const decline = () => { const reason = window.prompt("Enter a reason for declining this leave request:"); if (reason?.trim()) updateRequest(request.id, "Declined", reason.trim()); }; return <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/40"><td className="px-4 py-3 font-medium text-foreground">{request.employee}</td><td className="px-4 py-3 text-muted-foreground">{request.department}</td><td className="px-4 py-3 text-foreground">{request.type}<div className="text-muted-foreground">{request.days} day{request.days === 1 ? "" : "s"}</div></td><td className="px-4 py-3 text-muted-foreground">{request.startDate} to {request.endDate}</td><td className="max-w-[220px] whitespace-normal px-4 py-3 text-muted-foreground">{request.reason}{request.attachment && <a href={request.attachment} target="_blank" rel="noreferrer" className="block text-primary hover:underline">View document</a>}{request.declineReason && <div className="mt-1 text-red-300">Decline reason: {request.declineReason}</div>}</td><td className="px-4 py-3 text-muted-foreground">{new Date(request.submittedAt).toLocaleDateString()}</td><td className="px-4 py-3"><StatusBadge request={request} /></td><td className="px-4 py-3">{canReview ? <div className="flex gap-2"><button onClick={() => updateRequest(request.id, "Approved")} className="rounded-lg bg-green-500/10 p-2 text-green-400" title="Approve"><Check size={14} /></button><button onClick={decline} className="rounded-lg bg-red-500/10 p-2 text-red-400" title="Decline"><X size={14} /></button></div> : <span className="text-muted-foreground">No action</span>}</td></tr>; })}
            {!visibleRequests.length && <tr><td colSpan="8" className="px-4 py-12 text-center text-muted-foreground">No leave requests yet.</td></tr>}
          </tbody></table>
        </div>
      )}

      {canMonitor && <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-border bg-card p-4"><Clock3 className="mb-2 text-yellow-400" size={17} /><p className="text-xl font-bold text-foreground">{visibleRequests.filter((request) => request.status === "Pending").length}</p><p className="text-xs text-muted-foreground">Pending review</p></div><div className="rounded-xl border border-border bg-card p-4"><CalendarDays className="mb-2 text-primary" size={17} /><p className="text-xl font-bold text-foreground">{visibleRequests.length}</p><p className="text-xs text-muted-foreground">Recently submitted</p></div><div className="rounded-xl border border-border bg-card p-4"><Send className="mb-2 text-orange-400" size={17} /><p className="text-xl font-bold text-foreground">{visibleRequests.filter((request) => escalationFor(request).startsWith("Escalated")).length}</p><p className="text-xs text-muted-foreground">Escalated requests</p></div></div>}
    </div>
  );
}
