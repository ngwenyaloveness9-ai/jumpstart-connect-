from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import json

from .models import Announcement, AnnouncementAttachment
from jyc_apps.chat.models import Group, GroupMember

User = get_user_model()


@method_decorator(csrf_exempt, name="dispatch")
class CreateAnnouncementView(View):

    def post(self, request):

        # -------------------------------------
        # Support multipart/form-data and JSON
        # -------------------------------------

        if request.content_type and "multipart/form-data" in request.content_type:

            author_id = request.POST.get("author_id")

            title = request.POST.get("title", "").strip()

            body = request.POST.get("body", "").strip()

            target_type = request.POST.get(
                "target_type",
                "everyone"
            )

            group_id = request.POST.get("group_id")

            department = request.POST.get(
                "department",
                ""
            ).strip()

            attachments = request.FILES.getlist("attachments")

        else:

            try:
                data = json.loads(request.body)

            except json.JSONDecodeError:

                return JsonResponse(
                    {"error": "Invalid JSON"},
                    status=400
                )

            author_id = data.get("author_id")

            title = data.get("title", "").strip()

            body = data.get("body", "").strip()

            target_type = data.get(
                "target_type",
                "everyone"
            )

            group_id = data.get("group_id")

            department = data.get(
                "department",
                ""
            ).strip()

            attachments = []

        if not title:

            return JsonResponse(
                {"error": "Title cannot be empty"},
                status=400
            )

        if not body and not attachments:

            return JsonResponse(
                {"error": "Announcement cannot be empty"},
                status=400
            )

        # -------------------------------------
        # Author
        # -------------------------------------

        try:
            author = User.objects.get(id=author_id)

        except User.DoesNotExist:

            return JsonResponse(
                {"error": "Author not found"},
                status=404
            )

        # -------------------------------------
        # Group (optional)
        # -------------------------------------

        group = None

        if target_type == "group":

            if not group_id:

                return JsonResponse(
                    {"error": "group_id is required"},
                    status=400
                )

            try:
                group = Group.objects.get(id=group_id)

            except Group.DoesNotExist:

                return JsonResponse(
                    {"error": "Group not found"},
                    status=404
                )

        # -------------------------------------
        # Department validation
        # -------------------------------------

        if target_type == "department" and not department:

            return JsonResponse(
                {"error": "department is required"},
                status=400
            )

        # -------------------------------------
        # Create Announcement
        # -------------------------------------

        announcement = Announcement.objects.create(

            author=author,

            title=title,

            body=body,

            target_type=target_type,

            group=group,

            department=department

        )

        attachment_payload = []

        # -------------------------------------
        # Save Attachments
        # -------------------------------------

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

            elif content_type.startswith("video/"):

                simplified_type = "video"

            elif content_type.startswith("audio/"):

                simplified_type = "audio"

            attachment_obj = AnnouncementAttachment.objects.create(

                announcement=announcement,

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

                "id": attachment_obj.id,

                "name": attachment_obj.filename,

                "size": attachment_obj.size_bytes,

                "type": simplified_type,

                "mimeType": attachment_obj.content_type,

                "url": request.build_absolute_uri(
                    attachment_obj.file.url
                )

            })

        return JsonResponse({

            "status": "created",

            "announcement": {

                "id": announcement.id,

                "author_id": author.id,

                "author_name":
                    f"{author.first_name} {author.last_name}",

                "title": announcement.title,

                "body": announcement.body,

                "target_type": announcement.target_type,

                "group":
                    announcement.group.name
                    if announcement.group
                    else None,

                "department": announcement.department,

                "timestamp":
                    announcement.timestamp.isoformat(),

                "attachments": attachment_payload

            }

        }, status=201)


class GetAllAnnouncementsView(View):

    def get(self, request):

        user_id = request.GET.get("user_id")

        group_id = request.GET.get("group_id")

        user = None

        if user_id:

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                user = None

        announcements = (
            Announcement.objects
            .select_related("author", "group")
            .prefetch_related("attachments")
            .order_by("-timestamp")
        )

        if group_id:

            filtered = []

            user_dept = getattr(user, "department", None) or ""

            for ann in announcements:

                if ann.target_type == "everyone":
                    filtered.append(ann)
                elif ann.target_type == "group" and ann.group_id == int(group_id):
                    filtered.append(ann)
                elif ann.target_type == "department" and ann.department and ann.department.strip().lower() == user_dept.strip().lower():
                    filtered.append(ann)

            announcements = filtered

        elif user:

            user_groups = GroupMember.objects.filter(
                user=user
            ).values_list("group_id", flat=True)

            user_dept = getattr(user, "department", None) or ""

            filtered = []

            for ann in announcements:

                if ann.target_type == "everyone":
                    filtered.append(ann)
                elif ann.target_type == "group" and ann.group_id in user_groups:
                    filtered.append(ann)
                elif ann.target_type == "department" and ann.department and ann.department.strip().lower() == user_dept.strip().lower():
                    filtered.append(ann)

            announcements = filtered

        results = []

        for announcement in announcements:

            attachment_payload = []

            for att in announcement.attachments.all():

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

                elif content_type.startswith("video/"):
                    simplified_type = "video"

                elif content_type.startswith("audio/"):
                    simplified_type = "audio"

                attachment_payload.append({

                    "id": att.id,

                    "name": att.filename,

                    "size": att.size_bytes,

                    "type": simplified_type,

                    "mimeType": att.content_type,

                    "url": request.build_absolute_uri(att.file.url)

                })

            results.append({

                "id": announcement.id,

                "author_id": announcement.author.id,

                "author_name":
                    f"{announcement.author.first_name} {announcement.author.last_name}",

                "title": announcement.title,

                "body": announcement.body,

                "target_type": announcement.target_type,

                "group":
                    announcement.group.name
                    if announcement.group
                    else None,

                "department": announcement.department,

                "timestamp": announcement.timestamp.isoformat(),

                "attachments": attachment_payload

            })

        return JsonResponse({

            "announcements": results,

            "count": len(results)

        })


@method_decorator(csrf_exempt, name='dispatch')
class DeleteAnnouncementView(View):
    def delete(self, request, announcement_id):
        try:
            ann = Announcement.objects.get(id=announcement_id)
        except Announcement.DoesNotExist:
            return JsonResponse({"error": "Announcement not found"}, status=404)

        ann.delete()
        return JsonResponse({"status": "deleted", "id": announcement_id})


@method_decorator(csrf_exempt, name="dispatch")
class EditAnnouncementView(View):

    def patch(self, request, announcement_id):

        try:
            announcement = Announcement.objects.get(id=announcement_id)
        except Announcement.DoesNotExist:
            return JsonResponse(
                {"error": "Announcement not found"},
                status=404
            )

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Invalid JSON"},
                status=400
            )

        author_id = data.get("author_id")

        if announcement.author.id != author_id:
            return JsonResponse(
                {
                    "error": "Only the author can edit this announcement"
                },
                status=403
            )

        announcement.title = data.get(
            "title",
            announcement.title
        )

        announcement.body = data.get(
            "body",
            announcement.body
        )

        announcement.save()

        return JsonResponse({

            "status": "updated",

            "announcement": {

                "id": announcement.id,

                "title": announcement.title,

                "body": announcement.body,

                "updated_at": announcement.updated_at.isoformat()

            }

        })
