import os
import json
from django.http import JsonResponse
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Article
from rest_framework.serializers import ModelSerializer

# Путь до папки с JSON-переводами во фронтенде
MESSAGES_DIR = os.path.join(settings.BASE_DIR.parent, 'frontend', 'messages')

def get_translations(request, locale):
    # Защита от поиска файлов вне папки (LFI уязвимости)
    if locale not in ['ru', 'en', 'es']:
        return JsonResponse({}, status=400)
        
    filepath = os.path.join(MESSAGES_DIR, f'{locale}.json')
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
class ArticleSitemapSerializer(ModelSerializer):
    class Meta:
        model = Article
        fields = ['slug', 'created_at', 'updated_at']

class PublicArticleListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # Эндпоинт для ситмапа и фронтенда
        articles = Article.objects.filter(is_published=True)
        locale = request.query_params.get('locale')
        if locale:
            articles = articles.filter(locale=locale)
        
        # Если запрос для sitemap — отдаем сокращенный формат
        if request.query_params.get('sitemap') == 'true':
            serializer = ArticleSitemapSerializer(articles, many=True)
            return Response(serializer.data)
            
        # Для фронтенда отдаем полные данные
        return Response([{
            "id": str(a.id),
            "title": a.title,
            "slug": a.slug,
            "short_description": a.short_description,
            "content": a.content,
            "updated_at": a.updated_at
        } for a in articles])
    
    def get(self, request):
        articles = Article.objects.filter(is_published=True)
        locale = request.query_params.get('locale')
        if locale:
            articles = articles.filter(locale=locale)
        
        if request.query_params.get('sitemap') == 'true':
            serializer = ArticleSitemapSerializer(articles, many=True)
            return Response(serializer.data)
            
        # Формируем полный JSON с абсолютным путём к изображению
        return Response([{
            "id": str(a.id),
            "title": a.title,
            "slug": a.slug,
            "short_description": a.short_description,
            "content": a.content,
            # Динамически собираем абсолютный URL для Next.js
            "preview_image": request.build_absolute_uri(a.preview_image.url) if a.preview_image else None,
            "updated_at": a.updated_at
        } for a in articles])