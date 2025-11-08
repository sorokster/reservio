import random
from datetime import time, timedelta, date
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from backend.common.models import (
    Country, City, Company, Restaurant, RestaurantPosition, Schedule, Table, TableStatus,
    Menu, Cuisine, MenuCategory, MenuCategoryOrder, MenuItem, Reservation, ReservationSlot, ReservationStatus,
    Review, FavouriteRestaurant, FavouriteRestaurantItem, WeekDay, SlotStatus
)

        # ----------------------------
# Base data
        # ----------------------------
COUNTRIES = [
    {"name": "United States", "code": "US"},
    {"name": "Germany", "code": "DE"},
    {"name": "Ukraine", "code": "UA"},
]

CITIES_BY_COUNTRY = {
    "US": ["New York", "Los Angeles", "Chicago"],
    "DE": ["Berlin", "Munich", "Hamburg"],
    "UA": ["Kyiv", "Lviv", "Odesa"],
}

COMPANY_NAMES = ["Gastro Group", "Food Planet", "Delight Co", "TasteLab", "UrbanEats"]
MENUS = ["Breakfast", "Lunch", "Dinner", "Drinks", "Desserts"]
CUISINES = ["Italian", "Japanese", "American", "Mexican", "Ukrainian", "French"]
MENU_CATEGORIES = ["Starters", "Main Course", "Desserts", "Drinks", "Salads", "Snacks", "Appetizers", "Soups", "Beverages", "Sides"]

        # ----------------------------
# Helper functions
        # ----------------------------
def create_users(n=15):
    users = []
    for i in range(n):
        user, created = User.objects.get_or_create(
            username=f"user{i+1}",
            defaults={"email": f"user{i+1}@example.com"},
        )
        if created:
            user.set_password("1234")
            user.save()
        users.append(user)
    return users

def create_countries_and_cities():
    for c in COUNTRIES:
        country, _ = Country.objects.get_or_create(name=c["name"], code=c["code"])
        for city_name in CITIES_BY_COUNTRY[c["code"]]:
            City.objects.get_or_create(country=country, name=city_name)

def create_companies(users):
    for name in COMPANY_NAMES:
        owner = random.choice(users)
        Company.objects.create(
            owner=owner,
            name=name,
            description=f"{name} specializes in modern dining experiences.",
            website=f"https://{name.replace(' ', '').lower()}.com",
            email=f"info@{name.replace(' ', '').lower()}.com",
        )

def create_restaurants():
    all_companies = list(Company.objects.all())
    all_countries = list(Country.objects.all())

    for _ in range(15):
        company = random.choice(all_companies)
        country = random.choice(all_countries)
        city = random.choice(list(City.objects.filter(country=country)))

        restaurant = Restaurant.objects.create(
                    company=company,
            country=country,
            city=city,
            name=f"{city.name} {random.choice(['Bistro', 'Grill', 'Cafe', 'Tavern'])}",
            address=f"{random.randint(1,200)} {random.choice(['Main St', 'Central Ave', 'Broadway'])}",
            phone=f"+{random.randint(100000000,999999999)}",
            email=f"contact@{city.name.lower()}.example.com",
        )

        # 1–2 positions per restaurant
        for _ in range(random.randint(1, 2)):
            RestaurantPosition.objects.create(
                restaurant=restaurant,
                country=country,
                    city=city,
                address=f"{random.randint(1,200)} {random.choice(['Main St', 'Central Ave', 'Broadway'])}, {city.name}",
                description=f"Branch of {restaurant.name} located in {city.name}.",
                latitude=round(random.uniform(-90, 90), 6),
                longitude=round(random.uniform(-180, 180), 6),
            )

def create_schedules():
    for restaurant in Restaurant.objects.all():
        start_time = time(9, 0)
        end_time = time(22, 0)
        for day in WeekDay:
            if day in [WeekDay.SAT, WeekDay.SUN]:
                if random.choice([True, False]):
                    is_closed = True
                    time_from = time_to = None
                else:
                    is_closed = False
                    time_from = time(10, 0)
                    time_to = time(20, 0)
            else:
                is_closed = False
                time_from = start_time
                time_to = end_time
            Schedule.objects.create(
                restaurant=restaurant,
                weekday=day,
                is_closed=is_closed,
                time_from=time_from,
                time_to=time_to,
            )

def create_tables():
    for restaurant in Restaurant.objects.all():
        for i in range(1, random.randint(6, 12)):
            table = Table.objects.create(
                restaurant=restaurant,
                number=str(i),
                seats=random.choice([2, 4, 6])
            )
            TableStatus.objects.create(table=table, is_booked=random.choice([False, True]))


def create_menus_and_items():
    # Create all cuisines
    all_cuisines = []
    for cuisine_name in CUISINES:
                cuisine, _ = Cuisine.objects.get_or_create(name=cuisine_name)
        all_cuisines.append(cuisine)

    # Create all unique menu categories
    all_categories = []
    for category_name in MENU_CATEGORIES:
        category, _ = MenuCategory.objects.get_or_create(name=category_name)
        all_categories.append(category)

    # Assign cuisines to restaurants
    for restaurant in Restaurant.objects.all():
        restaurant_cuisines = random.sample(all_cuisines, random.randint(2, len(all_cuisines)))
        restaurant.cuisines.set(restaurant_cuisines)

        # Create menus for each restaurant
        for menu_name in MENUS:
            menu = Menu.objects.create(
                restaurant=restaurant,
                name=menu_name,
                description=f"{menu_name} menu.",
                order=MENUS.index(menu_name)
            )

            # Select random categories for this menu (max 5 categories)
            n_categories = random.randint(2, min(5, len(all_categories)))
            selected_categories = random.sample(all_categories, n_categories)
            
            # Link categories to menu via ManyToMany with order
            for order, category in enumerate(selected_categories, start=1):
                MenuCategoryOrder.objects.get_or_create(
                    menu=menu,
                    category=category,
                    defaults={'order': order}
                )

            # Create menu items for each category in this menu (max 10 items per category)
            for category in selected_categories:
                n_items = random.randint(2, 10)
                for i in range(n_items):
                    # Make item name unique by including menu name to avoid duplicates
                    item_name = f"{menu_name} {category.name} Item {i + 1}"
                    MenuItem.objects.get_or_create(
                        menu=menu,
                        category=category,
                        name=item_name,
                        defaults={
                            'description': f"Delicious {category.name.lower()} from {menu_name} menu.",
                            'weight': random.randint(100, 500),
                            'is_new': random.choice([True, False]),
                            'price': round(random.uniform(5, 30), 2),
                        }
                    )

def create_reservations(users):
    all_restaurants = list(Restaurant.objects.all())
    for _ in range(50):
        user = random.choice(users)
        restaurant = random.choice(all_restaurants)
        table = random.choice(list(restaurant.tables.all()))
        reservation_date = date.today() + timedelta(days=random.randint(1, 30))
        reservation = Reservation.objects.create(
            user=user,
                    restaurant=restaurant,
            table=table,
            date=reservation_date,
            guests=random.randint(1, table.seats),
        )
        ReservationSlot.objects.create(
            reservation=reservation,
            time_from=time(random.randint(10, 20), 0),
            time_to=time(random.randint(21, 23), 0),
        )
        ReservationStatus.objects.create(
            reservation=reservation,
            status=random.choice(list(SlotStatus.values)),
        )

def create_reviews(users):
    for restaurant in Restaurant.objects.all():
        for _ in range(random.randint(3, 10)):
            user = random.choice(users)
            food = round(random.uniform(3, 5), 2)
            interior = round(random.uniform(3, 5), 2)
            atmosphere = round(random.uniform(3, 5), 2)
            service = round(random.uniform(3, 5), 2)
            overall = round((food + interior + atmosphere + service) / 4, 2)
            Review.objects.create(
                user=user,
                    restaurant=restaurant,
                food=food,
                interior=interior,
                atmosphere=atmosphere,
                service=service,
                overall=overall,
                comment=f"{restaurant.name} is a great place! Loved it.",
            )

def create_favourites(users):
    for user in users:
        fav_restaurants = random.sample(list(Restaurant.objects.all()), random.randint(1, 3))
        for r in fav_restaurants:
            FavouriteRestaurant.objects.get_or_create(user=user, restaurant=r)
        fav_items = random.sample(list(MenuItem.objects.all()), random.randint(2, 6))
        for i in fav_items:
            FavouriteRestaurantItem.objects.get_or_create(user=user, menu_item=i)

        # ----------------------------
# Management Command
        # ----------------------------
class Command(BaseCommand):
    help = "Populate the database with realistic restaurant data."

    def handle(self, *args, **options):
        self.stdout.write("🚀 Populating database...")
        users = create_users()
        create_countries_and_cities()
        create_companies(users)
        create_restaurants()
        create_schedules()
        create_tables()
        create_menus_and_items()
        create_reservations(users)
        create_reviews(users)
        create_favourites(users)
        self.stdout.write(self.style.SUCCESS("🎉 Database populated successfully!"))