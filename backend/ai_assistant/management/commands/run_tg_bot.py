import asyncio
import logging
import json
from django.core.management.base import BaseCommand
from asgiref.sync import sync_to_async
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, CommandHandler, filters

# Импортируем настройки и наш ИИ-сервис
from ai_assistant.models import AssistantConfig
from ai_assistant.services import AIAssistantService

logger = logging.getLogger(__name__)

# Принудительно конвертируем синхронный метод генерации ответа ИИ в асинхронный
generate_ai_response = sync_to_async(AIAssistantService.generate_response)


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start — сбрасывает историю переписки и приветствует юзера"""
    context.user_data['chat_history'] = []
    
    user_lang = update.effective_user.language_code or 'en'
    if user_lang.startswith('ru'):
        msg = (
            "Привет! Я официальный ИИ-скаут платформы **BiMark**. 🤖\n\n"
            "Я подключен напрямую к нашей базе данных и знаю всё про доступные инвестиционные доли, "
            "активы, условия доходности (5-15% в месяц) и токеномику BMK.\n\n"
            "Задайте мне любой вопрос о проектах каталога!"
        )
    else:
        msg = (
            "Hello! I am the official AI Scout for the **BiMark** platform. 🤖\n\n"
            "I have direct access to our live database and know everything about available shares, "
            "turnkey digital businesses, yield metrics (5-15% monthly), and BMK tokenomics.\n\n"
            "Ask me anything about our active catalog listings!"
        )
    await update.message.reply_text(msg, parse_mode="Markdown")


async def handle_telegram_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик всех входящих текстовых сообщений от пользователей"""
    # 1. Динамически проверяем конфигурацию в БД (включен ли бот вообще)
    config = await AssistantConfig.objects.afirst()
    if not config or not config.is_tg_bot_active:
        return  # Если тумблер в админке выключен — бот игнорирует сообщения

    user_text = update.message.text
    user_lang = update.effective_user.language_code or 'en'
    
    # Нормализуем локаль под поддерживаемые платформой стандарты
    locale = 'ru' if user_lang.startswith('ru') else 'es' if user_lang.startswith('es') else 'en'

    # 2. Имитируем контекст страницы для сохранения единой логики песочницы
    page_context = f"<current_language>{locale}</current_language><current_url>/telegram-messenger-bot</current_url>"

    # 3. Инициализируем и подтягиваем историю диалога конкретного юзера из кэша сессии бота
    if 'chat_history' not in context.user_data:
        context.user_data['chat_history'] = []

    # Добавляем реплику пользователя в контекст
    context.user_data['chat_history'].append({"role": "user", "content": user_text})

    # Удерживаем скользящее окно истории в пределах последних 12 сообщений, чтобы не перегружать контекст токенов
    context.user_data['chat_history'] = context.user_data['chat_history'][-12:]

    # Включаем статус «Бот печатает...» в Telegram для создания живого эффекта
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")

    try:
        # 4. Отправляем накопленную историю и сгенерированный XML-контекст в наш универсальный сервис
        ai_response_text = await generate_ai_response(
            messages=context.user_data['chat_history'],
            page_context=page_context
        )

        # Добавляем ответ ИИ в историю переписки этого пользователя
        context.user_data['chat_history'].append({"role": "assistant", "content": ai_response_text})

        # 5. Отправляем сформированный ответ пользователю
        await update.message.reply_text(ai_response_text, parse_mode="Markdown")

    except Exception as e:
        logger.error(f"Telegram Bot AI Generation crash: {str(e)}")
        fallback_err = "Сервис временно перегружен запросами. Пожалуйста, попробуйте написать позже." if locale == 'ru' else "Service is temporarily busy. Please try again later."
        await update.message.reply_text(fallback_err)


class Command(BaseCommand):
    help = "Запускает поллинг-демона Telegram-бота ИИ-ассистента BiMark"

    def handle(self, *args, **options):
        # Запускаем асинхронный event-loop для бесконечного цикла бота
        try:
            asyncio.run(self.main())
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("\nБот успешно остановлен."))

    async def main(self):
        # Извлекаем конфигурацию токена при старте воркера
        config = await AssistantConfig.objects.afirst()
        if not config or not config.tg_bot_token:
            self.stdout.write(self.style.ERROR("Критическая ошибка: В админке Django отсутствует Telegram Bot Token!"))
            return

        self.stdout.write(self.style.SUCCESS(f"Запуск ядра Telegram бота на базе модели: {config.model_name}..."))

        # Инициализируем приложение бота
        application = ApplicationBuilder().token(config.tg_bot_token).build()

        # Регистрируем хэндлеры команд и сообщений
        application.add_handler(CommandHandler("start", start_command))
        application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_telegram_message))

        # Начинаем бесконечный опрос серверов Telegram (Polling)
        await application.initialize()
        await application.start()
        await application.updater.start_polling()

        self.stdout.write(self.style.SUCCESS("🤖 Бот успешно запущен и слушает входящие сообщения. Нажмите Ctrl+C для выхода."))
        
        # Держим цикл активным
        while True:
            await asyncio.sleep(3600)