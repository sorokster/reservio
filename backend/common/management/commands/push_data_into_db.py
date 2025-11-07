from django.core.management.base import BaseCommand
import random
from datetime import time
from django.contrib.auth.models import User
from backend.common.models import Country, City, Company, Restaurant, Schedule, Table, Menu, Cuisine, MenuItem, Review

class Command(BaseCommand):
    help = "Populate database with test restaurants, menus, schedules, tables, and reviews"

    def handle(self, *args, **options):
        # ----------------------------
        # Create 1 Country
        # ----------------------------
        ukraine, _ = Country.objects.get_or_create(name="Ukraine", code="UA")

        # ----------------------------
        # Create 10 Cities
        # ----------------------------
        city_names = ["Kyiv", "Lviv", "Odesa", "Kharkiv", "Dnipro", "Zaporizhzhia",
                      "Ivano-Frankivsk", "Vinnytsia", "Chernihiv", "Sumy"]
        cities = [City.objects.get_or_create(name=name, country=ukraine)[0] for name in city_names]

        # ----------------------------
        # Create 20 Companies
        # ----------------------------
        company_names = [f"Company {i}" for i in range(1, 21)]
        companies = [Company.objects.get_or_create(name=name, defaults={'description': f'{name} in Ukraine'})[0] for name in company_names]

        # ----------------------------
        # Create 100 restaurants
        # ----------------------------
        restaurants = []
        existing_restaurant_names = set(Restaurant.objects.values_list('name', flat=True))
        for i in range(100):
            company = random.choice(companies)
            city = random.choice(cities)
            name = f"{company.name} {city.name} Branch {i + 1}"
            while name in existing_restaurant_names:
                name += f"-{random.randint(1, 999)}"
            existing_restaurant_names.add(name)
            address = f"{random.randint(1, 100)} {city.name} Street"
            phone = f"+380{random.randint(500000000, 699999999)}"
            email = f"{city.name.lower()}_{i + 1}@{company.name.replace(' ', '').lower()}.com"
            restaurants.append(Restaurant(
                company=company,
                country=ukraine,
                city=city,
                name=name,
                address=address,
                phone=phone,
                email=email
            ))

        Restaurant.objects.bulk_create(restaurants)
        all_restaurants = list(Restaurant.objects.all())

        # ----------------------------
        # Create menu, cuisines, items
        # ----------------------------
        cuisine_names = ["Italian", "Japanese", "Ukrainian", "French", "Mexican",
                         "Chinese", "Indian", "Mediterranean", "Seafood", "Fast Food"]

        for restaurant in all_restaurants:
            menu_name = f"{restaurant.name} Menu"
            menu, _ = Menu.objects.get_or_create(restaurant=restaurant, name=menu_name)

            cuisines_for_restaurant = random.sample(cuisine_names, random.randint(3, 5))
            cuisines = []

            for cuisine_name in cuisines_for_restaurant:
                cuisine, _ = Cuisine.objects.get_or_create(name=cuisine_name)
                if not menu.cuisines.filter(id=cuisine.id).exists():
                    cuisine.menu.add(menu)
                cuisines.append(cuisine)

            for cuisine in cuisines:
                existing_item_names = set(
                    MenuItem.objects.filter(menu=menu, cuisine=cuisine).values_list('name', flat=True)
                )
                for _ in range(random.randint(40, 50)):
                    while True:
                        item_name = f"{cuisine.name} Dish {random.randint(1, 10000)}"
                        if item_name not in existing_item_names:
                            existing_item_names.add(item_name)
                            break
                    price = round(random.uniform(5, 50), 2)
                    MenuItem.objects.create(
                        menu=menu,
                        cuisine=cuisine,
                        name=item_name,
                        description=f"Tasty {item_name}",
                        price=price
                    )

        # ----------------------------
        # Create schedule
        # ----------------------------
        for restaurant in all_restaurants:
            schedules = []
            for weekday in range(1, 8):
                is_closed = False
                if weekday in [6, 7]:
                    is_closed = random.choice([True, False])
                if is_closed:
                    time_from = None
                    time_to = None
                else:
                    start_hour = random.randint(9, 12)
                    end_hour = random.randint(20, 23)
                    time_from = time(start_hour, 0)
                    time_to = time(end_hour, 0)
                schedules.append(Schedule(
                    restaurant=restaurant,
                    weekday=weekday,
                    is_closed=is_closed,
                    time_from=time_from,
                    time_to=time_to
                ))
            Schedule.objects.bulk_create(schedules)

        # ----------------------------
        # Create tables
        # ----------------------------
        for restaurant in all_restaurants:
            tables = []
            num_tables = random.randint(10, 25)
            existing_table_numbers = set(Table.objects.filter(restaurant=restaurant).values_list('number', flat=True))
            for n in range(1, num_tables + 1):
                number = str(n)
                while number in existing_table_numbers:
                    number = str(n) + f"-{random.randint(1, 999)}"
                existing_table_numbers.add(number)
                tables.append(Table(
                    restaurant=restaurant,
                    number=number,
                    seats=random.choice([2, 4, 6, 8])
                ))
            Table.objects.bulk_create(tables)

        # ----------------------------
        # Create users
        # ----------------------------
        users = list(User.objects.all())
        if not users:
            users = []
            for i in range(100):
                user = User.objects.create_user(username=f"user{i}", email=f"user{i}@example.com", password="1234")
                users.append(user)

        # ----------------------------
        # Create reviews
        # ----------------------------
        for restaurant in all_restaurants:
            num_reviews = random.randint(25, 50)
            existing_reviews = set(Review.objects.filter(restaurant=restaurant).values_list('user_id', flat=True))
            for _ in range(num_reviews):
                user = random.choice(users)
                while user.id in existing_reviews:
                    user = random.choice(users)
                existing_reviews.add(user.id)
                rating = round(random.uniform(1, 5), 2)
                comment = f"This is a review by {user.username} with rating {rating}"
                Review.objects.create(user=user, restaurant=restaurant, rating=rating, comment=comment)

        self.stdout.write(self.style.SUCCESS("Database populated successfully!"))