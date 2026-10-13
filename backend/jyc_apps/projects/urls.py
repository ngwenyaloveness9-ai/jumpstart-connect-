from django.urls import path

from .views import (
    ProjectCalendarView,
    ProjectDetailView,
    ProjectListView,
    ProjectMembersView,
    TaskAttachmentsView,
    TaskCommentsView,
    TaskDetailView,
    TaskListView,
)

urlpatterns = [
    path("projects/", ProjectListView.as_view(), name="project-list"),
    path("projects/<int:project_id>/", ProjectDetailView.as_view(), name="project-detail"),
    path("projects/members/", ProjectMembersView.as_view(), name="project-members"),
    path("project-tasks/", TaskListView.as_view(), name="project-task-list"),
    path("project-tasks/<int:task_id>/", TaskDetailView.as_view(), name="project-task-detail"),
    path("project-tasks/<int:task_id>/comments/", TaskCommentsView.as_view(), name="project-task-comments"),
    path("project-tasks/<int:task_id>/attachments/", TaskAttachmentsView.as_view(), name="project-task-attachments"),
    path("project-calendar/", ProjectCalendarView.as_view(), name="project-calendar"),
]