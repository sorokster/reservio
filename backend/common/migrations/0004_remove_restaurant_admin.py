# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0003_add_admin_to_restaurant'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='restaurant',
            name='common_restaurant_admin_idx',
        ),
        migrations.RemoveField(
            model_name='restaurant',
            name='admin',
        ),
    ]

