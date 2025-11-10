import random
from datetime import time, timedelta, date
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from backend.common.models import (
    Country, City, Company, Restaurant, RestaurantLocation, Schedule, Table, TableStatus,
    Menu, Cuisine, MenuCategory, MenuCategoryOrder, MenuItem, Reservation, ReservationSlot, ReservationStatus,
    Review, FavouriteRestaurant, FavouriteRestaurantItem, WeekDay, SlotStatus
)

# ----------------------------
# Base data
# ----------------------------
COUNTRIES = [
    {"name": "Ukraine", "code": "UA"},
    {"name": "Poland", "code": "PL"},
]

# Ukrainian cities with real coordinates
UKRAINIAN_CITIES = [
    {"name": "Kyiv", "lat": 50.4501, "lng": 30.5234},
    {"name": "Lviv", "lat": 49.8397, "lng": 24.0297},
    {"name": "Odesa", "lat": 46.4825, "lng": 30.7233},
    {"name": "Kharkiv", "lat": 49.9935, "lng": 36.2304},
    {"name": "Dnipro", "lat": 48.4647, "lng": 35.0462},
    {"name": "Zaporizhzhia", "lat": 47.8388, "lng": 35.1396},
    {"name": "Vinnytsia", "lat": 49.2331, "lng": 28.4682},
    {"name": "Chernivtsi", "lat": 48.2915, "lng": 25.9403},
    {"name": "Ivano-Frankivsk", "lat": 48.9226, "lng": 24.7111},
    {"name": "Ternopil", "lat": 49.5535, "lng": 25.5948},
    {"name": "Uzhhorod", "lat": 48.6244, "lng": 22.2879},
    {"name": "Lutsk", "lat": 50.7472, "lng": 25.3254},
    {"name": "Poltava", "lat": 49.5883, "lng": 34.5514},
    {"name": "Sumy", "lat": 50.9077, "lng": 34.7981},
    {"name": "Khmelnytskyi", "lat": 49.4229, "lng": 26.9871},
    {"name": "Rivne", "lat": 50.6199, "lng": 26.2516},
    {"name": "Zhytomyr", "lat": 50.2547, "lng": 28.6587},
    {"name": "Mykolaiv", "lat": 46.9750, "lng": 31.9946},
    {"name": "Kherson", "lat": 46.6354, "lng": 32.6169},
    {"name": "Kropyvnytskyi", "lat": 48.5132, "lng": 32.2597},
]

POLISH_CITIES = [
    {"name": "Warsaw", "lat": 52.2297, "lng": 21.0122},
    {"name": "Krakow", "lat": 50.0647, "lng": 19.9450},
    {"name": "Wroclaw", "lat": 51.1079, "lng": 17.0385},
]

CITIES_BY_COUNTRY = {
    "UA": UKRAINIAN_CITIES,
    "PL": POLISH_CITIES,
}

# Real Ukrainian restaurant names by city
RESTAURANTS_BY_CITY = {
    "Kyiv": [
        "Kanapa", "Osteria Pantagruel", "BEEF", "Mama Manana", "Pervak", "Shinok", 
        "Ostannya Barykada", "BEEF Meat & Wine", "Lavra", "Bakun", "Vino e Cucina",
        "BEEF Steakhouse", "Mizandari", "BEEF Burger", "BEEF Bar", "BEEF Grill",
        "BEEF Prime", "BEEF House", "BEEF Kitchen", "BEEF Lounge"
    ],
    "Lviv": [
        "Kryjivka", "Lviv Handmade Chocolate", "Gasova Lampa", "Amadeus", "Kumpel",
        "Baczewski", "Veronika", "Atlas", "Mons Pius", "Bernardine", "Korzo",
        "Lviv Croissants", "Svit Kavy", "Videnska Kava", "Kredens Cafe"
    ],
    "Odesa": [
        "Dacha", "Kompot", "Bernardazzi", "Kumanets", "Moldovanka", "Derybas",
        "Gostiny Dvor", "Fankoni", "Kvartira 35", "Bratislava", "Mama Roma"
    ],
    "Kharkiv": [
        "Pervak", "Mizandari", "BEEF", "Shinok", "BEEF Steakhouse", "BEEF Burger",
        "BEEF Bar", "BEEF Grill", "BEEF Prime", "BEEF House"
    ],
    "Dnipro": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar",
        "BEEF Grill", "BEEF Prime", "BEEF House", "BEEF Kitchen"
    ],
    "Zaporizhzhia": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Vinnytsia": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Chernivtsi": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Ivano-Frankivsk": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Ternopil": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Uzhhorod": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Lutsk": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Poltava": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Sumy": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Khmelnytskyi": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Rivne": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Zhytomyr": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Mykolaiv": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Kherson": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
    "Kropyvnytskyi": [
        "BEEF", "Pervak", "Mizandari", "BEEF Steakhouse", "BEEF Burger", "BEEF Bar"
    ],
}

# Real Ukrainian addresses by city (main streets)
ADDRESSES_BY_CITY = {
    "Kyiv": [
        "Khreshchatyk St", "Andriivskyi Descent", "Velyka Zhytomyrska St", "Volodymyrska St",
        "Bohdana Khmelnytskoho St", "Hrushevskoho St", "Lva Tolstoho St", "Saksahanskoho St"
    ],
    "Lviv": [
        "Rynok Square", "Svobody Ave", "Horodotska St", "Doroshenka St", "Shevchenko Ave",
        "Kopernyka St", "Hrushevskoho St", "Kulparkivska St"
    ],
    "Odesa": [
        "Derybasivska St", "Primorskyi Blvd", "Rishelievska St", "Hretska St",
        "Pushkinska St", "Lanzheronivska St", "Katerynynska St"
    ],
    "Kharkiv": [
        "Svobody Square", "Sumska St", "Pushkinska St", "Poltavskyi Shliakh",
        "Nauky Ave", "Moskovskyi Ave", "Heroiv Kharkova Ave"
    ],
    "Dnipro": [
        "Dmytra Yavornytskoho Ave", "Soborna St", "Naberezhna St", "Heroiv Ave",
        "Karla Marksa Ave", "Haharina Ave"
    ],
    "Zaporizhzhia": [
        "Sobornyi Ave", "Lenina Ave", "Metalurhiv Ave", "Peremohy Ave"
    ],
    "Vinnytsia": [
        "Soborna St", "Kotsiubynskoho St", "Hrushevskoho St", "Zaliznychna St"
    ],
    "Chernivtsi": [
        "Holovna St", "Kobylianska St", "Ruska St", "Shevchenko St"
    ],
    "Ivano-Frankivsk": [
        "Nezalezhnosti St", "Hrushevskoho St", "Vovchynetska St"
    ],
    "Ternopil": [
        "Ruska St", "Hrushevskoho St", "Lvivska St"
    ],
    "Uzhhorod": [
        "Korzo St", "Hrushevskoho St", "Kapushanska St"
    ],
    "Lutsk": [
        "Hrushevskoho St", "Kopernyka St", "Soborna St"
    ],
    "Poltava": [
        "Soborna St", "Pershotravneva St", "Hrushevskoho St"
    ],
    "Sumy": [
        "Soborna St", "Hrushevskoho St", "Pokrovska St"
    ],
    "Khmelnytskyi": [
        "Hrushevskoho St", "Soborna St", "Proskurivska St"
    ],
    "Rivne": [
        "Soborna St", "Hrushevskoho St", "Korolenka St"
    ],
    "Zhytomyr": [
        "Soborna St", "Hrushevskoho St", "Peremohy St"
    ],
    "Mykolaiv": [
        "Soborna St", "Admiralska St", "Naberezhna St"
    ],
    "Kherson": [
        "Soborna St", "Ushakova Ave", "Naberezhna St"
    ],
    "Kropyvnytskyi": [
        "Soborna St", "Hrushevskoho St", "Preobrazhenska St"
    ],
}

COMPANY_NAMES = [
    "Gastro Group", "Food Planet", "Delight Co", "TasteLab", "UrbanEats",
    "BEEF Restaurant Group", "Pervak Group", "Mizandari Group"
]

MENUS = ["Breakfast", "Lunch", "Dinner", "Drinks", "Desserts"]
CUISINES = ["Ukrainian", "Italian", "European", "American", "Japanese", "French", "Georgian", "Asian"]
MENU_CATEGORIES = ["Starters", "Main Course", "Desserts", "Drinks", "Salads", "Snacks", "Appetizers", "Soups", "Beverages", "Sides"]

# ----------------------------
# Helper functions
# ----------------------------
def create_users(n=20):
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
        cities_data = CITIES_BY_COUNTRY[c["code"]]
        for city_data in cities_data:
            City.objects.get_or_create(country=country, name=city_data["name"])

def create_companies(users):
    for name in COMPANY_NAMES:
        owner = random.choice(users)
        Company.objects.get_or_create(
            name=name,
            defaults={
                "owner": owner,
                "description": f"{name} specializes in modern dining experiences.",
                "website": f"https://{name.replace(' ', '').lower()}.com",
                "email": f"info@{name.replace(' ', '').lower()}.com",
            }
        )

def create_restaurants():
    all_companies = list(Company.objects.all())
    ukraine = Country.objects.get(code="UA")
    poland = Country.objects.get(code="PL")
    
    # Create 50+ restaurants in Ukraine
    ukrainian_cities = City.objects.filter(country=ukraine)
    restaurant_count = 0
    
    for city in ukrainian_cities:
        city_data = next((c for c in UKRAINIAN_CITIES if c["name"] == city.name), None)
        if not city_data:
            continue
            
        # Get restaurant names for this city
        restaurant_names = RESTAURANTS_BY_CITY.get(city.name, ["BEEF", "Pervak", "Mizandari"])
        addresses = ADDRESSES_BY_CITY.get(city.name, ["Soborna St", "Hrushevskoho St"])
        
        # Create 2-4 restaurants per city (more for major cities)
        num_restaurants = 4 if city.name in ["Kyiv", "Lviv", "Odesa", "Kharkiv"] else random.randint(2, 3)
        
        for i in range(num_restaurants):
            if restaurant_count >= 55:  # Stop at 55 restaurants
                break
                
            company = random.choice(all_companies)
            restaurant_name = restaurant_names[i % len(restaurant_names)]
            address_street = random.choice(addresses)
            address_number = random.randint(1, 200)
            
            restaurant = Restaurant.objects.create(
                company=company,
                city=city,
                name=restaurant_name,
                address=f"{address_number} {address_street}, {city.name}",
                phone=f"+380{random.randint(100000000, 999999999)}",
                email=f"contact@{restaurant_name.lower().replace(' ', '')}.com",
                is_active=True,
            )
            
            # Create restaurant location with real coordinates (with small random offset)
            offset_lat = random.uniform(-0.01, 0.01)
            offset_lng = random.uniform(-0.01, 0.01)
            
            RestaurantLocation.objects.create(
                restaurant=restaurant,
                country=city.country,
                city=city,
                address=f"{address_number} {address_street}, {city.name}",
                description=f"{restaurant_name} located in the heart of {city.name}.",
                latitude=round(city_data["lat"] + offset_lat, 6),
                longitude=round(city_data["lng"] + offset_lng, 6),
            )
            
            restaurant_count += 1
        
        if restaurant_count >= 55:
            break
    
    # Create a few restaurants in Poland
    polish_cities = City.objects.filter(country=poland)
    for city in polish_cities:
        city_data = next((c for c in POLISH_CITIES if c["name"] == city.name), None)
        if not city_data:
            continue
            
        for i in range(random.randint(1, 2)):
            company = random.choice(all_companies)
            restaurant = Restaurant.objects.create(
                company=company,
                city=city,
                name=f"{city.name} {random.choice(['Bistro', 'Grill', 'Cafe', 'Restaurant'])}",
                address=f"{random.randint(1, 200)} {random.choice(['Main St', 'Central Ave', 'Old Town'])}",
                phone=f"+48{random.randint(100000000, 999999999)}",
                email=f"contact@{city.name.lower()}.example.com",
                is_active=True,
            )
            
            offset_lat = random.uniform(-0.01, 0.01)
            offset_lng = random.uniform(-0.01, 0.01)
            
            RestaurantLocation.objects.create(
                restaurant=restaurant,
                country=city.country,
                city=city,
                address=f"{random.randint(1, 200)} {random.choice(['Main St', 'Central Ave', 'Old Town'])}, {city.name}",
                description=f"Restaurant located in {city.name}.",
                latitude=round(city_data["lat"] + offset_lat, 6),
                longitude=round(city_data["lng"] + offset_lng, 6),
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
        # 8-15 tables per restaurant
        for i in range(1, random.randint(8, 16)):
            table = Table.objects.create(
                restaurant=restaurant,
                number=str(i),
                seats=random.choice([2, 4, 6, 8])
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
        restaurant_cuisines = random.sample(all_cuisines, random.randint(2, min(4, len(all_cuisines))))
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
                n_items = random.randint(3, 8)
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
                            'price': round(random.uniform(50, 500), 2),
                        }
                    )

def create_reservations(users):
    all_restaurants = list(Restaurant.objects.all())
    for _ in range(100):
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
        for _ in range(random.randint(5, 15)):
            user = random.choice(users)
            food = round(random.uniform(3.5, 5.0), 2)
            interior = round(random.uniform(3.5, 5.0), 2)
            atmosphere = round(random.uniform(3.5, 5.0), 2)
            service = round(random.uniform(3.5, 5.0), 2)
            overall = round((food + interior + atmosphere + service) / 4, 2)
            
            comments = [
                f"{restaurant.name} is a great place! Loved it.",
                f"Amazing food and atmosphere at {restaurant.name}.",
                f"Highly recommend {restaurant.name}. Excellent service!",
                f"One of the best restaurants in {restaurant.city.name}.",
                f"Great experience at {restaurant.name}. Will come back!",
            ]
            
            Review.objects.create(
                user=user,
                restaurant=restaurant,
                food=food,
                interior=interior,
                atmosphere=atmosphere,
                service=service,
                overall=overall,
                comment=random.choice(comments),
            )

def create_favourites(users):
    for user in users:
        fav_restaurants = random.sample(list(Restaurant.objects.all()), random.randint(2, 5))
        for r in fav_restaurants:
            FavouriteRestaurant.objects.get_or_create(user=user, restaurant=r)
        fav_items = random.sample(list(MenuItem.objects.all()), random.randint(3, 8))
        for i in fav_items:
            FavouriteRestaurantItem.objects.get_or_create(user=user, menu_item=i)

# ----------------------------
# Management Command
# ----------------------------
class Command(BaseCommand):
    help = "Populate the database with realistic restaurant data focused on Ukraine."

    def handle(self, *args, **options):
        self.stdout.write("🚀 Populating database with Ukrainian restaurants...")
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
        
        restaurant_count = Restaurant.objects.count()
        self.stdout.write(self.style.SUCCESS(f"🎉 Database populated successfully!"))
        self.stdout.write(self.style.SUCCESS(f"   Created {restaurant_count} restaurants"))
        self.stdout.write(self.style.SUCCESS(f"   Created {RestaurantLocation.objects.count()} restaurant locations"))
        self.stdout.write(self.style.SUCCESS(f"   Created {Review.objects.count()} reviews"))
