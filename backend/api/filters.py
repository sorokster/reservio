from backend.common.models import Menu, Cuisine, MenuItem, Restaurant
import django_filters


# ----------------------------
# Filters
# ----------------------------
class RestaurantFilter(django_filters.FilterSet):
    cuisine = django_filters.NumberFilter(method='filter_by_cuisine')
    min_rating = django_filters.NumberFilter(method='filter_by_rating')
    country_id = django_filters.NumberFilter(field_name='city__country_id')

    class Meta:
        model = Restaurant
        fields = ['company_id', 'city_id', 'country_id', 'cuisine', 'min_rating']

    def filter_by_cuisine(self, queryset, name, value):
        if value:
            try:
                return queryset.filter(cuisines__id=value).distinct()
            except Exception:
                return queryset.none()
        return queryset

    def filter_by_rating(self, queryset, name, value):
        if value is not None:
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