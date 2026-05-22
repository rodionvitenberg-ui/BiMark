from rest_framework import serializers

class ChatMessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['user', 'assistant'])
    content = serializers.CharField(max_length=10000)

class AIAssistantChatSerializer(serializers.Serializer):
    messages = ChatMessageSerializer(many=True, help_text="История переписки в чате")
    page_context = serializers.CharField(
        required=False, 
        allow_blank=True, 
        allow_null=True,  # <-- ЗАМЕНИЛИ null=True НА allow_null=True
        help_text="Слепок данных со страницы, на которой сейчас находится пользователь"
    )