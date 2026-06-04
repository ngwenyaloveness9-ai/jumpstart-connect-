import { useState } from "react";
import { Save, CheckCircle, Building, Globe, Bell, Palette, Database, AlertTriangle } from "lucide-react";
function Toggle({ enabled, onChange }) {
    return (<button onClick={onChange} className={`relative rounded-full transition-all flex-shrink-0`} style={{ width: "36px", height: "20px", background: enabled ? "#F5C518" : "#2A2A2A" }}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`}/>
    </button>);
}
function Section({ title, icon: Icon, children }) {
    return (<div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#1A1A1A]">
        <div className="w-7 h-7 rounded-lg bg-[#F5C518]/10 flex items-center justify-center">
          <Icon size={14} className="text-[#F5C518]"/>
        </div>
        <h3 className="text-white text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>);
}
function Field({ label, desc, children }) {
    return (<div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <div className="text-white text-xs font-medium">{label}</div>
        {desc && <div className="text-[#444] text-[10px] mt-0.5">{desc}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>);
}
function Input({ value, onChange, placeholder, type = "text" }) {
    return (<input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2 rounded-xl text-xs placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all w-64"/>);
}
export function AdminSettings() {
    const [saved, setSaved] = useState(false);
    const [orgName, setOrgName] = useState("Jumpstart Your Career");
    const [orgDomain, setOrgDomain] = useState("jumpstartyourcareer.co.za");
    const [supportEmail, setSupportEmail] = useState("it@jumpstartyourcareer.co.za");
    const [timezone, setTimezone] = useState("Africa/Johannesburg");
    const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
    const [retentionDays, setRetentionDays] = useState("365");
    const [maxUsers, setMaxUsers] = useState("500");
    const [notifications, setNotifications] = useState({
        emailDigest: true,
        systemAlerts: true,
        securityAlerts: true,
        usageReports: false,
        maintenanceNotices: true,
    });
    const [features, setFeatures] = useState({
        offsiteAccess: true,
        guestBoards: false,
        publicForms: false,
        timeTracking: true,
        aiSuggestions: false,
        advancedReporting: true,
    });
    const toggleNotif = (k) => setNotifications((n) => ({ ...n, [k]: !n[k] }));
    const toggleFeature = (k) => setFeatures((f) => ({ ...f, [k]: !f[k] }));
    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };
    return (<div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Settings</h1>
          <p className="text-[#444] text-xs mt-0.5">Account-level configuration, governance, and operational controls</p>
        </div>
        <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "bg-[#F5C518] text-black hover:bg-[#E6B800]"}`}>
          {saved ? <><CheckCircle size={15}/> Saved!</> : <><Save size={15}/> Save Settings</>}
        </button>
      </div>

      {/* Organisation */}
      <Section title="Organisation" icon={Building}>
        <Field label="Organisation Name" desc="Displayed across the platform and in emails">
          <Input value={orgName} onChange={setOrgName} placeholder="Your organisation name"/>
        </Field>
        <Field label="Primary Domain" desc="Only users from this domain may register">
          <Input value={orgDomain} onChange={setOrgDomain} placeholder="yourdomain.co.za"/>
        </Field>
        <Field label="IT Support Email" desc="Shown on login page and error screens">
          <Input value={supportEmail} onChange={setSupportEmail} type="email"/>
        </Field>
        <Field label="Max User Accounts" desc="Platform-wide user account limit">
          <Input value={maxUsers} onChange={setMaxUsers} type="number"/>
        </Field>
      </Section>

      {/* Localisation */}
      <Section title="Localisation" icon={Globe}>
        <Field label="Timezone" desc="Used for timestamps, reminders, and scheduling">
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#F5C518]/50 transition-all w-64">
            {["Africa/Johannesburg", "UTC", "Africa/Nairobi", "Europe/London", "America/New_York"].map((tz) => (<option key={tz}>{tz}</option>))}
          </select>
        </Field>
        <Field label="Date Format" desc="How dates are displayed throughout the platform">
          <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#F5C518]/50 transition-all w-64">
            {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        {[
            { key: "emailDigest", label: "Daily Email Digest", desc: "Summary of activity sent to admins each morning" },
            { key: "systemAlerts", label: "System Alerts", desc: "Notify admins of service degradation or downtime" },
            { key: "securityAlerts", label: "Security Alerts", desc: "Immediate notification for failed logins and locked accounts" },
            { key: "usageReports", label: "Weekly Usage Reports", desc: "Board and user activity report sent every Monday" },
            { key: "maintenanceNotices", label: "Maintenance Notices", desc: "Notify all users before scheduled maintenance windows" },
        ].map((item) => (<Field key={item.key} label={item.label} desc={item.desc}>
            <Toggle enabled={notifications[item.key]} onChange={() => toggleNotif(item.key)}/>
          </Field>))}
      </Section>

      {/* Feature flags */}
      <Section title="Feature Controls" icon={Palette}>
        {[
            { key: "offsiteAccess", label: "Off-site Access Requests", desc: "Allow users to request temporary off-site OTP access" },
            { key: "guestBoards", label: "Guest Board Access", desc: "Allow external guests to view specific boards (read-only)" },
            { key: "publicForms", label: "Public Intake Forms", desc: "Allow forms to be submitted without login (controlled)" },
            { key: "timeTracking", label: "Time Tracking", desc: "Enable time logging on board items and tasks" },
            { key: "aiSuggestions", label: "AI Suggestions (Beta)", desc: "AI-powered task suggestions and automation recommendations" },
            { key: "advancedReporting", label: "Advanced Reporting", desc: "Cross-board, multi-workspace executive reporting views" },
        ].map((item) => (<Field key={item.key} label={item.label} desc={item.desc}>
            <Toggle enabled={features[item.key]} onChange={() => toggleFeature(item.key)}/>
          </Field>))}
      </Section>

      {/* Data retention */}
      <Section title="Data & Retention" icon={Database}>
        <Field label="Audit Log Retention (days)" desc="Logs older than this period are archived (POPIA-aligned)">
          <Input value={retentionDays} onChange={setRetentionDays} type="number"/>
        </Field>
        <Field label="Deleted Item Recovery Window" desc="How long deleted items remain recoverable">
          <select className="bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#F5C518]/50 transition-all w-64">
            {["30 days", "60 days", "90 days", "Indefinite"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="File Storage Limit per Board" desc="Maximum file attachment storage per board">
          <select className="bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#F5C518]/50 transition-all w-64">
            {["500 MB", "1 GB", "5 GB", "Unlimited"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </Section>

      {/* Danger zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={15} className="text-red-400"/>
          <h3 className="text-red-400 text-sm font-semibold">Danger Zone</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "Reset All Permissions", desc: "Revert all workspace and board permissions to defaults. This cannot be undone." },
            { label: "Purge Audit Logs", desc: "Permanently delete all audit records beyond the retention window." },
            { label: "Deactivate Platform", desc: "Take the platform offline for all users. Reserved for emergency use only." },
        ].map((action) => (<div key={action.label} className="flex items-start justify-between gap-4 py-3 border-b border-red-500/10 last:border-0">
              <div>
                <div className="text-white text-xs font-medium">{action.label}</div>
                <div className="text-[#555] text-[10px] mt-0.5">{action.desc}</div>
              </div>
              <button className="flex-shrink-0 text-xs border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                Execute
              </button>
            </div>))}
        </div>
      </div>
    </div>);
}
