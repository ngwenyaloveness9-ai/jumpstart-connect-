import {
  MessageSquare,
  Megaphone,
  Users,
} from "lucide-react";

const tabs = [
  {
    id: "chat",
    label: "Group Chat",
    icon: MessageSquare,
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: Megaphone,
  },
  {
    id: "members",
    label: "Members",
    icon: Users,
  },
];

export function WorkspaceTabs({
  activeTab,
  setActiveTab,
  counts = {},
}) {
  return (
    <div className="bg-[#161B22] border-b border-[#2B3137] px-6">

      <div className="flex items-center gap-3">

        {tabs.map((tab) => {
          const Icon = tab.icon;

          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all duration-200

                ${
                  active
                    ? "text-[#F7C948]"
                    : "text-gray-400 hover:text-white"
                }

              `}
            >
              <Icon size={18} />

              <span>{tab.label}</span>

              {counts[tab.id] > 0 && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs

                  ${
                    active
                      ? "bg-[#F7C948] text-black"
                      : "bg-[#30363D] text-gray-300"
                  }
                  `}
                >
                  {counts[tab.id]}
                </span>
              )}

              {active && (
                <span className="absolute left-0 bottom-0 h-[3px] w-full rounded-full bg-[#F7C948]" />
              )}
            </button>
          );
        })}

      </div>

    </div>
  );
}