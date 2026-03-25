from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import ValidationError

from catalog.models import Project, Ownership, Category
# Если у вас CheckoutSerializer не импортирован, убедитесь, что он есть в catalog.serializers
from catalog.serializers import ProjectSerializer, OwnershipSerializer, CategorySerializer, CheckoutSerializer
from catalog.services import PurchaseService, NotEnoughShares
from billing.exceptions import InsufficientFunds

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Категории проектов.
    Открыт для всех (AllowAny), чтобы рендерить каталог без авторизации.
    """
    serializer_class = CategorySerializer
    permission_classes = [AllowAny] # <--- РАЗРЕШАЕМ ДОСТУП ВСЕМ
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Category.objects.all()
        
        # Если это запрос списка (каталог) - прячем скрытые
        if self.action == 'list':
            return qs.filter(is_hidden=False)
        
        # Если запрос конкретной категории по слагу - отдаем как есть
        return qs

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Каталог проектов: список и деталка.
    Открыт для всех (AllowAny).
    """
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        # ИСКЛЮЧАЕМ ТОКЕНЫ ИЗ ОБЫЧНОГО КАТАЛОГА
        qs = Project.objects.select_related('category').filter(is_token=False)
        
        if self.action == 'list':
            return qs.filter(is_hidden=False)
        return qs

class TokenViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Эндпоинт исключительно для токенов.
    """
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        # ОТДАЕМ ТОЛЬКО ТОКЕНЫ
        qs = Project.objects.select_related('category').filter(is_token=True)
        
        if self.action == 'list':
            return qs.filter(is_hidden=False)
        return qs

class PortfolioView(views.APIView):
    """
    Портфель пользователя.
    """
    permission_classes = [IsAuthenticated] # <--- ЗДЕСЬ АВТОРИЗАЦИЯ ОБЯЗАТЕЛЬНА

    def get(self, request):
        portfolio = Ownership.objects.filter(user=request.user).select_related('project')
        serializer = OwnershipSerializer(portfolio, many=True)
        return Response(serializer.data)

class CheckoutView(views.APIView):
    """
    Эндпоинт для оплаты корзины/покупки доли.
    """
    permission_classes = [IsAuthenticated] # <--- ЗДЕСЬ АВТОРИЗАЦИЯ ОБЯЗАТЕЛЬНА

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
            return Response({"detail": "Внутренняя ошибка сервера."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)