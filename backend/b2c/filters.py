from backend.common.models import Menu, Cuisine, MenuItem, MenuCategory, Restaurant
from django.db.models import Avg, Q
import django_filters


# ----------------------------
# Filters
# ----------------------------
class RestaurantFilter(django_filters.FilterSet):
    cuisine = django_filters.NumberFilter(method='filter_by_cuisine')
    min_rating = django_filters.NumberFilter(method='filter_by_rating')

    class Meta:
        model = Restaurant
        fields = ['company_id', 'country_id', 'city_id', 'cuisine', 'min_rating']

    def filter_by_cuisine(self, queryset, name, value):
        """Filter restaurants that have the specified cuisine"""
        if value:
            try:
                # Cuisine is now directly related to Restaurant via ManyToMany
                return queryset.filter(cuisines__id=value).distinct()
            except Exception:
                # If there's an error, return empty queryset
                return queryset.none()
        return queryset

    def filter_by_rating(self, queryset, name, value):
        """Filter restaurants by minimum average rating"""
        if value is not None:
            # avg_rating annotation is already added in get_queryset
            # Just filter by it
            return queryset.filter(
                avg_rating__gte=value
            ).distinct()
        return queryset


class CuisineFilter(django_filters.FilterSet):
    restaurant_id = django_filters.NumberFilter(field_name='restaurant__id')

    class Meta:
        model = Cuisine
        fields = ['restaurant_id', 'name']


class MenuItemFilter(django_filters.FilterSet):
    category_id = django_filters.NumberFilter(field_name='category__id')

    class Meta:
        model = MenuItem
        fields = ['category_id', 'name']


class MenuFilter(django_filters.FilterSet):
    restaurant_id = django_filters.NumberFilter(field_name='restaurant__id')

    class Meta:
        model = Menu
        fields = ['restaurant_id', 'name']