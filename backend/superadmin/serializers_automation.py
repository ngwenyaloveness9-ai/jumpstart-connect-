from rest_framework import serializers
from .models import Automation


class AutomationSerializer(serializers.ModelSerializer):
    last_run = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%SZ", required=False, allow_null=True)

    class Meta:
        model = Automation
        fields = [
            'id',
            'name',
            'trigger',
            'action',
            'workspace',
            'runs',
            'last_run',
            'enabled',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
