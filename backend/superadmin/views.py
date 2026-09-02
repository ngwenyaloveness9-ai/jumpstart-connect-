from datetime import timedelta
import random

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from authentication.models import OTP
from authentication.serializers import EmployeeCreateSerializer
from jyc_apps.chat.models import Group, GroupMember


User = get_user_model()


class CreateEmployeeView(APIView):

    # Require authentication: only Superadmin or HR can onboard employees.
    permission_classes = [IsAuthenticated]

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

        # Authorization: only superadmin may create HR users, HR users may create other employees.
        creator = getattr(request, 'user', None)
        creator_role = (getattr(creator, 'role', '') or '').strip().lower() if creator else ''
        creator_department = (getattr(creator, 'department', '') or '').strip().lower() if creator else ''
        new_department = (data.get('department') or '').strip().lower()

        if creator_role == "superadmin":
           # Superadmin may only onboard HR users
           if new_department != "human resources":
              return Response(
                 {
                    "error": (
                        "Superadmin may only onboard Human Resources users. "
                         "Please set department to 'Human Resources'."
                )
            },
            status=403,
        )

        elif creator_role == "hr":
            # HR may onboard employees across departments
            pass

        else:
            return Response(
        {
            "error": (
                "Only Superadmin or Human Resources staff "
                "can onboard employees."
            )
        },
        status=403,
    )

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
                    expires_at=None,
                )

                # -----------------------------------
                # Send Email
                # -----------------------------------

                html_message = f"""
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0; padding:0; background-color:#f5f5f5; font-family: Arial, Helvetica, sans-serif; color:#0D0D0D;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e5e5;">
      <div style="background:#F5C518; padding:24px 32px; text-align:center;">
        <div style="display:inline-block; background:#0D0D0D; color:#F5C518; border-radius:999px; padding:10px 18px; font-weight:700; letter-spacing:1px; font-size:12px; text-transform:uppercase;">
          Jumpstart Connect
        </div>
        <h1 style="margin:16px 0 0; font-size:28px; line-height:1.2; color:#0D0D0D;">Welcome to JumpStart!</h1>
      </div>

      <div style="padding:32px;">
        <p style="margin:0 0 16px; font-size:16px; color:#0D0D0D;">
          Hello <strong>{user.first_name}</strong>,
        </p>

        <p style="margin:0 0 18px; font-size:15px; line-height:1.7; color:#0D0D0D;">
          Your employee account has been created successfully. Use the one-time PIN below to complete your first sign in using your work email.
        </p>

        <div style="background:#FFF9E6; border:1px solid #F5C518; border-radius:12px; padding:20px; text-align:center; margin:24px 0;">
          <div style="font-size:12px; font-weight:700; letter-spacing:1.5px; color:#666666; text-transform:uppercase; margin-bottom:12px;">
            Your One-Time PIN
          </div>
          <div style="font-size:34px; font-weight:700; letter-spacing:8px; color:#0D0D0D;">{otp_code}</div>
        </div>

        <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#0D0D0D;">
          This PIN does not expire and can be used only once. After the first sign in, you will be redirected to create your own password.
        </p>

        <p style="margin:0; font-size:15px; line-height:1.7; color:#0D0D0D;">
          Regards,<br>
          <strong>JumpStart Your Career</strong>
        </p>
      </div>
    </div>
  </body>
</html>
"""
                send_mail(
                    subject="Welcome to JumpStart Your Career",
                    message=f"""
Hello {user.first_name},

Your employee account has been created successfully.

Your One-Time PIN:
{otp_code}

This PIN does not expire and can be used only once.

Regards,
JumpStart Your Career
""",
                    html_message=html_message,
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
# ============================================================
# SUPERADMIN - HR MANAGEMENT
# ============================================================

class HRListView(APIView):
    """
    Superadmin can view all Human Resources users.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Only Superadmin
        if request.user.role != "superadmin":
            return Response(
                {
                    "error": "Only the Superadmin can manage Human Resources users."
                },
                status=403
            )

        hr_users = User.objects.filter(
            role="hr"
        ).order_by("-created_at")

        data = []

        for hr in hr_users:
            data.append({
                "id": hr.id,
                "email": hr.email,
                "first_name": hr.first_name,
                "last_name": hr.last_name,
                "department": hr.department,
                "role": hr.role,
                "phone": hr.phone,
                "is_active": hr.is_active,
                "created_at": hr.created_at,
            })

        return Response(
            {
                "count": len(data),
                "hr_users": data
            },
            status=200
        )


class HRUpdateView(APIView):
    """
    Superadmin can update an HR user's details.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        # Only Superadmin
        if request.user.role != "superadmin":
            return Response(
                {
                    "error": "Only the Superadmin can manage Human Resources users."
                },
                status=403
            )

        try:
            hr = User.objects.get(
                pk=pk,
                role="hr"
            )
        except User.DoesNotExist:
            return Response(
                {
                    "error": "HR user not found."
                },
                status=404
            )

        # Prevent changing the HR into another role
        allowed_fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "department",
            "is_active",
        ]

        for field in allowed_fields:
            if field in request.data:
                setattr(hr, field, request.data[field])

        # Always keep this user as HR
        hr.role = "hr"
        hr.save()

        return Response(
            {
                "message": "HR user updated successfully.",
                "hr": {
                    "id": hr.id,
                    "email": hr.email,
                    "first_name": hr.first_name,
                    "last_name": hr.last_name,
                    "department": hr.department,
                    "role": hr.role,
                    "phone": hr.phone,
                    "is_active": hr.is_active,
                }
            },
            status=200
        )


class HRDeleteView(APIView):
    """
    Superadmin can delete an HR user.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        # Only Superadmin
        if request.user.role != "superadmin":
            return Response(
                {
                    "error": "Only the Superadmin can manage Human Resources users."
                },
                status=403
            )

        try:
            hr = User.objects.get(
                pk=pk,
                role="hr"
            )
        except User.DoesNotExist:
            return Response(
                {
                    "error": "HR user not found."
                },
                status=404
            )

        # Delete HR
        hr.delete()

        return Response(
            {
                "message": "HR user deleted successfully."
            },
            status=200
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
            .filter(group_type="DEPARTMENT")
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
    """
    HR and Superadmin can view users.
    """
    permission_classes = [IsAuthenticated]

    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):

        if request.user.role not in ["hr", "superadmin"]:
            return Response(
                {
                    "error": "Only Human Resources or Superadmin can view users."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return super().get(request, *args, **kwargs)


class UserResetLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ["hr", "superadmin"]:
            return Response(
                {"error": "Only Human Resources or Superadmin can send reset links."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = get_object_or_404(User, pk=pk)
        if request.user.role == "hr" and (user.role or "").lower() != "employee":
            return Response(
                {"error": "HR can only manage employee accounts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"http://localhost:5173/reset-password?uid={uid}&token={token}&email={user.email}"

        send_mail(
            subject="Reset your JumpStart Connect password",
            message=f"Hello {user.first_name},\n\nReset your password here: {reset_url}\n\nThis link expires when your account credentials change.",
            from_email=None,
            recipient_list=[user.email],
        )

        return Response({"message": "Password reset link sent successfully."})


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    HR and Superadmin can view and manage users.

    HR:
        - Can view employees
        - Can edit employees
        - Can delete employees
        - Cannot modify Superadmin users
        - Cannot modify HR users

    Superadmin:
        - Can manage users through this endpoint
    """

    permission_classes = [IsAuthenticated]

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        user = super().get_object()

        if self.request.user.role == "hr":
            if (user.role or "").lower() != "employee":
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    "HR can only manage employee accounts."
                )

        return user

    def get(self, request, *args, **kwargs):

        if request.user.role not in ["hr", "superadmin"]:
            return Response(
                {
                    "error": "Only Human Resources or Superadmin can manage users."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return super().get(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):

        if request.user.role not in ["hr", "superadmin"]:
            return Response(
                {
                    "error": "Only Human Resources or Superadmin can edit users."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.role == "hr" and str(request.data.get("role", "employee")).lower() not in ["employee", "manager"]:
            return Response(
                {"error": "HR can only assign Employee or Manager roles."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):

        if request.user.role not in ["hr", "superadmin"]:
            return Response(
                {
                    "error": "Only Human Resources or Superadmin can delete users."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class UserProfileDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

