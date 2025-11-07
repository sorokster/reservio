from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count
from backend.common.models import (
    Country, City, Company, Restaurant, Schedule,
    Table, TableStatus, Menu, Cuisine, MenuItem,
    Reservation, ReservationSlot, ReservationStatus,
    Review
)
from .filters import MenuItemFilter, CuisineFilter, MenuFilter
from .serializers import (
    CountrySerializer, CitySerializer, CompanySerializer, RestaurantSerializer,
    ScheduleSerializer, TableSerializer, TableStatusSerializer,
    MenuSerializer, CuisineSerializer, MenuItemSerializer,
    ReservationSerializer, ReservationSlotSerializer, ReservationStatusSerializer,
    ReviewSerializer
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
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class RestaurantViewSet(viewsets.ModelViewSet):
    # Keep queryset attribute for DRF router basename detection
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['company_id', 'country_id', 'city_id']
    search_fields = ['name', 'address']

    def get_queryset(self):
        # Ensure annotate is always applied for aggregated review data
        return Restaurant.objects.select_related('company', 'country', 'city').annotate(
            avg_rating=Avg('reviews__rating'),
            review_count_annotated=Count('reviews')
        ).all()


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
    queryset = Menu.objects.prefetch_related('cuisines__items', 'items').all()
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
    queryset = MenuItem.objects.select_related('menu', 'cuisine').all()
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
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurant_id', 'table_id', 'user_id', 'date']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Reservation.objects.select_related('user', 'restaurant', 'table').prefetch_related('time_slots', 'statuses').all()
        
        # If user is authenticated, allow them to see their own reservations
        # If not authenticated, they can't see any (permission_classes handles this)
        if self.request.user.is_authenticated:
            # Allow staff/superusers to see all reservations
            if self.request.user.is_staff or self.request.user.is_superuser:
                return queryset
            
            # Regular users can only see their own reservations
            # The user_id filter will be applied after this, but it will only
            # return results if the filtered user_id matches the authenticated user
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
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['restaurant_id', 'user_id', 'rating']
    search_fields = ['comment']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']