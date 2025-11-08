# Generated manually

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('common', '0004_remove_restaurant_admin'),
    ]

    operations = [
        migrations.CreateModel(
            name='FavouriteRestaurant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('restaurant', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='favourited_by', to='common.restaurant')),
                ('user', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='favourite_restaurants', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('user', 'restaurant')},
            },
        ),
        migrations.CreateModel(
            name='FavouriteRestaurantItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('menu_item', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='favourited_by', to='common.menuitem')),
                ('user', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='favourite_menu_items', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('user', 'menu_item')},
            },
        ),
        migrations.AddIndex(
            model_name='favouriterestaurantitem',
            index=models.Index(fields=['user', 'menu_item'], name='common_fav_user_menu_idx'),
        ),
        migrations.AddIndex(
            model_name='favouriterestaurantitem',
            index=models.Index(fields=['user'], name='common_fav_item_user_idx'),
        ),
        migrations.AddIndex(
            model_name='favouriterestaurantitem',
            index=models.Index(fields=['menu_item'], name='common_fav_item_menu_idx'),
        ),
        migrations.AddIndex(
            model_name='favouriterestaurant',
            index=models.Index(fields=['user', 'restaurant'], name='common_fav_user_rest_idx'),
        ),
        migrations.AddIndex(
            model_name='favouriterestaurant',
            index=models.Index(fields=['user'], name='common_fav_rest_user_idx'),
        ),
        migrations.AddIndex(
            model_name='favouriterestaurant',
            index=models.Index(fields=['restaurant'], name='common_fav_rest_rest_idx'),
        ),
    ]

