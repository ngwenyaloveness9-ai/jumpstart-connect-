from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

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

        print("REQUEST DATA:", request.data)

        serializer = OTPVerifySerializer(data=request.data)

        if not serializer.is_valid():
            print("SERIALIZER ERRORS:", serializer.errors)
            return Response(serializer.errors, status=400)

        # Normalize email and OTP
        email = serializer.validated_data["email"].strip().lower()
        otp_code = serializer.validated_data["otp"].strip()

        print("EMAIL:", repr(email))
        print("OTP:", repr(otp_code))

        try:
            otp = OTP.objects.filter(
                email__iexact=email,
                code=otp_code
            ).latest("created_at")

            print("OTP FOUND:", otp.code)

        except OTP.DoesNotExist:
            print("OTP NOT FOUND")
            return Response(
                {"error": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        print("USED:", otp.is_used)
        print("EXPIRES:", otp.expires_at)
        print("NOW:", timezone.now())

        if not otp.is_valid():
            print("OTP INVALID")
            return Response(
                {"error": "OTP expired or already used"},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp.is_used = True
        otp.save(update_fields=["is_used"])

        print("OTP VERIFIED SUCCESS")

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

        email = serializer.validated_data["email"].strip().lower()
        password = serializer.validated_data["password"]
        confirm_password = serializer.validated_data["confirm_password"]

        if password != confirm_password:
            return Response(
                {"error": "Passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email__iexact=email)

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
from rest_framework.authtoken.models import Token


class LoginView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()
        password = (serializer.validated_data.get("password") or "").strip()
        otp_code = (serializer.validated_data.get("otp") or "").strip()

        user = User.objects.filter(
            email__iexact=email
        ).first()

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if otp_code:
            if not user.is_first_login:
                return Response(
                    {"error": "One-time PIN login is only available for first-time setup."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            otp = OTP.objects.filter(
                email__iexact=email,
                code=otp_code
            ).order_by("-created_at").first()

            if not otp or not otp.is_valid():
                return Response(
                    {"error": "Invalid or already used one-time PIN."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            otp.is_used = True
            otp.save(update_fields=["is_used"])
            user.otp_verified = True
            user.save(update_fields=["otp_verified"])

            return Response({
                "message": "One-time PIN verified successfully.",
                "first_login": True,
                "email": user.email,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "department": user.department,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                }
            })

        if not password:
            return Response(
                {"error": "Password is required for regular sign in."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(password):
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if user.password_expired():
            return Response({
                "force_password_change": True,
                "message": "Password expired"
            })

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "message": "Login successful",
            "token": token.key,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "department": user.department,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
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


class ForgotPasswordView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"http://localhost:5173/reset-password?uid={uid}&token={token}&email={user.email}"
            send_mail(
                "Reset your JumpStart Connect password",
                f"Hello {user.first_name},\n\nReset your password here:\n{reset_url}\n\nIf you did not request this, you can ignore this email.",
                None,
                [user.email],
            )

        return Response({"message": "If an account exists for that email, a reset link has been sent."})


class ResetPasswordView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")
        if not uid or not token or not password or not confirm_password:
            return Response({"error": "The reset link and both password fields are required."}, status=status.HTTP_400_BAD_REQUEST)
        if password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"error": "This reset link is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({"error": "This reset link is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.is_first_login = False
        user.password_changed_at = timezone.now()
        user.save(update_fields=["password", "is_first_login", "password_changed_at"])
        Token.objects.filter(user=user).delete()
        return Response({"message": "Password reset successfully."})


# =====================================================
# ME (CURRENT USER)
# =====================================================
class MeView(APIView):

    def get(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
    "id": user.id,
    "email": user.email,
    "first_name": user.first_name,
    "last_name": user.last_name,
    "role": user.role
})

    def patch(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        allowed_fields = ["first_name", "last_name", "email", "phone", "department", "role"]
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "department": user.department,
            "role": user.role,
        })

# =====================================================
# LOGOUT
# =====================================================
class LogoutView(APIView):

    def post(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        Token.objects.filter(user=user).delete()
        return Response({"message": "Logged out successfully."})