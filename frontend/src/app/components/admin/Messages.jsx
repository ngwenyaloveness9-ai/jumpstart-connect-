/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Hash,
  Lock,
  Search,
  Smile,
  Paperclip,
  Send,
  Reply,
  MoreHorizontal,
  Plus,
  Phone,
  Video,
  Info,
  Pin,
  ChevronDown,
  ChevronRight,
  Circle,
  FileText,
  ImageIcon,
  Download,
  AtSign,
  Mic,
  X,
  MessageSquare,
} from "lucide-react";
import { messageApi } from "../../services/messageApi";

// ─── Sub-components ────────────────────────────────────────────────────────────

const ATTACH_ICONS = {
  pdf:   { color: "text-red-400",    bg: "bg-red-500/10"    },
  excel: { color: "text-green-400",  bg: "bg-green-500/10"  },
  word:  { color: "text-blue-400",   bg: "bg-blue-500/10"   },
  image: { color: "text-purple-400", bg: "bg-purple-500/10" },
};

function AttachmentCard({ att }) {
  const s = ATTACH_ICONS[att.type] || ATTACH_ICONS.pdf;
  if (att.type === "image") {
    return (
      <div className="mt-2 rounded-xl overflow-hidden border border-[#2A2A2A] max-w-xs">
        <div className={`h-32 ${s.bg} flex items-center justify-center`}>
          <ImageIcon size={32} className={s.color} />
        </div>
        <div className="flex items-center justify-between bg-[#1A1A1A] px-3 py-2">
          <div className="flex items-center gap-2">
            <ImageIcon size={12} className={s.color} />
            <span className="text-xs text-[#888]">{att.name}</span>
          </div>
          <span className="text-[10px] text-[#444]">{att.size}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-2 flex items-center gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 max-w-xs group/att">
      <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
        <FileText size={14} className={s.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{att.name}</p>
        <p className="text-[10px] text-[#444]">{att.size} · {att.type.toUpperCase()}</p>
      </div>
      <button className="opacity-0 group-hover/att:opacity-100 transition-opacity text-[#444] hover:text-white">
        <Download size={13} />
      </button>
    </div>
  );
}

function ReactionPill({ emoji, count, mine, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
        mine
          ? "bg-primary/15 border-primary/30 text-primary"
          : "bg-[#1E1E1E] border-[#2A2A2A] text-[#666] hover:border-[#444] hover:text-white"
      }`}
    >
      <span>{emoji}</span>
      <span className="font-medium">{count}</span>
    </button>
  );
}

function SystemMessage({ text }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-[#1E1E1E]" />
      <span className="text-[10px] text-[#444] whitespace-nowrap">{text}</span>
      <div className="flex-1 h-px bg-[#1E1E1E]" />
    </div>
  );
}

function MessageRow({ msg, onReact }) {
  const [hovered, setHovered] = useState(false);

  if (msg.system) return <SystemMessage text={msg.text} />;

  return (
    <div
      className={`group/msg flex gap-3 px-4 py-2 rounded-xl transition-all relative ${hovered ? "bg-[#1A1A1A]" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
        style={{ background: `${msg.color || "#F5C518"}20`, color: msg.color || "#F5C518" }}
      >
        {msg.initials || msg.author?.charAt(0) || "?"}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-semibold text-white">{msg.author}</span>
          {msg.dept && <span className="text-[10px] text-[#555]">{msg.dept}</span>}
          <span className="text-[10px] text-[#444]">{msg.time}</span>
        </div>
        <p className="text-sm text-[#CCCCCC] leading-relaxed">{msg.text}</p>
        {msg.attachments?.length > 0 && (
          <div className="mt-2 space-y-2">
            {msg.attachments.map((att, idx) => (
              <AttachmentCard key={idx} att={att} />
            ))}
          </div>
        )}

        {/* Reactions */}
        {msg.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.reactions.map((r) => (
              <ReactionPill key={r.emoji} {...r} onToggle={() => onReact(msg.id, r.emoji)} />
            ))}
            <button className="flex items-center justify-center w-7 h-5 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#444] hover:text-white hover:border-[#444] transition-all text-xs">
              <Plus size={10} />
            </button>
          </div>
        )}

        {/* Reply count */}
        {msg.replies > 0 && (
          <button className="mt-1.5 flex items-center gap-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors">
            <Reply size={11} />
            {msg.replies} {msg.replies === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Hover toolbar */}
      {hovered && (
        <div className="absolute right-4 top-1 flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-1.5 py-1 shadow-xl">
          {["👍", "❤️", "😄"].map((e) => (
            <button
              key={e}
              onClick={() => onReact(msg.id, e)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#2A2A2A] text-sm transition-all"
            >
              {e}
            </button>
          ))}
          <div className="w-px h-4 bg-[#2A2A2A] mx-0.5" />
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#2A2A2A] text-[#666] hover:text-white transition-all">
            <Reply size={12} />
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#2A2A2A] text-[#666] hover:text-white transition-all">
            <MoreHorizontal size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function DMItem({ dm, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(dm.id)}
      className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all ${
        isActive
          ? "bg-primary/15 text-primary font-semibold"
          : "text-[#888] hover:text-white hover:bg-[#1A1A1A]"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
          style={{ background: "#2A2A2A", color: "#888" }}
        >
          {dm.name?.charAt(0) || "?"}
        </div>
        {dm.online && (
          <Circle
            size={6}
            className="absolute -bottom-0.5 -right-0.5 fill-green-400 text-green-400 ring-2 ring-[#111111] rounded-full"
          />
        )}
      </div>
      <span className="flex-1 text-left truncate">{dm.name}</span>
      {dm.unread > 0 && (
        <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {dm.unread}
        </span>
      )}
    </button>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// ─── Main component ────────────────────────────────────────────────────────────

export function Messages({
  orgName = "Jumpstart Connect",
  pageLabel = "Communication",
}) {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const currentUserId = currentUser?.id ?? null;

  const [directMessages, setDirectMessages] = useState([]);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [dmsExpanded, setDmsExpanded] = useState(true);
  const [channelSearch, setChannelSearch] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Build the conversation list from the inbox ───────────────────────────
  const loadInbox = useCallback(async () => {
    if (!currentUserId) {
      setError("No logged-in user found.");
      setLoadingInbox(false);
      return;
    }

    try {
      setLoadingInbox(true);
      setError(null);

      const data = await messageApi.getThreads(currentUserId);
      const rawMessages = data?.inbox || [];

      // Group messages by the "other" participant in the conversation
      const conversationsByPartner = new Map();

      rawMessages.forEach((m) => {
        const isOutgoing = m.sender_id === currentUserId;
        const partnerId = isOutgoing ? m.receiver_id : m.sender_id;
        const partnerName = isOutgoing ? m.receiver_name : m.sender_name;

        const existing = conversationsByPartner.get(partnerId);
        const entry = {
          id: partnerId,
          name: partnerName || "Unknown",
          lastMessage: m.message,
          lastTimestamp: m.timestamp,
          unread: 0,
        };

        if (!existing || new Date(m.timestamp) > new Date(existing.lastTimestamp)) {
          conversationsByPartner.set(partnerId, entry);
        }
      });

      const conversations = Array.from(conversationsByPartner.values()).sort(
        (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
      );

      setDirectMessages(conversations);

      setActiveChannelId((prev) => {
        if (prev) return prev;
        return conversations.length > 0 ? conversations[0].id : null;
      });
    } catch (err) {
      console.error("Failed to load inbox:", err);
      setError(err.message);
    } finally {
      setLoadingInbox(false);
    }
  }, [currentUserId]);

  const loadContacts = useCallback(async () => {
    if (!currentUserId) {
      setAvailableContacts([]);
      return;
    }

    try {
      const data = await messageApi.getContacts(currentUserId);
      const contacts = Array.isArray(data?.contacts) ? data.contacts : [];
      setAvailableContacts(contacts);
    } catch (err) {
      console.error("Failed to load contacts:", err);
      setAvailableContacts([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadInbox();
    loadContacts();
  }, [loadInbox, loadContacts]);

  const sidebarContacts = useMemo(() => {
    const existingIds = new Set(directMessages.map((conversation) => conversation.id));

    return (availableContacts || [])
      .filter((contact) => !existingIds.has(contact.id))
      .map((contact) => ({
        id: contact.id,
        name: contact.name || contact.email || "Unknown",
        email: contact.email,
        department: contact.department,
        role: contact.role,
        lastMessage: "",
        lastTimestamp: null,
        unread: 0,
        isContact: true,
      }));
  }, [availableContacts, directMessages]);

  const sidebarChannels = useMemo(() => {
    return [...directMessages, ...sidebarContacts].sort((a, b) => {
      if (!a.lastTimestamp && !b.lastTimestamp) return 0;
      if (!a.lastTimestamp) return 1;
      if (!b.lastTimestamp) return -1;
      return new Date(b.lastTimestamp) - new Date(a.lastTimestamp);
    });
  }, [directMessages, sidebarContacts]);

  useEffect(() => {
    setActiveChannelId((prev) => {
      if (prev && sidebarChannels.some((channel) => channel.id === prev)) {
        return prev;
      }
      return sidebarChannels[0]?.id ?? null;
    });
  }, [sidebarChannels]);

  // ── Load the open conversation's messages ─────────────────────────────────
  const loadConversation = useCallback(async (partnerId) => {
    if (!currentUserId || !partnerId) {
      setConversationMessages([]);
      return;
    }

    try {
      setLoadingConversation(true);
      const data = await messageApi.getThread(currentUserId, partnerId);
      console.log("getThread response:", data);

      // The backend may return a plain array, or wrap it in an object
      // (e.g. { conversation: [...] } or { messages: [...] }) — handle both.
      const rawMessages = Array.isArray(data)
        ? data
        : Array.isArray(data?.conversation)
        ? data.conversation
        : Array.isArray(data?.messages)
        ? data.messages
        : Array.isArray(data?.results)
        ? data.results
        : [];

      const mapped = rawMessages
        .slice()
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map((m) => ({
          id: m.id,
          author: m.sender_id === currentUserId ? "You" : m.sender_name,
          text: m.message,
          time: formatTime(m.timestamp),
        }));

      setConversationMessages(mapped);
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setError(err.message);
      setConversationMessages([]);
    } finally {
      setLoadingConversation(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (activeChannelId) {
      loadConversation(activeChannelId);
    }
  }, [activeChannelId, loadConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length]);

  const filteredDMs = useMemo(() => {
    if (!channelSearch.trim()) return directMessages;
    const q = channelSearch.toLowerCase();
    return directMessages.filter((d) => d.name.toLowerCase().includes(q));
  }, [directMessages, channelSearch]);

  const filteredContacts = useMemo(() => {
    if (!channelSearch.trim()) return sidebarContacts;
    const q = channelSearch.toLowerCase();
    return sidebarContacts.filter((contact) => contact.name.toLowerCase().includes(q));
  }, [sidebarContacts, channelSearch]);

  const selectedChannel = useMemo(
    () => sidebarChannels.find((channel) => channel.id === activeChannelId) ?? null,
    [sidebarChannels, activeChannelId]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChannelSelect = useCallback((id) => {
    setActiveChannelId(id);
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachments((existing) => [...existing, ...files]);
    event.target.value = "";
  };

  const handleRemoveAttachment = (name) => {
    setAttachments((prev) => prev.filter((f) => f.name !== name));
  };

  const handleSendMessage = async () => {
    const text = draft.trim();
    if (!selectedChannel || !currentUserId || !text) return;

    try {
      await messageApi.sendMessage({
        senderId: currentUserId,
        receiverId: selectedChannel.id,
        message: text,
      });

      setDraft("");
      setAttachments([]);
      setIsTyping(false);
      inputRef.current?.focus();

      await loadConversation(selectedChannel.id);
      await loadInbox();
      await loadContacts();
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReact = (msgId, emoji) => {
    console.log("React to message", msgId, emoji);
  };

  if (loadingInbox && directMessages.length === 0) {
    return (
      <div className="flex h-[calc(100vh-9rem)] bg-[#0D0D0D] rounded-2xl border border-[#1E1E1E] overflow-hidden items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-[#222] flex items-center justify-center">
            <MessageSquare size={22} className="text-[#333]" />
          </div>
          <p className="text-sm text-white font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!selectedChannel) {
    return (
      <div className="flex h-[calc(100vh-9rem)] bg-[#0D0D0D] rounded-2xl border border-[#1E1E1E] overflow-hidden items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-[#222] flex items-center justify-center">
            <MessageSquare size={22} className="text-[#333]" />
          </div>
          <p className="text-sm text-white font-medium">No conversations available</p>
          <p className="text-xs text-[#444]">
            {error ? error : "There are currently no messages to display."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      {/* Breadcrumb bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-[#555]">{orgName}</span>
          <ChevronRight size={13} className="text-[#444]" />
          <span className="text-white font-semibold">{pageLabel}</span>
        </div>
      </div>

      <div className="flex flex-1 bg-[#0D0D0D] rounded-2xl border border-[#1E1E1E] overflow-hidden">
        {/* ── Left panel ── */}
        <div className="w-60 flex-shrink-0 border-r border-[#1E1E1E] flex flex-col bg-[#111111]">
          {/* Search */}
          <div className="p-3 border-b border-[#1A1A1A]">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#444]" />
              <input
                type="text"
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                placeholder="Find conversations..."
                className="w-full bg-[#1A1A1A] border border-[#222] text-white pl-7 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#F5C518]/30 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-2">
            {/* Direct messages */}
            <button
              onClick={() => setDmsExpanded(!dmsExpanded)}
              className="w-full flex items-center gap-1.5 px-1 py-1 text-[10px] font-semibold text-[#444] uppercase tracking-wider hover:text-[#666] transition-colors"
            >
              {dmsExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Direct Messages
            </button>
            {dmsExpanded && (
              <div className="space-y-0.5 mt-1">
                {filteredDMs.length > 0 && (
                  <>
                    <div className="px-1 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#444]">
                      Conversations
                    </div>
                    {filteredDMs.map((dm) => (
                      <DMItem
                        key={dm.id}
                        dm={dm}
                        isActive={dm.id === selectedChannel?.id}
                        onSelect={handleChannelSelect}
                      />
                    ))}
                  </>
                )}

                {filteredContacts.length > 0 && (
                  <>
                    <div className="px-1 py-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#444]">
                      Available people
                    </div>
                    {filteredContacts.map((contact) => (
                      <DMItem
                        key={contact.id}
                        dm={{ ...contact, unread: 0 }}
                        isActive={contact.id === selectedChannel?.id}
                        onSelect={handleChannelSelect}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel header */}
          <div className="h-12 border-b border-[#1E1E1E] flex items-center justify-between px-4 flex-shrink-0 bg-[#111111]">
            <div className="flex items-center gap-2 min-w-0">
              <Hash size={15} className="text-[#666] flex-shrink-0" />
              <span className="text-sm font-semibold text-white truncate">{selectedChannel.name}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1A1A1A] transition-all">
                <Phone size={14} />
              </button>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1A1A1A] transition-all">
                <Video size={14} />
              </button>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1A1A1A] transition-all">
                <Info size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-2 space-y-0.5 bg-[#0D0D0D]">
            {loadingConversation && conversationMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-[#222] flex items-center justify-center">
                  <MessageSquare size={22} className="text-[#333]" />
                </div>
                <p className="text-sm text-white font-medium">Loading messages...</p>
              </div>
            ) : conversationMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-[#222] flex items-center justify-center">
                  <MessageSquare size={22} className="text-[#333]" />
                </div>
                <p className="text-sm text-white font-medium">No messages yet</p>
                <p className="text-xs text-[#444]">Start the conversation with {selectedChannel.name}</p>
              </div>
            ) : (
              conversationMessages.map((msg) => (
                <MessageRow key={msg.id} msg={msg} onReact={handleReact} />
              ))
            )}

            {isTyping && (
              <div className="flex items-center gap-3 px-4 py-1">
                <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[10px] text-[#888]">
                  {selectedChannel.name?.charAt(0) || "?"}
                </div>
                <div className="flex items-center gap-1 bg-[#1A1A1A] rounded-xl px-3 py-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#444] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#333]">typing...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#1E1E1E] flex-shrink-0 bg-[#111111]">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden focus-within:border-[#F5C518]/30 transition-all">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedChannel.name}...`}
                rows={1}
                className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-white placeholder-[#444] focus:outline-none resize-none"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />

              {/* Attachments preview (UI only — backend has no attachment support yet) */}
              {attachments.length > 0 && (
                <div className="px-3 pb-2 space-y-1.5">
                  {attachments.map((file) => {
                    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
                    const typeMap = { png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image" };
                    const attType = typeMap[ext] || "pdf";
                    const s = ATTACH_ICONS[attType] || ATTACH_ICONS.pdf;
                    return (
                      <div key={file.name} className="flex items-center justify-between gap-3 bg-[#111] border border-[#2A2A2A] rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={14} className={s.color} />
                          <span className="text-xs text-[#888] truncate">{file.name}</span>
                          <span className="text-[10px] text-[#444]">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(file.name)}
                          className="text-[#444] hover:text-white transition-colors flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between px-3 pb-2">
                <div className="flex items-center gap-1">
                  {[
                    { icon: Smile, label: "Emoji" },
                    { icon: Paperclip, label: "Attach", onClick: () => fileInputRef.current?.click() },
                    { icon: AtSign, label: "Mention" },
                    { icon: Mic, label: "Voice note" },
                  ].map(({ icon: Icon, label, onClick }) => (
                    <button
                      key={label}
                      title={label}
                      onClick={onClick}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#2A2A2A] transition-all"
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!draft.trim()}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={12} /> Send
                </button>
              </div>
            </div>
            <p className="text-[10px] text-[#333] mt-1.5 px-1">
              Press <kbd className="bg-[#1A1A1A] border border-[#2A2A2A] px-1 py-0.5 rounded text-[9px]">Enter</kbd> to send ·{" "}
              <kbd className="bg-[#1A1A1A] border border-[#2A2A2A] px-1 py-0.5 rounded text-[9px]">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}