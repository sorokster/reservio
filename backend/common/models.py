from django.contrib.auth.models import User
from django.db import models

# ----------------------------
# Helpers
# ----------------------------
class WeekDay(models.IntegerChoices):
    MON = 1, 'Monday'
    TUE = 2, 'Tuesday'
    WED = 3, 'Wednesday'
    THU = 4, 'Thursday'
    FRI = 5, 'Friday'
    SAT = 6, 'Saturday'
    SUN = 7, 'Sunday'


class SlotStatus(models.IntegerChoices):
    PENDING = 0, 'Pending'
    CONFIRMED = 1, 'Confirmed'
    CANCELED = 2, 'Canceled'


# ----------------------------
# Country
# ----------------------------
class Country(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    code = models.CharField(max_length=3, unique=True, db_index=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


# ----------------------------
# City
# ----------------------------
class City(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='cities', db_index=True)
    name = models.CharField(max_length=255)

    class Meta:
        unique_together = ('country', 'name')
        indexes = [models.Index(fields=['name'])]
        ordering = ['country', 'name']

    def __str__(self):
        return f'{self.name}, {self.country.name}'


# ----------------------------
# Company
# ----------------------------
class Company(models.Model):
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_companies', db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    logo = models.ImageField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['name']), models.Index(fields=['owner'])]
        ordering = ['name']

    def __str__(self):
        return self.name


# ----------------------------
# Restaurant
# ----------------------------
class Restaurant(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='restaurants', db_index=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='restaurants', db_index=True)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='restaurants', db_index=True)
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    preview = models.ImageField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['company']),
            models.Index(fields=['country']),
            models.Index(fields=['city']),
        ]
        ordering = ['name']

    def __str__(self):
        return f'{self.company.name} — {self.name}'


# ----------------------------
# Restaurant Position
# ----------------------------
class RestaurantPosition(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='positions', db_index=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='positions', db_index=True)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='positions', db_index=True)
    address = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.restaurant.name} — {self.latitude} — {self.longitude}'


# ----------------------------
# Schedule
# ----------------------------
class Schedule(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='schedules', db_index=True)
    weekday = models.IntegerField(choices=WeekDay.choices, db_index=True)
    is_closed = models.BooleanField(default=False)
    time_from = models.TimeField(blank=True, null=True)
    time_to = models.TimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('restaurant', 'weekday')
        indexes = [models.Index(fields=['restaurant', 'weekday'])]
        ordering = ['restaurant', 'weekday']

    def __str__(self):
        return f'{self.restaurant.name} - {self.weekday.label} - {self.time_from} - {self.time_to}'


# ----------------------------
# Table
# ----------------------------
class Table(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='tables', db_index=True)
    number = models.CharField(max_length=10)
    seats = models.PositiveIntegerField()

    class Meta:
        unique_together = ('restaurant', 'number')
        indexes = [models.Index(fields=['restaurant', 'number'])]
        ordering = ['restaurant', 'number']

    def __str__(self):
        return f'{self.restaurant.name} - Table {self.number}'


# ----------------------------
# Table Status
# ----------------------------
class TableStatus(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='statuses', db_index=True)
    is_booked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['table']), models.Index(fields=['is_booked']), models.Index(fields=['table', 'updated_at'])]
        ordering = ['-updated_at']

    def __str__(self):
        return f'Table {self.table.number} - {"Booked" if self.is_booked else "Free"}'


# ----------------------------
# Menu
# ----------------------------
class Menu(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menus', db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('restaurant', 'name')
        indexes = [models.Index(fields=['restaurant', 'name'])]
        ordering = ['restaurant', 'order', 'name']

    def __str__(self):
        return f'{self.restaurant.name} - {self.name}'


# ----------------------------
# Cuisine
# ----------------------------
class Cuisine(models.Model):
    restaurant = models.ManyToManyField(Restaurant, related_name='cuisines')
    name = models.CharField(max_length=255, unique=True, db_index=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name}'


# ----------------------------
# MenuCategory
# ----------------------------
class MenuCategory(models.Model):
    menu = models.ManyToManyField(Menu, related_name='categories', through='MenuCategoryOrder')
    name = models.CharField(max_length=255, unique=True, db_index=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name}'


# ----------------------------
# MenuCategoryOrder (Intermediate model for Menu-MenuCategory ManyToMany)
# ----------------------------
class MenuCategoryOrder(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='category_orders', db_index=True)
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='menu_orders', db_index=True)
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        unique_together = [
            ('menu', 'category'),  # One category can appear only once per menu
            ('menu', 'order'),     # Order must be unique within each menu
        ]
        indexes = [
            models.Index(fields=['menu', 'order']),
            models.Index(fields=['category', 'order']),
        ]
        ordering = ['menu', 'order']

    def __str__(self):
        return f'{self.menu.name} - {self.category.name} (order: {self.order})'


# ----------------------------
# MenuItem
# ----------------------------
class MenuItem(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='items', db_index=True)
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items', db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    weight = models.FloatField(blank=True, null=True)
    is_new = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('menu', 'category', 'name')
        indexes = [models.Index(fields=['menu', 'category', 'name']), models.Index(fields=['category', 'name'])]
        ordering = ['menu', 'category', 'name']

    def __str__(self):
        return self.name


# ----------------------------
# Reservation
# ----------------------------
class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations', db_index=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reservations', db_index=True)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='reservations', db_index=True)
    date = models.DateField(db_index=True)
    guests = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['table']),
            models.Index(fields=['restaurant', 'date'])
        ]
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.table} on {self.date}'


# ----------------------------
# ReservationSlot
# ----------------------------
class ReservationSlot(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='time_slots', db_index=True)
    time_from = models.TimeField()
    time_to = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['reservation', 'time_from'])]
        ordering = ['reservation', 'time_from']

    def __str__(self):
        return f'{self.reservation} - {self.time_from} to {self.time_to}'


# ----------------------------
# ReservationStatus
# ---------------------------ф-
class ReservationStatus(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='statuses', db_index=True)
    status = models.IntegerField(choices=SlotStatus.choices, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['reservation', 'status'])]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reservation} - {self.status}'


# ----------------------------
# Review
# ----------------------------
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', db_index=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews', db_index=True)
    food = models.DecimalField(max_digits=3, decimal_places=2)
    interior = models.DecimalField(max_digits=3, decimal_places=2)
    atmosphere = models.DecimalField(max_digits=3, decimal_places=2)
    service = models.DecimalField(max_digits=3, decimal_places=2)
    overall = models.DecimalField(max_digits=3, decimal_places=2)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['restaurant', 'created_at'])]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.restaurant.name} - {self.created_at.strftime("%Y-%m-%d")}'


# ----------------------------
# FavouriteRestaurant
# ----------------------------
class FavouriteRestaurant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favourite_restaurants', db_index=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='favourite_by', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'restaurant')
        indexes = [
            models.Index(fields=['user', 'restaurant']),
            models.Index(fields=['user']),
            models.Index(fields=['restaurant']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.restaurant.name}'


# ----------------------------
# FavouriteRestaurantItem
# ----------------------------
class FavouriteRestaurantItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favourite_menu_items', db_index=True)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='favourite_by', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'menu_item')
        indexes = [
            models.Index(fields=['user', 'menu_item']),
            models.Index(fields=['user']),
            models.Index(fields=['menu_item']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.menu_item.name}'
