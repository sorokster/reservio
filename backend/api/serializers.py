from rest_framework import serializers
from django.contrib.auth.models import User
from backend.common.models import (
    Country, City, Company, Restaurant, RestaurantLocation, Schedule,
    Table, TableStatus, Menu, Cuisine, MenuItem, MenuCategory,
    Reservation, ReservationSlot, ReservationStatus,
    Review, FavouriteRestaurant, FavouriteRestaurantItem,
    SlotStatus, MenuCategoryOrder
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
        ordering = ['name']


class CitySerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)
    country_id = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), source='country', write_only=True
    )

    class Meta:
        model = City
        fields = ['id', 'name', 'country', 'country_id']
        ordering = ['name']


# ----------------------------
# Company & Restaurant
# ----------------------------
class CompanySerializer(serializers.ModelSerializer):
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='owner', write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = Company
        fields = ['id', 'owner_id', 'name', 'description', 'website', 'email', 'logo', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        ordering = ['name']


class RestaurantSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True
    )
    city = CitySerializer(read_only=True)
    city_id = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), source='city', write_only=True
    )
    cuisines = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    locations = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'address', 'phone', 'email',
            'company', 'company_id',
            'city', 'city_id', 'preview',
            'cuisines', 'average_rating', 'review_count', 'locations',
            'created_at', 'updated_at'
        ]
        ordering = ['name']

    def get_cuisines(self, obj):
        try:
            if hasattr(obj, '_prefetched_objects_cache') and 'cuisines' in obj._prefetched_objects_cache:
                cuisines = obj._prefetched_objects_cache['cuisines']
            else:
                cuisines = obj.cuisines.all()
            return CuisineSerializer(cuisines, many=True).data
        except Exception as e:
            return []

    def get_average_rating(self, obj):
        if hasattr(obj, 'avg_rating'):
            return float(obj.avg_rating) if obj.avg_rating else None
        return None

    def get_review_count(self, obj):
        if hasattr(obj, 'review_count_annotated'):
            return obj.review_count_annotated
        return obj.reviews.count()
    
    def get_locations(self, obj):
        if hasattr(obj, '_prefetched_objects_cache') and 'locations' in obj._prefetched_objects_cache:
            locations = obj._prefetched_objects_cache['locations']
        else:
            locations = RestaurantLocation.objects.filter(restaurant=obj).select_related('country', 'city')
        return RestaurantLocationSerializer(locations, many=True).data


# ----------------------------
# Restaurant Location
# ----------------------------
class RestaurantLocationSerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)
    city = CitySerializer(read_only=True)
    
    class Meta:
        model = RestaurantLocation
        fields = ['id', 'restaurant', 'country', 'city', 'address', 'description', 'latitude', 'longitude', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


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
# Menu / Cuisine / MenuItem / MenuCategory
# ----------------------------
class MenuCategorySerializer(serializers.ModelSerializer):
    order = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'order']
        read_only_fields = ['id']
    
    def get_order(self, obj):
        menu = self.context.get('menu')
        if menu:
            try:
                order_obj = MenuCategoryOrder.objects.get(menu=menu, category=obj)
                return order_obj.order
            except MenuCategoryOrder.DoesNotExist:
                return 0
        return 0


class MenuItemSerializer(serializers.ModelSerializer):
    category = MenuCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuCategory.objects.all(), source='category', write_only=True
    )
    restaurant_id = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'description', 'price', 'weight', 'is_new', 'image',
            'category', 'category_id', 'restaurant_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_restaurant_id(self, obj):
        try:
            if hasattr(obj, 'menu') and obj.menu:
                if hasattr(obj.menu, 'restaurant_id'):
                    return obj.menu.restaurant_id
                elif hasattr(obj.menu, 'restaurant'):
                    return obj.menu.restaurant.id if obj.menu.restaurant else None
            if hasattr(obj, 'category') and obj.category:
                menus = obj.category.menu.all()
                if menus.exists():
                    menu = menus.first()
                    if hasattr(menu, 'restaurant_id'):
                        return menu.restaurant_id
                    elif hasattr(menu, 'restaurant'):
                        return menu.restaurant.id if menu.restaurant else None
            return None
        except Exception:
            return None


class CuisineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuisine
        fields = ['id', 'name']
        read_only_fields = ['id']


class MenuSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    class Meta:
        model = Menu
        fields = ['id', 'restaurant', 'name', 'description', 'order', 'categories', 'items']
        read_only_fields = ['id']
    
    def get_categories(self, obj):
        from backend.common.models import MenuCategoryOrder
        if hasattr(obj, '_prefetched_objects_cache') and 'category_orders' in obj._prefetched_objects_cache:
            category_orders = obj._prefetched_objects_cache['category_orders']
        else:
            category_orders = MenuCategoryOrder.objects.filter(menu=obj).select_related('category').order_by('order')
        serializer = MenuCategorySerializer(
            [co.category for co in category_orders],
            many=True,
            context={'menu': obj}
        )
        return serializer.data
    
    def get_items(self, obj):
        if hasattr(obj, '_prefetched_objects_cache') and 'items' in obj._prefetched_objects_cache:
            items = obj._prefetched_objects_cache['items']
        else:
            items = MenuItem.objects.filter(menu=obj).select_related('category', 'menu').distinct()
        return MenuItemSerializer(items, many=True).data


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
    
    def to_internal_value(self, data):
        if isinstance(data, dict) and 'status' in data:
            status = data['status']
            if isinstance(status, str):
                status_map = {
                    'pending': SlotStatus.PENDING,
                    'confirmed': SlotStatus.CONFIRMED,
                    'canceled': SlotStatus.CANCELED,
                }
                data['status'] = status_map.get(status.lower(), SlotStatus.PENDING)
            elif isinstance(status, int):
                if status not in [SlotStatus.PENDING, SlotStatus.CONFIRMED, SlotStatus.CANCELED]:
                    data['status'] = SlotStatus.PENDING
        return super().to_internal_value(data)

class ReservationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
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
        time_slots_data = validated_data.pop('time_slots_data', [])
        time_from = validated_data.pop('time_from', None)
        time_to = validated_data.pop('time_to', None)
        statuses_data = validated_data.pop('statuses_data', [])

        reservation = Reservation.objects.create(**validated_data)
        if time_slots_data:
            for slot_data in time_slots_data:
                ReservationSlot.objects.create(reservation=reservation, **slot_data)
        elif time_from and time_to:
            ReservationSlot.objects.create(
                reservation=reservation,
                time_from=time_from,
                time_to=time_to
            )

        if not statuses_data:
            ReservationStatus.objects.create(
                reservation=reservation,
                status=SlotStatus.PENDING
            )
        else:
            for status_data in statuses_data:
                if 'status' in status_data and isinstance(status_data['status'], str):
                    status_map = {
                        'pending': SlotStatus.PENDING,
                        'confirmed': SlotStatus.CONFIRMED,
                        'canceled': SlotStatus.CANCELED,
                    }
                    status_data['status'] = status_map.get(status_data['status'].lower(), SlotStatus.PENDING)
                ReservationStatus.objects.create(reservation=reservation, **status_data)
        
        return reservation

    def update(self, instance, validated_data):
        time_slots_data = validated_data.pop('time_slots_data', None)
        time_from = validated_data.pop('time_from', None)
        time_to = validated_data.pop('time_to', None)
        statuses_data = validated_data.pop('statuses_data', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if time_slots_data is not None:
            instance.time_slots.all().delete()
            for slot_data in time_slots_data:
                ReservationSlot.objects.create(reservation=instance, **slot_data)
        elif time_from is not None and time_to is not None:
            instance.time_slots.all().delete()
            ReservationSlot.objects.create(
                reservation=instance,
                time_from=time_from,
                time_to=time_to
            )

        if statuses_data is not None:
            for status_data in statuses_data:
                if 'status' in status_data and isinstance(status_data['status'], str):
                    status_map = {
                        'pending': SlotStatus.PENDING,
                        'confirmed': SlotStatus.CONFIRMED,
                        'canceled': SlotStatus.CANCELED,
                    }
                    status_data['status'] = status_map.get(status_data['status'].lower(), SlotStatus.PENDING)
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
    restaurant_id = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.all(), source='restaurant', write_only=True
    )

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_id', 'restaurant_id',
            'food', 'interior', 'atmosphere', 'service', 'overall',
            'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ----------------------------
# FavouriteRestaurant & FavouriteRestaurantItem
# ----------------------------
class FavouriteRestaurantSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )
    restaurant = RestaurantSerializer(read_only=True)
    restaurant_id = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.all(), source='restaurant', write_only=True
    )

    class Meta:
        model = FavouriteRestaurant
        fields = ['id', 'user_id', 'restaurant', 'restaurant_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class FavouriteRestaurantItemSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source='menu_item', write_only=True
    )

    class Meta:
        model = FavouriteRestaurantItem
        fields = ['id', 'user_id', 'menu_item', 'menu_item_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']