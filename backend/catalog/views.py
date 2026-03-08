from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import ValidationError

from catalog.models import Project, Ownership, Category
from catalog.serializers import ProjectSerializer, OwnershipSerializer, CategorySerializer, BuySharesSerializer
from catalog.services import PurchaseService, NotEnoughShares
from billing.exceptions import InsufficientFunds

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Каталог проектов: список и деталка.
    Доступен всем (даже неавторизованным, чтобы Next.js мог рендерить лендинг).
    """
    queryset = Project.objects.filter(status__in=[Project.Status.PRESALE, Project.Status.ACTIVE])
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug' # Искать будем по slug (например, /api/projects/youtube-channel/)

class PortfolioView(views.APIView):
    """
    Портфель пользователя.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        portfolio = Ownership.objects.filter(user=request.user).select_related('project')
        serializer = OwnershipSerializer(portfolio, many=True)
        return Response(serializer.data)

class CheckoutView(views.APIView):
    """
    Эндпоинт для оплаты корзины.
    Ожидает JSON: 
    {
        "payment_method": "BALANCE", 
        "items": [
            {"project_id": "uuid-1", "shares_amount": 5},
            {"project_id": "uuid-2", "shares_amount": 10}
        ]
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items = serializer.validated_data['items']
        payment_method = serializer.validated_data['payment_method']

        try:
            result = PurchaseService.process_checkout(
                user=request.user,
                items=items,
                payment_method=payment_method
            )
            return Response(result, status=status.HTTP_200_OK)

        except NotEnoughShares as e:
            return Response({"detail": str(e), "code": "NOT_ENOUGH_SHARES"}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            error_msg = list(e)[0] if hasattr(e, '__iter__') else str(e)
            return Response({"detail": error_msg}, status=status.HTTP_400_BAD_REQUEST)
        except InsufficientFunds as e:
            return Response({"detail": str(e)}, status=status.HTTP_402_PAYMENT_REQUIRED)
        except Exception as e:
            # Для отладки можно временно вывести str(e)
            return Response({"detail": "Внутренняя ошибка сервера."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Category.objects.all() # Или .filter(is_active=True), если у тебя есть такой статус
        
        # Если это запрос списка (каталог) - прячем скрытые
        if self.action == 'list':
            return qs.filter(is_hidden=False)
        
        # Если запрос конкретной категории по слагу - отдаем как есть
        return qs

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProjectSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Project.objects.select_related('category').all()
        
        if self.action == 'list':
            # Сначала убираем скрытые
            qs = qs.filter(is_hidden=False)
            
            # Ловим параметр из URL (например: /api/projects/?is_new=true)
            is_new_param = self.request.query_params.get('is_new')
            if is_new_param == 'true':
                qs = qs.filter(is_new=True)
                
            return qs
            
        return qs