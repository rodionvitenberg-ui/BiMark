from django.core.management.base import BaseCommand
from cms.models import Article

class Command(BaseCommand):
    help = "Наполняет базу данных тестовыми SEO/GEO статьями на базе библейских текстов"

    def handle(self, *args, **options):
        self.stdout.write("Начало сидинга тестовых статей...")

        # --- СТАТЬЯ 1: НА РУССКОМ (Екклесиаст, Глава 3) ---
        # Краткое описание: ~125 слов
        ru_short = (
            "Книга Екклесиаста, традиционно приписываемая мудрому царю Соломону, на протяжении "
            "многих веков остается одним из самых глубоких философских трактатов в истории человечества. "
            "В третьей главе этого древнего текста излагается монументальная концепция времени, которая "
            "удивительным образом перекликается с принципами современного стратегического планирования, "
            "управления рисками и инвестиционного менеджмента. Соломон утверждает, что всему свой час, "
            "и у каждого коммерческого или жизненного начинания под небом есть свой определенный период. "
            "Для современных предпринимателей, приобретающих готовые цифровые бизнесы, медиа-активы или SaaS-платформы "
            "через гарант-сервисы, эта древняя истина служит суровым напоминанием о важности точного выбора момента "
            "входа в сделку. Понимание глобальных циклов рынка, периодов накопления капитала и моментов для "
            "решительных шагов полностью определяет долгосрочный успех и выживание любого масштабного предприятия "
            "в современной изменчивой экосистеме."
        )

        # Полный текст: ~500 слов (смесь канонического текста и аналитического комментария)
        ru_content = """
        <p>Всему свое время, и время всякой вещи под небом: время рождаться, и время умирать; время насаждать, и время вырывать насаженное; время убивать, и время врачевать; время разрушать, и время строить; время плакать, и время смеяться; время сетовать, и время плясать; время разбрасывать камни, и время собирать камни; время обнимать, и время уклоняться от объятий; время искать, и время терять; время сберегать, и время бросать; время раздирать, и время сшивать; время молчать, и время говорить; время любить, и время ненавидеть; время войне, и время миру.</p>
        
        <p>Этот великий отрывок из ветхозаветного писания ставит перед исследователями глубокие вопросы о природе человеческой деятельности. Что пользы работающему от того, над чем он трудится? Мудрец ясно видит, что все заботы, которые Бог дал сынам человеческим, предназначены для их смирения и познания границ собственных возможностей. Познание времени — это высшая форма человеческой мудрости. В контексте современной экономической мысли, эти строки могут быть истолкованы как базовая теория рыночных циклов. Каждый инвестор знает, что за периодом бурного роста неизбежно следует экономический спад, а за разрушением старых технологических укладов — созидание инновационных цифровых платформ.</p>
        
        <p>Соломон продолжает свои размышления, указывая на то, что Бог сделал все прекрасным в свое время, и даже вложил вечность в сердце человека, хотя человек никогда не сможет до конца постичь все дела, которые Бог творит от начала и до конца. Это ограничение человеческого разума подчеркивает важность смирения перед лицом неопределенности. В мире высоких технологий и цифрового брокериджа, где активы переходят из рук в руки за считанные часы, понимание долгосрочных трендов становится главным конкурентным преимуществом. Мудрый покупатель не ищет сиюминутной выгоды, он смотрит на вечные законы спроса и предложения, заложенные в структуру общества.</p>
        
        <p>Я познал, говорит Екклесиаст, что нет для человека ничего лучшего, как веселиться и делать доброе в жизни своей. И если какой человек ест и пьет, и видит благо во всяком труде своем, то это — дар Божий. Таким образом, истинная цель любого труда и приобретения заключается не в накоплении тлена, а в обретении внутренней гармонии и радости от созидания. Все, что делает Бог, пребывает вовек; к тому нечего прибавлять и от того нечего убавлять. Древний текст учит нас смотреть на бизнес не как на хаотичную гонку, а как на упорядоченный процесс, где справедливость, безопасность и законность играют первостепенную роль.</p>
        
        <p>В завершение главы мудрец напоминает о неизбежном суде времени над всеми делами человеческими: и праведного, и нечестивого будет судить Бог, потому что время для всякой вещи и о всяком деле там. Это фундаментальное основание для построения честных, прозрачных и защищенных взаимоотношений между партнерами. Платформа BiMark, отказываясь от спекулятивных механик в пользу верифицированных сделок эскроу, следует именно этому принципу — созиданию долгосрочной ценности, неподвластной временным кризисам и потрясениям.</p>
        """

        # --- СТАТЬЯ 2: НА АНГЛИЙСКОМ (Genesis, Глава 1) ---
        # Краткое описание: ~125 слов
        en_short = (
            "The opening chapter of the Book of Genesis provides a foundational narrative of creation "
            "that has thoroughly shaped global culture, philosophy, and legal frameworks for millennia. "
            "Describing the methodical, step-by-step transformation of dark cosmos out of complete chaos, "
            "this classic text strongly emphasizes sequence, logical structure, and validation at every stage. "
            "For modern technology founders, enterprise software buyers, and strategic digital business investors, "
            "this systematic creation model serves as an excellent conceptual blueprint. Before deploying capital "
            "into turnkey software platforms or verified media channels, performing architectural due diligence "
            "and parsing baseline meta-data is strictly paramount. This analytical article explores how ancient "
            "philosophical ideas directly parallel contemporary web development frameworks, illustrating that building "
            "sustainable online empires always requires a deliberate strategic vision, secure transfer guidelines, "
            "and a thorough qualitative evaluation of assets."
        )

        # Полный текст: ~500 слов
        en_content = """
        <p>In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters. And God said, Let there be light: and there was light. And God saw the light, that it was good: and God divided the light from the darkness. And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.</p>
        
        <p>This magnificent opening of ancient scripture lays down the primary law of any successful architecture: the transition from initial chaos to absolute structural order. Every single step of the creation framework is deliberate, distinct, and metrics-driven. Light is separated from darkness, waters are divided from the sky, and dry land is gathered to form a stable foundation. For an investor analyzing a digital startup or a high-ticket software company, this step-by-step model represents the ideal validation process. A business cannot function successfully if its underlying database, traffic sources, and operational legal rights are mixed in a chaotic structure. True value is generated only when every component is safely isolated, verified, and put into its correct operational place.</p>
        
        <p>And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so. And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good. And the evening and the morning were the third day. Here we see the introduction of the principle of organic scalability and self-sustainability. A premier cash-flowing asset must contain its own driving mechanism for growth, much like a seed within a tree. Media networks or automated SaaS platforms are highly valued precisely because they generate predictable compound yield without requiring constant emergency manual interventions from the administration.</p>
        
        <p>Furthermore, the repetitive phrase "and God saw that it was good" serves as the ancient world's ultimate quality assurance protocol. Creation is never left unmonitored; every phase undergoes immediate strict evaluation against absolute standards of excellence before moving to the next level of development. In modern digital M&A and corporate brokerage, this mirrors the rigid escrow and technical verification routines. Rights to domain names, operational repositories, and secure owner profiles must be thoroughly audited, held in safe custody, and confirmed as completely flawless prior to the final release of corporate funds to the seller party.</p>
        
        <p>Ultimately, order triumphs over the void, resulting in a perfectly balanced ecosystem capable of hosting advanced life and sustaining economic value. The BiMark platform applies these timeless universal standards to the international digital business market. By eliminating fragmented fraction mechanics and focusing strictly on the wholesale transfer of entire operational enterprises in one piece, the platform establishes a clean, structured, and highly reliable environment where global buyers can acquire verified digital equity with absolute transactional peace of mind.</p>
        """

        # 2. Сохраняем в PostgreSQL (с защитой от дублирования по slug)
        Article.objects.update_or_create(
            slug="vremya-dlya-kazhdoj-veshchi",
            defaults={
                "title": "Время для каждой вещи под небом: Мудрость Екклесиаста для инвестора",
                "locale": Article.LocaleChoices.RU,
                "short_description": ru_short,
                "content": ru_content,
                "is_published": True
            }
        )

        Article.objects.update_or_create(
            slug="architecture-of-creation-genesis-insights",
            defaults={
                "title": "The Architecture of Creation: Genesis Insights into Building Digital Ecosystems",
                "locale": Article.LocaleChoices.EN,
                "short_description": en_short,
                "content": en_content,
                "is_published": True
            }
        )

        self.stdout.write(self.style.SUCCESS("🎉 Тестовые статьи успешно внедрены в базу данных!"))