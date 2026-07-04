from rest_framework import serializers
from .models import MessageThread, Message, MessageAttachment


class MessageAttachmentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MessageAttachment
        fields = ['id', 'name', 'url']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file and request is not None:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None


class MessageSerializer(serializers.ModelSerializer):
    authorEmail = serializers.CharField(source='author_email', allow_null=True, required=False)
    time = serializers.SerializerMethodField()
    attachments = MessageAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'author', 'authorEmail', 'text', 'time', 'attachments']

    def get_time(self, obj):
        return obj.created_at.isoformat()


class MessageThreadSerializer(serializers.ModelSerializer):
    sender = serializers.CharField()
    subject = serializers.CharField()
    contactEmail = serializers.CharField(source='contact_email', allow_null=True, required=False)
    lastMessage = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = MessageThread
        fields = ['id', 'sender', 'subject', 'contactEmail', 'lastMessage', 'time', 'unread', 'messages']

    def get_lastMessage(self, obj):
        latest = obj.messages.order_by('-created_at').first()
        if latest:
            return latest.text or 'Sent an attachment'
        return obj.last_message

    def get_time(self, obj):
        return obj.updated_at.isoformat()
