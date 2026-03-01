from rest_framework import serializers
from catalog.models import Project, Ownership, Category

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'description', 
            'price_per_share', 'total_shares', 'available_shares', 
            'status', 'created_at'
        ]
        # Отдаем фронтенду только для чтения
        read_only_fields = fields

class OwnershipSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    
    class Meta:
        model = Ownership
        fields = ['id', 'project', 'shares_amount', 'average_buy_price', 'created_at']

class ProjectSerializer(serializers.ModelSerializer):
    # Кастомные поля для группировки переводов
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'slug', 'title', 'description', 
            'price_per_share', 'total_shares', 'available_shares', 
            'status', 'created_at'
        ]
        read_only_fields = fields

    def get_title(self, obj):
        return {
            'ru': obj.title_ru,
            'en': obj.title_en,
            'es': obj.title_es,
        }

    def get_description(self, obj):
        return {
            'ru': obj.description_ru,
            'en': obj.description_en,
            'es': obj.description_es,
        }
    
class CategorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'slug', 'name', 'image']

    def get_name(self, obj):
        # Аналогично твоему подходу с переводами проектов
        return {
            'ru': getattr(obj, 'name_ru', obj.name),
            'en': getattr(obj, 'name_en', obj.name),
            'es': getattr(obj, 'name_es', obj.name),
        }

class ProjectSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True) # Вкладываем категорию
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'slug', 'title', 'description', 'category', 'image',
            'price_per_share', 'total_shares', 'available_shares', 
            'status', 'created_at'
        ]
        read_only_fields = fields

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