from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0009_messagereaction"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="read_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="groupmember",
            name="last_read_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
