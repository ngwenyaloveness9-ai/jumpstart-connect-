from datetime import timedelta
import random

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from authentication.models import OTP
from authentication.serializers import EmployeeCreateSerializer


User = get_user_model()


class CreateEmployeeView(APIView):
    # TEMPORARY FOR TESTING ONLY
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = EmployeeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        if User.objects.filter(email=data["email"]).exists():
            return Response(
                {"error": "User already exists"},
                status=400
            )

        try:
            with transaction.atomic():

                # Create Employee
                print("VALIDATED DATA:", data)
                print("ROLE RECEIVED:", data.get("role"))
                user = User.objects.create(
                    email=data["email"],
                    first_name=data["first_name"],
                    last_name=data["last_name"],
                    department=data.get("department"),
                    role=data.get("role"),
                    phone=data.get("phone"),
                    is_first_login=True,
                )

                # Generate OTP
                otp_code = str(random.randint(100000, 999999))

                OTP.objects.create(
                    email=user.email,
                    code=otp_code,
                    expires_at=timezone.now() + timedelta(minutes=10)
                )

                # Send Email (Console Backend)
                send_mail(
                    subject="Your Onboarding OTP",
                    message=f"""
Hello {user.first_name},

Your onboarding OTP is: {otp_code}

This OTP expires in 10 minutes.

Regards,
JumpStart System
                    """,
                    from_email="noreply@jumpstart.com",
                    recipient_list=[user.email],
                    fail_silently=False,
                )

        except Exception as e:
            return Response(
                {
                    "error": "Employee creation failed",
                    "details": str(e)
                },
                status=500
            )

        return Response({
            "message": "Employee created successfully",
            "employee_email": user.email,
            "otp_generated": True
        })