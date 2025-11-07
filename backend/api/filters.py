from backend.common.models import Menu, Cuisine, MenuItem
import django_filters


# ----------------------------
# Filters
# ----------------------------
class CuisineFilter(django_filters.FilterSet):
    menu_id = django_filters.NumberFilter(field_name='menu__id')

    class Meta:
        model = Cuisine
        fields = ['menu_id', 'name']


class MenuItemFilter(django_filters.FilterSet):
    menu_id = django_filters.NumberFilter(field_name='menu__id')
    cuisine_id = django_filters.NumberFilter(field_name='cuisine__id')

    class Meta:
        model = MenuItem
        fields = ['menu_id', 'cuisine_id', 'name']


class MenuFilter(django_filters.FilterSet):
    restaurant_id = django_filters.NumberFilter(field_name='restaurant__id')

    class Meta:
        model = Menu
        fields = ['restaurant_id', 'name']