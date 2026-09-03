from datetime import timedelta
import base64
from html import escape
from pathlib import Path
import random
import threading
import secrets

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
from authentication.email_service import get_logo_data_uri
from authentication.serializers import EmployeeCreateSerializer
from jyc_apps.chat.models import Group, GroupMember


User = get_user_model()


def _jumpstart_logo_data_uri():
        logo_path = Path(settings.BASE_DIR).parent / "frontend" / "src" / "assets" / "images" / "jumpstart-logo.webp"
        try:
                encoded_logo = base64.b64encode(logo_path.read_bytes()).decode("ascii")
                return f"data:image/webp;base64,{encoded_logo}"
        except OSError:
                return ""


def _reset_email_html(user, subject, heading, intro, content, action_label=None, action_url=None, note=""):
        sender = escape(settings.DEFAULT_FROM_EMAIL)
        recipient = escape(user.email)
        first_name = escape(user.first_name or "there")
        logo = _jumpstart_logo_data_uri()
        action = (
                f'<a href="{escape(action_url)}" style="display:inline-block;background:#F5C518;color:#0D0D0D;'
                f'padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;">{escape(action_label)}</a>'
                if action_label and action_url else ""
        )
        logo_markup = f'<img src="{logo}" alt="JumpStart Your Career" width="72" height="72" style="display:block;margin:0 auto 12px;">' if logo else ""
        return f"""
        <div style="margin:0;padding:32px 16px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#171717;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
                <div style="background:#F5C518;padding:28px 32px;text-align:center;">
                    {logo_markup}
                    <div style="font-size:22px;font-weight:700;">Jumpstart Connect</div>
                    <div style="font-size:12px;margin-top:5px;letter-spacing:1px;text-transform:uppercase;">JumpStart Your Career</div>
                </div>
                <div style="padding:32px;">
                    <table style="width:100%;font-size:12px;color:#666;margin-bottom:28px;">
                        <tr><td style="padding-bottom:6px;"><strong>From:</strong> {sender}</td></tr>
                        <tr><td><strong>To:</strong> {recipient}</td></tr>
                    </table>
                    <h1 style="font-size:24px;margin:0 0 18px;color:#0D0D0D;">{escape(heading)}</h1>
                    <p style="font-size:16px;line-height:1.6;margin:0 0 14px;">Hello <strong>{first_name}</strong>,</p>
                    <p style="font-size:15px;line-height:1.7;margin:0 0 18px;color:#333;">{escape(intro)}</p>
                    {content}
                    {action}
                    <p style="font-size:13px;line-height:1.6;margin:24px 0 0;color:#666;">{escape(note)}</p>
                    <p style="font-size:14px;line-height:1.6;margin:28px 0 0;">Regards,<br><strong>Jumpstart Connect HR</strong></p>
                </div>
                <div style="background:#0D0D0D;color:#ffffff;padding:16px 32px;font-size:12px;text-align:center;">JumpStart Your Career | Human Resources</div>
            </div>
        </div>
        """


def is_employee_account(user):
    return (user.role or "").strip().lower() not in {"hr", "superadmin"}


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

                
                # Generate and store the temporary password used for first login.
                temporary_password = secrets.token_urlsafe(12)
                user.set_password(temporary_password)
                user.save(update_fields=["password"])

                # -----------------------------------
                # Send Email
                # -----------------------------------

                logo_data_uri = get_logo_data_uri()
                html_message = f"""
<!DOCTYPE html>
<html lang="en">
    <body style="margin:0; padding:32px 16px; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif; color:#111827;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #e5e7eb; box-shadow:0 8px 24px rgba(17,24,39,.08);">
            <div style="background:#0D0D0D; padding:30px 32px; text-align:center;">
                <img src="{logo_data_uri}" alt="Jumpstart Connect" width="72" height="72" style="display:block; width:72px; height:72px; margin:0 auto 16px; border-radius:50%;">
                <div style="font-size:13px; font-weight:700; letter-spacing:1.8px; color:#F5C518; text-transform:uppercase;">Jumpstart Connect</div>
                <h1 style="margin:12px 0 0; font-size:27px; line-height:1.25; color:#ffffff;">Welcome to JumpStart!</h1>
                <p style="margin:10px 0 0; font-size:14px; color:#d1d5db;">Your workspace access is ready.</p>
      </div>

            <div style="padding:34px 32px 28px;">
                <p style="margin:0 0 16px; font-size:17px; color:#111827;">
          Hello <strong>{user.first_name}</strong>,
        </p>

        <p style="margin:0 0 18px; font-size:15px; line-height:1.7; color:#0D0D0D;">
          Your employee account has been created successfully. Use the one-time password below to complete your first sign in using your work email.
        </p>

                <div style="background:#fff9e6; border:1px solid #f5c518; border-radius:14px; padding:22px 20px; text-align:center; margin:26px 0;">
                    <div style="font-size:11px; font-weight:700; letter-spacing:1.6px; color:#6b7280; text-transform:uppercase; margin-bottom:12px;">
            Your One-Time Password
          </div>
          <div style="font-size:25px; font-weight:700; letter-spacing:2px; color:#0D0D0D; word-break:break-all;">{temporary_password}</div>
        </div>

        <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#0D0D0D;">
          This password is for your first sign in only. After signing in, you will be redirected to create your own password.
        </p>

                <p style="margin:28px 0 0; padding-top:20px; border-top:1px solid #e5e7eb; font-size:13px; line-height:1.7; color:#6b7280;">
          Regards,<br>
                    <strong style="color:#111827;">JumpStart Your Career</strong>
        </p>
      </div>
            <div style="background:#f9fafb; padding:16px 32px; text-align:center; font-size:11px; color:#9ca3af;">This is an automated message. Please do not reply.</div>
    </div>
  </body>
</html>
"""
                send_mail(
                    subject="Welcome to JumpStart Your Career",
                    message=f"""
Hello {user.first_name},

Your employee account has been created successfully.

Your One-Time Password:
{temporary_password}

Use this password for your first sign in only. You will then be redirected to create your own password.

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


class UserResetOtpView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ["hr", "superadmin"]:
            return Response(
                {"error": "Only Human Resources or Superadmin can send reset OTPs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = get_object_or_404(User, pk=pk)
        if request.user.role == "hr" and not is_employee_account(user):
            return Response(
                {"error": "HR can only manage employee accounts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        otp_code = str(random.randint(100000, 999999))
        OTP.objects.filter(email__iexact=user.email, is_used=False).update(is_used=True)
        OTP.objects.create(
            email=user.email,
            code=otp_code,
            expires_at=timezone.now() + timedelta(minutes=15),
        )

        def _send_otp():
            try:
                sender = settings.DEFAULT_FROM_EMAIL
                send_mail(
                    subject="Your JumpStart Connect password reset OTP",
                    message=(f"From: {sender}\nTo: {user.email}\n\nHello {user.first_name},\n\n"
                             f"Your password reset OTP is: {otp_code}\n\nShare this OTP with Human Resources. "
                             "It expires in 15 minutes."),
                    from_email=sender,
                    recipient_list=[user.email],
                    html_message=_reset_email_html(
                        user,
                        "Your JumpStart Connect password reset OTP",
                        "Password reset verification",
                        "Human Resources requested a password reset verification code for your Jumpstart Connect account.",
                        f'''<div style="background:#FFF9E6;border:1px solid #F5C518;border-radius:10px;padding:22px;text-align:center;margin:22px 0;">
                          <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:#666;text-transform:uppercase;margin-bottom:10px;">Your one-time password reset code</div>
                          <div style="font-size:34px;font-weight:700;letter-spacing:8px;color:#0D0D0D;">{escape(otp_code)}</div>
                        </div>''',
                        note="Please send this code to Human Resources. Do not share it with anyone else. The code expires in 15 minutes.",
                    ),
                )
            except Exception:
                # Swallow exceptions so the API can return quickly; admins may check logs.
                pass

        threading.Thread(target=_send_otp, daemon=True).start()

        return Response({"message": "Password reset OTP sent successfully."})


class UserResetLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ["hr", "superadmin"]:
            return Response(
                {"error": "Only Human Resources or Superadmin can send reset links."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = get_object_or_404(User, pk=pk)
        if request.user.role == "hr" and not is_employee_account(user):
            return Response(
                {"error": "HR can only manage employee accounts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        otp_code = str(request.data.get("otp", "")).strip()
        otp = OTP.objects.filter(
            email__iexact=user.email,
            code=otp_code,
            is_used=False,
        ).order_by("-created_at").first()
        if not otp or not otp.expires_at or otp.expires_at <= timezone.now():
            return Response(
                {"error": "The OTP is invalid or expired. Request a new OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"http://localhost:5173/reset-password?uid={uid}&token={token}&email={user.email}"

        def _send_link():
            try:
                sender = settings.DEFAULT_FROM_EMAIL
                send_mail(
                    subject="Reset your JumpStart Connect password",
                    message=(f"From: {sender}\nTo: {user.email}\n\nHello {user.first_name},\n\n"
                             f"Human Resources verified your request. Reset your password here: {reset_url}\n\n"
                             "This link expires when your account credentials change."),
                    from_email=sender,
                    recipient_list=[user.email],
                    html_message=_reset_email_html(
                        user,
                        "Reset your JumpStart Connect password",
                        "Reset your password",
                        "Human Resources verified your password reset request. Use the button below to choose a new password.",
                        '<div style="background:#f7f7f7;border-left:4px solid #F5C518;padding:14px 16px;margin:22px 0;color:#333;font-size:14px;line-height:1.6;">This link is for your account only.</div>',
                        action_label="Reset my password",
                        action_url=reset_url,
                        note="For your security, the link expires when your account credentials change. If you did not contact Human Resources, notify them immediately.",
                    ),
                )
            except Exception:
                pass

        threading.Thread(target=_send_link, daemon=True).start()
        otp.is_used = True
        otp.save(update_fields=["is_used"])

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

