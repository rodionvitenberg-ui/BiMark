import logging
from openai import OpenAI
from rest_framework.exceptions import ValidationError
from .models import AssistantConfig

logger = logging.getLogger(__name__)

class AIAssistantService:
    @staticmethod
    def get_client_and_config():
        """
        Динамически собирает конфигурацию и инициализирует клиент OpenAI
        """
        config = AssistantConfig.objects.first()
        if not config or not config.is_active:
            return None, None

        model_name = config.model_name
        
        # Разруливаем провайдеров
        if model_name in [AssistantConfig.ModelChoices.GPT_4O, AssistantConfig.ModelChoices.GPT_4O_MINI]:
            if not config.openai_api_key:
                raise ValidationError("В админке выбран OpenAI, но отсутствует API ключ.")
            client = OpenAI(api_key=config.openai_api_key)
            
        elif model_name in [AssistantConfig.ModelChoices.DEEPSEEK_CHAT, AssistantConfig.ModelChoices.DEEPSEEK_REASONER]:
            if not config.deepseek_api_key:
                raise ValidationError("В админке выбран DeepSeek, но отсутствует API ключ.")
            # DeepSeek полностью совместим с библиотекой openai, меняем только endpoint
            client = OpenAI(
                api_key=config.deepseek_api_key,
                base_url="https://api.deepseek.com/v1"
            )
            
        elif model_name == AssistantConfig.ModelChoices.CUSTOM_PROXY:
            if not config.custom_proxy_url or not config.custom_proxy_key:
                raise ValidationError("Выбран кастомный прокси, но не заполнены URL или Ключ доступа.")
            client = OpenAI(
                api_key=config.custom_proxy_key,
                base_url=config.custom_proxy_url
            )
        else:
            raise ValidationError("Выбрана неизвестная конфигурация модели ИИ.")

        return client, config

    @classmethod
    def generate_response(cls, messages: list, page_context: str = None) -> str:
        """
        Отправляет историю переписки + контекст текущей страницы в LLM
        """
        client, config = cls.get_client_and_config()
        if not client:
            return "Извините, ИИ-ассистент временно отключен."

        # Формируем стартовый системный промт
        full_system_instruction = config.system_prompt
        
        # Если фронтенд передал контекст страницы — подмешиваем его к системным инструкциям
        if page_context:
            full_system_instruction += f"\n\nТЕКУЩИЙ КОНТЕНТ СТРАНИЦЫ ПОЛЬЗОВАТЕЛЯ:\n{page_context}\n"
            full_system_instruction += "Используй этот контекст, чтобы отвечать точно и привязываться к тому, что видит пользователь."

        # Собираем массив сообщений для API
        api_messages = [{"role": "system", "content": full_system_instruction}]
        
        # Добавляем историю переписки (очищаем от возможных левых полей фронта)
        for msg in messages:
            if msg.get('role') in ['user', 'assistant']:
                api_messages.append({
                    "role": msg['role'],
                    "content": msg['content']
                })

        try:
            # Параметры запроса
            kwargs = {
                "model": config.model_name,
                "messages": api_messages,
            }
            
            # У моделей reasoner (с рассуждениями вроде DeepSeek R1) фиксированная температура
            if config.model_name != AssistantConfig.ModelChoices.DEEPSEEK_REASONER:
                kwargs["temperature"] = config.temperature

            response = client.chat.completions.create(**kwargs)
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Ошибка при запросе к LLM ({config.model_name}): {str(e)}")
            return "Произошла техническая ошибка при обработке запроса ИИ. Попробуйте позже."