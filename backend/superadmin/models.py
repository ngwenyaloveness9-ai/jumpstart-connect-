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


class Workspace(models.Model):
    name = models.CharField(max_length=150)
    boards = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Webhook(models.Model):
    name = models.CharField(max_length=200)
    url = models.URLField()
    events = models.TextField(help_text='Comma-separated event keys')
    workspace = models.CharField(max_length=150, blank=True, null=True)
    last_triggered = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=30, default='active')
    success_rate = models.CharField(max_length=20, default='100%')
    created_at = models.DateTimeField(auto_now_add=True)

    def events_list(self):
        return [e.strip() for e in (self.events or '').split(',') if e.strip()]

    def __str__(self):
        return self.name


class Integration(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=50, default='disconnected')
    enabled = models.BooleanField(default=False)
    last_sync = models.DateTimeField(blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Automation(models.Model):
    name = models.CharField(max_length=200)
    trigger = models.CharField(max_length=250)
    action = models.CharField(max_length=250)
    workspace = models.CharField(max_length=150, blank=True, null=True)
    runs = models.PositiveIntegerField(default=0)
    last_run = models.DateTimeField(blank=True, null=True)
    enabled = models.BooleanField(default=True)
    status = models.CharField(max_length=20, default='healthy')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
