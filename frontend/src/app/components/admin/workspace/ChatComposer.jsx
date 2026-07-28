import { useState, useRef } from "react";
import {
  Send,
  Paperclip,
  Image,
  Smile,
  Mic,
  X,
  Reply,
} from "lucide-react";

export function ChatComposer({
  onSend,
  onAttach,
  replyingTo = null,
  onCancelReply,
}) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

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
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            maxLength={MAX_CHARACTERS}
            className="w-full bg-transparent resize-none outline-none p-4 text-white placeholder:text-gray-500"
          />

          <div className="flex items-center justify-between border-t border-[#2B3137] px-3 py-2">

            {/* Left Actions */}

            <div className="flex items-center gap-2">

              <button
                className="p-2 rounded-lg hover:bg-[#21262D]"
              >
                <Smile size={19}/>
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