import { useState } from "react";
import {
  MoreVertical,
  Reply,
  Smile,
  Pencil,
  Trash2,
  Download,
  Paperclip,
  Check,
  CheckCheck,
} from "lucide-react";

export function ChatMessage({
  message,
  currentUser,
  onReaction,
  onReply,
  onEdit,
  onDelete,
}) {
  const [showActions, setShowActions] = useState(false);

  const isMine = String(currentUser?.id) === String(message.sender?.id);

  const reactions = message.reactions || [];
  const attachments = message.attachments || [];
  const [showReactions, setShowReactions] = useState(false);
  const EMOJIS = [
    "😀",
    "😂",
    "😍",
    "😢",
    "😡",
    "👍",
    "👎",
    "❤️",
    "🎉",
    "🚀",
];
  return (
    <div
      className={`group flex gap-3 ${
        isMine ? "justify-end" : "justify-start"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}

      {!isMine && (
        <img
          src={
            message.sender?.avatar ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(message.sender?.name || "User")
          }
          alt={message.sender?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}

      {/* Message */}

      <div
        className={`max-w-[70%] ${
          isMine ? "items-end" : "items-start"
        } flex flex-col`}
      >
        {!isMine && (
          <span className="text-sm font-semibold text-white mb-1">
            {message.sender?.name}
          </span>
        )}

        <div
          className={`rounded-2xl px-4 py-3 shadow-lg relative

            ${
              isMine
                ? "bg-[#F7C948] text-black rounded-br-md"
                : "bg-[#1B222C] text-white rounded-bl-md"
            }
          `}
        >
          {/* Message */}

          {message.deleted ? (
            <p className="whitespace-pre-wrap break-words italic opacity-60">
              This message was deleted
            </p>
          ) : (
            <p className="whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Attachments */}

          {!message.deleted && attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg bg-black/10 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Paperclip size={16} />
                    <span className="text-sm">
                      {file.name}
                    </span>
                  </div>

                  <button className="hover:text-blue-500 transition">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Edited */}

          {message.edited && !message.deleted && (
            <span className="text-xs opacity-60 mt-2 block">
              Edited
            </span>
          )}
        </div>

        {/* Footer */}

        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <span>{message.time}</span>

          {isMine &&
            (message.read ? (
              <CheckCheck
                size={15}
                className="text-blue-400"
              />
            ) : (
              <Check size={15} />
            ))}
        </div>

        {/* Reactions */}

        {reactions.length > 0 && !message.deleted && (
          <div className="flex flex-wrap gap-2 mt-2">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() =>
                  onReaction?.(
                    message.id,
                    reaction.emoji
                  )
                }
                className="px-2 py-1 rounded-full bg-[#2B3137] text-sm hover:bg-[#3B424B] transition"
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}

      {isMine && (
        <img
          src={
            currentUser?.avatar ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(currentUser?.name || "Me")
          }
          alt={currentUser?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}

      {/* Hover Actions */}

      {showActions && (
        <div className="flex items-start gap-2 mt-2">
          <button
            className="p-2 rounded-lg bg-[#21262D] hover:bg-[#30363D]"
            onClick={() => onReply?.(message)}
          >
            <Reply size={16} />
          </button>

          <div className="relative">

    <button
        onClick={() => setShowReactions(!showReactions)}
    >
        <Smile size={16} />
    </button>

    {showReactions && (
        <div className="absolute bottom-full right-0 mb-2 bg-[#1A1A1A] border border-[#333] rounded-xl p-2 shadow-xl flex gap-2 flex-wrap w-48 z-50">

            {EMOJIS.map((emoji) => (
                <button
                    key={emoji}
                    className="text-xl hover:scale-125 transition"
                    onClick={() => {
                        onReaction?.(message.id, emoji);
                        setShowReactions(false);
                    }}
                >
                    {emoji}
                </button>
            ))}

        </div>
    )}

</div>

          {isMine && (
            <>
              <button
                className="p-2 rounded-lg bg-[#21262D] hover:bg-[#30363D]"
                onClick={() => onEdit?.(message)}
              >
                <Pencil size={16} />
              </button>

              <button
    onClick={() => onDelete?.(message.id)}
    title="Delete message"
>
    <Trash2 className="h-4 w-4" />
</button>
            </>
          )}

          <button className="p-2 rounded-lg bg-[#21262D] hover:bg-[#30363D]">
            <MoreVertical size={16} />
          </button>
        </div>
      )}
    </div>
  );
}