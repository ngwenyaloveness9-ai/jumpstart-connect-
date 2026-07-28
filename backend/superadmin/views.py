from datetime import timedelta
import random

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from authentication.models import OTP
from authentication.serializers import EmployeeCreateSerializer
from jyc_apps.chat.models import Group, GroupMember


User = get_user_model()


class CreateEmployeeView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = EmployeeCreateSerializer(data=request.data)

        if not serializer.is_valid():
            print("VALIDATION ERRORS:", serializer.errors)
            print("REQUEST DATA:", request.data)

            return Response(
                serializer.errors,
                status=400
            )

        data = serializer.validated_data

        if User.objects.filter(email=data["email"]).exists():
            return Response(
                {
                    "error": "A user with this email already exists."
                },
                status=400
            )

        try:
            with transaction.atomic():

                # -----------------------------------
                # Create Employee
                # -----------------------------------

                user = User.objects.create_user(
                    email=data["email"],
                    first_name=data["first_name"],
                    last_name=data["last_name"],
                    department=data.get("department"),
                    role=data.get("role"),
                    phone=data.get("phone"),
                    is_first_login=True,
                    otp_verified=False,
                )

                
                # -----------------------------------
                # Generate OTP
                # -----------------------------------

                otp_code = str(random.randint(100000, 999999))

                OTP.objects.create(
                    email=user.email,
                    code=otp_code,
                    expires_at=timezone.now() + timedelta(minutes=10)
                )

                # -----------------------------------
                # Send Email
                # -----------------------------------

                send_mail(
                    subject="Welcome to JumpStart Your Career",
                    message=f"""
Hello {user.first_name},

Welcome to JumpStart Your Career!

Your employee account has been created successfully.

----------------------------------------
Your One-Time Password (OTP)

{otp_code}

----------------------------------------

This OTP expires in 10 minutes.

Use your work email together with this OTP to complete your first login.

Regards,

JumpStart Your Career
""",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )

        except Exception as e:
            import traceback
            traceback.print_exc()

            return Response(
               {
            "error": str(e)
        },
        status=500
    )

        return Response(
            {
                "message": "Employee created successfully.",
                "employee": {
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "department": user.department,
                    "role": user.role,
                },
                "otp_sent": True
            },
            status=201
        )


# Message API Views
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import MessageThread, Message, MessageAttachment
from .serializers import MessageThreadSerializer
from .serializers_stats import DashboardSerializer
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from .serializers_user import UserSerializer
from rest_framework import generics
from .serializers_workspace import WorkspaceSerializer
from .models import Workspace
from jyc_apps.chat.models import Group
from jyc_apps.chat.serializers import GroupSerializer

class WorkspaceListView(generics.ListAPIView):
    queryset = Workspace.objects.all().order_by('-created_at')
    serializer_class = WorkspaceSerializer

class DepartmentListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GroupSerializer

    def get_queryset(self):
        return (
            Group.objects
            .exclude(name="Main Workspace")
            .order_by("name")
        )

# Webhooks, Integrations, and Automations
from .serializers_webhook import WebhookSerializer
from .serializers_integration import IntegrationSerializer
from .serializers_automation import AutomationSerializer
from .models import Webhook, Integration, Automation


class WebhookListView(generics.ListAPIView):
    queryset = Webhook.objects.all().order_by('-created_at')
    serializer_class = WebhookSerializer


class IntegrationListView(generics.ListAPIView):
    queryset = Integration.objects.all().order_by('-created_at')
    serializer_class = IntegrationSerializer


class AutomationListCreateView(generics.ListCreateAPIView):
    queryset = Automation.objects.all().order_by('-created_at')
    serializer_class = AutomationSerializer

    def perform_create(self, serializer):
        enabled = serializer.validated_data.get('enabled', True)
        status = serializer.validated_data.get('status', 'healthy')
        if not enabled:
            status = 'paused'
        serializer.save(status=status)


class AutomationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Automation.objects.all()
    serializer_class = AutomationSerializer

    def perform_update(self, serializer):
        enabled = serializer.validated_data.get('enabled', serializer.instance.enabled)
        status = serializer.validated_data.get('status', serializer.instance.status)
        if not enabled:
            status = 'paused'
        elif status == 'paused':
            status = 'healthy'
        serializer.save(status=status)

User = get_user_model()


class DashboardView(APIView):
    def get(self, request):
        # Minimal live data implementation
        total_users = User.objects.count()
        # Placeholder logic for active projects / pending requests / system alerts
        active_projects = 0
        pending_requests = 0
        system_alerts = MessageThread.objects.filter(unread=True).count()

        # Activity data: last 6 months - derive from message counts as a proxy
        from django.utils import timezone
        from datetime import timedelta
        now = timezone.now()
        activity = []
        for i in range(6):
            month_start = (now - timedelta(days=30 * (5 - i))).strftime('%b')
            count = MessageThread.objects.filter(updated_at__gte=(now - timedelta(days=30 * (6 - i)))).count()
            activity.append({"month": month_start, "tasks": count * 3, "users": max(1, int(count / 2))})

        # Workspaces: not modeled yet; return empty list
        workspaces = []

        # Recent users
        recent_users_qs = User.objects.order_by('-created_at')[:5]
        recent_users = [{
            "name": f"{u.first_name} {u.last_name}",
            "role": u.role,
            "dept": u.department,
            "status": "active" if u.is_active else "inactive"
        } for u in recent_users_qs]

        # Audit logs: use recent message thread actions as a proxy
        audit_qs = MessageThread.objects.order_by('-updated_at')[:5]
        audit_logs = [{
            "user": t.sender,
            "action": t.subject,
            "time": "just now",
            "type": "system"
        } for t in audit_qs]

        payload = {
            "stats": {
                "total_users": total_users,
                "active_projects": active_projects,
                "pending_requests": pending_requests,
                "system_alerts": system_alerts,
            },
            "activity": activity,
            "workspaces": workspaces,
            "recent_users": recent_users,
            "audit_logs": audit_logs,
        }

        serializer = DashboardSerializer(payload)
        return Response(serializer.data)


class MessageThreadListView(generics.ListAPIView):
    queryset = MessageThread.objects.prefetch_related('messages__attachments').all()
    serializer_class = MessageThreadSerializer


class MessageThreadDetailView(generics.RetrieveAPIView):
    queryset = MessageThread.objects.prefetch_related('messages__attachments').all()
    serializer_class = MessageThreadSerializer


class MessageCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        thread = get_object_or_404(MessageThread, pk=pk)
        text = request.data.get('text', '').strip()
        author = request.data.get('author', 'You')
        author_email = request.data.get('author_email', '')
        contact_email = request.data.get('contact_email', thread.contact_email)

        message = Message.objects.create(
            thread=thread,
            author=author,
            author_email=author_email,
            text=text,
        )

        attachments = request.FILES.getlist('attachments')
        for file_obj in attachments:
            MessageAttachment.objects.create(
                message=message,
                file=file_obj,
                name=file_obj.name,
            )

        thread.contact_email = contact_email or thread.contact_email
        thread.last_message = text or 'Sent an attachment'
        thread.unread = False
        thread.save()

        serializer = MessageThreadSerializer(thread, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageThreadMarkReadView(APIView):
    def patch(self, request, pk):
        thread = get_object_or_404(MessageThread, pk=pk)
        thread.unread = False
        thread.save()
        serializer = MessageThreadSerializer(thread, context={'request': request})
        return Response(serializer.data)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

