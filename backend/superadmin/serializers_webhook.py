from rest_framework import serializers
from .models import Webhook


class WebhookSerializer(serializers.ModelSerializer):
    events = serializers.SerializerMethodField()

    class Meta:
        model = Webhook
        fields = ("id", "name", "url", "events", "workspace", "last_triggered", "status", "success_rate", "created_at")

    def get_events(self, obj):
        return obj.events_list()
