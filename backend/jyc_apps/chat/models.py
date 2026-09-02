from django.db import models
from django.conf import settings


# =====================================================
# PRIVATE CHAT
# =====================================================

class Message(models.Model):

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )

    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )

    message = models.TextField(blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(
        auto_now=True
    )

    edited = models.BooleanField(
        default=False
    )

    is_deleted = models.BooleanField(
        default=False
    )

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.sender.email} → {self.receiver.email}"


class MessageAttachment(models.Model):

    message = models.ForeignKey(
        Message,
        related_name="attachments",
        on_delete=models.CASCADE
    )

    file = models.FileField(
        upload_to="chat_attachments/"
    )

    filename = models.CharField(
        max_length=255
    )

    content_type = models.CharField(
        max_length=100,
        blank=True
    )

    size_bytes = models.PositiveIntegerField(
        default=0
    )

    scan_status = models.CharField(
        max_length=20,
        default="pending"
    )

    is_safe = models.BooleanField(
        default=True
    )

    moderation_reason = models.TextField(
        blank=True,
        default=""
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return self.filename


class MessageReaction(models.Model):

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="reactions"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="message_reactions"
    )

    emoji = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user", "emoji")
        ordering = ["created_at"]


# =====================================================
# GROUPS
# =====================================================

class Group(models.Model):

    GROUP_TYPES = (
        ("MAIN", "Main Workspace"),
        ("DEPARTMENT", "Department Workspace"),
        ("CUSTOM", "Custom Workspace"),
    )

    name = models.CharField(
        max_length=150,
        unique=True,
    )

    description = models.TextField(
        blank=True
    )

    group_type = models.CharField(
        max_length=20,
        choices=GROUP_TYPES,
        default="CUSTOM",
    )

    department = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    auto_add_members = models.BooleanField(
        default=False,
        help_text="If true, members may be auto-added to this group when created",
    )

    

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_groups",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


# =====================================================
# GROUP MEMBERS
# =====================================================

class GroupMember(models.Model):

    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="members"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="group_memberships"
    )

    is_admin = models.BooleanField(
        default=False
    )

    joined_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = ("group", "user")
        ordering = ["joined_at"]

    def __str__(self):
        return f"{self.user.email} → {self.group.name}"


# =====================================================
# GROUP MESSAGES
# =====================================================

class GroupMessage(models.Model):

    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="group_messages"
    )

    message = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    edited = models.BooleanField(
        default=False
    )

    is_deleted = models.BooleanField(
        default=False
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.email} → {self.group.name}"


# =====================================================
# GROUP ATTACHMENTS
# =====================================================

class GroupMessageAttachment(models.Model):

    message = models.ForeignKey(
        GroupMessage,
        related_name="attachments",
        on_delete=models.CASCADE
    )

    file = models.FileField(
        upload_to="group_chat_attachments/"
    )

    filename = models.CharField(
        max_length=255
    )

    content_type = models.CharField(
        max_length=100,
        blank=True
    )

    size_bytes = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return self.filename

# =====================================================
# GROUP MESSAGE REACTIONS
# =====================================================

class GroupMessageReaction(models.Model):

    message = models.ForeignKey(
        GroupMessage,
        on_delete=models.CASCADE,
        related_name="reactions"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="group_message_reactions"
    )

    emoji = models.CharField(
        max_length=20
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = ("message", "user", "emoji")
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user.email} reacted {self.emoji}"