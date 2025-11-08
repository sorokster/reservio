from rest_framework import viewsets, filters, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count
from backend.common.models import (
    Country, City, Company, Restaurant, Schedule,
    Table, TableStatus, Menu, Cuisine, MenuItem,
    Reservation, ReservationSlot, ReservationStatus,
    Review, FavouriteRestaurant, FavouriteRestaurantItem
)
from .filters import MenuItemFilter, CuisineFilter, MenuFilter
from .pagination import ReviewsPagination, ReservationsPagination, RestaurantsPagination
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


class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.select_related('country').all()
    serializer_class = CitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['country_id']
    search_fields = ['name']


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['owner_id']
    search_fields = ['name']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Public API - show all companies (read-only for visitors)
        return Company.objects.all()


class RestaurantViewSet(viewsets.ModelViewSet):
    # Keep queryset attribute for DRF router basename detection
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    pagination_class = RestaurantsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['company_id', 'country_id', 'city_id']
    search_fields = ['name', 'address']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Public API - show all restaurants
        queryset = Restaurant.objects.select_related('company', 'country', 'city').annotate(
            avg_rating=Avg('reviews__rating'),
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


# ----------------------------
# Table & TableStatus
# ----------------------------
class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.select_related('restaurant').all()
    serializer_class = TableSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant_id', 'seats']
    search_fields = ['number']


class TableStatusViewSet(viewsets.ModelViewSet):
    queryset = TableStatus.objects.select_related('table').all()
    serializer_class = TableStatusSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['table_id', 'is_booked']


# ----------------------------
# Menu / Cuisine / MenuItem
# ----------------------------
class MenuViewSet(viewsets.ModelViewSet):
    queryset = Menu.objects.select_related('restaurant').prefetch_related('cuisines__items__menu', 'items__menu').all()
    serializer_class = MenuSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = MenuFilter
    search_fields = ['name']


class CuisineViewSet(viewsets.ModelViewSet):
    queryset = Cuisine.objects.prefetch_related('items', 'menu').all()
    serializer_class = CuisineSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = CuisineFilter
    search_fields = ['name']


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.select_related('menu__restaurant', 'cuisine').all()
    serializer_class = MenuItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = MenuItemFilter
    search_fields = ['name']


# ----------------------------
# Reservation / Slot / Status
# ----------------------------
class ReservationViewSet(viewsets.ModelViewSet):
    # Keep queryset attribute for DRF router basename detection
    queryset = Reservation.objects.select_related('user', 'restaurant', 'table').prefetch_related('time_slots', 'statuses').all()
    serializer_class = ReservationSerializer
    pagination_class = ReservationsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurant_id', 'table_id', 'user_id', 'date']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Reservation.objects.select_related('user', 'restaurant', 'table').prefetch_related('time_slots', 'statuses').all()
        
        # If user is authenticated, allow them to see their own reservations
        # If not authenticated, they can't see any (permission_classes handles this)
        if self.request.user.is_authenticated:
            # Public API - users can only see their own reservations
            if self.request.user.is_staff or self.request.user.is_superuser:
                return queryset
            return queryset.filter(user=self.request.user)
        return queryset.none()


class ReservationSlotViewSet(viewsets.ModelViewSet):
    queryset = ReservationSlot.objects.select_related('reservation').all()
    serializer_class = ReservationSlotSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['reservation_id', 'time_from', 'time_to']


class ReservationStatusViewSet(viewsets.ModelViewSet):
    queryset = ReservationStatus.objects.select_related('reservation').all()
    serializer_class = ReservationStatusSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['reservation_id', 'status']


# ----------------------------
# Review
# ----------------------------
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('user', 'restaurant').all()
    serializer_class = ReviewSerializer
    pagination_class = ReviewsPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['restaurant_id', 'user_id', 'rating']
    search_fields = ['comment']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']


# ----------------------------
# FavouriteRestaurant & FavouriteRestaurantItem
# ----------------------------
class FavouriteRestaurantViewSet(viewsets.ModelViewSet):
    queryset = FavouriteRestaurant.objects.select_related('user', 'restaurant').all()
    serializer_class = FavouriteRestaurantSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_id', 'restaurant_id']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = FavouriteRestaurant.objects.select_related('user', 'restaurant').all()
        # Users can only see their own favourites
        if self.request.user.is_authenticated:
            if self.request.user.is_staff or self.request.user.is_superuser:
                return queryset
            return queryset.filter(user=self.request.user)
        return queryset.none()

    def create(self, request, *args, **kwargs):
        # Check if already exists before creating
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
                # Return existing favourite
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=200)
        
        # Create new favourite
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

    def perform_create(self, serializer):
        # Automatically set user to current user
        # Get restaurant from validated_data (it's already converted from restaurant_id)
        restaurant = serializer.validated_data.get('restaurant')
        if not restaurant:
            # If restaurant is not in validated_data, try to get it from request data
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
        # Ensure user can only delete their own favourites
        instance = self.get_object()
        if instance.user != request.user and not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to delete this favourite.'},
                status=403
            )
        return super().destroy(request, *args, **kwargs)


class FavouriteRestaurantItemViewSet(viewsets.ModelViewSet):
    queryset = FavouriteRestaurantItem.objects.select_related('user', 'menu_item').all()
    serializer_class = FavouriteRestaurantItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_id', 'menu_item_id']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = FavouriteRestaurantItem.objects.select_related('user', 'menu_item').all()
        # Users can only see their own favourites
        if self.request.user.is_authenticated:
            if self.request.user.is_staff or self.request.user.is_superuser:
                return queryset
            return queryset.filter(user=self.request.user)
        return queryset.none()

    def create(self, request, *args, **kwargs):
        # Check if already exists before creating
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
                # Return existing favourite
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=200)
        
        # Create new favourite
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

    def perform_create(self, serializer):
        # Automatically set user to current user
        # Get menu_item from validated_data (it's already converted from menu_item_id)
        menu_item = serializer.validated_data.get('menu_item')
        if not menu_item:
            # If menu_item is not in validated_data, try to get it from request data
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
        # Ensure user can only delete their own favourites
        instance = self.get_object()
        if instance.user != request.user and not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to delete this favourite.'},
                status=403
            )
        return super().destroy(request, *args, **kwargs)