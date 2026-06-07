from rest_framework import serializers


# -----------------------------
# Employee Onboarding
# -----------------------------
class EmployeeCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)

    department = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    role = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    phone = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True
    )


# -----------------------------
# OTP Verification
# -----------------------------
class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


# -----------------------------
# First Password Creation
# -----------------------------
class CreatePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    password = serializers.CharField(
        min_length=8,
        write_only=True
    )

    confirm_password = serializers.CharField(
        min_length=8,
        write_only=True
    )


# -----------------------------
# Normal Login
# -----------------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )


# -----------------------------
# Change Expired Password
# -----------------------------
class ChangePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    old_password = serializers.CharField(
        write_only=True
    )

    new_password = serializers.CharField(
        min_length=8,
        write_only=True
    )

    confirm_password = serializers.CharField(
        min_length=8,
        write_only=True
    )