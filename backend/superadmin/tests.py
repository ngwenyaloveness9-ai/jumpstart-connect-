from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient


User = get_user_model()


class SystemAdminAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.system_admin = User.objects.create_user(
            email="developer@example.com",
            password="Secure-password1!",
            first_name="Dev",
            last_name="One",
            role="employee",
            is_system_admin=True,
            is_first_login=False,
            password_changed_at=timezone.now(),
        )
        self.employee = User.objects.create_user(
            email="employee@example.com",
            password="Secure-password1!",
            first_name="Staff",
            last_name="Member",
            role="employee",
            is_first_login=False,
            password_changed_at=timezone.now(),
        )

    def test_system_admin_can_list_users_and_is_not_promoted_to_superadmin(self):
        self.client.force_authenticate(self.system_admin)

        list_response = self.client.get("/api/users/")
        profile_response = self.client.patch(
            "/api/auth/me/",
            {"role": "superadmin", "is_system_admin": False},
            format="json",
        )

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(profile_response.status_code, 200)
        self.system_admin.refresh_from_db()
        self.assertEqual(self.system_admin.role, "employee")
        self.assertTrue(self.system_admin.is_system_admin)

    def test_system_admin_cannot_promote_or_manage_privileged_accounts(self):
        self.client.force_authenticate(self.system_admin)

        promote_response = self.client.patch(
            f"/api/users/{self.employee.pk}/",
            {"role": "superadmin"},
            format="json",
        )
        self.assertEqual(promote_response.status_code, 403)

        protected_response = self.client.get(
            f"/api/users/{self.system_admin.pk}/"
        )
        self.assertEqual(protected_response.status_code, 403)

    def test_regular_employee_cannot_access_user_management(self):
        self.client.force_authenticate(self.employee)

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 403)

    def test_management_command_grants_and_revokes_employee_access(self):
        call_command("set_system_admin", "EMPLOYEE@example.com")
        self.employee.refresh_from_db()
        self.assertTrue(self.employee.is_system_admin)

        call_command("set_system_admin", "--revoke", self.employee.email)
        self.employee.refresh_from_db()
        self.assertFalse(self.employee.is_system_admin)

    def test_management_command_rejects_superadmin_accounts(self):
        superadmin = User.objects.create_superuser(
            email="ceo@example.com",
            password="Secure-password1!",
            first_name="Chief",
            last_name="Executive",
        )

        with self.assertRaises(CommandError):
            call_command("set_system_admin", superadmin.email)

        superadmin.refresh_from_db()
        self.assertFalse(superadmin.is_system_admin)
