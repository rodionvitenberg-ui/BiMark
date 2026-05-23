from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .services import AIAssistantService
from .models import AssistantQuickReply

class AIAssistantChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        messages = request.data.get("messages", [])
        page_context = request.data.get("page_context", None)

        if not messages:
            return Response({"error": "Messages history array is required"}, status=400)

        # Вызываем стриминг-генератор
        stream_generator = AIAssistantService.generate_stream_response(messages, page_context)
        
        # Возвращаем специальный потоковый ответ с типом text/event-stream
        response = StreamingHttpResponse(stream_generator, content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'  # Критично для серверов на Nginx (отключает прокси-буферизацию)
        return response
    
class AssistantQuickRepliesListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        path = request.query_params.get('path', '/')
        locale = request.query_params.get('locale', 'en')

        # Вытаскиваем подсказки для конкретного URL и языка
        replies = AssistantQuickReply.objects.filter(path=path, locale=locale)
        
        # Фоллбек: если для текущей страницы Максим ничего не настроил,
        # отдаем дефолтные подсказки с главной страницы ('/'), чтобы блок не пустовал
        if not replies.exists() and path != '/':
            replies = AssistantQuickReply.objects.filter(path='/', locale=locale)

        # Возвращаем просто плоский массив строк для фронтенда
        return Response([r.text for r in replies])