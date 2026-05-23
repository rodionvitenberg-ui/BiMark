from django.urls import path
from .views import AIAssistantChatView, AssistantQuickRepliesListView

urlpatterns = [
    path('chat/', AIAssistantChatView.as_view(), name='ai-assistant-chat'),
    path('quick-replies/', AssistantQuickRepliesListView.as_view(), name='ai_quick_replies'), # Новый роут!
]