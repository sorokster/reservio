from rest_framework import viewsets, filters
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Prefetch
from backend.common.models import (
    Country, City, Company, Restaurant, RestaurantLocation, Schedule,
    Table, TableStatus, Menu, Cuisine, MenuItem, MenuCategoryOrder,
    Reservation, ReservationSlot, ReservationStatus,
    Review, FavouriteRestaurant, FavouriteRestaurantItem
)
from .filters import MenuItemFilter, CuisineFilter, MenuFilter, RestaurantFilter
from .pagination import ReviewsPagination, ReservationsPagination, RestaurantsPagination, FavouritesPagination
from .permissions import PublicReadOrAuthenticatedWrite
from .serializers import (
    CountrySerializer, CitySerializer, CompanySerializer, RestaurantSerializer,
    ScheduleSerializer, TableSerializer, TableStatusSerializer,
    MenuSerializer, CuisineSerializer, MenuItemSerializer,
    ReservationSerializer, ReservationSlotSerializer, ReservationStatusSerializer,
    ReviewSerializer, FavouriteRestaurantSerializer, FavouriteRestaurantItemSerializer
)


# ----------------------------
# Country / City / Company / Restaurant
# ----------------------------
class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']
    permission_classes = [PublicReadOrAuthenticatedWrite]


class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.select_related('country').all()
    serializer_class = CitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['country_id']
    search_fields = ['name']
    permission_classes = [PublicReadOrAuthenticatedWrite]


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['owner_id']
    search_fields = ['name']
    permission_classes = [PublicReadOrAuthenticatedWrite]

    def get_queryset(self):
        return Company.objects.all()


class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    pagination_class = RestaurantsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = RestaurantFilter
    search_fields = ['name', 'address']
    permission_classes = [PublicReadOrAuthenticatedWrite]

    def get_queryset(self):
        locations_prefetch = Prefetch(
            'locations',
            queryset=RestaurantLocation.objects.select_related('city', 'country').all()
        )
        queryset = Restaurant.objects.select_related('company', 'city', 'city__country').prefetch_related(
            'cuisines',
            locations_prefetch
        ).annotate(
            avg_rating=Avg('reviews__overall'),
            review_count_annotated=Count('reviews')
        )
        return queryset.all()


# ----------------------------
# Schedule
# ----------------------------
class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.select_related('restaurant').all()
    serializer_class = ScheduleSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurant_id', 'weekday', 'is_closed']
    permission_classes = [PublicReadOrAuthenticatedWrite]


# ----------------------------
# Table & TableStatus
# ----------------------------
class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.select_related('restaurant').all()
    serializer_class = TableSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant_id', 'seats']
    search_fields = ['number']
    permission_classes = [PublicReadOrAuthenticatedWrite]


class TableStatusViewSet(viewsets.ModelViewSet):
    queryset = TableStatus.objects.select_related('table').all()
    serializer_class = TableStatusSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['table_id', 'is_booked']
    permission_classes = [PublicReadOrAuthenticatedWrite]


# ----------------------------
# Menu / Cuisine / MenuItem
# ----------------------------
class MenuViewSet(viewsets.ModelViewSet):
    queryset = Menu.objects.select_related('restaurant').prefetch_related(
        'categories',
        Prefetch(
            'items',
            queryset=MenuItem.objects.select_related('category').all()
        ),
        Prefetch(
            'category_orders',
            queryset=MenuCategoryOrder.objects.select_related('category').order_by('order')
        )
    ).all()
    serializer_class = MenuSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = MenuFilter
    search_fields = ['name']
    permission_classes = [PublicReadOrAuthenticatedWrite]


class CuisineViewSet(viewsets.ModelViewSet):
    queryset = Cuisine.objects.all()
    serializer_class = CuisineSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = CuisineFilter
    search_fields = ['name']
    permission_classes = [PublicReadOrAuthenticatedWrite]


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.select_related('category').prefetch_related('category__menu__restaurant').all()
    serializer_class = MenuItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = MenuItemFilter
    search_fields = ['name']
    permission_classes = [PublicReadOrAuthenticatedWrite]


# ----------------------------
# Reservation / Slot / Status
# ----------------------------
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related('user', 'restaurant', 'table').prefetch_related('time_slots', 'statuses').all()
    serializer_class = ReservationSerializer
    pagination_class = ReservationsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurant_id', 'table_id', 'user_id', 'date']
    permission_classes = [PublicReadOrAuthenticatedWrite]

    def get_queryset(self):
        queryset = self.queryset
        if self.request.user.is_authenticated:
            if self.request.user.is_staff or self.request.user.is_superuser:
                return queryset
            return queryset.filter(user=self.request.user)
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReservationSlotViewSet(viewsets.ModelViewSet):
    queryset = ReservationSlot.objects.select_related('reservation').all()
    serializer_class = ReservationSlotSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['reservation_id', 'time_from', 'time_to']
    permission_classes = [PublicReadOrAuthenticatedWrite]


class ReservationStatusViewSet(viewsets.ModelViewSet):
    queryset = ReservationStatus.objects.select_related('reservation').all()
    serializer_class = ReservationStatusSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['reservation_id', 'status']
    permission_classes = [PublicReadOrAuthenticatedWrite]


# ----------------------------
# Review
# ----------------------------
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('user', 'restaurant').all()
    serializer_class = ReviewSerializer
    pagination_class = ReviewsPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['restaurant_id', 'user_id', 'overall', 'food', 'interior', 'atmosphere', 'service']
    search_fields = ['comment']
    ordering_fields = ['created_at', 'overall', 'food', 'interior', 'atmosphere', 'service']
    ordering = ['-created_at']
    permission_classes = [PublicReadOrAuthenticatedWrite]


# ----------------------------
# FavouriteRestaurant & FavouriteRestaurantItem
# ----------------------------
class FavouriteRestaurantViewSet(viewsets.ModelViewSet):
    queryset = FavouriteRestaurant.objects.select_related('user', 'restaurant', 'restaurant__city', 'restaurant__city__country', 'restaurant__company').all()
    serializer_class = FavouriteRestaurantSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_id', 'restaurant_id']
    permission_classes = [PublicReadOrAuthenticatedWrite]
    pagination_class = FavouritesPagination

    def get_queryset(self):
        queryset = self.queryset
        if self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)
        return queryset.none()

    def create(self, request, *args, **kwargs):
        restaurant_id = request.data.get('restaurant_id')
        if restaurant_id:
            try:
                restaurant_id = int(restaurant_id)
            except (ValueError, TypeError):
                return Response(
                    {'detail': 'Invalid restaurant_id'},
                    status=400
                )
            
            existing = FavouriteRestaurant.objects.filter(
                user=request.user,
                restaurant_id=restaurant_id
            ).first()
            if existing:
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=200)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

    def perform_create(self, serializer):
        restaurant = serializer.validated_data.get('restaurant')
        if not restaurant:
            restaurant_id = self.request.data.get('restaurant_id')
            if restaurant_id:
                try:
                    restaurant_id = int(restaurant_id)
                    restaurant = Restaurant.objects.get(id=restaurant_id)
                except (ValueError, TypeError):
                    raise ValidationError({'restaurant_id': 'Invalid restaurant_id'})
                except Restaurant.DoesNotExist:
                    raise ValidationError({'restaurant_id': 'Restaurant not found'})
            else:
                raise ValidationError({'restaurant_id': 'restaurant_id is required'})
        
        serializer.save(user=self.request.user, restaurant=restaurant)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response(
                {'detail': 'You do not have permission to delete this favourite.'},
                status=403
            )
        return super().destroy(request, *args, **kwargs)


class FavouriteRestaurantItemViewSet(viewsets.ModelViewSet):
    queryset = FavouriteRestaurantItem.objects.select_related(
        'user', 
        'menu_item',
        'menu_item__category',
        'menu_item__menu',
        'menu_item__menu__restaurant'
    ).all()
    serializer_class = FavouriteRestaurantItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_id', 'menu_item_id']
    permission_classes = [PublicReadOrAuthenticatedWrite]

    def get_queryset(self):
        queryset = FavouriteRestaurantItem.objects.select_related(
            'user', 
            'menu_item',
            'menu_item__category',
            'menu_item__menu',
            'menu_item__menu__restaurant'
        ).all()
        if self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)
        return queryset.none()

    def create(self, request, *args, **kwargs):
        menu_item_id = request.data.get('menu_item_id')
        if menu_item_id:
            try:
                menu_item_id = int(menu_item_id)
            except (ValueError, TypeError):
                return Response(
                    {'detail': 'Invalid menu_item_id'},
                    status=400
                )
            
            existing = FavouriteRestaurantItem.objects.filter(
                user=request.user,
                menu_item_id=menu_item_id
            ).first()
            if existing:
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=200)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

    def perform_create(self, serializer):
        menu_item = serializer.validated_data.get('menu_item')
        if not menu_item:
            menu_item_id = self.request.data.get('menu_item_id')
            if menu_item_id:
                try:
                    menu_item_id = int(menu_item_id)
                    menu_item = MenuItem.objects.get(id=menu_item_id)
                except (ValueError, TypeError):
                    raise ValidationError({'menu_item_id': 'Invalid menu_item_id'})
                except MenuItem.DoesNotExist:
                    raise ValidationError({'menu_item_id': 'Menu item not found'})
            else:
                raise ValidationError({'menu_item_id': 'menu_item_id is required'})
        
        serializer.save(user=self.request.user, menu_item=menu_item)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user and not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to delete this favourite.'},
                status=403
            )
        return super().destroy(request, *args, **kwargs)