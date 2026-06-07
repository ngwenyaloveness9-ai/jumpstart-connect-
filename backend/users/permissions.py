from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """
    Allows access only to users with role = superadmin
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "superadmin"
        )