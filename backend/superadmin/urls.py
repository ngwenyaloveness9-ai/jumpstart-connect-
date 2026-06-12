from django.urls import path
from . import views

urlpatterns = [
    # Existing endpoints
    path("employees/create/", views.CreateEmployeeView.as_view()),
    
    # Message endpoints
    path("messages/threads/", views.MessageThreadListView.as_view(), name="message-thread-list"),
    path("messages/threads/<int:pk>/", views.MessageThreadDetailView.as_view(), name="message-thread-detail"),
    path("messages/threads/<int:pk>/messages/", views.MessageCreateView.as_view(), name="message-create"),
    path("messages/threads/<int:pk>/mark-read/", views.MessageThreadMarkReadView.as_view(), name="message-thread-mark-read"),
    # Dashboard
    path("stats/dashboard/", views.DashboardView.as_view(), name="dashboard-view"),
    # Users
    path("users/", views.UserListView.as_view(), name="user-list"),
    path("users/<int:pk>/", views.UserDetailView.as_view(), name="user-detail"),
    # Workspaces
    path("workspaces/", views.WorkspaceListView.as_view(), name="workspace-list"),
    # Webhooks
    path("webhooks/", views.WebhookListView.as_view(), name="webhook-list"),
    # Integrations
    path("integrations/", views.IntegrationListView.as_view(), name="integration-list"),
    # Automations
    path("automations/", views.AutomationListCreateView.as_view(), name="automation-list-create"),
    path("automations/<int:pk>/", views.AutomationDetailView.as_view(), name="automation-detail"),
]