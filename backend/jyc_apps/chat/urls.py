from django.urls import path
from .views import SendMessageView, GetConversationView, GetInboxView, GetContactsView

urlpatterns = [
    path('send', SendMessageView.as_view(), name='chat-send'),
    path('conversation/<int:user1_id>/<int:user2_id>', GetConversationView.as_view(), name='chat-conversation'),
    path('contacts/<int:user_id>', GetContactsView.as_view(), name='chat-contacts'),
    path('inbox/<int:user_id>', GetInboxView.as_view(), name='chat-inbox'),
]
