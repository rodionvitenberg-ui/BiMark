import logging
import json
from openai import OpenAI
from django.utils.html import strip_tags
from rest_framework.exceptions import ValidationError
from .models import AssistantConfig
from apps.catalog.models import Project  # Твоя модель каталога[cite: 4]

logger = logging.getLogger(__name__)

class AIAssistantService:
    @staticmethod
    def get_client_and_config():
        """Инициализация клиента OpenAI/DeepSeek"""
        config = AssistantConfig.objects.first()
        if not config or not config.is_active:
            return None, None

        model_name = config.model_name
        
        if model_name in [AssistantConfig.ModelChoices.GPT_4O, AssistantConfig.ModelChoices.GPT_4O_MINI]:
            if not config.openai_api_key:
                raise ValidationError("В админке выбран OpenAI, но отсутствует API ключ.")
            client = OpenAI(api_key=config.openai_api_key)
        elif model_name in [AssistantConfig.ModelChoices.DEEPSEEK_CHAT, AssistantConfig.ModelChoices.DEEPSEEK_REASONER]:
            if not config.deepseek_api_key:
                raise ValidationError("В админке выбран DeepSeek, но отсутствует API ключ.")
            # DeepSeek API полностью совместим с SDK OpenAI
            client = OpenAI(api_key=config.deepseek_api_key, base_url="https://api.deepseek.com/v1")
        elif model_name == AssistantConfig.ModelChoices.CUSTOM_PROXY:
            client = OpenAI(api_key=config.custom_proxy_key, base_url=config.custom_proxy_url)
        else:
            raise ValidationError("Выбрана неизвестная конфигурация модели ИИ.")

        return client, config

    @staticmethod
    def get_agent_tools():
        """Определение инструментов (Function Calling) для ИИ-Агента"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "add_item_to_cart",
                    "description": "Automatically adds a specified amount of project shares or a turnkey digital asset to the user's shopping cart.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "project_slug": {
                                "type": "string", 
                                "description": "The exact slug identifier of the investment project or asset."
                            },
                            "shares_amount": {
                                "type": "integer", 
                                "description": "Number of shares to add to cart. For unique turnkey assets, this is always 1."
                            }
                        },
                        "required": ["project_slug", "shares_amount"]
                    }
                }
            }
        ]

    @staticmethod
    def build_backend_catalog_context(locale: str) -> str:
        """Сборка XML-среза каталога из PostgreSQL в песочницу ИИ[cite: 4]"""
        xml = "<active_platform_catalog>\n"
        try:
            active_projects = Project.objects.filter(
                is_hidden=False,
                status__in=[Project.Status.PRESALE, Project.Status.ACTIVE]
            ).select_related('category').order_by('-created_at')[:15] #[cite: 4]
            
            for proj in active_projects:
                title = getattr(proj, f'title_{locale}', getattr(proj, 'title_en', proj.title))
                raw_short_desc = getattr(proj, f'short_description_{locale}', getattr(proj, 'short_description_en', proj.short_description))
                clean_desc = strip_tags(raw_short_desc or "")[:200].strip()
                
                category_name = ""
                if proj.category:
                    category_name = getattr(proj.category, f'name_{locale}', getattr(proj.category, 'name_en', proj.category.name))

                xml += "  <catalog_item>\n"
                xml += f"    <slug>{proj.slug}</slug>\n" #[cite: 4]
                xml += f"    <type>{'platform_token' if proj.is_token else 'digital_asset' if proj.category and proj.category.slug in ['youtube','telegram'] else 'investment_project'}</type>\n" #[cite: 4]
                xml += f"    <title>{title}</title>\n"
                xml += f"    <price_per_share>${proj.price_per_share}</price_per_share>\n" #[cite: 4]
                xml += f"    <available_shares>{proj.available_shares} pcs</available_shares>\n" #[cite: 4]
                if clean_desc:
                    xml += f"    <short_description>{clean_desc}</short_description>\n"
                xml += "  </catalog_item>\n"
        except Exception as e:
            logger.error(f"Context build failed: {str(e)}")
            xml += "  <error>Catalog is temporarily sleeping</error>\n"
        
        xml += "</active_platform_catalog>"
        return xml

    @classmethod
    def generate_stream_response(cls, messages: list, page_context: str = None):
        """Генератор чанков (SSE) для трансляции ответа пользователю на лету"""
        client, config = cls.get_client_and_config()
        if not client:
            yield "data: " + json.dumps({"content": "AI Assistant is offline."}) + "\n\n"
            return

        current_locale = 'en'
        if page_context and "<current_language>" in page_context:
            try:
                current_locale = page_context.split("<current_language>")[1].split("</current_language>")[0].strip()
            except Exception:
                pass

        # Оптимизация под DeepSeek Context Caching:
        # 1. Сначала идет неизменяемый системный промт (подгружается из кэша)
        full_system_instruction = f"{config.system_prompt}\n\n"
        # 2. В самый конец подмешиваем динамические блоки каталога и роутинга фронтенда
        full_system_instruction += f"BIMARK LIVE DATABASE CATALOG:\n{cls.build_backend_catalog_context(current_locale)}\n"
        
        if page_context:
            full_system_instruction += f"\nFRONTEND PAGE CONTEXT:\n{page_context}\n"

        api_messages = [{"role": "system", "content": full_system_instruction}]
        for msg in messages:
            if msg.get('role') in ['user', 'assistant']:
                api_messages.append({"role": msg['role'], "content": msg['content']})

        try:
            kwargs = {
                "model": config.model_name,
                "messages": api_messages,
                "stream": True, # Обязательно для стриминга!
                "tools": cls.get_agent_tools(),
                "tool_choice": "auto"
            }
            # DeepSeek Reasoner не поддерживает кастомную температуру
            if config.model_name != AssistantConfig.ModelChoices.DEEPSEEK_REASONER:
                kwargs["temperature"] = config.temperature

            response = client.chat.completions.create(**kwargs)

            for chunk in response:
                delta = chunk.choices[0].delta
                
                # Обработка генерации обычного текста
                if hasattr(delta, 'content') and delta.content:
                    yield f"data: {json.dumps({'content': delta.content})}\n\n"
                
                # Обработка вызова инструментов (Function Calling) ИИ-агентом
                if hasattr(delta, 'tool_calls') and delta.tool_calls:
                    for tool_call in delta.tool_calls:
                        yield f"data: {json.dumps({'tool_call': tool_call.model_dump()})}\n\n"

        except Exception as e:
            logger.error(f"Stream generation error: {str(e)}")
            yield "data: " + json.dumps({"content": "Technical error occurred."}) + "\n\n"