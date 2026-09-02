import { useState, useEffect, useRef } from "react";

import { groupsApi } from "../../../services/groupsApi";

import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { GroupChat } from "./GroupChat";
import { AnnouncementList } from "./AnnouncementList";
import { MembersList } from "./MembersList";
import { announcementApi } from "../../../services/announcementApi";
import { AnnouncementModal } from "./AnnouncementModal";

export function WorkspaceEnvironment({
    workspace,
    onBack,
}) {

    const currentUser =
        JSON.parse(localStorage.getItem("currentUser")) ||
        JSON.parse(localStorage.getItem("user"));
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [savingAnnouncement, setSavingAnnouncement] = useState(false);
    const [activeTab, setActiveTab] = useState("chat");
    const [members, setMembers] = useState([]);
    const [groupMessages, setGroupMessages] = useState([]);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
    const [groupAnnouncements, setGroupAnnouncements] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [infoMessage, setInfoMessage] = useState("");

    const isRestricted = workspace.access === "limited";
    const mountedRef = useRef(true);

    const formatMessages = (messageData) => {
        return (messageData.messages || []).map((msg) => ({
            id: msg.id,
            content: msg.message,
            sender: {
                id: msg.sender_id,
                name: msg.sender_name,
            },
            attachments: msg.attachments || [],
            reactions: msg.reactions || [],
            mentions: msg.mentions || [],
            edited: Boolean(msg.edited),
            deleted: Boolean(msg.is_deleted),
            time: new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            read: true,
        }));
    };

    const loadGroupMessages = async () => {
        if (isRestricted || !workspace?.id || !currentUser?.id) return;
        try {
            const messageData = await groupsApi.messages(
                workspace.id,
                currentUser.id
            );
            if (mountedRef.current) {
                setGroupMessages(formatMessages(messageData));
            }
        } catch (err) {
            console.error("Failed to load group messages", err);
        }
    };

    const loadAnnouncements = async () => {
        try {
            const data = await announcementApi.getAll(currentUser?.id, workspace.id);

            const formattedAnnouncements =
                (data.announcements || []).map((ann) => ({
                    id: ann.id,
                    title: ann.title,
                    content: ann.body,
                    author: {
                        id: ann.author_id,
                        name: ann.author_name,
                    },
                    createdAt: new Date(ann.timestamp).toLocaleString(),
                    updatedAt: ann.updated_at
                        ? new Date(ann.updated_at).toLocaleString()
                        : null,
                    priority: ann.priority || "info",
                    pinned: ann.pinned || false,
                    attachments: ann.attachments || [],
                    reactions: ann.reactions || 0,
                    comments: ann.comments || 0,
                    views: ann.views || 0,
                }));

            setGroupAnnouncements(formattedAnnouncements);
        } catch (err) {
            console.error("Failed to load announcements", err);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        async function loadWorkspace() {
            try {
                const members = await groupsApi.getMembers(workspace.id);
                setMembers(members);

                await loadGroupMessages();

                await loadAnnouncements();
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingMembers(false);
            }
        }

        if (workspace?.id) {
            void loadWorkspace();
        }
    }, [workspace.id, isRestricted, currentUser?.id]);

    useEffect(() => {
        if (!workspace?.id || isRestricted || activeTab !== "chat") {
            return;
        }

        const intervalId = setInterval(() => {
            void loadGroupMessages();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [workspace?.id, isRestricted, activeTab, currentUser?.id]);

const handleCreateAnnouncement = async (formData) => {
    try {

        setCreatingAnnouncement(true);

        if (editingAnnouncement) {

            await announcementApi.edit(
                editingAnnouncement.id,
                {
                    author_id: currentUser.id,
                    title: formData.get("title"),
                    body: formData.get("body"),
                }
            );

        } else {

            await announcementApi.create(formData);

        }

        await loadAnnouncements();

        setEditingAnnouncement(null);

        setShowAnnouncementModal(false);

    } catch (err) {

        console.error(err);

        alert("Failed to save announcement.");

    } finally {

        setCreatingAnnouncement(false);

    }
};

const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementModal(true);
};

const handleSendMessage = async ({ content, attachments }) => {
    try {
        setSendingMessage(true);
        const formData = new FormData();

        formData.append("sender_id", currentUser.id);
        formData.append("group_id", workspace.id);
        formData.append("message", content);

        attachments.forEach((file) => {
            formData.append("attachments", file);
        });

        if (isRestricted) {
            await groupsApi.contactDepartment(formData);
            setInfoMessage(
                "Your message has been sent to this workspace's members as direct messages."
            );
            setGroupMessages([]);
            return;
        }

        await groupsApi.sendMessage(formData);

        await loadGroupMessages();
    } catch (err) {
        console.error(err);
        setInfoMessage("Failed to send your message. Please try again.");
    } finally {
        setSendingMessage(false);
    }
};

const handleDeleteMessage = async (messageId) => {
    try {
        await groupsApi.deleteMessage(messageId);

        await loadGroupMessages();

    } catch (error) {
        console.error("Failed to delete message:", error);
    }
};

const handleEditMessage = async (message) => {
    const nextMessage = window.prompt("Edit your message", message.content || "");

    if (nextMessage === null) return;

    const trimmed = nextMessage.trim();

    if (!trimmed) {
        alert("Message cannot be empty.");
        return;
    }

    try {
        await groupsApi.updateMessage(message.id, trimmed);
        await loadGroupMessages();
    } catch (err) {
        console.error("Failed to edit message:", err);
        alert("Unable to edit this message.");
    }
};

const handleReaction = async (messageId, emoji) => {
    try {
        await groupsApi.reactToMessage(
            messageId,
            currentUser.id,
            emoji
        );

        await loadGroupMessages();

    } catch (err) {
        console.error("Reaction failed:", err);
    }
};

const handleDeleteAnnouncement = async (announcementId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) return;

    try {
        await announcementApi.delete(announcementId);

        await loadAnnouncements();

    } catch (err) {
        console.error("Failed to delete announcement:", err);

        alert("Failed to delete announcement.");
    }
};

    return (
        <div className="h-full flex flex-col bg-background rounded-3xl overflow-hidden border border-border">

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
                    <>
                        {isRestricted && (
                            <div className="bg-muted border-b border-border px-6 py-4 text-sm text-foreground">
                                You have limited access to this workspace. Chat history is hidden, but you can send a message with attachments and it will be delivered to workspace members as direct messages.
                            </div>
                        )}
                        {infoMessage && (
                            <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 text-sm text-primary">
                                {infoMessage}
                            </div>
                        )}
                        <GroupChat
                            workspace={workspace}
                            messages={groupMessages}
                            currentUser={currentUser}
                            members={members}
                            onSendMessage={handleSendMessage}
                            onDelete={isRestricted ? undefined : handleDeleteMessage}
                            onReaction={isRestricted ? undefined : handleReaction}
                            onEdit={isRestricted ? undefined : handleEditMessage}
                        />
                    </>
                )}

                {activeTab === "announcements" && (
                    <AnnouncementList
    announcements={groupAnnouncements}
    currentUser={currentUser}
    onCreateAnnouncement={() => {
        setEditingAnnouncement(null);
        setShowAnnouncementModal(true);
    }}
    onEditAnnouncement={handleEditAnnouncement}
    onDeleteAnnouncement={handleDeleteAnnouncement}
/>
                )}

                {activeTab === "members" && (
                    <MembersList
                        members={members}
                        currentUser={{
                            ...currentUser,
                            isWorkspaceAdmin: members.some((member) => member.id === currentUser?.id && member.is_admin),
                        }}
                    />
                )}
           
            </div>
             {showAnnouncementModal && (
    <AnnouncementModal
    workspace={workspace}
    currentUser={currentUser}
    loading={creatingAnnouncement}
    announcement={editingAnnouncement}
    onClose={() => {
        setEditingAnnouncement(null);
        setShowAnnouncementModal(false);
    }}
    onSubmit={handleCreateAnnouncement}
/>
)}
        </div>
    );
}
