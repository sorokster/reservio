from django.contrib import admin
from django.contrib.auth.models import User, Group
from .models import (
    Country, City, Company, Restaurant, Schedule,
    Table, TableStatus, Menu, Cuisine, MenuItem,
    Reservation, ReservationSlot, ReservationStatus,
    Review
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
    list_display = ['name', 'owner', 'email', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'email']
    raw_id_fields = ['owner']

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'city', 'country', 'phone', 'created_at']
    list_filter = ['company', 'country', 'city', 'created_at']
    search_fields = ['name', 'address', 'phone', 'email']
    raw_id_fields = ['company', 'country', 'city']

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

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'menu', 'cuisine', 'price']
    list_filter = ['menu', 'cuisine']
    search_fields = ['name']
    raw_id_fields = ['menu', 'cuisine']

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant', 'table', 'date', 'guests', 'created_at']
    list_filter = ['date', 'created_at']
    raw_id_fields = ['user', 'restaurant', 'table']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['comment']
    raw_id_fields = ['user', 'restaurant']
