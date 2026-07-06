import json

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
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

    def test_send_message_with_attachment_stores_attachment(self):
        uploaded_file = SimpleUploadedFile(
            "test-file.txt",
            b"Hello attachment",
            content_type="text/plain"
        )

        response = self.client.post(
            reverse("chat-send"),
            data={
                "sender_id": self.user.id,
                "receiver_id": self.other.id,
                "message": "See attached",
                "attachments": uploaded_file,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["status"], "sent")
        self.assertEqual(data["message"]["message"], "See attached")
        self.assertEqual(len(data["message"]["attachments"]), 1)
        self.assertEqual(data["message"]["attachments"][0]["name"], "test-file.txt")

    def test_share_attachment_forwards_message_with_attachment(self):
        uploaded_file = SimpleUploadedFile(
            "forward.txt",
            b"Forwarded attachment",
            content_type="text/plain"
        )

        send_response = self.client.post(
            reverse("chat-send"),
            data={
                "sender_id": self.user.id,
                "receiver_id": self.other.id,
                "message": "Please review",
                "attachments": uploaded_file,
            },
            format="multipart",
        )
        original_message = send_response.json()["message"]
        attachment_id = original_message["attachments"][0]["id"]

        target = self.User.objects.create_user(
            email="another@example.com",
            password="secret123",
            first_name="Alan",
            last_name="Turing",
            role="employee",
        )

        share_response = self.client.post(
            reverse("chat-share"),
            data=json.dumps({
                "sender_id": self.user.id,
                "receiver_id": target.id,
                "attachment_id": attachment_id,
                "message": "Forwarding this attachment",
            }),
            content_type="application/json",
        )

        self.assertEqual(share_response.status_code, 201)
        share_data = share_response.json()
        self.assertEqual(share_data["status"], "shared")
        self.assertEqual(share_data["message"]["receiver_id"], target.id)
        self.assertEqual(len(share_data["message"]["attachments"]), 1)
        self.assertEqual(share_data["message"]["attachments"][0]["name"], "forward.txt")
