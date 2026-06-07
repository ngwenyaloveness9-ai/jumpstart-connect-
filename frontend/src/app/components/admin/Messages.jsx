import { useMemo, useRef, useState } from "react";
import { Bell, FileText, Paperclip, Send, UploadCloud, X } from "lucide-react";

export function Messages({ threads, activeThreadId, onThreadSelect, onSendMessage }) {
  const fileInputRef = useRef(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [recipientEmail, setRecipientEmail] = useState("");

  const selectedThread = useMemo(() => threads.find((t) => t.id === activeThreadId) ?? threads[0], [threads, activeThreadId]);
  const unreadCount = useMemo(() => threads.filter((t) => t.unread).length, [threads]);

  // recipientEmail input is optional; if empty we'll fall back to the thread's contactEmail when sending

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachments((existing) => [...existing, ...files]);
    event.target.value = "";
  };

  const handleRemoveAttachment = (name) => {
    setAttachments((prev) => prev.filter((f) => f.name !== name));
  };

  const handleSendMessage = () => {
    const text = draft.trim();
    if (!text && attachments.length === 0 && !recipientEmail && !selectedThread?.contactEmail) return;
    const to = recipientEmail || selectedThread?.contactEmail || "";
    onSendMessage(selectedThread.id, text, attachments, to);
    setDraft("");
    setAttachments([]);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-[0.18em]"><Bell size={14}/> Messaging Center</div>
          <h1 className="text-xl font-bold text-black">Admin Chat Platform</h1>
          <p className="text-[#666] text-sm mt-1">Send messages, files, and keep the team in sync from a single conversation hub.</p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-2xl bg-[#F5C518]/10 border border-[#F5C518]/20 px-4 py-2 text-sm text-[#3D2F01]">
          <span className="font-semibold">Unread messages</span>
          <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-[#F5C518] text-black text-sm font-semibold">{unreadCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
        <section className="space-y-4 rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-white">Conversations</h2>
              <p className="text-[#888] text-xs">Open a thread to mark it as read.</p>
            </div>
            <span className="text-xs text-muted-foreground">{unreadCount} new</span>
          </div>

          <div className="space-y-2">
            {threads.map((thread) => (
              <button key={thread.id} type="button" onClick={() => onThreadSelect(thread.id)} className={`w-full text-left rounded-2xl border px-3 py-3 transition-all ${thread.id === selectedThread.id ? "border-primary/20 bg-primary/5" : "border-transparent hover:border-[#2A2A2A] hover:bg-[#141414]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{thread.sender}</p>
                    <p className="text-[11px] text-[#888] truncate">{thread.subject}</p>
                    {thread.contactEmail ? (<div className="text-[10px] text-[#666] truncate">{thread.contactEmail}</div>) : null}
                  </div>
                  <div className="text-[10px] text-[#999]">{thread.time}</div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#AAA] truncate">{thread.lastMessage}</p>
                  {thread.unread ? (<span className="inline-flex h-6 min-w-[1.4rem] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">New</span>) : null}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 flex flex-col h-[calc(100vh-120px)] min-h-[560px]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-[#888] uppercase tracking-[0.18em]">Thread</p>
              <h2 className="text-lg font-semibold text-white">{selectedThread.sender}</h2>
              <p className="text-sm text-[#999]">{selectedThread.subject}</p>
              {selectedThread.contactEmail ? (<div className="text-[12px] text-[#888] mt-1">{selectedThread.contactEmail}</div>) : null}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#AAA]">
              <Paperclip size={14}/>
              <span>{selectedThread.messages.length} messages</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-3xl border border-[#202020] bg-[#070707] p-4">
            <div className="space-y-4">
              {selectedThread.messages.map((message) => (
                <div key={message.id} className={`rounded-3xl p-4 ${message.author === "You" ? "bg-[#131313] self-end text-right" : "bg-[#0F172A] text-left"}`}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <span className={`text-[11px] font-semibold ${message.author === "You" ? "text-[#85C0FF]" : "text-[#F5C518]"}`}>{message.author}</span>
                      {message.authorEmail ? (<div className="text-[10px] text-[#888] truncate">{message.authorEmail}</div>) : null}
                    </div>
                    <span className="text-[10px] text-[#666]">{message.time}</span>
                  </div>
                  <p className="text-sm leading-6 text-[#DDD]">{message.text}</p>
                  {message.attachments?.length ? (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div key={attachment.name} className="flex items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#111] px-3 py-2 text-xs text-[#EEE]">
                          <FileText size={14}/>
                          {attachment.url ? (<a href={attachment.url} target="_blank" rel="noreferrer" className="underline truncate">{attachment.name}</a>) : (<span>{attachment.name}</span>)}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[#202020] bg-[#0D0D0D] p-4">
            <label className="block text-xs font-medium text-[#BBB] mb-2">To (email)</label>
            <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="recipient@example.com" className="w-full mb-3 rounded-lg border border-[#252525] bg-[#090909] px-3 py-2 text-sm text-white outline-none focus:border-primary/40" />
            <label className="block text-xs font-medium text-[#BBB] mb-2">Write a reply</label>
            <textarea rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} className="w-full resize-none rounded-3xl border border-[#252525] bg-[#090909] px-4 py-3 text-sm text-white outline-none focus:border-primary/40" placeholder="Type your message here..." />

            {attachments.length > 0 ? (
              <div className="mt-3 space-y-2">
                {attachments.map((file) => (
                  <div key={file.name} className="flex items-center justify-between gap-3 rounded-2xl border border-[#2A2A2A] bg-[#111] px-3 py-2 text-xs text-[#DDD]">
                    <div className="flex items-center gap-2">
                      <FileText size={14}/>
                      <span>{file.name}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveAttachment(file.name)} className="text-[#888] hover:text-white transition-colors"><X size={14}/></button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-[#AAA]">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#090909] px-3 py-2 text-sm text-[#EEE] hover:border-primary/50 transition-all">
                  <UploadCloud size={14}/> Attach file
                </button>
                <span>{attachments.length} attached</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleSendMessage} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
                  <Send size={14}/> Send message
                </button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileChange} />
          </div>
        </section>
      </div>
    </div>
  );
}
