import { useMemo, useState } from "react";
import {
  Megaphone,
  Search,
  Plus,
  Filter,
  Pin,
} from "lucide-react";

import { AnnouncementCard } from "./AnnouncementCard";

export function AnnouncementList({
  announcements = [],
  currentUser,
  onCreateAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onPinAnnouncement,
  onReact,
}) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const canCreate =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "owner" ||
    currentUser?.role === "supervisor";

  const filteredAnnouncements = useMemo(() => {
    let results = [...announcements];

    if (priorityFilter !== "all") {
      results = results.filter(
        (a) => a.priority === priorityFilter
      );
    }

    if (search.trim()) {
      results = results.filter(
        (a) =>
          a.title
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          a.content
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    return results.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    });
  }, [announcements, priorityFilter, search]);

  return (
    <div className="h-full flex flex-col bg-[#0D1117]">

      {/* Header */}

      <div className="border-b border-[#2B3137] bg-[#161B22] px-6 py-5">

        <div className="flex justify-between items-center">

          <div>

            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Megaphone className="text-yellow-400" />
              Announcements
            </h2>

            <p className="text-gray-400 mt-1">
              Company and department updates.
            </p>

          </div>

          {canCreate && (
            <button
              onClick={onCreateAnnouncement}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition"
            >
              <Plus size={18}/>
              New Announcement
            </button>
          )}

        </div>

        {/* Search */}

        <div className="mt-5 flex gap-4">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search announcements..."
              className="w-full rounded-xl bg-[#0D1117] border border-[#30363D] pl-10 pr-4 py-3 text-white outline-none"
            />

          </div>

          <div className="relative">

            <Filter
              size={18}
              className="absolute left-3 top-3 text-gray-500"
            />

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
              className="appearance-none rounded-xl bg-[#0D1117] border border-[#30363D] text-white pl-10 pr-8 py-3"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>

          </div>

        </div>

      </div>

      {/* List */}

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {filteredAnnouncements.length === 0 ? (

          <div className="h-full flex flex-col justify-center items-center text-center">

            <Megaphone
              size={70}
              className="text-gray-600 mb-4"
            />

            <h3 className="text-white text-xl font-semibold">

              No announcements

            </h3>

            <p className="text-gray-500 mt-2">

              Important updates will appear here.

            </p>

          </div>

        ) : (

          filteredAnnouncements.map((announcement) => (

            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              currentUser={currentUser}
              onEdit={onEditAnnouncement}
              onDelete={onDeleteAnnouncement}
              onPin={onPinAnnouncement}
              onReact={onReact}
            />

          ))

        )}

      </div>

      {/* Footer */}

      <div className="border-t border-[#2B3137] bg-[#161B22] px-6 py-3 flex items-center gap-2 text-gray-400 text-sm">

        <Pin size={15} />

        Pinned announcements always appear first.

      </div>

    </div>
  );
}