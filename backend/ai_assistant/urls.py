from django.urls import path
from .views import AIAssistantChatView

urlpatterns = [
    path('chat/', AIAssistantChatView.as_view(), name='ai-assistant-chat'),
]