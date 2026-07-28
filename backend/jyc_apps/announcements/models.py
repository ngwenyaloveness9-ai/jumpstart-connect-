from django.db import models
from django.conf import settings


class Announcement(models.Model):

    TARGET_CHOICES = (
        ("everyone", "Everyone"),
        ("group", "Group"),
        ("department", "Department"),
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="announcements"
    )

    title = models.CharField(max_length=255)

    body = models.TextField()

    target_type = models.CharField(
        max_length=20,
        choices=TARGET_CHOICES,
        default="everyone"
    )

    # Used when target_type == "group"
    group = models.ForeignKey(
        "chat.Group",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="announcements"
    )

    # Used when target_type == "department"
    department = models.CharField(
        max_length=100,
        blank=True
    )

    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    updated_at = models.DateTimeField(
    auto_now=True
)
    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return self.title


class AnnouncementAttachment(models.Model):

    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name="attachments"
    )

    file = models.FileField(
        upload_to="announcement_attachments/"
    )

    filename = models.CharField(
        max_length=255
    )

    content_type = models.CharField(
        max_length=255
    )

    size_bytes = models.BigIntegerField(
        default=0
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.filename