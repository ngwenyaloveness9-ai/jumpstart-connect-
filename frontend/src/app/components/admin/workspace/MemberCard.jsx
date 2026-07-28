import { useState } from "react";
import {
  Mail,
  Building2,
  Circle,
  MoreVertical,
  Eye,
  UserCog,
  BellOff,
  UserMinus,
  Crown,
  Shield,
  User,
} from "lucide-react";

const ROLE_CONFIG = {
  owner: {
    label: "Workspace Owner",
    icon: Crown,
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  supervisor: {
    label: "Supervisor",
    icon: Shield,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  employee: {
    label: "Employee",
    icon: User,
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
};

export function MemberCard({
  member,
  currentUser,
  onViewProfile,
  onPromote,
  onMute,
  onRemove,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const role =
    ROLE_CONFIG[member.role?.toLowerCase()] ||
    ROLE_CONFIG.employee;

  const RoleIcon = role.icon;

  const canManage =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "owner" ||
    currentUser?.role === "supervisor";

  return (
    <div className="rounded-2xl border border-[#2B3137] bg-[#161B22] hover:border-yellow-500/40 transition shadow-lg">

      {/* Header */}

      <div className="p-6 flex justify-between items-start">

        <div className="flex gap-4">

          <div className="relative">

            <img
              src={
                member.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.name || "User"
                )}`
              }
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#30363D]"
            />

            <span
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#161B22]
                ${
                  member.online
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
            />

          </div>

          <div>

            <h3 className="text-lg font-semibold text-white">
              {member.name}
            </h3>

            <p className="text-sm text-gray-400">
              @{member.username || "username"}
            </p>

            <div
              className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full border text-xs font-semibold ${role.color}`}
            >
              <RoleIcon size={14} />
              {role.label}
            </div>

          </div>

        </div>

        {canManage && member.id !== currentUser?.id && (
          <div className="relative">

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-[#21262D]"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#21262D] border border-[#30363D] overflow-hidden shadow-xl z-20">

                <button
                  onClick={() => onViewProfile?.(member)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#30363D]"
                >
                  <Eye size={16} />
                  View Profile
                </button>

                <button
                  onClick={() => onPromote?.(member)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#30363D]"
                >
                  <UserCog size={16} />
                  Change Role
                </button>

                <button
                  onClick={() => onMute?.(member)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#30363D]"
                >
                  <BellOff size={16} />
                  Mute Member
                </button>

                <button
                  onClick={() => onRemove?.(member)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10"
                >
                  <UserMinus size={16} />
                  Remove Member
                </button>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Information */}

      <div className="px-6 pb-6 space-y-4">

        <div className="flex items-center gap-3 text-gray-300">

          <Mail size={17} className="text-yellow-400" />

          <span>{member.email}</span>

        </div>

        <div className="flex items-center gap-3 text-gray-300">

          <Building2 size={17} className="text-yellow-400" />

          <span>{member.department}</span>

        </div>

        <div className="flex items-center gap-3">

          <Circle
            size={12}
            fill="currentColor"
            className={
              member.online
                ? "text-green-500"
                : "text-gray-500"
            }
          />

          <span className="text-gray-300">

            {member.online
              ? "Online"
              : "Offline"}

          </span>

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-[#2B3137] px-6 py-4 flex justify-between items-center">

        <span className="text-xs text-gray-500">

          Joined {member.joinedAt || "Recently"}

        </span>

        <button
          onClick={() => onViewProfile?.(member)}
          className="px-4 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-sm text-white transition"
        >
          View Profile
        </button>

      </div>

    </div>
  );
}