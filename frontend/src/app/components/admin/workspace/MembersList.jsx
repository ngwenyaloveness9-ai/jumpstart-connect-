import { useMemo, useState } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
} from "lucide-react";

import { MemberCard } from "./MemberCard";

export function MembersList({
  members = [],
  currentUser,
  onInviteMember,
  onPromote,
  onRemove,
  onMute,
  onViewProfile,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const canInvite =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "owner" ||
    currentUser?.role === "supervisor";

  const filteredMembers = useMemo(() => {
    let data = [...members];

    if (filter !== "all") {
      data = data.filter(
        (member) =>
          member.role?.toLowerCase() === filter
      );
    }

    if (search.trim()) {
      const term = search.toLowerCase();

      data = data.filter(
        (member) =>
          member.name?.toLowerCase().includes(term) ||
          member.department?.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term)
      );
    }

    return data.sort((a, b) => {
      if (a.online && !b.online) return -1;
      if (!a.online && b.online) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [members, search, filter]);

  return (
    <div className="flex flex-col h-full bg-[#0D1117]">

      {/* Header */}

      <div className="border-b border-[#2B3137] bg-[#161B22] px-6 py-5">

        <div className="flex justify-between items-center">

          <div>

            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Users className="text-yellow-400" />
              Members
            </h2>

            <p className="text-gray-400 mt-1">
              View and manage workspace members.
            </p>

          </div>

          {canInvite && (
            <button
              onClick={onInviteMember}
              className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-black font-semibold hover:bg-yellow-500 transition"
            >
              <UserPlus size={18} />
              Invite Member
            </button>
          )}

        </div>

        {/* Search & Filter */}

        <div className="mt-5 flex gap-4">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl bg-[#0D1117] border border-[#30363D] pl-10 pr-4 py-3 text-white outline-none"
            />

          </div>

          <div className="relative">

            <Filter
              size={18}
              className="absolute left-3 top-3 text-gray-500"
            />

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="appearance-none rounded-xl bg-[#0D1117] border border-[#30363D] text-white pl-10 pr-8 py-3"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="supervisor">Supervisor</option>
              <option value="employee">Employee</option>
            </select>

          </div>

        </div>

      </div>

      {/* Member Grid */}

      <div className="flex-1 overflow-y-auto p-6">

        {filteredMembers.length === 0 ? (

          <div className="h-full flex flex-col justify-center items-center text-center">

            <Users
              size={70}
              className="text-gray-600 mb-4"
            />

            <h3 className="text-white text-xl font-semibold">

              No members found

            </h3>

            <p className="text-gray-500 mt-2">

              Try another search or invite new members.

            </p>

          </div>

        ) : (

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">

            {filteredMembers.map((member) => (

              <MemberCard
                key={member.id}
                member={member}
                currentUser={currentUser}
                onPromote={onPromote}
                onMute={onMute}
                onRemove={onRemove}
                onViewProfile={onViewProfile}
              />

            ))}

          </div>

        )}

      </div>

      {/* Footer */}

      <div className="border-t border-[#2B3137] bg-[#161B22] px-6 py-3 text-sm text-gray-400">

        Showing {filteredMembers.length} of {members.length} members

      </div>

    </div>
  );
}