import uuid
from django.core.management.base import BaseCommand
from catalog.models import Category, Project

class Command(BaseCommand):
    help = 'Poblar la base de datos con los proyectos iniciales y sus traducciones'

    def handle(self, *args, **kwargs):
        self.stdout.write("Iniciando la creación de categorías y proyectos...")

        # 1. Crear las Categorías Principales
        cat_youtube, _ = Category.objects.get_or_create(
            slug='youtube',
            defaults={
                'name_ru': 'YouTube Каналы',
                'name_en': 'YouTube Channels',
                'name_es': 'Canales de YouTube',
            }
        )
        cat_social, _ = Category.objects.get_or_create(
            slug='social-media',
            defaults={
                'name_ru': 'Социальные сети',
                'name_en': 'Social Media',
                'name_es': 'Redes Sociales',
            }
        )
        cat_telegram, _ = Category.objects.get_or_create(
            slug='telegram',
            defaults={
                'name_ru': 'Telegram Каналы',
                'name_en': 'Telegram Channels',
                'name_es': 'Canales de Telegram',
            }
        )
        cat_startups, _ = Category.objects.get_or_create(
            slug='it-startups',
            defaults={
                'name_ru': 'IT Стартапы',
                'name_en': 'IT Startups',
                'name_es': 'Startups de TI',
            }
        )

        # 2. Definir los Datos de los Proyectos
        projects_data = [
            {
                'slug': 'mexico-cooking-channel',
                'category': cat_youtube,
                'price_per_share': 99.00,
                'total_shares': 100,  # 1% por share
                'title_ru': 'Мексика: Кулинарный канал (397к подписчиков)',
                'title_en': 'Mexico: Cooking Channel (397k Subscribers)',
                'title_es': 'México: Canal de Cocina (397k Suscriptores)',
                'desc_ru': 'Мексиканский кулинарный канал — 397 000+ подписчиков. Живой, эмоциональный и тёплый проект, ориентированный на женскую аудиторию.\n\nДоход: Стабильный доход за счёт перелива контента на YouTube и сайты. Средняя доходность 5–15% в месяц.\nКак купить: Цена указана за 1% проекта.',
                'desc_en': 'A Mexican culinary channel with over 397,000 subscribers. This is a vibrant and warm project tailored for a female audience.\n\nIncome: Stable revenue from content redistribution to YouTube, affiliate sites, and pay-per-view platforms. Average monthly profitability is 5–15%.\nHow to Buy: Price is for a 1% share.',
                'desc_es': 'Canal culinario mexicano con más de 397,000 suscriptores. Un proyecto cálido y emocional enfocado en el público femenino.\n\nIngresos: Ingresos estables por redistribución de contenido en YouTube y sitios de afiliados. Promedio mensual del 5–15%.\nCómo comprar: El precio es por el 1% del proyecto.'
            },
            {
                'slug': 'argentina-1m-subscribers',
                'category': cat_social,
                'price_per_share': 249.00,
                'total_shares': 100, # 1% por share
                'title_ru': 'Аргентина: 1М+ Подписчиков',
                'title_en': 'Argentina: 1M+ Subscribers',
                'title_es': 'Argentina: 1M+ Suscriptores',
                'desc_ru': 'Аргентинская группа с аудиторией 1 000 000+. Один из самых активных проектов в Латинской Америке.\n\nДоход: Перелив трафика на YouTube, партнерские сайты (Amazon) и игры. 5–15% в месяц от оборота.\nВыплаты: 27 числа каждого месяца.\nКак купить: Цена за 1%.',
                'desc_en': 'An Argentine group with an audience exceeding 1,000,000. One of the most active projects in Latin America.\n\nIncome: Generated through traffic flow to YouTube, gaming platforms, and affiliate sites. Average monthly profitability is 5–15%.\nPayments: Made on the 27th of each month.\nHow to Buy: Price is for a 1% share.',
                'desc_es': 'Grupo argentino con una audiencia superior a 1,000,000. Uno de los proyectos más activos de Latinoamérica.\n\nIngresos: Flujo de tráfico hacia YouTube, sitios de afiliados (Amazon) y juegos. Rentabilidad del 5–15% mensual.\nPagos: El día 27 de cada mes.\nCómo comprar: Precio por el 1%.'
            },
            {
                'slug': 'usa-motivation-quotes',
                'category': cat_youtube,
                'price_per_share': 60.00,
                'total_shares': 1000, # 0.1% por share
                'title_ru': 'США: Мотивация и Цитаты (408к подписчиков)',
                'title_en': 'USA: Motivation & Quotes (408k Subscribers)',
                'title_es': 'EE. UU.: Motivación y Citas (408k Suscriptores)',
                'desc_ru': 'Американский канал с 408,000+ подписчиков, посвященный жизни, мотивации и вдохновению. Мощный охват в США и Канаде.\n\nДоход: Монетизация через YouTube и платформы CPC. ROI: 5–15% в месяц.\nКак купить: Цена за 0.1%.',
                'desc_en': 'An American channel with 408,000+ subscribers focused on life, motivation, and inspiration. Powerful reach in the USA and Canada.\n\nIncome: Monetized via YouTube traffic, affiliate sites, and pay-per-click platforms. ROI: 5–15% per month.\nHow to Buy: Price is for a 0.1% share.',
                'desc_es': 'Canal estadounidense sobre motivación y crecimiento personal. Gran alcance en EE. UU. y Canadá con crecimiento constante.\n\nIngresos: Monetización mediante tráfico a YouTube y plataformas de pago por clic. Rentabilidad: 5–15% mensual.\nCómo comprar: Precio por el 0.1%.'
            },
            {
                'slug': 'usa-movie-animation-reviews',
                'category': cat_youtube,
                'price_per_share': 49.00,
                'total_shares': 1000, # 0.1% por share
                'title_ru': 'США: Обзоры кино и анимации',
                'title_en': 'USA: Movie & Animation Reviews',
                'title_es': 'EE. UU.: Reseñas de Cine y Animación',
                'desc_ru': 'Быстрорастущий канал с динамичными обзорами фильмов и анимации. Активные зрители из США.\n\nДоход: Реклама YouTube, сотрудничество с брендами. Легко масштабируемая ниша.\nКак купить: Цена за 0.1%.',
                'desc_en': 'A fast-growing channel featuring dynamic reviews and recommendations for films and animation. Active US viewers.\n\nIncome: Revenue from YouTube ads, brand collaborations, and content syndication. Highly relevant niche in the US.\nHow to Buy: Price is for a 0.1% share.',
                'desc_es': 'Canal nuevo de rápido crecimiento sobre películas y dibujos animados. Espectadores activos en EE. UU.\n\nIngresos: Publicidad de YouTube, colaboraciones con marcas y sindicación de contenido. Nicho muy relevante.\nCómo comprar: Precio por el 0.1%.'
            },
            {
                'slug': 'usa-professional-channel',
                'category': cat_youtube,
                'price_per_share': 80.00,
                'total_shares': 1000, # 0.1% por share
                'title_ru': 'США: Профессиональный канал (1.1М+ Подписчиков)',
                'title_en': 'USA: Professional Channel (1.1M+ Subscribers)',
                'title_es': 'EE. UU.: Canal Profesional (1.1M+ Suscriptores)',
                'desc_ru': 'Профессиональный канал, готовый к масштабированию.\n\nДоход: Около $100,000 в год. ROI: 5–15% в месяц. Выплаты 27 числа.\nПотенциал: Огромная база подписчиков.\nКак купить: Цена за 0.1%.',
                'desc_en': 'A professional channel ready for scaling through high-quality video content.\n\nIncome: Approaching $100,000 per year through ads, sponsorships, and affiliate programs. ROI: 5–15% per month. Payments on the 27th.\nHow to Buy: Price is for a 0.1% share.',
                'desc_es': 'Canal profesional con una fuerte audiencia en EE. UU.\n\nIngresos: Cerca de $100,000 anuales mediante publicidad y patrocinios. Rentabilidad: 5–15% al mes. Pagos cada día 27.\nCómo comprar: Precio por el 0.1%.'
            },
            {
                'slug': 'telegram-moscow-news',
                'category': cat_telegram,
                'price_per_share': 80.00,
                'total_shares': 1000, # 0.1% por share
                'title_ru': 'Telegram: Новости Москвы (49к Подписчиков)',
                'title_en': 'Telegram: Moscow News (49k Subscribers)',
                'title_es': 'Telegram: Noticias de Moscú (49k Suscriptores)',
                'desc_ru': 'Стабильный городской канал, освещающий события, политику и жизнь Москвы.\n\nАудитория: Преимущественно жители Москвы с высокой вовлеченностью. Стабильный доход от нативных интеграций.\nКак купить: Цена за 0.1%.',
                'desc_en': 'A stable city channel covering events, politics, and urban life in Moscow.\n\nAudience: Predominantly Moscow residents with high engagement. Consistent revenue from native integrations.\nHow to Buy: Price is for a 0.1% share.',
                'desc_es': 'Canal estable sobre la vida urbana, política y sucesos en Moscú.\n\nAudiencia: Residentes de la capital con alta interacción. Ingresos constantes por publicidad nativa e integraciones.\nCómo comprar: Precio por el 0.1%.'
            },
            {
                'slug': 'usa-facebook-group-quotes',
                'category': cat_social,
                'price_per_share': 15000.00,
                'total_shares': 1, # Proyecto completo
                'title_ru': 'США: Группа Facebook (Цитаты)',
                'title_en': 'USA: Facebook Group (Quotes)',
                'title_es': 'EE. UU.: Grupo de Facebook (Citas)',
                'desc_ru': 'Группа с высокой активностью и целевой аудиторией из США.\n\nДоход: $1,500–$3,000 в месяц. Управление доступно за 30% от дохода. Окупаемость: 5–10 месяцев.\nКак купить: Готовый проект целиком (1 доля).',
                'desc_en': 'A high-activity group with a US target audience.\n\nRevenue: Projected at $1,500–$3,000 per month. Management team is available for 30% of the income. Payback: 5–10 months.\nHow to Buy: Full project acquisition (1 share).',
                'desc_es': 'Grupo de alta actividad con audiencia en EE. UU.\n\nIngresos: Estimados entre $1,500 y $3,000 al mes. Equipo disponible para administrar el grupo por el 30% de los ingresos. Recuperación: 5–10 meses.\nCómo comprar: Proyecto completo (1 participación).'
            },
            {
                'slug': 'eduzon-international',
                'category': cat_startups,
                'price_per_share': 50000.00,
                'total_shares': 1, # Proyecto completo
                'title_ru': 'Международный образовательный проект: Eduzon.org',
                'title_en': 'International Educational Project: Eduzon.org',
                'title_es': 'Proyecto Educativo Internacional: Eduzon.org',
                'desc_ru': 'Глобальная платформа, работающая с 2018 года для поступления в университеты и онлайн-обучения.\n\nДоход: Ожидается от $10,000 в месяц. Профессиональная команда готова управлять платформой. Окупаемость: Менее 6 месяцев.\nКак купить: Готовый проект целиком.',
                'desc_en': 'A global platform active since 2018 for university applications and online learning.\n\nIncome: Projected from $10,000 per month through subscriptions and services. Professional team ready to manage the platform. Payback: Less than 6 months.\nHow to Buy: Full project acquisition.',
                'desc_es': 'Plataforma global activa desde 2018 para admisiones universitarias y cursos online.\n\nIngresos: Esperados desde $10,000 al mes. Equipo listo para operar la plataforma. Recuperación: Menos de 6 meses.\nCómo comprar: Proyecto completo.'
            },
            {
                'slug': 'germany-psychology-channel',
                'category': cat_youtube,
                'price_per_share': 17000.00,
                'total_shares': 1, # Proyecto completo
                'title_ru': 'Германия: Канал о психологии и философии',
                'title_en': 'Germany: Psychology & Philosophy Channel',
                'title_es': 'Alemania: Canal de Psicología y Filosofía',
                'desc_ru': 'Немецкий YouTube канал о психологии и самопознании с доходом +1000$ в месяц.\n\nМонетизация: 9-10$ за 1000 просмотров. Опытная команда включена для продолжения работы.\nКак купить: Готовый проект целиком.',
                'desc_en': 'A German YouTube channel with income exceeding $1,000 per month.\n\nMonetization: High CPM of $9–$10 per 1,000 views. Experienced team included for seamless scaling.\nHow to Buy: Full project acquisition.',
                'desc_es': 'Canal de YouTube alemán con ingresos superiores a $1,000 mensuales.\n\nMonetización: CPM alto de $9–$10 por cada 1,000 vistas. Incluye equipo experimentado.\nCómo comprar: Proyecto completo.'
            }
        ]

        # 3. Insertar a la Base de Datos
        for p in projects_data:
            proj, created = Project.objects.update_or_create(
                slug=p['slug'],
                defaults={
                    'category': p['category'],
                    'price_per_share': p['price_per_share'],
                    'total_shares': p['total_shares'],
                    'available_shares': p['total_shares'], # Asumimos que inicialmente todas están disponibles
                    'status': 'ACTIVE',
                    'title_ru': p['title_ru'],
                    'title_en': p['title_en'],
                    'title_es': p['title_es'],
                    'description_ru': p['desc_ru'],
                    'description_en': p['desc_en'],
                    'description_es': p['desc_es'],
                    'is_new': True,
                    'is_hidden': False
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Proyecto creado: {p['title_en']}"))
            else:
                self.stdout.write(self.style.WARNING(f"🔄 Proyecto actualizado: {p['title_en']}"))

        self.stdout.write(self.style.SUCCESS("¡Comando finalizado! La base de datos ha sido poblada con éxito con todas las traducciones."))