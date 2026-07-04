from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

from .models import SharedFile

User = get_user_model()


@method_decorator(csrf_exempt, name='dispatch')
class UploadFileView(View):
    def post(self, request):
        uploader_id = request.POST.get('uploader_id')
        uploaded_file = request.FILES.get('file')

        if not uploaded_file:
            return JsonResponse({"error": "No file provided"}, status=400)

        try:
            uploader = User.objects.get(id=uploader_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Uploader not found"}, status=404)

        record = SharedFile.objects.create(
            uploader=uploader,
            filename=uploaded_file.name,
            file=uploaded_file,
            size_bytes=uploaded_file.size,
        )

        return JsonResponse({
            "status": "uploaded",
            "file": {
                "id": record.id,
                "uploader_id": uploader.id,
                "uploader_name": f"{uploader.first_name} {uploader.last_name}",
                "filename": record.filename,
                "size_bytes": record.size_bytes,
                "timestamp": record.timestamp.isoformat(),
            }
        }, status=201)


class ListFilesView(View):
    def get(self, request):
        files = SharedFile.objects.select_related('uploader').all()
        data = [{
            "id": f.id,
            "uploader_id": f.uploader_id,
            "uploader_name": f"{f.uploader.first_name} {f.uploader.last_name}",
            "filename": f.filename,
            "size_bytes": f.size_bytes,
            "timestamp": f.timestamp.isoformat(),
        } for f in files]

        return JsonResponse({"files": data, "count": len(data)})


@method_decorator(csrf_exempt, name='dispatch')
class DeleteFileView(View):
    def delete(self, request, file_id):
        try:
            f = SharedFile.objects.get(id=file_id)
        except SharedFile.DoesNotExist:
            return JsonResponse({"error": "File not found"}, status=404)

        f.file.delete(save=False)  # delete from disk too
        f.delete()
        return JsonResponse({"status": "deleted", "id": file_id})
