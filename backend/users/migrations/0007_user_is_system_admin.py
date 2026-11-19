from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0006_user_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_system_admin",
            field=models.BooleanField(default=False),
        ),
    ]
