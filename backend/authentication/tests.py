from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone


User = get_user_model()

class FirstLoginPasswordTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email="employee@example.com",
			password="temporary-password",
			first_name="Ada",
			last_name="Lovelace",
			role="employee",
			is_first_login=True,
			otp_verified=False,
		)

	def test_temporary_password_uses_normal_login_and_requires_password_creation(self):
		response = self.client.post(
			"/api/auth/login/",
			data={
				"email": self.user.email,
				"password": "temporary-password",
			},
			content_type="application/json",
		)

		self.assertEqual(response.status_code, 200)
		self.assertTrue(response.json()["first_login"])
		self.assertNotIn("token", response.json())

	def test_regular_login_returns_token_after_first_password_is_created(self):
		self.user.set_password("New-password1!")
		self.user.is_first_login = False
		self.user.password_changed_at = timezone.now()
		self.user.save(update_fields=["password", "is_first_login", "password_changed_at"])

		response = self.client.post(
			"/api/auth/login/",
			data={
				"email": self.user.email,
				"password": "New-password1!",
			},
			content_type="application/json",
		)

		self.assertEqual(response.status_code, 200)
		self.assertIn("token", response.json())
		self.assertNotIn("first_login", response.json())
