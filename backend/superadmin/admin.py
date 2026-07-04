from django.contrib import admin
from .models import MessageThread, Message, MessageAttachment


@admin.register(MessageThread)
class MessageThreadAdmin(admin.ModelAdmin):
    list_display = ('sender', 'subject', 'contact_email', 'unread', 'updated_at')
    search_fields = ('sender', 'subject', 'contact_email')
    list_filter = ('unread',)


class MessageAttachmentInline(admin.TabularInline):
    model = MessageAttachment
    extra = 0


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('thread', 'author', 'author_email', 'created_at')
    search_fields = ('author', 'author_email', 'text')
    inlines = [MessageAttachmentInline]


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'message')
    search_fields = ('name',)
