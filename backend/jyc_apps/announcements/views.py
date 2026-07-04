from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import json

from .models import Announcement

User = get_user_model()


@method_decorator(csrf_exempt, name='dispatch')
class CreateAnnouncementView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        author_id = data.get('author_id')
        title = data.get('title', '').strip()
        body = data.get('body', '').strip()

        if not title or not body:
            return JsonResponse({"error": "Title and body cannot be empty"}, status=400)

        try:
            author = User.objects.get(id=author_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Author not found"}, status=404)

        ann = Announcement.objects.create(author=author, title=title, body=body)

        return JsonResponse({
            "status": "created",
            "announcement": {
                "id": ann.id,
                "author_id": author.id,
                "author_name": f"{author.first_name} {author.last_name}",
                "title": ann.title,
                "body": ann.body,
                "timestamp": ann.timestamp.isoformat(),
            }
        }, status=201)


class GetAllAnnouncementsView(View):
    def get(self, request):
        announcements = Announcement.objects.select_related('author').all()
        data = [{
            "id": a.id,
            "author_id": a.author_id,
            "author_name": f"{a.author.first_name} {a.author.last_name}",
            "title": a.title,
            "body": a.body,
            "timestamp": a.timestamp.isoformat(),
        } for a in announcements]

        return JsonResponse({"announcements": data, "count": len(data)})


@method_decorator(csrf_exempt, name='dispatch')
class DeleteAnnouncementView(View):
    def delete(self, request, announcement_id):
        try:
            ann = Announcement.objects.get(id=announcement_id)
        except Announcement.DoesNotExist:
            return JsonResponse({"error": "Announcement not found"}, status=404)

        ann.delete()
        return JsonResponse({"status": "deleted", "id": announcement_id})
