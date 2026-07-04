from rest_framework import serializers
from .models import Integration


class IntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Integration
        fields = ("id", "name", "category", "status", "enabled", "last_sync", "description", "created_at")
