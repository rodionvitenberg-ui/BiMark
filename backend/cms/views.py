import os
import json
from django.http import JsonResponse
from django.conf import settings

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