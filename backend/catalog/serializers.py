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
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Project
        # ДОБАВЛЕНО: 'image', 'category'
        fields = [
            'id', 'slug', 'title', 'short_description', 'description', 'category', 'image',
            'price_per_share', 'total_shares', 'available_shares', 
            'status', 'created_at', 'is_token'
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
    
    def get_short_description(self, obj):
        return {
            'ru': getattr(obj, 'short_description_ru', obj.short_description),
            'en': getattr(obj, 'short_description_en', obj.short_description),
            'es': getattr(obj, 'short_description_es', obj.short_description),
        }

class OwnershipSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    
    class Meta:
        model = Ownership
        fields = ['id', 'project', 'shares_amount', 'average_buy_price', 'created_at']

class BuySharesSerializer(serializers.Serializer):
    shares_to_buy = serializers.IntegerField(min_value=1)
    payment_method = serializers.ChoiceField(
        choices=['BALANCE', 'STRIPE', 'PAYPAL', 'TRIPLEA'], 
        default='BALANCE'
    )

class CartItemSerializer(serializers.Serializer):
    project_id = serializers.UUIDField()
    shares_amount = serializers.IntegerField(min_value=1)

class CheckoutSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True, allow_empty=False)
    payment_method = serializers.ChoiceField(choices=['BALANCE', 'STRIPE', 'PAYPAL', 'TRIPLEA'])