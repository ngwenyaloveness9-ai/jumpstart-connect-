import { useEffect, useState } from "react";
import { Plus, Key, Globe, Copy, Eye, EyeOff, RefreshCw, Trash2, CheckCircle, Activity } from "lucide-react";
import { webhooksApi } from "../../services/webhooksApi";
const API_KEYS = [];
const SCOPES = ["read:boards", "write:boards", "read:items", "write:items", "read:users", "write:users", "read:dashboards", "admin:users", "admin:workspaces"];
const EVENTS = ["item.created", "item.status_changed", "item.deleted", "form.submitted", "board.archived", "user.invited", "user.deactivated"];
export function ApiWebhooks() {
    const [revealedKey, setRevealedKey] = useState(null);
    const [copiedKey, setCopiedKey] = useState(null);
    const [showNewKey, setShowNewKey] = useState(false);
    const [showNewWebhook, setShowNewWebhook] = useState(false);
    const [activeTab, setActiveTab] = useState("api");
    const [newKeyName, setNewKeyName] = useState("");
    const [newWebhookName, setNewWebhookName] = useState("");
    const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const copyKey = (id, key) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 1500);
    };
    const maskKey = (key) => key.slice(0, 14) + "•".repeat(20) + key.slice(-4);

    useEffect(() => {
      let mounted = true;
      webhooksApi.list().then((data) => {
        if (!mounted) return;
        setWebhooks(data);
        setLoading(false);
      }).catch((err) => { console.error(err); setError(err.message); setLoading(false); });
      return () => { mounted = false; };
    }, []);
    return (<div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">API & Webhooks</h1>
          <p className="text-[#F5C518] text-xs mt-0.5">Manage API keys, webhook endpoints, and external event subscriptions</p>
        </div>
        <button onClick={() => activeTab === "api" ? setShowNewKey(true) : setShowNewWebhook(true)} className="flex items-center gap-2 bg-[#F5C518] text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">
          <Plus size={15}/> {activeTab === "api" ? "New API Key" : "New Webhook"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
            { label: "API Keys", value: API_KEYS.filter((k) => k.status === "active").length, color: "#F5C518" },
            { label: "Webhooks", value: WEBHOOKS.length, color: "#60A5FA" },
            { label: "Active Webhooks", value: WEBHOOKS.filter((w) => w.status === "active").length, color: "#4ADE80" },
            { label: "Failing", value: WEBHOOKS.filter((w) => w.status === "failing").length, color: "#FB923C" },
        ].map((s) => (<div key={s.label} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4">
            <div className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[#444] text-xs">{s.label}</div>
          </div>))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111111] border border-[#1E1E1E] rounded-xl p-1 w-fit">
        {["api", "webhooks"].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? "bg-[#F5C518] text-black" : "text-[#555] hover:text-white"}`}>
            {tab === "api" ? "API Keys" : "Webhooks"}
          </button>))}
      </div>

      {/* API Keys */}
      {activeTab === "api" && (<div className="space-y-3">
          {/* Security notice */}
          <div className="flex items-start gap-3 bg-[#F5C518]/5 border border-[#F5C518]/15 rounded-xl px-4 py-3">
            <Key size={14} className="text-[#F5C518] flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-[#888]">
              API keys grant programmatic access. All keys must be reviewed by IT/Security before production use. Never commit keys to source control.
            </p>
          </div>

          {API_KEYS.map((apiKey) => (<div key={apiKey.id} className={`bg-[#111111] border rounded-2xl p-5 transition-all ${apiKey.status === "revoked" ? "border-[#1A1A1A] opacity-60" : "border-[#1E1E1E] hover:border-[#2A2A2A]"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{apiKey.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${apiKey.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-[#2A2A2A] text-[#555] border-[#333]"}`}>
                      {apiKey.status}
                    </span>
                  </div>
                  <div className="text-[#444] text-[10px] mt-0.5">Created {apiKey.created} · Last used {apiKey.lastUsed}</div>
                </div>
                {apiKey.status === "active" && (<button className="text-[#444] hover:text-red-400 transition-colors">
                    <Trash2 size={14}/>
                  </button>)}
              </div>
              <div className="flex items-center gap-2 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl px-4 py-2.5 mb-3">
                <code className="flex-1 text-[#888] text-xs font-mono truncate">
                  {revealedKey === apiKey.id ? apiKey.key : maskKey(apiKey.key)}
                </code>
                <button onClick={() => setRevealedKey(revealedKey === apiKey.id ? null : apiKey.id)} className="text-[#444] hover:text-white transition-colors flex-shrink-0">
                  {revealedKey === apiKey.id ? <EyeOff size={13}/> : <Eye size={13}/>}
                </button>
                <button onClick={() => copyKey(apiKey.id, apiKey.key)} className="text-[#444] hover:text-[#F5C518] transition-colors flex-shrink-0">
                  {copiedKey === apiKey.id ? <CheckCircle size={13} className="text-green-400"/> : <Copy size={13}/>}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {apiKey.scopes.map((scope) => (<span key={scope} className="text-[10px] text-[#555] bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 rounded-md font-mono">{scope}</span>))}
              </div>
            </div>))}
        </div>)}

      {/* Webhooks */}
      {activeTab === "webhooks" && (<div className="space-y-3">
          {loading ? (<div>Loading webhooks…</div>) : webhooks.map((wh) => (<div key={wh.id} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5 hover:border-[#2A2A2A] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-[#F5C518]"/>
                    <span className="text-white text-sm font-medium">{wh.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${wh.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                      {wh.status}
                    </span>
                  </div>
                  <div className="text-[#444] text-[10px] mt-0.5">{wh.workspace} · Last triggered {wh.last_triggered ? new Date(wh.last_triggered).toLocaleString() : '—'}</div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[#444] hover:text-[#F5C518]"><RefreshCw size={13}/></button>
                  <button className="text-[#444] hover:text-red-400"><Trash2 size={13}/></button>
                </div>
              </div>
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl px-4 py-2.5 mb-3">
                <code className="text-[#888] text-xs font-mono">{wh.url}</code>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {(wh.events || []).map((ev) => (<span key={ev} className="text-[10px] text-[#555] bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 rounded-md font-mono">{ev}</span>))}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Activity size={11} className={wh.success_rate === "100%" ? "text-green-400" : parseFloat((wh.success_rate||'0').replace('%','')) > 90 ? "text-[#F5C518]" : "text-red-400"}/>
                  <span className="text-[#555]">{wh.success_rate || '0%'} success</span>
                </div>
              </div>
            </div>))}
        </div>)}

      {/* New API Key modal */}
      {showNewKey && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-white font-semibold text-base mb-1">Create API Key</h2>
            <p className="text-[#444] text-xs mb-5">Keys must be reviewed by IT/Security before production use.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Key Name</label>
                <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. Reporting Integration Key" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-2">Scopes</label>
                <div className="flex flex-wrap gap-2">
                  {SCOPES.map((s) => (<label key={s} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="accent-[#F5C518] w-3 h-3"/>
                      <span className="text-[10px] text-[#888] font-mono">{s}</span>
                    </label>))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewKey(false)} className="flex-1 border border-[#2A2A2A] text-[#888] py-2.5 rounded-xl text-sm hover:text-white transition-all">Cancel</button>
              <button onClick={() => setShowNewKey(false)} className="flex-1 bg-[#F5C518] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">Generate Key</button>
            </div>
          </div>
        </div>)}

      {/* New Webhook modal */}
      {showNewWebhook && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-white font-semibold text-base mb-1">Create Webhook</h2>
            <p className="text-[#444] text-xs mb-5">Webhooks POST event data to your endpoint when events occur.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Webhook Name</label>
                <input value={newWebhookName} onChange={(e) => setNewWebhookName(e.target.value)} placeholder="e.g. Slack Notification Hook" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-1.5">Endpoint URL</label>
                <input value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} placeholder="https://your-endpoint.com/webhook" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-sm placeholder-[#333] focus:outline-none focus:border-[#F5C518]/50 transition-all"/>
              </div>
              <div>
                <label className="text-xs text-[#888] block mb-2">Subscribe to Events</label>
                <div className="flex flex-col gap-2">
                  {EVENTS.map((ev) => (<label key={ev} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-[#F5C518] w-3 h-3"/>
                      <span className="text-xs text-[#888] font-mono">{ev}</span>
                    </label>))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewWebhook(false)} className="flex-1 border border-[#2A2A2A] text-[#888] py-2.5 rounded-xl text-sm hover:text-white transition-all">Cancel</button>
              <button onClick={() => setShowNewWebhook(false)} className="flex-1 bg-[#F5C518] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E6B800] transition-all">Create Webhook</button>
            </div>
          </div>
        </div>)}
    </div>);
}
