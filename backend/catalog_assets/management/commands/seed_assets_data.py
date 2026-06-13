from django.core.management.base import BaseCommand
from catalog_assets.models import AssetCategory, AssetTag, MetricDefinition #[cite: 14]

class Command(BaseCommand):
    help = "Наполнение базы данных стартовыми категориями, тегами и DD-метриками для ассетов"

    def handle(self, *args, **options):
        self.stdout.write(self.style.MUTE("Начало сидирования метаданных маркетплейса..."))

        # =========================================================================
        # 1. СИДИРОВАНИЕ КАТЕГОРИЙ (AssetCategory)
        # =========================================================================
        categories = [
            {
                "slug": "telegram-networks",
                "name": "Telegram-каналы и сети",
                "name_ru": "Telegram-каналы и сети",
                "name_en": "Telegram Channels & Networks",
                "name_es": "Canales y redes de Telegram"
            },
            {
                "slug": "youtube-channels",
                "name": "YouTube-каналы",
                "name_ru": "YouTube-каналы",
                "name_en": "YouTube Channels",
                "name_es": "Canales de YouTube"
            },
            {
                "slug": "micro-saas-apps",
                "name": "Микро-SaaS и веб-приложения",
                "name_ru": "Микро-SaaS и веб-приложения",
                "name_en": "Micro-SaaS & Web Apps",
                "name_es": "Micro-SaaS y aplicaciones web"
            },
            {
                "slug": "ai-tools-bots",
                "name": "AI-сервисы и боты",
                "name_ru": "AI-сервисы и боты",
                "name_en": "AI Tools & Bots",
                "name_es": "Herramientas de IA y bots"
            },
            {
                "slug": "content-blogs",
                "name": "Контентные сайты и блоги",
                "name_ru": "Контентные сайты и блоги",
                "name_en": "Content Websites & Blogs",
                "name_es": "Sitios web de contenido y blogs"
            },
            {
                "slug": "e-commerce",
                "name": "Электронная коммерция",
                "name_ru": "Электронная коммерция",
                "name_en": "E-commerce & Marketplaces",
                "name_es": "Comercio electrónico y mercados"
            },
            {
                "slug": "mobile-applications",
                "name": "Мобильные приложения",
                "name_ru": "Мобильные приложения",
                "name_en": "Mobile Applications",
                "name_es": "Aplicaciones móviles"
            },
            {
                "slug": "newsletters-substacks",
                "name": "Email-рассылки и блоги Substack",
                "name_ru": "Email-рассылки и блоги Substack",
                "name_en": "Newsletters & Substacks",
                "name_es": "Boletines informativos y Substacks"
            },
            {
                "slug": "social-media-assets",
                "name": "Медиа-активы соцсетей",
                "name_ru": "Медиа-активы соцсетей",
                "name_en": "Social Media Assets",
                "name_es": "Activos de redes sociales"
            },
            {
                "slug": "digital-agencies",
                "name": "Цифровые агентства и сервисы",
                "name_ru": "Цифровые агентства и сервисы",
                "name_en": "Digital Agencies & Services",
                "name_es": "Agencias y servicios digitales"
            }
        ]

        cat_count = 0
        for cat_data in categories:
            obj, created = AssetCategory.objects.update_or_create(
                slug=cat_data["slug"],
                defaults=cat_data
            ) #[cite: 14]
            if created:
                cat_count += 1

        self.stdout.write(self.style.SUCCESS(f"✔ Категории успешно обновлены. Создано новых: {cat_count}"))

        # =========================================================================
        # 2. СИДИРОВАНИЕ ТЕГОВ (AssetTag)
        # =========================================================================
        tags = [
            {
                "slug": "high-roi", "color": "#10B981", "show_on_card": True,
                "name": "Высокий ROI", "name_ru": "Высокий ROI", "name_en": "High ROI", "name_es": "Alto ROI"
            },
            {
                "slug": "passive-income", "color": "#3B82F6", "show_on_card": True,
                "name": "Пассивный доход", "name_ru": "Пассивный доход", "name_en": "Passive Income", "name_es": "Ingresos pasivos"
            },
            {
                "slug": "verified-profit", "color": "#8B5CF6", "show_on_card": True,
                "name": "Верифицированная прибыль", "name_ru": "Верифицированная прибыль", "name_en": "Verified Profit", "name_es": "Ganancia verificada"
            },
            {
                "slug": "quick-payback", "color": "#F59E0B", "show_on_card": True,
                "name": "Быстрая окупаемость", "name_ru": "Быстрая окупаемость", "name_en": "Quick Payback", "name_es": "Retorno rápido"
            },
            {
                "slug": "growth-potential", "color": "#6366F1", "show_on_card": True,
                "name": "Потенциал роста", "name_ru": "Потенциал роста", "name_en": "Growth Potential", "name_es": "Potencial de crecimiento"
            },
            {
                "slug": "fully-automated", "color": "#06B6D4", "show_on_card": True,
                "name": "Полностью автоматизирован", "name_ru": "Полностью автоматизирован", "name_en": "Fully Automated", "name_es": "Totalmente automatizado"
            },
            {
                "slug": "audited-asset", "color": "#059669", "show_on_card": True,
                "name": "Проверен аудитом", "name_ru": "Проверен аудитом", "name_en": "Audited Asset", "name_es": "Activo auditado"
            },
            {
                "slug": "exclusive-deal", "color": "#D97706", "show_on_card": True,
                "name": "Эксклюзив", "name_ru": "Эксклюзив", "name_en": "Exclusive Deal", "name_es": "Exclusivo"
            },
            {
                "slug": "organic-traffic", "color": "#14B8A6", "show_on_card": True,
                "name": "Органический трафик", "name_ru": "Органический трафик", "name_en": "Organic Traffic", "name_es": "Tráfico orgánico"
            },
            {
                "slug": "price-drop", "color": "#EF4444", "show_on_card": True,
                "name": "Снижение цены", "name_ru": "Снижение цены", "name_en": "Price Drop", "name_es": "Rebaja de precio"
            }
        ]

        tag_count = 0
        for tag_data in tags:
            obj, created = AssetTag.objects.update_or_create(
                slug=tag_data["slug"],
                defaults=tag_data
            ) #[cite: 14]
            if created:
                tag_count += 1

        self.stdout.write(self.style.SUCCESS(f"✔ Маркетинговые теги успешно обновлены. Создано новых: {tag_count}"))

        # =========================================================================
        # 3. СИДИРОВАНИЕ ОПРЕДЕЛЕНИЙ МЕТРИК (MetricDefinition)
        # =========================================================================
        metrics = [
            {
                "order": 10, "icon": "DollarSign", "show_on_card": True,
                "name": "Чистая прибыль в месяц", "name_ru": "Чистая прибыль в месяц", "name_en": "Monthly Net Profit", "name_es": "Beneficio neto mensual"
            },
            {
                "order": 20, "icon": "TrendingUp", "show_on_card": True,
                "name": "Месячный оборот", "name_ru": "Месячный оборот", "name_en": "Monthly Revenue", "name_es": "Ingresos mensuales"
            },
            {
                "order": 30, "icon": "ArrowDownRight", "show_on_card": True,
                "name": "Ежемесячные расходы", "name_ru": "Ежемесячные расходы", "name_en": "Monthly Expenses", "name_es": "Gastos mensuales"
            },
            {
                "order": 40, "icon": "Calendar", "show_on_card": True,
                "name": "Срок окупаемости", "name_ru": "Срок окупаемости", "name_en": "Payback Period", "name_es": "Período de retorno"
            },
            {
                "order": 50, "icon": "Users", "show_on_card": True,
                "name": "Общая аудитория", "name_ru": "Общая аудитория / Пользователи", "name_en": "Total Audience / Users", "name_es": "Audiencia total / Usuarios"
            },
            {
                "order": 60, "icon": "Activity", "show_on_card": True,
                "name": "Уровень вовлеченности (ER)", "name_ru": "Уровень вовлеченности (ER)", "name_en": "Engagement Rate (ER)", "name_es": "Tasa de interacción (ER)"
            },
            {
                "order": 70, "icon": "Clock", "show_on_card": False,
                "name": "Возраст актива", "name_ru": "Возраст актива", "name_en": "Asset Age", "name_es": "Antigüedad del activo"
            },
            {
                "order": 80, "icon": "Globe", "show_on_card": False,
                "name": "Источник трафика", "name_ru": "Источник трафика", "name_en": "Traffic Source", "name_es": "Fuente de tráfico"
            },
            {
                "order": 90, "icon": "Hourglass", "show_on_card": False,
                "name": "Затраты времени в неделю", "name_ru": "Затраты времени в неделю", "name_en": "Time Commitment", "name_es": "Tiempo requerido por semana"
            },
            {
                "order": 100, "icon": "CreditCard", "show_on_card": False,
                "name": "Способ монетизации", "name_ru": "Способ монетизации", "name_en": "Primary Monetization", "name_es": "Monetización principal"
            }
        ]

        metric_count = 0
        for metric_data in metrics:
            # Так как у MetricDefinition нет слага, уникальным идентификатором выступает порядок сортировки order
            obj, created = MetricDefinition.objects.update_or_create(
                order=metric_data["order"],
                defaults=metric_data
            ) #[cite: 14]
            if created:
                metric_count += 1

        self.stdout.write(self.style.SUCCESS(f"✔ Определения DD-метрик успешно обновлены. Создано новых: {metric_count}"))
        self.stdout.write(self.style.SUCCESS("🎉 База данных BiMark успешно сидирована необходимыми метаданными!"))