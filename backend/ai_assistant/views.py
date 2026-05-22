from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import AIAssistantChatSerializer
from .services import AIAssistantService
from .models import AssistantConfig

class AIAssistantChatView(views.APIView):
    """
    Эндпоинт для общения с ИИ-ассистентом платформы BiMark.
    Принимает историю переписки и контекст текущей страницы.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # 1. Проверяем, включен ли ассистент вообще глобально в админке
        config = AssistantConfig.objects.first()
        if not config or not config.is_active:
            return Response(
                {"detail": "ИИ-Ассистент временно отключен администратором."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # 2. Валидируем входящие данные
        serializer = AIAssistantChatSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        messages = validated_data.get('messages', [])
        page_context = validated_data.get('page_context', '')

        # 3. Генерируем ответ через сервис (он подхватит нужные ключи OpenAI/DeepSeek)
        ai_response = AIAssistantService.generate_response(
            messages=messages,
            page_context=page_context
        )

        return Response(
            {
                "role": "assistant",
                "content": ai_response
            },
            status=status.HTTP_200_OK
        )