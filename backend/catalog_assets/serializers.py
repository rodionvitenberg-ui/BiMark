# catalog_assets/serializers.py
from rest_framework import serializers
from .models import Asset, AssetOwnership

class AssetSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'id', 'title', 'description', 'price', 'image', 
            'is_unique', 'status', 'created_at'
        ]

    def get_title(self, obj):
        return {
            'ru': getattr(obj, 'title_ru', obj.title),
            'en': getattr(obj, 'title_en', obj.title),
            'es': getattr(obj, 'title_es', obj.title),
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

        return {
            'ru': img_ru or fallback,
            'en': img_en or fallback,
            'es': img_es or fallback,
        }

class AssetOwnershipSerializer(serializers.ModelSerializer):
    asset = AssetSerializer(read_only=True)
    
    class Meta:
        model = AssetOwnership
        fields = ['id', 'asset', 'purchase_price', 'purchased_at']