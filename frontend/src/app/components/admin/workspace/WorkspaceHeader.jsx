import {
    ArrowLeft,
    Bell,
    Settings,
    Search,
    Users,
    Circle,
    Building2
} from "lucide-react";

export function WorkspaceHeader({
    workspace,
    onBack
}) {

    const members = workspace?.memberCount || 0;
    const online = workspace?.onlineCount || 0;

    return (
        <div className="bg-[#161B22] border-b border-[#2B3137]">

            <div className="px-8 py-5 flex items-center justify-between">

                {/* LEFT */}

                <div className="flex items-center gap-5">

                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl hover:bg-[#21262D] flex items-center justify-center transition"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                        {workspace?.name?.charAt(0) || "W"}
                    </div>

                    <div>

                        <h1 className="text-2xl font-bold text-white">
                            {workspace?.name || "Technology"}
                        </h1>

                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">

                            <div className="flex items-center gap-1">
                                <Building2 size={15} />
                                {workspace?.department || "Department"}
                            </div>

                            <div className="flex items-center gap-1">
                                <Users size={15} />
                                {members} Members
                            </div>

                            <div className="flex items-center gap-1 text-green-400">
                                <Circle
                                    size={10}
                                    fill="currentColor"
                                />
                                {online} Online
                            </div>

                        </div>

                    </div>

                </div>

                {/* RIGHT */}

                <div className="flex items-center gap-3">

                    <button className="w-11 h-11 rounded-xl bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center transition">
                        <Search size={19}/>
                    </button>

                    <button className="relative w-11 h-11 rounded-xl bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center transition">

                        <Bell size={19}/>

                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"/>

                    </button>

                    <button className="w-11 h-11 rounded-xl bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center transition">
                        <Settings size={19}/>
                    </button>

                </div>

            </div>

        </div>
    );
}