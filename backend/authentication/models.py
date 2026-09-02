from django.db import models
from django.utils import timezone


class OTP(models.Model):
    email = models.EmailField()

    code = models.CharField(
        max_length=6
    )

    is_used = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def is_valid(self):
        return not self.is_used

    def __str__(self):
        return f"{self.email} - {self.code}"