from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0002_leaverequest_stage_changed_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="leaverequest",
            name="attachment",
            field=models.FileField(blank=True, null=True, upload_to="leave_attachments/"),
        ),
        migrations.AddField(
            model_name="leaverequest",
            name="decline_reason",
            field=models.TextField(blank=True, default=""),
        ),
    ]
