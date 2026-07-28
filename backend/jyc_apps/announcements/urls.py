from django.urls import path
from .views import CreateAnnouncementView, GetAllAnnouncementsView, DeleteAnnouncementView
from .views import (
    CreateAnnouncementView,
    GetAllAnnouncementsView,
    DeleteAnnouncementView,
    EditAnnouncementView,
)

urlpatterns = [
    path('create', CreateAnnouncementView.as_view(), name='announcement-create'),
    path('all', GetAllAnnouncementsView.as_view(), name='announcement-list'),
    path('<int:announcement_id>', DeleteAnnouncementView.as_view(), name='announcement-delete'),
    path(
    "<int:announcement_id>/edit",
    EditAnnouncementView.as_view(),
    name="announcement-edit",
),
]
