from rest_framework import serializers


# ============================================================
# EMPLOYEE / HR ONBOARDING
# ============================================================

class EmployeeCreateSerializer(serializers.Serializer):

    email = serializers.EmailField()

    first_name = serializers.CharField(
        max_length=100
    )

    last_name = serializers.CharField(
        max_length=100
    )

    department = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    role = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True
    )

    phone = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True
    )

    def validate_email(self, value):

        return value.strip().lower()

    def validate_role(self, value):

        value = value.strip().lower()

        allowed_roles = {
            "hr",
            "employee",
        }

        if value not in allowed_roles:

            raise serializers.ValidationError(
                "Role must be either 'hr' or 'employee'."
            )

        return value

    def validate_department(self, value):

        return value.strip()

    def validate(self, attrs):

        role = attrs.get("role", "").strip().lower()

        department = (
            attrs.get("department", "")
            .strip()
            .lower()
        )

        # ----------------------------------------------------
        # HR VALIDATION
        # ----------------------------------------------------

        if role == "hr":

            if department != "human resources":

                raise serializers.ValidationError(
                    {
                        "department": (
                            "HR users must belong to "
                            "Human Resources."
                        )
                    }
                )

        # ----------------------------------------------------
        # EMPLOYEE VALIDATION
        # ----------------------------------------------------

        elif role == "employee":

            if not department:

                raise serializers.ValidationError(
                    {
                        "department": (
                            "Department is required "
                            "for employees."
                        )
                    }
                )

        return attrs


# ============================================================
# OTP VERIFICATION
# ============================================================

class OTPVerifySerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(
        max_length=6
    )


# ============================================================
# FIRST PASSWORD CREATION
# ============================================================

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


# ============================================================
# NORMAL LOGIN
# ============================================================

class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    otp = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        min_length=6,
        max_length=6,
    )

    def validate(self, attrs):
        password = (attrs.get("password") or "").strip()
        otp = (attrs.get("otp") or "").strip()

        if not password and not otp:
            raise serializers.ValidationError(
                "Either password or a one-time PIN is required."
            )

        if password and otp:
            raise serializers.ValidationError(
                "Provide either your password or a one-time PIN, not both."
            )

        return attrs


# ============================================================
# CHANGE EXPIRED PASSWORD
# ============================================================

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