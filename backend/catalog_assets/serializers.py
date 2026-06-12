# catalog_assets/serializers.py
from rest_framework import serializers
from .models import Asset, AssetCategory, AssetTag, AssetMetricValue, AssetOwnership

class AssetCategorySerializer(serializers.ModelSerializer):
    """Сериализатор категорий уникальных ассетов с поддержкой локализации"""
    name = serializers.SerializerMethodField()

    class Meta:
        model = AssetCategory
        fields = ['id', 'name', 'slug', 'image', 'is_hidden']

    def get_name(self, obj):
        return {
            'ru': getattr(obj, 'name_ru', obj.name),
            'en': getattr(obj, 'name_en', obj.name),
            'es': getattr(obj, 'name_es', obj.name),
        }


class AssetTagSerializer(serializers.ModelSerializer):
    """Сериализатор динамических тегов"""
    name = serializers.SerializerMethodField()

    class Meta:
        model = AssetTag
        fields = ['id', 'name', 'slug', 'color', 'show_on_card']

    def get_name(self, obj):
        return {
            'ru': getattr(obj, 'name_ru', obj.name),
            'en': getattr(obj, 'name_en', obj.name),
            'es': getattr(obj, 'name_es', obj.name),
        }


class AssetMetricValueSerializer(serializers.ModelSerializer):
    """Сериализатор строк Due Diligence (EAV-паттерн)"""
    metric_name = serializers.SerializerMethodField()
    icon = serializers.CharField(source='metric.icon', read_only=True)
    show_on_card = serializers.BooleanField(source='metric.show_on_card', read_only=True)
    value = serializers.SerializerMethodField()

    class Meta:
        model = AssetMetricValue
        fields = ['metric_name', 'icon', 'show_on_card', 'value']

    def get_metric_name(self, obj):
        return {
            'ru': getattr(obj.metric, 'name_ru', obj.metric.name),
            'en': getattr(obj.metric, 'name_en', obj.metric.name),
            'es': getattr(obj.metric, 'name_es', obj.metric.name),
        }

    def get_value(self, obj):
        return {
            'ru': getattr(obj, 'value_ru', obj.value),
            'en': getattr(obj, 'value_en', obj.value),
            'es': getattr(obj, 'value_es', obj.value),
        }


class AssetListSerializer(serializers.ModelSerializer):
    """Сериализатор для витрины каталога (Облегченный контент + фильтрация по show_on_card)"""
    title = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    category = AssetCategorySerializer(read_only=True)
    tags = serializers.SerializerMethodField()
    metrics = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'id', 'title', 'short_description', 'description', 'price', 'image', 
            'is_unique', 'is_new', 'is_hidden', 'status', 'created_at',
            'category', 'tags', 'metrics'
        ]

    def get_title(self, obj):
        return {
            'ru': getattr(obj, 'title_ru', obj.title),
            'en': getattr(obj, 'title_en', obj.title),
            'es': getattr(obj, 'title_es', obj.title),
        }
    
    def get_short_description(self, obj):
        return {
            'ru': getattr(obj, 'short_description_ru', obj.short_description),
            'en': getattr(obj, 'short_description_en', obj.short_description),
            'es': getattr(obj, 'short_description_es', obj.short_description),
        }

    def get_description(self, obj):
        return {
            'ru': getattr(obj, 'description_ru', obj.description),
            'en': getattr(obj, 'description_en', obj.description),
            'es': getattr(obj, 'description_es', obj.description),
        }

    def get_image(self, obj):
        request = self.context.get('request')
        def get_img_url(img_field):
            if img_field and getattr(img_field, 'name', None):
                url = img_field.url
                return request.build_absolute_uri(url) if request else url
            return None
        img_ru = get_img_url(getattr(obj, 'image_ru', None))
        img_en = get_img_url(getattr(obj, 'image_en', None))
        img_es = get_img_url(getattr(obj, 'image_es', None))
        img_default = get_img_url(obj.image)
        fallback = img_en or img_default or img_ru or img_es
        return {'ru': img_ru or fallback, 'en': img_en or fallback, 'es': img_es or fallback}

    def get_tags(self, obj):
        # Отбираем только теги с флагом show_on_card=True
        card_tags = [tag for tag in obj.tags.all() if tag.show_on_card]
        return AssetTagSerializer(card_tags, many=True, context=self.context).data

    def get_metrics(self, obj):
        # Отбираем только метрики Due Diligence с флагом show_on_card=True
        card_metrics = [mv for mv in obj.metric_values.all() if mv.metric.show_on_card]
        return AssetMetricValueSerializer(card_metrics, many=True, context=self.context).data


class AssetDetailSerializer(AssetListSerializer):
    """Сериализатор для страницы товара (Отдает ПОЛНЫЙ массив тегов и Due Diligence параметров)"""
    tags = AssetTagSerializer(many=True, read_only=True)
    metrics = AssetMetricValueSerializer(source='metric_values', many=True, read_only=True)


class AssetOwnershipSerializer(serializers.ModelSerializer):
    """Журнал владения активами для личного кабинета (Сохранен без изменений)"""
    asset = AssetListSerializer(read_only=True)

    class Meta:
        model = AssetOwnership
        fields = ['id', 'asset', 'purchase_price', 'purchased_at']