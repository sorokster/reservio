# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0006_rename_common_company_owner_idx_common_comp_owner_i_7ac174_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='restaurant',
            name='map_position',
            field=models.JSONField(blank=True, help_text="Map coordinates in format: {'lat': float, 'lng': float}", null=True),
        ),
    ]

