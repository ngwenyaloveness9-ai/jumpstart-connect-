import json

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from .models import Group, GroupMember, GroupMessage, GroupMessageReaction


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


class GroupChatMessageFeatureTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.sender = self.User.objects.create_user(
            email="teamlead@example.com",
            password="secret123",
            first_name="Dana",
            last_name="Ngcobo",
            role="employee",
        )
        self.mentioned = self.User.objects.create_user(
            email="mentor@example.com",
            password="secret123",
            first_name="Mpho",
            last_name="Mokoena",
            role="employee",
        )
        self.group = Group.objects.create(name="Marketing Team", group_type="CUSTOM")
        GroupMember.objects.create(group=self.group, user=self.sender, is_admin=True)
        GroupMember.objects.create(group=self.group, user=self.mentioned)

    def test_send_group_message_with_mention_returns_resolved_users(self):
        response = self.client.post(
            reverse("group-send"),
            data=json.dumps({
                "sender_id": self.sender.id,
                "group_id": self.group.id,
                "message": "Hi @Mpho please review this",
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertIn("mentions", payload["message"])
        self.assertIn(self.mentioned.id, payload["message"]["mentions"])

    def test_group_message_reaction_can_toggle(self):
        message = GroupMessage.objects.create(
            group=self.group,
            sender=self.sender,
            message="This is good",
        )

        add_response = self.client.post(
            reverse("group-message-reaction"),
            data=json.dumps({
                "message_id": message.id,
                "user_id": self.sender.id,
                "emoji": "👍",
            }),
            content_type="application/json",
        )

        self.assertEqual(add_response.status_code, 200)
        self.assertEqual(add_response.json()["status"], "added")
        self.assertTrue(GroupMessageReaction.objects.filter(message=message, user=self.sender, emoji="👍").exists())

        remove_response = self.client.post(
            reverse("group-message-reaction"),
            data=json.dumps({
                "message_id": message.id,
                "user_id": self.sender.id,
                "emoji": "👍",
            }),
            content_type="application/json",
        )

        self.assertEqual(remove_response.status_code, 200)
        self.assertEqual(remove_response.json()["status"], "removed")
        self.assertFalse(GroupMessageReaction.objects.filter(message=message, user=self.sender, emoji="👍").exists())

    def test_group_message_can_be_edited_and_deleted(self):
        message = GroupMessage.objects.create(
            group=self.group,
            sender=self.sender,
            message="Original message",
        )

        edit_response = self.client.patch(
            reverse("group-message-update", kwargs={"message_id": message.id}),
            data=json.dumps({
                "message": "Updated message",
            }),
            content_type="application/json",
        )

        self.assertEqual(edit_response.status_code, 200)
        updated = GroupMessage.objects.get(id=message.id)
        self.assertTrue(updated.edited)
        self.assertEqual(updated.message, "Updated message")

        delete_response = self.client.delete(
            reverse("group-message-delete", kwargs={"message_id": message.id})
        )

        self.assertEqual(delete_response.status_code, 200)
        self.assertTrue(GroupMessage.objects.get(id=message.id).is_deleted)
