import { useEffect, useRef } from "react";
import { Pin, MessageSquare } from "lucide-react";

import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";

export function GroupChat({
    workspace,
    messages = [],
    currentUser,
    members = [],
    typingUsers = [],
    pinnedMessage,
    onSendMessage,
    onAttachFile,
    onReaction,
    onReply,
    onEdit,
    onDelete,
}) {

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-[#0D1117]">

            {/* Workspace Banner */}

            <div className="border-b border-[#2B3137] px-6 py-4 bg-[#161B22]">

                <h2 className="text-white font-semibold text-lg">
                    {workspace?.name || "Workspace Chat"}
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                    Collaborate with your team in real time.
                </p>

            </div>

            {/* Pinned Message */}

            {pinnedMessage && (

                <div className="flex items-center gap-3 bg-[#2C2213] border-b border-[#4B3A16] px-6 py-3">

                    <Pin
                        size={18}
                        className="text-yellow-400"
                    />

                    <div>

                        <p className="text-yellow-300 text-xs uppercase tracking-wide">
                            Pinned Message
                        </p>

                        <p className="text-white text-sm">
                            {pinnedMessage.content}
                        </p>

                    </div>

                </div>

            )}

            {/* Messages */}

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

                {messages.length === 0 ? (

                    <div className="h-full flex flex-col items-center justify-center text-center">

                        <MessageSquare
                            size={60}
                            className="text-gray-600 mb-4"
                        />

                        <h3 className="text-white text-xl font-semibold">

                            No messages yet

                        </h3>

                        <p className="text-gray-500 mt-2">

                            Start the conversation with your team.

                        </p>

                    </div>

                ) : (

                    <>
                        <div className="flex justify-center">

                            <span className="bg-[#21262D] text-gray-400 text-xs px-4 py-1 rounded-full">

                                Today

                            </span>

                        </div>

                        {messages.map((message) => (

                            <ChatMessage
                                key={message.id}
                                message={message}
                                currentUser={currentUser}
                                onReaction={onReaction}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}

                            />

                        ))}

                    </>

                )}

                <div ref={messagesEndRef} />

            </div>

            {/* Typing Indicator */}

            {typingUsers.length > 0 && (

                <div className="px-6 pb-2 text-sm text-gray-400">

                    {typingUsers.join(", ")} typing...

                </div>

            )}

            {/* Composer */}

            <ChatComposer
                onSend={onSendMessage}
                onAttach={onAttachFile}
                members={members}
            />

        </div>
    );
}