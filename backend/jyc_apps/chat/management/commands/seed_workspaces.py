from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jyc_apps.chat.models import Group

User = get_user_model()


class Command(BaseCommand):
    help = "Create the default JumpStart Connect workspaces"

    def handle(self, *args, **options):
        admin = User.objects.filter(role__iexact="superadmin").first()

        workspaces = [
            ("Main Workspace", "MAIN", None),
            ("Technology", "DEPARTMENT", "Technology"),
            ("Marketing", "DEPARTMENT", "Marketing"),
            ("Management", "DEPARTMENT", "Management"),
            ("Human Resources", "DEPARTMENT", "Human Resources"),
            ("Project Management", "DEPARTMENT", "Project Management"),
            ("Planning & Development", "DEPARTMENT", "Planning & Development"),
            ("Monitoring & Evaluation", "DEPARTMENT", "Monitoring & Evaluation"),
            ("Clean Energy", "DEPARTMENT", "Clean Energy"),
            ("Board Members", "DEPARTMENT", "Board Members"),
        ]

        for name, group_type, department in workspaces:
            Group.objects.get_or_create(
                name=name,
                defaults={
                    "description": f"{name} Workspace",
                    "group_type": group_type,
                    "department": department,
                    "created_by": admin,
                },
            )

        self.stdout.write(
            self.style.SUCCESS("Default workspaces created successfully.")
        )