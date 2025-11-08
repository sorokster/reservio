# Generated manually
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='company',
            name='owner',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='owned_companies',
                to=settings.AUTH_USER_MODEL,
                db_index=True
            ),
        ),
        migrations.AddIndex(
            model_name='company',
            index=models.Index(fields=['owner'], name='common_company_owner_idx'),
        ),
    ]

