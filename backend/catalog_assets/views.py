# catalog_assets/views.py
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

    def get_queryset(self):
        qs = Asset.objects.all()
        if self.action == 'list':
            # На витрине не показываем черновики и проданные уникальные активы
            return qs.exclude(status=Asset.Status.DRAFT).exclude(is_unique=True, status=Asset.Status.SOLD)
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