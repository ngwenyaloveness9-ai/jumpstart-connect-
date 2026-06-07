from django.contrib import admin
from .models import OTP


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ("email", "code", "is_used", "created_at", "expires_at")