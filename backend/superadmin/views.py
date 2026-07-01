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


User = get_user_model()


class CreateEmployeeView(APIView):
    # TEMPORARY FOR TESTING ONLY
    # Change back to IsSuperAdmin before deployment
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = EmployeeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # Prevent duplicate employee accounts
        if User.objects.filter(email=data["email"]).exists():
            return Response(
                {
                    "error": "A user with this email already exists."
                },
                status=400
            )

        try:
            with transaction.atomic():

                # Create employee
                user = User.objects.create(
                    email=data["email"],
                    first_name=data["first_name"],
                    last_name=data["last_name"],
                    department=data.get("department"),
                    role=data.get("role"),
                    phone=data.get("phone"),
                    is_first_login=True,
                    otp_verified=False,
                )

                # Generate 6-digit OTP
                otp_code = str(random.randint(100000, 999999))

                OTP.objects.create(
                    email=user.email,
                    code=otp_code,
                    expires_at=timezone.now() + timedelta(minutes=10)
                )

                # Send onboarding email
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

This OTP will expire in 10 minutes.

Use your work email together with this OTP to complete your first-time login and create your password.

If you did not expect this email, please contact your administrator.

Regards,

JumpStart Your Career
""",

                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )

        except Exception as e:
            return Response(
                {
                    "error": "Employee creation failed.",
                    "details": str(e)
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