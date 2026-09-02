import { useState, useRef } from "react";
import {
  Send,
  Paperclip,
  Image,
  Smile,
  AtSign,
  Mic,
  X,
  Reply,
} from "lucide-react";

export function ChatComposer({
  onSend,
  onAttach,
  replyingTo = null,
  onCancelReply,
  members = [],
}) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const MAX_CHARACTERS = 2000;

  const sendMessage = () => {
    const trimmed = message.trim();

    if (!trimmed && selectedFiles.length === 0) return;

    onSend?.({
      content: trimmed,
      attachments: selectedFiles,
      replyTo: replyingTo,
    });

    setMessage("");
    setSelectedFiles([]);
    setMentionQuery(null);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    const match = value.match(/@([A-Za-z0-9._-]*)$/);
    setMentionQuery(match ? match[1] : null);
  };

  const handleMentionSelect = (member) => {
    const label = member?.name?.split(" ")[0] || member?.first_name || "user";
    const nextValue = message.replace(/@([A-Za-z0-9._-]*)$/, `@${label}`);

    setMessage(nextValue);
    setMentionQuery(null);
  };

  const mentionSuggestions = mentionQuery !== null
    ? members.filter((member) => {
        const fullName = member.name || `${member.first_name || ""} ${member.last_name || ""}`.trim();
        const normalized = `${fullName} ${member.email || ""}`.toLowerCase();
        return normalized.includes(mentionQuery.toLowerCase());
      })
    : [];

  const insertEmoji = (emoji) => {
    setMessage((currentMessage) => `${currentMessage}${emoji}`);
    setShowEmojiPicker(false);
  };

  const handleFiles = (files) => {
    const list = Array.from(files);

    setSelectedFiles((prev) => [...prev, ...list]);

    onAttach?.(list);
  };

  return (
    <div className="border-t border-[#2B3137] bg-[#161B22]">

      {/* Reply Preview */}

      {replyingTo && (
        <div className="mx-4 mt-4 rounded-xl bg-[#21262D] p-3 flex justify-between">

          <div className="flex gap-3">

            <Reply
              size={18}
              className="text-yellow-400 mt-1"
            />

            <div>

              <p className="text-yellow-400 text-sm font-semibold">

                Replying to {replyingTo.sender?.name}

              </p>

              <p className="text-gray-300 text-sm truncate">

                {replyingTo.content}

              </p>

            </div>

          </div>

          <button
            onClick={onCancelReply}
            className="text-gray-400 hover:text-white"
          >
            <X size={18}/>
          </button>

        </div>
      )}

      {/* Attachment Preview */}

      {selectedFiles.length > 0 && (

        <div className="px-4 pt-4 flex flex-wrap gap-2">

          {selectedFiles.map((file, index) => (

            <div
              key={index}
              className="flex items-center gap-2 bg-[#21262D] rounded-lg px-3 py-2"
            >

              <Paperclip size={15}/>

              <span className="text-sm text-white">

                {file.name}

              </span>

              <button
                onClick={() =>
                  setSelectedFiles((prev) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
                className="text-red-400 hover:text-red-500"
              >
                <X size={15}/>
              </button>

            </div>

          ))}

        </div>

      )}

      {/* Composer */}

      <div className="p-4">

        <div className="rounded-2xl border border-[#30363D] bg-[#0D1117]">

          <textarea
            rows={2}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            maxLength={MAX_CHARACTERS}
            className="w-full bg-transparent resize-none outline-none p-4 text-white placeholder:text-gray-500"
          />

          {mentionSuggestions.length > 0 && (
            <div className="border-t border-[#2B3137] px-3 py-2 flex flex-wrap gap-2">
              {mentionSuggestions.slice(0, 5).map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleMentionSelect(member)}
                  className="rounded-full bg-[#21262D] px-2 py-1 text-xs text-white hover:bg-[#30363D]"
                >
                  @{member.first_name || member.name?.split(" ")[0] || "user"}
                                  @{member.name?.split(" ")[0] || member.first_name || "user"}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#2B3137] px-3 py-2">

            {/* Left Actions */}

            <div className="flex items-center gap-2">

              <div className="relative">
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-[#21262D]"
                  onClick={() => setShowEmojiPicker((visible) => !visible)}
                  title="Add emoji"
                >
                <Smile size={19}/>
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-[calc(100%+0.75rem)] left-0 z-50 grid w-56 grid-cols-5 gap-1.5 rounded-xl border border-[#3B424B] bg-[#161B22] p-3 shadow-2xl">
                    {["😀", "😂", "😍", "😢", "😡", "👍", "👎", "❤️", "🎉", "🚀"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-[#30363D]"
                        onClick={() => insertEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="p-2 rounded-lg hover:bg-[#21262D]"
                onClick={() => {
                  setMessage((value) => `${value}@`);
                  setMentionQuery("");
                }}
                title="Mention a member"
              >
                <AtSign size={19}/>
              </button>

              <button
                className="p-2 rounded-lg hover:bg-[#21262D]"
                onClick={() =>
                  fileInputRef.current.click()
                }
              >
                <Paperclip size={19}/>
              </button>

              <button
                className="p-2 rounded-lg hover:bg-[#21262D]"
                onClick={() =>
                  imageInputRef.current.click()
                }
              >
                <Image size={19}/>
              </button>

              <button
                className="p-2 rounded-lg hover:bg-[#21262D]"
              >
                <Mic size={19}/>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) =>
                  handleFiles(e.target.files)
                }
              />

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) =>
                  handleFiles(e.target.files)
                }
              />

            </div>

            {/* Right Side */}

            <div className="flex items-center gap-4">

              <span className="text-xs text-gray-500">

                {message.length}/{MAX_CHARACTERS}

              </span>

              <button
                onClick={sendMessage}
                disabled={
                  !message.trim() &&
                  selectedFiles.length === 0
                }
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition

                ${
                  message.trim() ||
                  selectedFiles.length > 0
                    ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                    : "bg-[#30363D] text-gray-500 cursor-not-allowed"
                }

                `}
              >

                <Send size={18}/>

                Send

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}