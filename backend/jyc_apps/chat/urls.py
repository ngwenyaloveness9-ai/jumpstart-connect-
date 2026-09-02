from django.urls import path

from .views import (
    SendMessageView,
    UpdatePrivateMessageView,
    DeletePrivateMessageView,
    PrivateMessageReactionView,
    ShareAttachmentView,
    GetConversationView,
    GetInboxView,
    GetContactsView,
    GetGroupsView,
    GetGroupMessagesView,
    SendGroupMessageView,
    ContactDepartmentView,
    GetGroupMembersView,
    DeleteGroupMessageView,
    UpdateGroupMessageView,
    GroupMessageReactionView,
    WorkspaceManagementView,
)

urlpatterns = [

    # -------------------------
    # PRIVATE CHAT
    # -------------------------

    path(
        "send",
        SendMessageView.as_view(),
        name="chat-send"
    ),

    path(
        "share",
        ShareAttachmentView.as_view(),
        name="chat-share"
    ),

    path("message/<int:message_id>/edit", UpdatePrivateMessageView.as_view(), name="message-update"),
    path("message/<int:message_id>", DeletePrivateMessageView.as_view(), name="message-delete"),
    path("message/reaction", PrivateMessageReactionView.as_view(), name="message-reaction"),

    path(
        "conversation/<int:user1_id>/<int:user2_id>",
        GetConversationView.as_view(),
        name="chat-conversation"
    ),

    path(
        "contacts/<int:user_id>",
        GetContactsView.as_view(),
        name="chat-contacts"
    ),

    path(
        "inbox/<int:user_id>",
        GetInboxView.as_view(),
        name="chat-inbox"
    ),

    # -------------------------
    # GROUP CHAT
    # -------------------------

    path(
        "groups/<int:user_id>",
        GetGroupsView.as_view(),
        name="chat-groups"
    ),

    path("groups/create", WorkspaceManagementView.as_view(), name="workspace-create"),
    path("workspaces/<int:group_id>", WorkspaceManagementView.as_view(), name="workspace-manage"),

    path(
        "group/<int:group_id>/messages",
        GetGroupMessagesView.as_view(),
        name="group-messages"
    ),

    path(
        "group/send",
        SendGroupMessageView.as_view(),
        name="group-send"
    ),
    path(
    "department/contact",
    ContactDepartmentView.as_view(),
    name="department-contact"
),

    path(
    "groups/<int:group_id>/members",
    GetGroupMembersView.as_view(),
    name="group-members",
),

path(
    "group/message/<int:message_id>",
    DeleteGroupMessageView.as_view(),
    name="group-message-delete",
),
path(
    "group/message/<int:message_id>/edit",
    UpdateGroupMessageView.as_view(),
    name="group-message-update",
),
 path(
    "group/message/reaction",
    GroupMessageReactionView.as_view(),
    name="group-message-reaction",
),

]
    