import { useEffect, useState } from "react";
import { ArrowLeft, Save, User } from "lucide-react";
import { useNavigate } from "react-router";
import { authApi } from "../services/authApi";

export function ProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", department: "", role: "employee" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    authApi.me()
      .then((user) => setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        role: (user.role || "employee").toLowerCase(),
      }))
      .catch((err) => setError(err.message || "Unable to load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const updated = await authApi.updateProfile(form);
      localStorage.setItem("currentUser", JSON.stringify({ ...JSON.parse(localStorage.getItem("currentUser") || "{}"), ...updated }));
      setForm({ ...form, ...updated, role: (updated.role || form.role).toLowerCase() });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Back to dashboard
        </button>
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center"><User size={24} className="text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold">{`${form.first_name} ${form.last_name}`.trim() || "My Profile"}</h1>
              <p className="text-sm text-primary mt-1">{form.role || "Role not set"}</p>
              <p className="text-sm text-muted-foreground mt-1">View and update your account details.</p>
            </div>
          </div>
          {message && <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">{message}</div>}
          {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
          <form onSubmit={saveProfile} className="grid gap-5 sm:grid-cols-2">
            {[{ name: "first_name", label: "First Name" }, { name: "last_name", label: "Last Name" }, { name: "email", label: "Email Address", type: "email" }, { name: "phone", label: "Phone Number" }, { name: "department", label: "Department" }].map((field) => (
              <label key={field.name} className="text-sm text-muted-foreground">{field.label}
                <input required={field.name !== "phone"} type={field.type || "text"} name={field.name} value={form[field.name]} onChange={updateField} className="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground focus:outline-none focus:border-primary" />
              </label>
            ))}
            <label className="text-sm text-muted-foreground">Role
              <input required name="role" type="text" value={form.role} onChange={updateField} placeholder="Enter your role" className="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground focus:outline-none focus:border-primary" />
            </label>
            <div className="sm:col-span-2 flex justify-end pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-60"><Save size={16} />{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
