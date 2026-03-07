from rest_framework import serializers
from catalog.models import Project, Ownership, Category

class CategorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'slug', 'name', 'image']

    def get_name(self, obj):
        return {
            'ru': getattr(obj, 'name_ru', obj.name),
            'en': getattr(obj, 'name_en', obj.name),
            'es': getattr(obj, 'name_es', obj.name),
        }

class ProjectSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Project
        # ДОБАВЛЕНО: 'image', 'category'
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

class OwnershipSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    
    class Meta:
        model = Ownership
        fields = ['id', 'project', 'shares_amount', 'average_buy_price', 'created_at']