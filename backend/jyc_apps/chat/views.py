from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.db.models import Count
import json
import re
from django.conf import settings
from .models import (
    Message,
    MessageAttachment,
    MessageReaction,
    Group,
    GroupMember,
    GroupMessage,
    GroupMessageAttachment,
    GroupMessageReaction,
)

User = get_user_model()

MENTION_RE = re.compile(r"@([A-Za-z0-9._-]+)")


def resolve_mention_user_ids(group, message_content):
    if not message_content:
        return []

    member_users = list(
        GroupMember.objects.filter(group=group).select_related("user").values(
            "user__id",
            "user__first_name",
            "user__last_name",
            "user__email",
        )
    )

    mention_ids = []
    seen = set()

    for raw_mention in MENTION_RE.findall(message_content):
        token = raw_mention.strip().lower()
        for member in member_users:
            user_id = member["user__id"]
            first_name = (member["user__first_name"] or "").lower()
            last_name = (member["user__last_name"] or "").lower()
            email_user = (member["user__email"] or "").split("@", 1)[0].lower()
            full_name = f"{first_name} {last_name}".strip()

            if token in {first_name, last_name, full_name, email_user} and user_id not in seen:
                mention_ids.append(user_id)
                seen.add(user_id)

    return mention_ids


def resolve_private_mention_user_ids(message_content):
    if not message_content:
        return []

    mention_ids = []
    for raw_mention in MENTION_RE.findall(message_content):
        token = raw_mention.lower()
        users = User.objects.filter(is_active=True).filter(
            first_name__iexact=token
        ) | User.objects.filter(is_active=True).filter(
            email__istartswith=f"{token}@"
        )
        mention_ids.extend(users.values_list("id", flat=True))

    return list(dict.fromkeys(mention_ids))


def build_group_message_payload(message, request):
    attachments = []
    for att in message.attachments.all():
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

    reaction_map = {}
    for reaction in message.reactions.select_related("user").all():
        reaction_map.setdefault(reaction.emoji, {"emoji": reaction.emoji, "count": 0, "users": []})
        reaction_map[reaction.emoji]["count"] += 1
        reaction_map[reaction.emoji]["users"].append(reaction.user_id)

    reactions = [{
        "emoji": payload["emoji"],
        "count": payload["count"],
        "users": payload["users"],
    } for payload in reaction_map.values()]

    return {
        "id": message.id,
        "sender_id": message.sender.id,
        "sender_name": f"{message.sender.first_name} {message.sender.last_name}".strip() or message.sender.email,
        "message": message.message,
        "timestamp": message.created_at.isoformat(),
        "attachments": attachments,
        "edited": message.edited,
        "is_deleted": message.is_deleted,
        "reactions": reactions,
        "mentions": resolve_mention_user_ids(message.group, message.message),
    }


def build_private_message_payload(message):
    reaction_map = {}
    for reaction in message.reactions.all():
        reaction_map.setdefault(reaction.emoji, {"emoji": reaction.emoji, "count": 0, "users": []})
        reaction_map[reaction.emoji]["count"] += 1
        reaction_map[reaction.emoji]["users"].append(reaction.user_id)

    return {
        "id": message.id,
        "sender_id": message.sender_id,
        "sender_name": f"{message.sender.first_name} {message.sender.last_name}".strip() or message.sender.email,
        "receiver_id": message.receiver_id,
        "receiver_name": f"{message.receiver.first_name} {message.receiver.last_name}".strip() or message.receiver.email,
        "message": message.message,
        "timestamp": message.timestamp.isoformat(),
        "edited": message.edited,
        "is_deleted": message.is_deleted,
        "reactions": list(reaction_map.values()),
        "mentions": resolve_private_mention_user_ids(message.message),
    }


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
                "edited": msg.edited,
                "is_deleted": msg.is_deleted,
                "reactions": [],
                "mentions": resolve_private_mention_user_ids(msg.message),
            }
        }, status=201)


@method_decorator(csrf_exempt, name="dispatch")
class UpdatePrivateMessageView(View):

    def patch(self, request, message_id):
        try:
            data = json.loads(request.body)
            message_text = (data.get("message") or "").strip()
            sender_id = data.get("sender_id")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        try:
            message = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return JsonResponse({"error": "Message not found"}, status=404)

        if str(message.sender_id) != str(sender_id):
            return JsonResponse({"error": "Only the sender can edit this message"}, status=403)
        if not message_text:
            return JsonResponse({"error": "Message cannot be empty"}, status=400)

        message.message = message_text
        message.edited = True
        message.save(update_fields=["message", "edited", "updated_at"])
        return JsonResponse({"status": "updated", "message": build_private_message_payload(message)})


@method_decorator(csrf_exempt, name="dispatch")
class DeletePrivateMessageView(View):

    def delete(self, request, message_id):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        try:
            message = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return JsonResponse({"error": "Message not found"}, status=404)

        if str(message.sender_id) != str(data.get("sender_id")):
            return JsonResponse({"error": "Only the sender can delete this message"}, status=403)

        message.is_deleted = True
        message.save(update_fields=["is_deleted", "updated_at"])
        return JsonResponse({"status": "deleted"})


@method_decorator(csrf_exempt, name="dispatch")
class PrivateMessageReactionView(View):

    def post(self, request):
        try:
            data = json.loads(request.body)
            message = Message.objects.get(id=data["message_id"])
            user = User.objects.get(id=data["user_id"])
            emoji = (data.get("emoji") or "").strip()
        except (json.JSONDecodeError, KeyError, Message.DoesNotExist, User.DoesNotExist):
            return JsonResponse({"error": "Invalid reaction request"}, status=400)

        if not emoji:
            return JsonResponse({"error": "Emoji is required"}, status=400)

        reaction, created = MessageReaction.objects.get_or_create(
            message=message,
            user=user,
            emoji=emoji,
        )
        if not created:
            reaction.delete()
            status = "removed"
        else:
            status = "added"

        return JsonResponse({
            "status": status,
            "reactions": list(message.reactions.values("emoji").annotate(count=Count("id"))),
        })


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
                "edited": m.edited,
                "is_deleted": m.is_deleted,
                "reactions": list(m.reactions.values("emoji").annotate(count=Count("id"))),
                "mentions": resolve_private_mention_user_ids(m.message),
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
    "hr",
    "human resources",
    "system administrator",
    "organization administrator",
}

ALLOWED_SUPERADMIN_GROUP_NAMES = {
    "Main Workspace",
    "Board Members",
    "Human Resources",
    "Management",
    "Project Management",
    "System Admin",
}


class GetGroupsView(View):

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

        # Ensure Main Workspace exists and user is a member
        try:
            main_group, _ = Group.objects.get_or_create(
                name="Main Workspace",
                defaults={
                    "description": "Everyone belongs here",
                    "group_type": "MAIN",
                },
            )
        except Exception:
            # If DB has unexpected NOT NULL columns (schema drift), don't try to create.
            main_group = Group.objects.filter(name="Main Workspace").first()

        if main_group:
            GroupMember.objects.get_or_create(group=main_group, user=user)

        # Ensure department group exists and user is a member
        if getattr(user, "department", None):
            try:
                department_group, _ = Group.objects.get_or_create(
                    name=user.department,
                    defaults={
                        "description": f"{user.department} Department",
                        "group_type": "DEPARTMENT",
                        "department": user.department,
                    },
                )
            except Exception:
                department_group = Group.objects.filter(name=user.department).first()

            if department_group:
                department_leadership_roles = {
                    "manager", "department manager", "head of department",
                    "supervisor", "head of technology",
                }
                is_department_admin = (
                    (getattr(user, "role", "") or "").strip().lower()
                    in department_leadership_roles
                )
                GroupMember.objects.update_or_create(
                    group=department_group,
                    user=user,
                    defaults={"is_admin": is_department_admin},
                )

        ADMIN_ROLES = {
            "superadmin",
            "hr",
            "human resources",
            "system administrator",
            "organization administrator",
        }

        role = (getattr(user, "role", "") or "").strip().lower()

        groups = Group.objects.all().order_by("name")

        results = []
        for group in groups:
            is_member = GroupMember.objects.filter(
                group=group,
                user=user
            ).exists()

            admin_member = (
                GroupMember.objects.filter(group=group, is_admin=True)
                .select_related("user")
                .first()
            )
            admin_name = None
            if admin_member and getattr(admin_member, "user", None):
                admin_name = f"{admin_member.user.first_name} {admin_member.user.last_name}".strip()

            is_restricted_for_superadmin = (
                role == "superadmin" and group.name not in ALLOWED_SUPERADMIN_GROUP_NAMES
            )

            results.append({
                "id": group.id,
                "name": group.name,
                "description": group.description,
                "department": group.department,
                "group_type": group.group_type,
                "members_count": GroupMember.objects.filter(group=group).count(),
                "boards_count": 0,
                "admin_name": admin_name,
                "is_member": is_member,
                "status": "restricted" if is_restricted_for_superadmin else ("active" if is_member or role in ADMIN_ROLES else "restricted"),
                "access": "limited" if is_restricted_for_superadmin else ("full" if is_member or role in ADMIN_ROLES else "limited"),
                "is_admin": GroupMember.objects.filter(group=group, user=user, is_admin=True).exists(),
            })

        return JsonResponse({
            "groups": results,
            "count": len(results),
        })


def _workspace_manager(request, data=None):
    data = data or {}
    user_id = data.get("user_id") or request.GET.get("user_id")
    try:
        user = User.objects.get(id=user_id)
    except (User.DoesNotExist, TypeError, ValueError):
        return None

    role = (getattr(user, "role", "") or "").strip().lower()
    if role not in {
        "hr", "human resources", "superadmin", "system administrator", "organization administrator",
        "manager", "department manager", "head of department", "supervisor", "head of technology",
    }:
        return None
    requested_department = (data.get("department") or "").strip().lower()
    if role in {"manager", "department manager", "head of department", "supervisor", "head of technology"} and requested_department and requested_department != (user.department or "").strip().lower():
        return None
    return user


def _can_manage_group(manager, group):
    role = (getattr(manager, "role", "") or "").strip().lower()
    if role in {"hr", "human resources", "superadmin", "system administrator", "organization administrator"}:
        return True
    return (
        role in {"manager", "department manager", "head of department", "supervisor", "head of technology"}
        and (group.department or "").strip().lower() == (manager.department or "").strip().lower()
    )


@method_decorator(csrf_exempt, name="dispatch")
class WorkspaceManagementView(View):
    def _json(self, request):
        try:
            return json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return None

    def post(self, request):
        data = self._json(request)
        if data is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        manager = _workspace_manager(request, data)
        if not manager:
            return JsonResponse({"error": "Only HR or an administrator can manage workspaces"}, status=403)

        name = (data.get("name") or "").strip()
        if not name:
            return JsonResponse({"error": "Workspace name is required"}, status=400)
        if Group.objects.filter(name__iexact=name).exists():
            return JsonResponse({"error": "A workspace with this name already exists"}, status=400)

        type_map = {"Department": "DEPARTMENT", "Program": "CUSTOM", "Restricted": "CUSTOM", "Temporary": "CUSTOM"}
        group = Group.objects.create(
            name=name,
            description=(data.get("description") or "").strip(),
            group_type=type_map.get(data.get("type"), data.get("type", "CUSTOM")),
            department=(data.get("department") or getattr(manager, "department", None) or "").strip() or None,
            auto_add_members=bool(data.get("auto_assign", False)),
            created_by=manager,
        )
        GroupMember.objects.get_or_create(group=group, user=manager, defaults={"is_admin": True})
        return JsonResponse({"id": group.id, "name": group.name}, status=201)

    def put(self, request, group_id):
        data = self._json(request)
        if data is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        manager = _workspace_manager(request, data)
        if not manager:
            return JsonResponse({"error": "Only HR or an administrator can manage workspaces"}, status=403)
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return JsonResponse({"error": "Workspace not found"}, status=404)
        if not _can_manage_group(manager, group):
            return JsonResponse({"error": "You can only manage your department workspace"}, status=403)

        name = (data.get("name") or group.name).strip()
        if not name:
            return JsonResponse({"error": "Workspace name is required"}, status=400)
        if Group.objects.filter(name__iexact=name).exclude(id=group.id).exists():
            return JsonResponse({"error": "A workspace with this name already exists"}, status=400)
        group.name = name
        if "description" in data:
            group.description = (data.get("description") or "").strip()
        if "auto_assign" in data:
            group.auto_add_members = bool(data["auto_assign"])
        group.save()
        return JsonResponse({"id": group.id, "name": group.name})

    def delete(self, request, group_id):
        data = self._json(request) or {}
        manager = _workspace_manager(request, data)
        if not manager:
            return JsonResponse({"error": "Only HR or an administrator can manage workspaces"}, status=403)
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return JsonResponse({"error": "Workspace not found"}, status=404)
        if not _can_manage_group(manager, group):
            return JsonResponse({"error": "You can only manage your department workspace"}, status=403)
        if group.name == "Main Workspace":
            return JsonResponse({"error": "The Main Workspace cannot be deleted"}, status=400)
        group.delete()
        return JsonResponse({"message": "Workspace deleted"})

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

        if (user.role or "").strip().lower() == "superadmin" and group.name not in ALLOWED_SUPERADMIN_GROUP_NAMES:
            return JsonResponse({
                "messages": [],
                "count": 0,
            })

        messages = (
            GroupMessage.objects
            .filter(group=group)
            .select_related("sender")
            .order_by("created_at")
        )

        results = []

        for msg in messages:
            results.append(build_group_message_payload(msg, request))

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
                "is_active": user.is_active,
                "last_login": user.last_login.isoformat() if user.last_login else None,
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

        if sender.role and sender.role.strip().lower() == "superadmin" and group.name not in ALLOWED_SUPERADMIN_GROUP_NAMES:
            delivered = 0
            for member in GroupMember.objects.filter(group=group).select_related("user"):
                if member.user.id == sender.id:
                    continue

                private_message = Message.objects.create(
                    sender=sender,
                    receiver=member.user,
                    message=f"[{group.name}] {message}"
                )

                for attachment in attachments:
                    MessageAttachment.objects.create(
                        message=private_message,
                        file=attachment,
                        filename=attachment.name,
                        content_type=getattr(attachment, "content_type", ""),
                        size_bytes=getattr(attachment, "size", 0),
                        scan_status="pending",
                        is_safe=True,
                        moderation_reason=""
                    )

                delivered += 1

            return JsonResponse({
                "status": "sent",
                "group_id": group.id,
                "group_name": group.name,
                "delivered_to": delivered,
            }, status=201)

        group_message = GroupMessage.objects.create(
            sender=sender,
            group=group,
            message=message
        )

        mention_ids = resolve_mention_user_ids(group, message)

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

                "attachments": attachment_payload,
                "edited": group_message.edited,
                "is_deleted": group_message.is_deleted,
                "reactions": [],
                "mentions": mention_ids,

            }

        }, status=201)


@method_decorator(csrf_exempt, name="dispatch")
class UpdateGroupMessageView(View):

    def patch(self, request, message_id):
        try:
            message = GroupMessage.objects.get(id=message_id)
        except GroupMessage.DoesNotExist:
            return JsonResponse({"error": "Message not found"}, status=404)

        try:
            data = json.loads(request.body)
            new_message = (data.get("message") or "").strip()
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        if not new_message:
            return JsonResponse({"error": "Message cannot be empty"}, status=400)

        message.message = new_message
        message.edited = True
        message.save(update_fields=["message", "edited", "updated_at"])

        return JsonResponse({
            "status": "updated",
            "message": build_group_message_payload(message, request),
        })
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

        message.is_deleted = True
        message.edited = True
        message.save(update_fields=["is_deleted", "edited", "updated_at"])

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
                "status": "added",
                "reactions": [{
                    "emoji": reaction.emoji,
                    "count": message.reactions.filter(emoji=reaction.emoji).count(),
                    "users": list(message.reactions.filter(emoji=reaction.emoji).values_list("user_id", flat=True))
                }]
            })

        except Exception as e:
            return JsonResponse(
                {"error": str(e)},
                status=400
            )
