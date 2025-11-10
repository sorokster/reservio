from django.contrib import admin
from django.contrib.auth.models import User, Group
from .models import (
    Country, City, Company, Restaurant, RestaurantLocation, Schedule,
    Table, TableStatus, Menu, Cuisine, MenuItem, MenuCategory, MenuCategoryOrder,
    Reservation, ReservationSlot, ReservationStatus,
    Review, FavouriteRestaurant, FavouriteRestaurantItem
)

# Register your models here.

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']
    search_fields = ['name', 'code']

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'country']
    list_filter = ['country']
    search_fields = ['name']

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'email', 'website', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'email', 'website']
    raw_id_fields = ['owner']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'city', 'phone', 'is_active', 'created_at']
    list_filter = ['company', 'city', 'is_active', 'created_at']
    search_fields = ['name', 'address', 'phone', 'email']
    raw_id_fields = ['company', 'city']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['restaurant', 'weekday', 'is_closed', 'time_from', 'time_to']
    list_filter = ['weekday', 'is_closed']
    raw_id_fields = ['restaurant']

@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['number', 'restaurant', 'seats']
    list_filter = ['restaurant', 'seats']
    raw_id_fields = ['restaurant']

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'order']
    list_filter = ['restaurant']
    raw_id_fields = ['restaurant']

@admin.register(Cuisine)
class CuisineAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(MenuCategoryOrder)
class MenuCategoryOrderAdmin(admin.ModelAdmin):
    list_display = ['menu', 'category', 'order']
    list_filter = ['menu', 'category']
    search_fields = ['menu__name', 'category__name']
    raw_id_fields = ['menu', 'category']
    ordering = ['menu', 'order']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'weight', 'is_new', 'created_at']
    list_filter = ['category', 'is_new', 'created_at']
    search_fields = ['name', 'description']
    raw_id_fields = ['category']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant', 'table', 'date', 'guests', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['user__username', 'restaurant__name', 'table__number']
    raw_id_fields = ['user', 'restaurant', 'table']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant', 'food', 'interior', 'atmosphere', 'service', 'overall', 'created_at']
    list_filter = ['created_at']
    search_fields = ['comment']
    raw_id_fields = ['user', 'restaurant']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(TableStatus)
class TableStatusAdmin(admin.ModelAdmin):
    list_display = ['table', 'is_booked', 'created_at', 'updated_at']
    list_filter = ['is_booked', 'created_at']
    raw_id_fields = ['table']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ReservationSlot)
class ReservationSlotAdmin(admin.ModelAdmin):
    list_display = ['reservation', 'time_from', 'time_to', 'created_at']
    list_filter = ['created_at']
    raw_id_fields = ['reservation']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ReservationStatus)
class ReservationStatusAdmin(admin.ModelAdmin):
    list_display = ['reservation', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    raw_id_fields = ['reservation']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(RestaurantLocation)
class RestaurantLocationAdmin(admin.ModelAdmin):
    list_display = ['restaurant', 'country', 'city', 'address', 'created_at']
    list_filter = ['country', 'city', 'created_at']
    search_fields = ['address', 'description']
    raw_id_fields = ['restaurant', 'country', 'city']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(FavouriteRestaurant)
class FavouriteRestaurantAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant', 'created_at', 'updated_at']
    list_filter = ['created_at']
    raw_id_fields = ['user', 'restaurant']
    readonly_fields = ['created_at', 'updated_at']
    search_fields = ['user__username', 'restaurant__name']

@admin.register(FavouriteRestaurantItem)
class FavouriteRestaurantItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'menu_item', 'created_at', 'updated_at']
    list_filter = ['created_at']
    raw_id_fields = ['user', 'menu_item']
    readonly_fields = ['created_at', 'updated_at']
    search_fields = ['user__username', 'menu_item__name']
