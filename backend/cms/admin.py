import os
import json
from django.contrib import admin
from django.conf import settings
from django.shortcuts import render, redirect
from .models import SiteTranslation

MESSAGES_DIR = os.path.join(settings.BASE_DIR.parent, 'frontend', 'messages')
LANGUAGES = ['ru', 'en', 'es']

# --- Утилиты для плоского JSON ---
def flatten_json(y):
    out = {}
    def flatten(x, name=''):
        if type(x) is dict:
            for a in x:
                flatten(x[a], name + a + '.')
        else:
            out[name[:-1]] = x
    flatten(y)
    return out

def unflatten_json(dictionary):
    result = {}
    for key, value in dictionary.items():
        parts = key.split(".")
        d = result
        for part in parts[:-1]:
            if part not in d:
                d[part] = {}
            d = d[part]
        d[parts[-1]] = value
    return result
# --------------------------------

@admin.register(SiteTranslation)
class SiteTranslationAdmin(admin.ModelAdmin):
    # Принудительно заставляем Django показывать эту страницу в меню
    def has_module_permission(self, request): return True
    def has_view_permission(self, request, obj=None): return True
    def has_change_permission(self, request, obj=None): return True
    def has_add_permission(self, request): return False
    def has_delete_permission(self, request, obj=None): return False

    def changelist_view(self, request, extra_context=None):
        os.makedirs(MESSAGES_DIR, exist_ok=True)

        if request.method == 'POST':
            # Собираем данные из таблицы (эта часть без изменений)
            new_data = {lang: {} for lang in LANGUAGES}
            for input_name, value in request.POST.items():
                if input_name.startswith('ru_'): new_data['ru'][input_name[3:]] = value
                elif input_name.startswith('en_'): new_data['en'][input_name[3:]] = value
                elif input_name.startswith('es_'): new_data['es'][input_name[3:]] = value

            # Распаковываем обратно во вложенные JSON и сохраняем
            for lang in LANGUAGES:
                filepath = os.path.join(MESSAGES_DIR, f'{lang}.json')
                nested_data = unflatten_json(new_data[lang])
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(nested_data, f, ensure_ascii=False, indent=2)

            self.message_user(request, "Тексты успешно обновлены!")
            return redirect('admin:cms_sitetranslation_changelist')

        # --- GET запрос: Готовим данные для таблицы ---
        flat_data = {lang: {} for lang in LANGUAGES}
        all_keys = set()

        for lang in LANGUAGES:
            filepath = os.path.join(MESSAGES_DIR, f'{lang}.json')
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    try:
                        flat = flatten_json(json.load(f))
                        flat_data[lang] = flat
                        all_keys.update(flat.keys())
                    except Exception:
                        pass

        # Группируем ключи по главному блоку (до первой точки)
        grouped_data = {}
        for key in sorted(list(all_keys)):
            # Разбиваем 'Hero.title' на ['Hero', 'title']. 
            # Если точки нет, положим в 'Общие'
            parts = key.split(".", 1) 
            group_name = parts[0] if len(parts) > 1 else "Общие"
            display_key = parts[1] if len(parts) > 1 else key

            if group_name not in grouped_data:
                grouped_data[group_name] = []
                
            grouped_data[group_name].append({
                'full_key': key, # Полный ключ нужен для сохранения (напр. ru_Hero.title)
                'display_key': display_key, # Короткий ключ для красоты (напр. title)
                'ru': flat_data['ru'].get(key, ''),
                'en': flat_data['en'].get(key, ''),
                'es': flat_data['es'].get(key, ''),
            })

        context = {
            **self.admin_site.each_context(request),
            'title': 'Локализация интерфейса',
            'grouped_data': grouped_data, # Передаем сгруппированные данные
            'opts': self.model._meta,
        }
        return render(request, 'admin/translation_form.html', context)