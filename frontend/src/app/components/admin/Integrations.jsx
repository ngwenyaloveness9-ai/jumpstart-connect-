import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle, Settings, RefreshCw } from "lucide-react";
function Toggle({ enabled, onChange }) {
    return (<button onClick={onChange} className={`relative w-9 rounded-full transition-all ${enabled ? "bg-[#F5C518]" : "bg-[#2A2A2A]"}`} style={{ height: "20px", width: "36px" }}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`}/>
    </button>);
}
import { integrationsApi } from "../../services/integrationsApi";
const CATEGORIES = ["All", "Communication", "Productivity", "Storage", "Email", "SMS / OTP", "Project Mgmt"];
export function Integrations() {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
      let mounted = true;
      integrationsApi.list().then((data) => {
        if (!mounted) return;
        const mapped = data.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category || 'Other',
          status: i.status || 'disconnected',
          enabled: !!i.enabled,
          lastSync: i.last_sync ? new Date(i.last_sync).toLocaleString() : '—',
          icon: (i.name || '').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase(),
          color: '#6264A7',
          desc: i.description || '',
        }));
        setIntegrations(mapped);
        setLoading(false);
      }).catch((err) => { console.error(err); setError(err.message); setLoading(false); });
      return () => { mounted = false; };
    }, []);
    const [category, setCategory] = useState("All");
    const [showAdd, setShowAdd] = useState(false);
    const toggle = (id) => {
        setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, enabled: !i.enabled } : i));
    };
    const filtered = integrations.filter((i) => category === "All" || i.category === category);
    return (<div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">Integrations</h1>
          <p className="text-[#F5C518] text-xs mt-0.5">Connect approved third-party tools and external systems</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-[#F5C518] text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">
          <Plus size={15}/> Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
            { label: "Total Integrations", value: integrations.length, color: "#F5C518" },
            { label: "Connected", value: integrations.filter((i) => i.status === "connected").length, color: "#4ADE80" },
            { label: "Active", value: integrations.filter((i) => i.enabled).length, color: "#60A5FA" },
            { label: "Disconnected", value: integrations.filter((i) => i.status === "disconnected").length, color: "#FB923C" },
        ].map((s) => (<div key={s.label} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4">
            <div className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[#444] text-xs">{s.label}</div>
          </div>))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (<button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${category === c ? "bg-[#F5C518]/10 text-[#F5C518] border-[#F5C518]/30" : "text-[#555] border-[#1E1E1E] bg-[#111111] hover:text-white hover:border-[#2A2A2A]"}`}>
            {c}
          </button>))}
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((intg) => (<div key={intg.id} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5 hover:border-[#2A2A2A] transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: intg.color }}>
                  {intg.icon}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{intg.name}</div>
                  <div className="text-[#444] text-[10px]">{intg.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {intg.status === "connected" ? (<CheckCircle size={13} className="text-green-400"/>) : (<XCircle size={13} className="text-[#444]"/>)}
              </div>
            </div>
            <p className="text-[#555] text-xs mb-4 leading-relaxed">{intg.desc}</p>
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-[#333]">
                {intg.status === "connected" ? `Last sync: ${intg.lastSync}` : "Not connected"}
              </div>
              <div className="flex items-center gap-2">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-white">
                  <Settings size={13}/>
                </button>
                {intg.status === "connected" && (<button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-[#F5C518]">
                    <RefreshCw size={13}/>
                  </button>)}
                <Toggle enabled={intg.enabled} onChange={() => toggle(intg.id)}/>
              </div>
            </div>
          </div>))}
      </div>

      {/* Add modal */}
      {showAdd && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-white font-semibold text-base mb-1">Add Integration</h2>
            <p className="text-[#444] text-xs mb-5">All integrations must be reviewed by IT/Security before production use.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Service Name</label>
                <input placeholder="e.g. HubSpot CRM" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Category</label>
                <select className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#F5C518]/50 transition-all">
                  {["Communication", "Productivity", "Storage", "Email", "SMS / OTP", "Project Mgmt", "Other"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-1.5">API Key / OAuth URL</label>
                <input placeholder="https://api.service.com/oauth" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-[#2A2A2A] text-[#888] py-2.5 rounded-xl text-sm hover:text-white transition-all">Cancel</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-[#F5C518] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">Connect</button>
            </div>
          </div>
        </div>)}
    </div>);
}
