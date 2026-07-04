from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import json

from .models import Message

User = get_user_model()


@method_decorator(csrf_exempt, name='dispatch')
class SendMessageView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        message_text = data.get('message', '').strip()

        if not message_text:
            return JsonResponse({"error": "Message cannot be empty"}, status=400)

        try:
            sender = User.objects.get(id=sender_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Sender not found"}, status=404)

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Receiver not found"}, status=404)

        msg = Message.objects.create(
            sender=sender,
            receiver=receiver,
            message=message_text
        )

        return JsonResponse({
            "status": "sent",
            "message": {
                "id": msg.id,
                "sender_id": sender.id,
                "sender_name": f"{sender.first_name} {sender.last_name}",
                "receiver_id": receiver.id,
                "receiver_name": f"{receiver.first_name} {receiver.last_name}",
                "message": msg.message,
                "timestamp": msg.timestamp.isoformat(),
            }
        }, status=201)


class GetConversationView(View):
    def get(self, request, user1_id, user2_id):
        messages = Message.objects.filter(
            sender_id=user1_id, receiver_id=user2_id
        ) | Message.objects.filter(
            sender_id=user2_id, receiver_id=user1_id
        )
        messages = messages.order_by('timestamp')

        data = [{
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_name": f"{m.sender.first_name} {m.sender.last_name}",
            "receiver_id": m.receiver_id,
            "receiver_name": f"{m.receiver.first_name} {m.receiver.last_name}",
            "message": m.message,
            "timestamp": m.timestamp.isoformat(),
        } for m in messages]

        return JsonResponse({"messages": data, "count": len(data)})


class GetInboxView(View):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)

        inbox = Message.objects.filter(receiver=user).order_by('-timestamp')

        data = [{
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_name": f"{m.sender.first_name} {m.sender.last_name}",
            "message": m.message,
            "timestamp": m.timestamp.isoformat(),
        } for m in inbox]

        return JsonResponse({"inbox": data, "count": len(data)})
