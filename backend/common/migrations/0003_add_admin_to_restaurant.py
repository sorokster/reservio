# Generated manually
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0002_add_owner_to_company'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='restaurant',
            name='admin',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='admin_restaurants',
                to=settings.AUTH_USER_MODEL,
                db_index=True
            ),
        ),
        migrations.AddIndex(
            model_name='restaurant',
            index=models.Index(fields=['admin'], name='common_restaurant_admin_idx'),
        ),
    ]

