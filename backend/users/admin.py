from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = (
        "email",
        "first_name",
        "last_name",
        "get_role",
        "department",
        "is_staff",
    )

    ordering = ("email",)

    search_fields = (
        "email",
        "first_name",
        "last_name",
        "role",
        "department",
    )

    fieldsets = (
        (None, {
            "fields": (
                "email",
                "password",
            )
        }),

        ("Personal Information", {
            "fields": (
                "first_name",
                "last_name",
                "phone",
                "department",
                "role",
            )
        }),

        ("Permissions", {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),

        ("Authentication Flow", {
            "fields": (
                "is_first_login",
                "password_changed_at",
            )
        }),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email",
                "first_name",
                "last_name",
                "password1",
                "password2",
            ),
        }),
    )

    def get_role(self, obj):
        return obj.role

    get_role.short_description = "Role / Job Title"