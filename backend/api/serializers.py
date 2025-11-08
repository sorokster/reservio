from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg, Count
from backend.common.models import (
    Country, City, Company, Restaurant, Schedule,
    Table, TableStatus, Menu, Cuisine, MenuItem,
    Reservation, ReservationSlot, ReservationStatus,
    Review, FavouriteRestaurant, FavouriteRestaurantItem
)

# ----------------------------
# User Serializer
# ----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

# ----------------------------
# Country & City
# ----------------------------
class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'code']

class CitySerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)
    country_id = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), source='country', write_only=True
    )

    class Meta:
        model = City
        fields = ['id', 'name', 'country', 'country_id']

# ----------------------------
# Company & Restaurant
# ----------------------------
class CompanySerializer(serializers.ModelSerializer):
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='owner', write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'description', 'website', 'email', 'owner_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class RestaurantSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True
    )
    country = CountrySerializer(read_only=True)
    country_id = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), source='country', write_only=True
    )
    city = CitySerializer(read_only=True)
    city_id = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), source='city', write_only=True
    )
    cuisines = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'address', 'phone', 'email', 'map_position',
            'company', 'company_id', 'country', 'country_id',
            'city', 'city_id', 'average_rating', 'review_count',
            'cuisines',
            'created_at', 'updated_at'
        ]

    def get_cuisines(self, obj):
        # Получаем уникальные кухни через связанные меню
        # Используем prefetch_related для оптимизации запросов к items и menu
        cuisines = Cuisine.objects.filter(menu__restaurant=obj).distinct().prefetch_related(
            'items__menu__restaurant'
        )
        return CuisineSerializer(cuisines, many=True).data

    def get_average_rating(self, obj):
        if hasattr(obj, 'avg_rating'):
            return float(obj.avg_rating) if obj.avg_rating else None
        return None

    def get_review_count(self, obj):
        if hasattr(obj, 'review_count_annotated'):
            return obj.review_count_annotated
        return obj.reviews.count()

# ----------------------------
# Schedule
# ----------------------------
class ScheduleSerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)
    restaurant = RestaurantSerializer(read_only=True)
    restaurant_id = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.all(), source='restaurant', write_only=True
    )

    class Meta:
        model = Schedule
        fields = ['id', 'restaurant', 'restaurant_id', 'weekday', 'weekday_display',
                  'is_closed', 'time_from', 'time_to', 'created_at', 'updated_at']

# ----------------------------
# Table & TableStatus
# ----------------------------
class TableSerializer(serializers.ModelSerializer):
    restaurant = RestaurantSerializer(read_only=True)
    restaurant_id = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.all(), source='restaurant', write_only=True
    )

    class Meta:
        model = Table
        fields = ['id', 'restaurant', 'restaurant_id', 'number', 'seats']

class TableStatusSerializer(serializers.ModelSerializer):
    table = TableSerializer(read_only=True)
    table_id = serializers.PrimaryKeyRelatedField(
        queryset=Table.objects.all(), source='table', write_only=True
    )

    class Meta:
        model = TableStatus
        fields = ['id', 'table', 'table_id', 'is_booked', 'created_at', 'updated_at']

# ----------------------------
# Menu / Cuisine / MenuItem
# ----------------------------
class MenuItemSerializer(serializers.ModelSerializer):
    restaurant_id = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'cuisine', 'menu', 'restaurant_id']
        read_only_fields = ['id']
    
    def get_restaurant_id(self, obj):
        try:
            # Use select_related if available, otherwise access directly
            if hasattr(obj, 'menu') and obj.menu:
                if hasattr(obj.menu, 'restaurant_id'):
                    return obj.menu.restaurant_id
                elif hasattr(obj.menu, 'restaurant'):
                    return obj.menu.restaurant.id if obj.menu.restaurant else None
            return None
        except Exception:
            return None


class CuisineSerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)
    menu = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Cuisine
        fields = ['id', 'name', 'menu', 'items']
        read_only_fields = ['id']


class MenuSerializer(serializers.ModelSerializer):
    cuisines = CuisineSerializer(many=True, read_only=True)
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Menu
        fields = ['id', 'restaurant', 'name', 'description', 'order', 'cuisines', 'items']
        read_only_fields = ['id']


# ----------------------------
# Reservation / Slot / Status
# ----------------------------
class ReservationSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationSlot
        fields = ['id', 'time_from', 'time_to', 'created_at', 'updated_at']

class ReservationStatusSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ReservationStatus
        fields = ['id', 'status', 'status_display', 'created_at', 'updated_at']

class ReservationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    restaurant = RestaurantSerializer(read_only=True)
    restaurant_id = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.all(), source='restaurant', write_only=True
    )
    table = TableSerializer(read_only=True)
    table_id = serializers.PrimaryKeyRelatedField(
        queryset=Table.objects.all(), source='table', write_only=True
    )
    time_slots = ReservationSlotSerializer(many=True, read_only=True)
    time_slots_data = ReservationSlotSerializer(many=True, write_only=True, required=False)
    # Support direct time_from and time_to for simpler API
    time_from = serializers.TimeField(write_only=True, required=False)
    time_to = serializers.TimeField(write_only=True, required=False)
    statuses = ReservationStatusSerializer(many=True, read_only=True)
    statuses_data = ReservationStatusSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'user_id', 'restaurant', 'restaurant_id',
            'table', 'table_id', 'date', 'guests',
            'time_slots', 'time_slots_data', 'time_from', 'time_to',
            'statuses', 'statuses_data',
            'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        # Extract nested data
        time_slots_data = validated_data.pop('time_slots_data', [])
        time_from = validated_data.pop('time_from', None)
        time_to = validated_data.pop('time_to', None)
        statuses_data = validated_data.pop('statuses_data', [])
        
        # Create reservation
        reservation = Reservation.objects.create(**validated_data)
        
        # Create time slots from time_slots_data if provided
        if time_slots_data:
            for slot_data in time_slots_data:
                ReservationSlot.objects.create(reservation=reservation, **slot_data)
        # Or create a single time slot from time_from and time_to if provided
        elif time_from and time_to:
            ReservationSlot.objects.create(
                reservation=reservation,
                time_from=time_from,
                time_to=time_to
            )
        
        # Create status (default to 'pending' if not provided)
        if not statuses_data:
            ReservationStatus.objects.create(
                reservation=reservation,
                status='pending'
            )
        else:
            for status_data in statuses_data:
                ReservationStatus.objects.create(reservation=reservation, **status_data)
        
        return reservation

    def update(self, instance, validated_data):
        # Extract nested data
        time_slots_data = validated_data.pop('time_slots_data', None)
        time_from = validated_data.pop('time_from', None)
        time_to = validated_data.pop('time_to', None)
        statuses_data = validated_data.pop('statuses_data', None)
        
        # Update reservation fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update time slots if provided
        if time_slots_data is not None:
            # Delete existing slots
            instance.time_slots.all().delete()
            # Create new slots
            for slot_data in time_slots_data:
                ReservationSlot.objects.create(reservation=instance, **slot_data)
        elif time_from is not None and time_to is not None:
            # Delete existing slots and create a single new slot
            instance.time_slots.all().delete()
            ReservationSlot.objects.create(
                reservation=instance,
                time_from=time_from,
                time_to=time_to
            )
        
        # Update status if provided
        if statuses_data is not None:
            # Create new status (keeping history)
            for status_data in statuses_data:
                ReservationStatus.objects.create(reservation=instance, **status_data)
        
        return instance

# ----------------------------
# Review
# ----------------------------
class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    restaurant = RestaurantSerializer(read_only=True)
    restaurant_id = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.all(), source='restaurant', write_only=True
    )

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_id', 'restaurant', 'restaurant_id', 'rating',
                  'comment', 'created_at', 'updated_at']


# ----------------------------
# FavouriteRestaurant & FavouriteRestaurantItem
# ----------------------------
class FavouriteRestaurantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )
    restaurant = RestaurantSerializer(read_only=True)
    restaurant_id = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.all(), source='restaurant', write_only=True
    )

    class Meta:
        model = FavouriteRestaurant
        fields = ['id', 'user', 'user_id', 'restaurant', 'restaurant_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class FavouriteRestaurantItemSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source='menu_item', write_only=True
    )

    class Meta:
        model = FavouriteRestaurantItem
        fields = ['id', 'user', 'user_id', 'menu_item', 'menu_item_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']