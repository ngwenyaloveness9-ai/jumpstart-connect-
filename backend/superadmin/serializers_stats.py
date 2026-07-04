from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MessageThread

User = get_user_model()


class StatCardSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    system_alerts = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    stats = StatCardSerializer()
    activity = serializers.ListField()
    workspaces = serializers.ListField()
    recent_users = serializers.ListField()
    audit_logs = serializers.ListField()
