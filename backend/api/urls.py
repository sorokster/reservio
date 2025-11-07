from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

# ----------------------------
# Base routers
# ----------------------------
router = DefaultRouter()
router.register(r'countries', CountryViewSet)
router.register(r'cities', CityViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'restaurants', RestaurantViewSet)
router.register(r'menus', MenuViewSet)
router.register(r'cuisines', CuisineViewSet)
router.register(r'menu-items', MenuItemViewSet)
router.register(r'tables', TableViewSet)
router.register(r'table-statuses', TableStatusViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'reservations', ReservationViewSet)
router.register(r'reservation-slots', ReservationSlotViewSet)
router.register(r'reservation-statuses', ReservationStatusViewSet)
router.register(r'reviews', ReviewViewSet)

# ----------------------------
# URLs
# ----------------------------
urlpatterns = [
    path('', include(router.urls)),
]