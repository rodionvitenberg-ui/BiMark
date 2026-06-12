# catalog_assets/views.py
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Asset, AssetCategory, AssetOwnership
from .serializers import (
    AssetListSerializer, 
    AssetDetailSerializer, 
    AssetCategorySerializer, 
    AssetOwnershipSerializer
)

class AssetCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Эндпоинт для получения списка категорий уникальных бизнесов.
    Необходим для построения фильтров каталога на фронтенде.
    """
    queryset = AssetCategory.objects.filter(is_hidden=False)
    serializer_class = AssetCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class AssetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Оптимизированная витрина цифровых активов (проектов целиком).
    """
    permission_classes = [AllowAny]
    lookup_field = 'id'
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'category', 'is_unique', 'is_new', 'is_hidden']

    def get_serializer_class(self):
        # Динамически переключаем вес JSON-пакета
        if self.action == 'retrieve':
            return AssetDetailSerializer
        return AssetListSerializer

    def get_queryset(self):
        # Убиваем N+1: вытягиваем категорию, теги и мультиязычные метрики DD ОДНИМ SQL-запросом
        qs = Asset.objects.select_related('category') \
                          .prefetch_related('tags', 'metric_values__metric')
        
        if self.action == 'list':
            # Логика фильтрации витрины полностью сохранена
            return qs.exclude(status=Asset.Status.DRAFT) \
                     .exclude(is_unique=True, status=Asset.Status.SOLD) \
                     .exclude(is_hidden=True)
                     
        return qs


class AssetPortfolioView(views.APIView):
    """
    Купленные активы пользователя (для дашборда/портфеля).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        portfolio = AssetOwnership.objects.filter(user=request.user) \
                                         .select_related('asset__category') \
                                         .prefetch_related('asset__tags', 'asset__metric_values__metric')
        serializer = AssetOwnershipSerializer(portfolio, many=True, context={'request': request})
        return Response(serializer.data)