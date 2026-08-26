from django.urls import path
from .views import LeaveRequestListView, LeaveRequestDetailView

urlpatterns = [
    path("leave/", LeaveRequestListView.as_view(), name="leave-list"),
    path("leave/<int:pk>/", LeaveRequestDetailView.as_view(), name="leave-detail"),
]