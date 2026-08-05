from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import json
from django.conf import settings
from .models import GroupMessageReaction

from .models import (
    Message,
    MessageAttachment,
    Group,
    GroupMember,
    GroupMessage,
    GroupMessageAttachment,
    GroupMessageReaction,
)

User = get_user_model()


@method_decorator(csrf_exempt, name='dispatch')
class SendMessageView(View):
    def post(self, request):
        if request.content_type and 'multipart/form-data' in request.content_type:
            sender_id = request.POST.get('sender_id')
            receiver_id = request.POST.get('receiver_id')
            message_text = request.POST.get('message', '').strip()
            attachments = request.FILES.getlist('attachments')
        else:
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON"}, status=400)

            sender_id = data.get('sender_id')
            receiver_id = data.get('receiver_id')
            message_text = data.get('message', '').strip()
            attachments = []

        if not message_text and not attachments:
            return JsonResponse({"error": "Message cannot be empty"}, status=400)

        try:
            sender = User.objects.get(id=sender_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Sender not found"}, status=404)

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Receiver not found"}, status=404)

        msg = Message.objects.create(
            sender=sender,
            receiver=receiver,
            message=message_text or ""
        )

        attachment_payload = []
        for attachment in attachments:
            content_type = getattr(attachment, 'content_type', '') or 'application/octet-stream'
            simplified_type = 'file'
            if content_type.startswith('image/'):
                simplified_type = 'image'
            elif 'pdf' in content_type:
                simplified_type = 'pdf'
            elif 'excel' in content_type or 'spreadsheet' in content_type:
                simplified_type = 'excel'
            elif 'word' in content_type or 'msword' in content_type:
                simplified_type = 'word'

            attachment_obj = MessageAttachment.objects.create(
                message=msg,
                file=attachment,
                filename=attachment.name,
                content_type=content_type,
                size_bytes=getattr(attachment, 'size', 0) or 0,
           
                scan_status="pending",
                is_safe=True,
                moderation_reason="",
            )
            attachment_payload.append({
                "id": attachment_obj.id,
                "name": attachment_obj.filename,
                "size": attachment_obj.size_bytes,
                "type": simplified_type,
                "mimeType": attachment_obj.content_type,
                "url": request.build_absolute_uri(attachment_obj.file.url),
            })

        return JsonResponse({
            "status": "sent",
            "message": {
                "id": msg.id,
                "sender_id": sender.id,
                "sender_name": f"{sender.first_name} {sender.last_name}",
                "receiver_id": receiver.id,
                "receiver_name": f"{receiver.first_name} {receiver.last_name}",
                "message": msg.message,
                "timestamp": msg.timestamp.isoformat(),
                "attachments": attachment_payload,
            }
        }, status=201)


class GetConversationView(View):
    def get(self, request, user1_id, user2_id):
        messages = Message.objects.filter(
            sender_id=user1_id, receiver_id=user2_id
        ) | Message.objects.filter(
            sender_id=user2_id, receiver_id=user1_id
        )
        messages = messages.order_by('timestamp')

        data = []
        for m in messages:
            attachments = []
            for att in m.attachments.all():
                content_type = att.content_type or ''
                simplified_type = 'file'
                if content_type.startswith('image/'):
                    simplified_type = 'image'
                elif 'pdf' in content_type:
                    simplified_type = 'pdf'
                elif 'excel' in content_type or 'spreadsheet' in content_type:
                    simplified_type = 'excel'
                elif 'word' in content_type or 'msword' in content_type:
                    simplified_type = 'word'

                attachments.append({
                    "id": att.id,
                    "name": att.filename,
                    "size": att.size_bytes,
                    "type": simplified_type,
                    "mimeType": content_type,
                    "url": request.build_absolute_uri(att.file.url),
                })
            data.append({
                "id": m.id,
                "sender_id": m.sender_id,
                "sender_name": f"{m.sender.first_name} {m.sender.last_name}",
                "receiver_id": m.receiver_id,
                "receiver_name": f"{m.receiver.first_name} {m.receiver.last_name}",
                "message": m.message,
                "timestamp": m.timestamp.isoformat(),
                "attachments": attachments,
            })

        return JsonResponse({"messages": data, "count": len(data)})


class GetContactsView(View):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)

        contacts = (
            User.objects.filter(is_active=True)
            .exclude(id=user.id)
            .order_by('first_name', 'last_name', 'email')
        )

        data = [{
            "id": contact.id,
            "name": f"{contact.first_name} {contact.last_name}".strip() or contact.email,
            "email": contact.email,
            "department": contact.department or "",
            "role": contact.role or "",
        } for contact in contacts]

        return JsonResponse({"contacts": data, "count": len(data)})


@method_decorator(csrf_exempt, name='dispatch')
class ShareAttachmentView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        attachment_id = data.get('attachment_id')
        message_text = data.get('message', '').strip()

        if not sender_id or not receiver_id or not attachment_id:
            return JsonResponse({"error": "sender_id, receiver_id, and attachment_id are required"}, status=400)

        try:
            sender = User.objects.get(id=sender_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Sender not found"}, status=404)

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Receiver not found"}, status=404)

        try:
            original_attachment = MessageAttachment.objects.get(id=attachment_id)
        except MessageAttachment.DoesNotExist:
            return JsonResponse({"error": "Attachment not found"}, status=404)

        new_message = Message.objects.create(
            sender=sender,
            receiver=receiver,
            message=message_text or "",
        )

        shared_attachment = MessageAttachment.objects.create(
    message=new_message,
    file=original_attachment.file,
    filename=original_attachment.filename,
    content_type=original_attachment.content_type,
    size_bytes=original_attachment.size_bytes,

    scan_status=original_attachment.scan_status,
    is_safe=original_attachment.is_safe,
    moderation_reason=original_attachment.moderation_reason,
        )
        return JsonResponse({
            "status": "shared",
            "message": {
                "id": new_message.id,
                "sender_id": sender.id,
                "sender_name": f"{sender.first_name} {sender.last_name}",
                "receiver_id": receiver.id,
                "receiver_name": f"{receiver.first_name} {receiver.last_name}",
                "message": new_message.message,
                "timestamp": new_message.timestamp.isoformat(),
                "attachments": [{
                    "id": shared_attachment.id,
                    "name": shared_attachment.filename,
                    "size": shared_attachment.size_bytes,
                    "type": original_attachment.content_type,
                    "mimeType": shared_attachment.content_type,
                    "url": request.build_absolute_uri(shared_attachment.file.url),
                }],
            }
        }, status=201)


class GetInboxView(View):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)

        inbox = Message.objects.filter(receiver=user).order_by('-timestamp')

        data = []
        for m in inbox:
            message_text = m.message
            if not message_text and m.attachments.exists():
                message_text = "Sent an attachment"
            data.append({
                "id": m.id,
                "sender_id": m.sender_id,
                "sender_name": f"{m.sender.first_name} {m.sender.last_name}",
                "message": message_text,
                "timestamp": m.timestamp.isoformat(),
            })

        return JsonResponse({"inbox": data, "count": len(data)})
# =====================================================
# GROUP CHAT
# =====================================================

ADMIN_ROLES = {
    "superadmin",
    "system administrator",
    "organization administrator",
}


class GetGroupsView(View):

    def get(self, request, user_id):

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "User not found"},
                status=404
            )

        role = (user.role or "").strip().lower()

        groups = Group.objects.all().order_by("name")

        results = []
        for group in groups:
            is_member = GroupMember.objects.filter(
                group=group,
                user=user
            ).exists()

            results.append({
                "id": group.id,
                "name": group.name,
                "description": group.description,
                "group_type": group.group_type,
                "members_count": GroupMember.objects.filter(
                    group=group
                ).count(),
                "boards_count": 0,
                "admin_name": (
                    GroupMember.objects.filter(
                        group=group,
                        is_admin=True
                    )
                    .select_related("user")
                    .values_list(
                        "user__first_name",
                        flat=True
                    )
                    .first()
                ),
                "is_member": is_member,
                "status": "active" if is_member or role in ADMIN_ROLES else "restricted",
                "access": "full" if is_member or role in ADMIN_ROLES else "limited",
            })

        return JsonResponse({
            "groups": results,
            "count": len(results)
        })


class GetGroupMessagesView(View):

    def get(self, request, group_id):

        user_id = request.GET.get("user_id")

        if not user_id:
            return JsonResponse(
                {"error": "User id required"},
                status=400
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "User not found"},
                status=404
            )

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return JsonResponse(
                {"error": "Group not found"},
                status=404
            )

        is_member = GroupMember.objects.filter(
            group=group,
            user=user
        ).exists()

        if not is_member and (user.role or "").strip().lower() not in ADMIN_ROLES:
            return JsonResponse(
                {"error": "Access denied"},
                status=403
            )

        messages = (
            GroupMessage.objects
            .filter(group=group)
            .select_related("sender")
            .order_by("created_at")
        )

        results = []

        for msg in messages:

            attachments = []

            for att in msg.attachments.all():

                content_type = att.content_type or ""

                simplified_type = "file"

                if content_type.startswith("image/"):
                    simplified_type = "image"

                elif "pdf" in content_type:
                    simplified_type = "pdf"

                elif "excel" in content_type or "spreadsheet" in content_type:
                    simplified_type = "excel"

                elif "word" in content_type or "msword" in content_type:
                    simplified_type = "word"

                attachments.append({
                    "id": att.id,
                    "name": att.filename,
                    "size": att.size_bytes,
                    "type": simplified_type,
                    "mimeType": att.content_type,
                    "url": request.build_absolute_uri(att.file.url),
                })
            
            

            results.append({
                "id": msg.id,
                "sender_id": msg.sender.id,
                "sender_name": f"{msg.sender.first_name} {msg.sender.last_name}",
                "message": msg.message,
                "timestamp": msg.created_at.isoformat(),
                "attachments": attachments,
            })

        return JsonResponse({
            "group": group.name,
            "messages": results,
            "count": len(results)
        })

class GetGroupMembersView(View):

    def get(self, request, group_id):

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return JsonResponse(
                {"error": "Group not found"},
                status=404,
            )

        members = (
            GroupMember.objects
            .filter(group=group)
            .select_related("user")
        )

        results = []

        for member in members:

            user = member.user

            results.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}".strip() or user.email,
                "email": user.email,
                "department": getattr(user, "department", ""),
                "role": getattr(user, "role", ""),
                "is_admin": member.is_admin,
                "online": False,
            })

        return JsonResponse({
            "members": results,
            "count": len(results),
        })

@method_decorator(csrf_exempt, name="dispatch")
class SendGroupMessageView(View):

    def post(self, request):

        # --------------------------
        # Handle multipart uploads
        # --------------------------

        if request.content_type and "multipart/form-data" in request.content_type:

            sender_id = request.POST.get("sender_id")
            group_id = request.POST.get("group_id")
            message = request.POST.get("message", "").strip()

            attachments = request.FILES.getlist("attachments")

        else:

            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse(
                    {"error": "Invalid JSON"},
                    status=400
                )

            sender_id = data.get("sender_id")
            group_id = data.get("group_id")
            message = data.get("message", "").strip()

            attachments = []

        if not message and not attachments:

            return JsonResponse(
                {"error": "Message cannot be empty"},
                status=400
            )

        try:
            sender = User.objects.get(id=sender_id)
        except User.DoesNotExist:

            return JsonResponse(
                {"error": "Sender not found"},
                status=404
            )

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:

            return JsonResponse(
                {"error": "Group not found"},
                status=404
            )

        group_message = GroupMessage.objects.create(
            sender=sender,
            group=group,
            message=message
        )

        attachment_payload = []

        for attachment in attachments:

            content_type = getattr(
                attachment,
                "content_type",
                ""
            ) or "application/octet-stream"

            simplified_type = "file"

            if content_type.startswith("image/"):
                simplified_type = "image"

            elif "pdf" in content_type:
                simplified_type = "pdf"

            elif "excel" in content_type or "spreadsheet" in content_type:
                simplified_type = "excel"

            elif "word" in content_type or "msword" in content_type:
                simplified_type = "word"

            att = GroupMessageAttachment.objects.create(
                message=group_message,
                file=attachment,
                filename=attachment.name,
                content_type=content_type,
                size_bytes=getattr(
                    attachment,
                    "size",
                    0
                )
            )

            attachment_payload.append({

                "id": att.id,

                "name": att.filename,

                "size": att.size_bytes,

                "type": simplified_type,

                "mimeType": att.content_type,

                "url": request.build_absolute_uri(att.file.url)

            })

        return JsonResponse({

            "status": "sent",

            "message": {

                "id": group_message.id,

                "sender_id": sender.id,

                "sender_name": f"{sender.first_name} {sender.last_name}",

                "group_id": group.id,

                "group_name": group.name,

                "message": group_message.message,

                "timestamp": group_message.created_at.isoformat(),

                "attachments": attachment_payload

            }

        }, status=201)
@method_decorator(csrf_exempt, name="dispatch")
class ContactDepartmentView(View):

    def post(self, request):

        if request.content_type and "multipart/form-data" in request.content_type:

            sender_id = request.POST.get("sender_id")
            group_id = request.POST.get("group_id")
            message_text = request.POST.get("message", "").strip()

            attachments = request.FILES.getlist("attachments")

        else:

            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse(
                    {"error": "Invalid JSON"},
                    status=400
                )

            sender_id = data.get("sender_id")
            group_id = data.get("group_id")
            message_text = data.get("message", "").strip()

            attachments = []

        if not message_text and not attachments:

            return JsonResponse(
                {"error": "Message cannot be empty"},
                status=400
            )

        try:
            sender = User.objects.get(id=sender_id)
        except User.DoesNotExist:

            return JsonResponse(
                {"error": "Sender not found"},
                status=404
            )

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:

            return JsonResponse(
                {"error": "Department not found"},
                status=404
            )

        # Members of the department
        members = (
            GroupMember.objects
            .filter(group=group)
            .select_related("user")
        )

        delivered = 0

        for member in members:

            # Don't send to yourself
            if member.user.id == sender.id:
                continue

            private_message = Message.objects.create(
                sender=sender,
                receiver=member.user,
                message=f"[{group.name}] {message_text}"
            )

            for attachment in attachments:

                MessageAttachment.objects.create(
                    message=private_message,
                    file=attachment,
                    filename=attachment.name,
                    content_type=getattr(
                        attachment,
                        "content_type",
                        ""
                    ),
                    size_bytes=getattr(
                        attachment,
                        "size",
                        0
                    ),
                    scan_status="pending",
                    is_safe=True,
                    moderation_reason=""
                )

            delivered += 1

        return JsonResponse({

            "status": "sent",

            "department": group.name,

            "delivered_to": delivered

        }, status=201) 

@method_decorator(csrf_exempt, name="dispatch")
class DeleteGroupMessageView(View):

    def delete(self, request, message_id):

        try:
            message = GroupMessage.objects.get(id=message_id)

        except GroupMessage.DoesNotExist:
            return JsonResponse(
                {"error": "Message not found"},
                status=404,
            )

        # Delete all attachments
        message.attachments.all().delete()

        # Delete the message
        message.delete()

        return JsonResponse({
            "status": "deleted"
        })

@method_decorator(csrf_exempt, name="dispatch")
class GroupMessageReactionView(View):

    def post(self, request):

        try:
            data = json.loads(request.body)

            message = GroupMessage.objects.get(
                id=data["message_id"]
            )

            user = User.objects.get(
                id=data["user_id"]
            )

            emoji = data["emoji"]

            reaction, created = GroupMessageReaction.objects.get_or_create(
                message=message,
                user=user,
                emoji=emoji
            )

            # Toggle reaction
            if not created:
                reaction.delete()
                return JsonResponse({
                    "status": "removed"
                })

            return JsonResponse({
                "status": "added"
            })

        except Exception as e:
            return JsonResponse(
                {"error": str(e)},
                status=400
            )