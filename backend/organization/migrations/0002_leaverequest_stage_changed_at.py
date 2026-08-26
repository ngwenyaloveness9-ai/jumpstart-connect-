from django.db import migrations, models
from django.db.models.functions import Now


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="leaverequest",
            name="stage_changed_at",
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.RunPython(
            lambda apps, schema_editor: apps.get_model("organization", "LeaveRequest").objects.filter(stage_changed_at__isnull=True).update(stage_changed_at=Now()),
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="leaverequest",
            name="stage_changed_at",
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
