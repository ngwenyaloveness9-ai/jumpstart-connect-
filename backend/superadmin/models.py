from django.db import models


class MessageThread(models.Model):
    sender = models.CharField(max_length=150)
    subject = models.CharField(max_length=255)
    contact_email = models.EmailField(blank=True, null=True)
    last_message = models.TextField(blank=True)
    unread = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.subject} — {self.sender}"


class Message(models.Model):
    thread = models.ForeignKey(MessageThread, related_name='messages', on_delete=models.CASCADE)
    author = models.CharField(max_length=150)
    author_email = models.EmailField(blank=True, null=True)
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message by {self.author} on {self.thread}"


class MessageAttachment(models.Model):
    message = models.ForeignKey(Message, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='message_attachments/')
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
