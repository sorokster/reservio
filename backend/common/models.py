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


class SlotStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELED = 'canceled', 'Canceled'


# ----------------------------
# Country
# ----------------------------
class Country(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    code = models.CharField(max_length=3, unique=True, db_index=True)

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

    def __str__(self):
        return f'{self.name}, {self.country.name}'


# ----------------------------
# Company
# ----------------------------
class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['name'])]

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['name']), models.Index(fields=['company'])]

    def __str__(self):
        return f'{self.company.name} — {self.name} — {self.address}'


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

    def __str__(self):
        return f'{self.restaurant.name} - {self.name}'


# ----------------------------
# Cuisine
# ----------------------------
class Cuisine(models.Model):
    menu = models.ManyToManyField(Menu, related_name='cuisines')
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f'{self.name}'


# ----------------------------
# MenuItem
# ----------------------------
class MenuItem(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='items', db_index=True)
    cuisine = models.ForeignKey(Cuisine, on_delete=models.CASCADE, related_name='items', db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        unique_together = ('menu', 'cuisine', 'name')  # уникальность блюда в меню + кухня
        indexes = [models.Index(fields=['menu', 'cuisine', 'name'])]

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

    def __str__(self):
        return f'{self.reservation} - {self.time_from} to {self.time_to}'


# ----------------------------
# ReservationStatus
# ----------------------------
class ReservationStatus(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='statuses', db_index=True)
    status = models.CharField(max_length=10, choices=SlotStatus.choices, db_index=True)
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
    rating = models.DecimalField(max_digits=3, decimal_places=2)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['restaurant', 'created_at'])]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.restaurant.name} - {self.created_at.strftime("%Y-%m-%d")}'
