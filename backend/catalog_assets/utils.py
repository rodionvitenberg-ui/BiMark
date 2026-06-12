import os
import io
from PIL import Image
from django.core.files.base import ContentFile

def process_image_to_webp(image_field, max_width=1200, quality=80):
    """
    Принимает ImageField, делает пропорциональный ресайз до max_width
    и пережимает в легкий формат WebP.
    """
    if not image_field or not image_field.name:
        return

    # Защита от бесконечной рекурсии: если файл уже webp, ничего не делаем
    if image_field.name.lower().endswith('.webp'):
        return

    try:
        # Открываем картинку из поля модели
        img = Image.open(image_field.file)
        
        # Обрабатываем альфа-каналы прозрачности (конвертируем в RGBA/RGB)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            # WebP отлично поддерживает прозрачность
            pass
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Пропорциональный ресайз, если ширина превышает лимит
        if img.width > max_width:
            new_height = int((max_width / img.width) * img.height)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

        # Сохраняем результат в байтовый буфер в памяти
        output_buffer = io.BytesIO()
        img.save(output_buffer, format='WebP', quality=quality, optimize=True)
        output_buffer.seek(0)

        # Формируем новое имя файла с расширением .webp
        current_filename = os.path.splitext(os.path.basename(image_field.name))[0]
        new_filename = f"{current_filename}.webp"

        # Пересохраняем файл в поле модели БЕЗ вызова метода save() самой модели
        image_field.save(new_filename, ContentFile(output_buffer.read()), save=False)

    except Exception as e:
        # Если файл поврежден или это не картинка — мягко пропускаем, чтобы админка не падала
        print(f"Ошибка оптимизации изображения {image_field.name}: {str(e)}")