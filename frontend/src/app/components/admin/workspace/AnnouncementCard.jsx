import { useState } from "react";
import {
  Pin,
  Paperclip,
  MoreVertical,
  Pencil,
  Trash2,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

const PRIORITY_STYLES = {
  info: {
    label: "Info",
    icon: Info,
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  },
  success: {
    label: "Success",
    icon: CheckCircle2,
    badge: "bg-green-500/20 text-green-400 border-green-500/40",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  urgent: {
    label: "Urgent",
    icon: ShieldAlert,
    badge: "bg-red-500/20 text-red-400 border-red-500/40",
  },
};

export function AnnouncementCard({
  announcement,
  currentUser,
  onEdit,
  onDelete,
  onPin,
  onReact,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const priority =
    PRIORITY_STYLES[announcement.priority] ||
    PRIORITY_STYLES.info;

  const PriorityIcon = priority.icon;

  const canManage =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "owner" ||
    currentUser?.id === announcement.author?.id;

  return (
    <div className="relative rounded-2xl border border-[#2B3137] bg-[#161B22] shadow-lg hover:border-yellow-500/40 transition-all">

      {/* Header */}

      <div className="flex justify-between items-start p-6">

        <div className="flex gap-4">

          <img
            src={
              announcement.author?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                announcement.author?.name || "User"
              )}`
            }
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>

            <div className="flex items-center gap-3 flex-wrap">

              <h3 className="text-lg font-semibold text-white">
                {announcement.title}
              </h3>

              <span
                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${priority.badge}`}
              >
                <PriorityIcon size={14} />
                {priority.label}
              </span>

              {announcement.pinned && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                  <Pin size={13} />
                  Pinned
                </span>
              )}

            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">

              <span>{announcement.author?.name}</span>

              <span className="flex items-center gap-1">
                <Clock size={14}/>
                {announcement.createdAt}
              </span>

            </div>

          </div>

        </div>

        {canManage && (
          <div className="relative">

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-[#21262D]"
            >
              <MoreVertical size={18}/>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#21262D] border border-[#30363D] overflow-hidden shadow-xl z-20">

                <button
                  onClick={() => onEdit?.(announcement)}
                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[#30363D]"
                >
                  <Pencil size={16}/>
                  Edit
                </button>

                <button
                  onClick={() => onPin?.(announcement)}
                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[#30363D]"
                >
                  <Pin size={16}/>
                  {announcement.pinned ? "Unpin" : "Pin"}
                </button>

                <button
                  onClick={() => onDelete?.(announcement.id)}
                  className="w-full px-4 py-3 flex items-center gap-2 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={16}/>
                  Delete
                </button>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Content */}

      <div className="px-6 pb-5">

        <p className="text-gray-300 leading-7 whitespace-pre-wrap">
          {announcement.content}
        </p>

      </div>

      {/* Attachments */}

      {announcement.attachments?.length > 0 && (

        <div className="px-6 pb-5 space-y-2">

          {announcement.attachments.map((file) => (

            <div
              key={file.id}
              className="flex items-center justify-between rounded-xl bg-[#0D1117] border border-[#30363D] px-4 py-3"
            >

              <div className="flex items-center gap-3">

                <Paperclip
                  size={16}
                  className="text-yellow-400"
                />

                <span className="text-sm text-gray-300">
                  {file.name}
                </span>

              </div>

              <button className="text-blue-400 hover:text-blue-300 text-sm">
                Download
              </button>

            </div>

          ))}

        </div>

      )}

      {/* Footer */}

      <div className="border-t border-[#2B3137] px-6 py-4 flex justify-between items-center">

        <div className="flex items-center gap-5">

          <button
            onClick={() => onReact?.(announcement.id, "❤️")}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition"
          >
            <Heart size={18}/>
            {announcement.reactions || 0}
          </button>

          <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition">
            <MessageCircle size={18}/>
            {announcement.comments || 0}
          </button>

          <div className="flex items-center gap-2 text-gray-500">

            <Eye size={17}/>

            {announcement.views || 0} views

          </div>

        </div>

        <span className="text-xs text-gray-500">

          Last updated {announcement.updatedAt || announcement.createdAt}

        </span>

      </div>

    </div>
  );
}