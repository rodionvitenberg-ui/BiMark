# catalog_assets/views.py
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Asset, AssetOwnership
from .serializers import AssetSerializer, AssetOwnershipSerializer

class AssetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Витрина активов (проектов целиком).
    """
    serializer_class = AssetSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
    
    # Подключаем бэкенд фильтрации и указываем доступные поля
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'is_unique', 'is_new', 'is_hidden']

    def get_queryset(self):
        qs = Asset.objects.all()
        
        if self.action == 'list':
            # На витрине не показываем:
            # 1. Черновики
            # 2. Проданные уникальные активы
            # 3. СКРЫТЫЕ активы (is_hidden=True)
            return qs.exclude(status=Asset.Status.DRAFT) \
                     .exclude(is_unique=True, status=Asset.Status.SOLD) \
                     .exclude(is_hidden=True)
                     
        return qs
class AssetPortfolioView(views.APIView):
    """
    Купленные активы пользователя (для дашборда).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        portfolio = AssetOwnership.objects.filter(user=request.user).select_related('asset')
        serializer = AssetOwnershipSerializer(portfolio, many=True, context={'request': request})
        return Response(serializer.data)