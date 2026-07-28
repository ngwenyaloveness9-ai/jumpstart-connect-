import { useState, useEffect } from "react";

import { groupsApi } from "../../../services/groupsApi";

import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { GroupChat } from "./GroupChat";
import { AnnouncementList } from "./AnnouncementList";
import { MembersList } from "./MembersList";

export function WorkspaceEnvironment({
    workspace,
    messages = [],
    announcements = [],
    onBack,
}) {

    const currentUser =
        JSON.parse(localStorage.getItem("currentUser")) ||
        JSON.parse(localStorage.getItem("user"));

    const [activeTab, setActiveTab] = useState("chat");
    const [members, setMembers] = useState([]);
    const [groupMessages, setGroupMessages] = useState([]);
    const [groupAnnouncements, setGroupAnnouncements] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

    useEffect(() => {
    async function loadWorkspace() {
        try {

            // Load members
            const members = await groupsApi.getMembers(workspace.id);
            setMembers(members);

            // Load messages
            const messageData = await groupsApi.messages(workspace.id);

const formattedMessages = (messageData.messages || []).map((msg) => ({
    id: msg.id,

    content: msg.message,

    sender: {
        id: msg.sender_id,
        name: msg.sender_name,
    },

    attachments: msg.attachments || [],

    time: new Date(msg.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    }),

    read: true,
}));

setGroupMessages(formattedMessages);

        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMembers(false);
        }
    }

    loadWorkspace();

}, [workspace.id]);

const handleSendMessage = async ({ content, attachments }) => {
    try {
        const formData = new FormData();

        formData.append("sender_id", currentUser.id);
        formData.append("group_id", workspace.id);
        formData.append("message", content);

        attachments.forEach((file) => {
            formData.append("attachments", file);
        });

        await groupsApi.sendMessage(formData);

        const updated = await groupsApi.messages(workspace.id);

        const formattedMessages = (updated.messages || []).map((msg) => ({
            id: msg.id,
            content: msg.message,

            sender: {
                id: msg.sender_id,
                name: msg.sender_name,
            },

            attachments: msg.attachments || [],

            time: new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),

            read: true,
        }));

        setGroupMessages(formattedMessages);

    } catch (err) {
        console.error(err);
    }
};

const handleDeleteMessage = async (messageId) => {
    try {
        await groupsApi.deleteMessage(messageId);

        const updated = await groupsApi.messages(workspace.id);

        const formattedMessages = (updated.messages || []).map((msg) => ({
            id: msg.id,
            content: msg.message,

            sender: {
                id: msg.sender_id,
                name: msg.sender_name,
            },

            attachments: msg.attachments || [],

            time: new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),

            read: true,
        }));

        setGroupMessages(formattedMessages);

    } catch (error) {
        console.error("Failed to delete message:", error);
    }
};

const handleReaction = async (messageId, emoji) => {
    try {
        await groupsApi.reactToMessage(
            messageId,
            currentUser.id,
            emoji
        );

        const updated = await groupsApi.messages(workspace.id);

        const formattedMessages = (updated.messages || []).map((msg) => ({
            id: msg.id,
            content: msg.message,

            sender: {
                id: msg.sender_id,
                name: msg.sender_name,
            },

            attachments: msg.attachments || [],
            reactions: msg.reactions || [],

            time: new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),

            read: true,
        }));

        setGroupMessages(formattedMessages);

    } catch (err) {
        console.error("Reaction failed:", err);
    }
};
    return (
        <div className="h-full flex flex-col bg-[#0D1117] rounded-3xl overflow-hidden border border-[#222]">

            <WorkspaceHeader
                workspace={workspace}
                onBack={onBack}
            />

            <WorkspaceTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <div className="flex-1 overflow-hidden">

                {activeTab === "chat" && (
                    <GroupChat
    workspace={workspace}
    messages={groupMessages}
    currentUser={currentUser}
    onSendMessage={handleSendMessage}
    onDelete={handleDeleteMessage}
    onReaction={handleReaction}
/>
                )}

                {activeTab === "announcements" && (
                    <AnnouncementList
                        announcements={announcements}
                    />
                )}

                {activeTab === "members" && (
                    <MembersList
                        members={members}
                    />
                )}

            </div>

        </div>
    );
}