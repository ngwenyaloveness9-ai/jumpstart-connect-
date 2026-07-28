import { useState } from "react";
import {
  X,
  Megaphone,
  Paperclip,
  Upload,
} from "lucide-react";

export function AnnouncementModal({
    workspace,
    currentUser,
    loading = false,
    announcement = null,
    onClose,
    onSubmit,
    onDeleteAnnouncement,
}) {
  const [title, setTitle] = useState(
    announcement?.title || ""
);

const [body, setBody] = useState(
    announcement?.content || ""
);

const [priority, setPriority] = useState(
    announcement?.priority || "info"
);

const [targetType, setTargetType] = useState(
    announcement?.targetType || "group"
);
  const [department, setDepartment] = useState("");
  const [attachments, setAttachments] = useState([]);

  const handleFiles = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    if (!body.trim() && attachments.length === 0) {
      alert("Please enter a message or attach a file.");
      return;
    }

    const formData = new FormData();

    formData.append("author_id", currentUser.id);
    formData.append("title", title);
    formData.append("body", body);

    formData.append("target_type", targetType);

    if (targetType === "group") {
      formData.append("group_id", workspace.id);
    }

    if (targetType === "department") {
      formData.append("department", department);
    }

    // Stored for frontend display if your backend later supports it
    formData.append("priority", priority);

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">

      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#161B22] border border-[#30363D] shadow-2xl flex flex-col">

        {/* Header */}

        <div className="flex items-center justify-between px-8 py-6 border-b border-[#30363D]">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-yellow-500 flex items-center justify-center">

              <Megaphone className="text-black" />

            </div>

            <div>

              <h2>
    {announcement
        ? "Edit Announcement"
        : "New Announcement"}
</h2>

              <p className="text-gray-400 text-sm">
                Share updates with your workspace.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#21262D]"
          >
            <X className="text-gray-300" />
          </button>

        </div>

<form
    onSubmit={handleSubmit}
    className="flex flex-col flex-1 overflow-hidden"
>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">

            {/* Title */}

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-[#0D1117] border border-[#30363D] px-4 py-3 text-white outline-none"
                placeholder="Announcement title"
              />

            </div>

            {/* Message */}

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Message
              </label>

              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-xl bg-[#0D1117] border border-[#30363D] px-4 py-3 text-white outline-none resize-none"
                placeholder="Write your announcement..."
              />

            </div>

            {/* Row */}

            <div className="grid grid-cols-2 gap-5">

              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl bg-[#0D1117] border border-[#30363D] px-4 py-3 text-white"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                </select>

              </div>

              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Audience
                </label>

                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full rounded-xl bg-[#0D1117] border border-[#30363D] px-4 py-3 text-white"
                >
                  <option value="group">Current Group</option>
                  <option value="department">Department</option>
                  <option value="everyone">Everyone</option>
                </select>

              </div>

            </div>

            {targetType === "department" && (

              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Department
                </label>

                <input
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value)
                  }
                  placeholder="ICT"
                  className="w-full rounded-xl bg-[#0D1117] border border-[#30363D] px-4 py-3 text-white"
                />

              </div>

            )}

            {/* Attachments */}

            <div>

              <label className="block text-sm text-gray-300 mb-3">
                Attach Files
              </label>

              <label className="border-2 border-dashed border-[#30363D] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 transition">

                <Upload
                  size={40}
                  className="text-yellow-400 mb-3"
                />

                <p className="text-white font-medium">
                  Click to upload files
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  Images, PDF, Word, Excel and more
                </p>

                <input
                  hidden
                  type="file"
                  multiple
                  onChange={handleFiles}
                />

              </label>

              {attachments.length > 0 && (

                <div className="mt-4 space-y-2">

                  {attachments.map((file, index) => (

                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl bg-[#0D1117] border border-[#30363D] px-4 py-3"
                    >

                      <Paperclip
                        size={16}
                        className="text-yellow-400"
                      />

                      <span className="text-gray-300 text-sm">
                        {file.name}
                      </span>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

          {/* Footer */}

          <div className="px-8 py-6 border-t border-[#30363D] flex justify-end gap-4">

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-[#30363D] text-gray-300 hover:bg-[#21262D]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 disabled:opacity-50"
            >
              {loading
    ? "Saving..."
    : announcement
        ? "Save Changes"
        : "Publish"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}