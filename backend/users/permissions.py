from rest_framework.permissions import BasePermission


class IsAccountSupportAdmin(BasePermission):
    """Allow HR, system administrators, and the organisation superadmin."""

    message = "You do not have permission to manage user accounts."

    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated
            and (
                user.is_system_admin
                or user.role in {"hr", "superadmin"}
            )
        )


class IsSuperAdmin(BasePermission):
    """
    Allows access only to users with role = superadmin
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "superadmin"
        )