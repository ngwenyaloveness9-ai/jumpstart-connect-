from django.urls import path
from .views import UploadFileView, ListFilesView, DeleteFileView

urlpatterns = [
    path('upload', UploadFileView.as_view(), name='file-upload'),
    path('all', ListFilesView.as_view(), name='file-list'),
    path('<int:file_id>', DeleteFileView.as_view(), name='file-delete'),
]
