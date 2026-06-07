from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager
)

from django.db import models
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):

        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            **extra_fields
        )

        if password:
            user.set_password(password)

        user.save(using=self._db)

        return user

    def create_superuser(self, email, password, **extra_fields):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "superadmin")
        extra_fields.setdefault("is_first_login", False)
        extra_fields.setdefault("otp_verified", True)

        user = self.create_user(
            email=email,
            password=password,
            **extra_fields
        )

        user.password_changed_at = timezone.now()
        user.save()

        return user


class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ("superadmin", "Super Admin"),
        ("manager", "Manager"),
        ("employee", "Employee"),
    )

    email = models.EmailField(
        unique=True
    )

    first_name = models.CharField(
        max_length=100
    )

    last_name = models.CharField(
        max_length=100
    )

    department = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default="employee"
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    # Django permissions

    is_active = models.BooleanField(
        default=True
    )

    is_staff = models.BooleanField(
        default=False
    )

    # Authentication flow

    is_first_login = models.BooleanField(
        default=True
    )

    otp_verified = models.BooleanField(
        default=False
    )

    password_changed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    objects = UserManager()

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "first_name",
        "last_name"
    ]

    def password_expired(self):

        if not self.password_changed_at:
            return True

        return timezone.now() > (
            self.password_changed_at +
            timedelta(days=90)
        )

    def __str__(self):
        return self.email