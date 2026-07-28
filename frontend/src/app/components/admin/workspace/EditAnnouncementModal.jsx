import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

export function EditAnnouncementModal({
    announcement,
    onClose,
    onSave,
    saving,
}) {

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (announcement) {
            setTitle(announcement.title || "");
            setContent(announcement.content || "");
        }
    }, [announcement]);

    if (!announcement) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

            <div className="w-full max-w-2xl rounded-2xl bg-[#161B22] border border-[#30363D] p-6">

                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-xl font-bold text-white">
                        Edit Announcement
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X />
                    </button>

                </div>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg bg-[#0D1117] border border-[#30363D] p-3 text-white mb-4"
                    placeholder="Announcement title"
                />

                <textarea
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-lg bg-[#0D1117] border border-[#30363D] p-3 text-white"
                    placeholder="Announcement..."
                />

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={saving}
                        onClick={() =>
                            onSave({
                                title,
                                body: content,
                            })
                        }
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                    >
                        <Save size={16}/>
                        {saving ? "Saving..." : "Save"}
                    </button>

                </div>

            </div>

        </div>
    );
}