from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction


User = get_user_model()


class Command(BaseCommand):
    help = "Grant or revoke System Admin access for existing employee accounts."

    def add_arguments(self, parser):
        parser.add_argument("emails", nargs="+", help="Email addresses of employee accounts.")
        parser.add_argument(
            "--revoke",
            action="store_true",
            help="Remove System Admin access instead of granting it.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        users = []
        for email in options["emails"]:
            try:
                user = User.objects.get(email__iexact=email.strip())
            except User.DoesNotExist as exc:
                raise CommandError(f"No account found for {email}.") from exc

            if user.role not in {"employee", "manager"} or user.is_superuser:
                raise CommandError(
                    f"{user.email} must be an employee or manager account to receive "
                    "System Admin access."
                )
            users.append(user)

        grant_access = not options["revoke"]
        for user in users:
            user.is_system_admin = grant_access
            user.save(update_fields=["is_system_admin"])
            action = "Granted" if grant_access else "Revoked"
            self.stdout.write(f"{action} System Admin access for {user.email}.")
