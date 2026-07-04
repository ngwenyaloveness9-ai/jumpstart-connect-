from django.db import models
from django.conf import settings


class SharedFile(models.Model):
    uploader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_files'
    )
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='shared_files/')
    size_bytes = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return self.filename
