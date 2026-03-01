from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import ValidationError

from catalog.models import Project, Ownership, Category
from catalog.serializers import ProjectSerializer, OwnershipSerializer, CategorySerializer
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

class BuySharesView(views.APIView):
    """
    Эндпоинт для покупки долей.
    Ожидает JSON: {"shares_to_buy": 5}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        shares_to_buy = request.data.get('shares_to_buy')
        
        if not shares_to_buy or not isinstance(shares_to_buy, int) or shares_to_buy <= 0:
            return Response(
                {"detail": "Укажите корректное количество долей (целое число > 0)."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Вызываем наш пуленепробиваемый сервис
            ownership, tx = PurchaseService.buy_shares(
                user=request.user,
                project_id=project_id,
                shares_to_buy=shares_to_buy
            )
            
            return Response({
                "detail": "Покупка успешно завершена.",
                "transaction_id": tx.id,
                "new_shares_amount": ownership.shares_amount,
                "average_buy_price": ownership.average_buy_price
            }, status=status.HTTP_200_OK)

        except InsufficientFunds as e:
            return Response({"detail": str(e), "code": "INSUFFICIENT_FUNDS"}, status=status.HTTP_400_BAD_REQUEST)
        except NotEnoughShares as e:
            return Response({"detail": str(e), "code": "NOT_ENOUGH_SHARES"}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({"detail": list(e)[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Project.DoesNotExist:
            return Response({"detail": "Проект не найден."}, status=status.HTTP_404_NOT_FOUND)
        
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Список всех категорий"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """Каталог проектов: список и деталка"""
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        # Базовый QuerySet
        qs = Project.objects.filter(status__in=[Project.Status.PRESALE, Project.Status.ACTIVE])
        
        # Фильтрация по категории через GET-параметр (?category=slug)
        category_slug = self.request.query_params.get('category')
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
            
        return qs.select_related('category')