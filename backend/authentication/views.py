from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from authentication.models import OTP

from .serializers import (
    OTPVerifySerializer,
    CreatePasswordSerializer,
    LoginSerializer,
    ChangePasswordSerializer
)


User = get_user_model()


# =====================================================
# VERIFY OTP
# =====================================================
class VerifyOTPView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        otp_code = serializer.validated_data["otp"]

        try:
            otp = OTP.objects.filter(
                email=email,
                code=otp_code
            ).latest("created_at")

        except OTP.DoesNotExist:
            return Response(
                {"error": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not otp.is_valid():
            return Response(
                {"error": "OTP expired or already used"},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp.is_used = True
        otp.save()

        return Response({
            "message": "OTP verified successfully",
            "first_login": True
        })


# =====================================================
# CREATE FIRST PASSWORD
# =====================================================
class CreatePasswordView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = CreatePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        confirm_password = serializer.validated_data["confirm_password"]

        if password != confirm_password:
            return Response(
                {"error": "Passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        user.set_password(password)
        user.is_first_login = False
        user.password_changed_at = timezone.now()
        user.save()

        return Response({
            "message": "Password created successfully"
        })


# =====================================================
# NORMAL LOGIN
# =====================================================
class LoginView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(
            username=email,
            password=password
        )

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if user.password_expired():
            return Response({
                "force_password_change": True,
                "message": "Password expired"
            })

        return Response({
            "message": "Login successful",
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name
        })


# =====================================================
# CHANGE PASSWORD
# =====================================================
class ChangePasswordView(APIView):

    def post(self, request):

        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]
        confirm_password = serializer.validated_data["confirm_password"]

        if new_password != confirm_password:
            return Response(
                {"error": "Passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.password_changed_at = timezone.now()
        user.save()

        return Response({
            "message": "Password changed successfully"
        })