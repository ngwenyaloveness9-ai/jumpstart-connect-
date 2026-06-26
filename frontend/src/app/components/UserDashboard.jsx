import { useState } from "react";
import { Messages } from "./admin/Messages";

export function UserDashboard() {
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);

  const handleSelectThread = (id) => {
    setActiveThreadId(id);
  };

  const handleSendMessage = (threadId, text, attachments, recipientEmail) => {
    console.log({
      threadId,
      text,
      attachments,
      recipientEmail,
    });
  };

  return (
    <div className="h-screen bg-background p-6">
      <Messages
        threads={threads}
        activeThreadId={activeThreadId}
        onThreadSelect={handleSelectThread}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}