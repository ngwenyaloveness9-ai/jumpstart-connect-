from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse


class ChatContactsEndpointTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            email="employee@example.com",
            password="secret123",
            first_name="Ada",
            last_name="Lovelace",
            role="employee",
        )
        self.other = self.User.objects.create_user(
            email="colleague@example.com",
            password="secret123",
            first_name="Grace",
            last_name="Hopper",
            role="employee",
        )

    def test_contacts_endpoint_lists_other_active_users(self):
        response = self.client.get(reverse("chat-contacts", kwargs={"user_id": self.user.id}))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["contacts"][0]["id"], self.other.id)
        self.assertEqual(data["contacts"][0]["name"], "Grace Hopper")
