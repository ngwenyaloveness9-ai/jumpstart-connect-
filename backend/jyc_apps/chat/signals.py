from django.db.models.signals import post_save
from django.dispatch import receiver

from users.models import User
from .models import Group, GroupMember


@receiver(post_save, sender=User)
def auto_join_groups(sender, instance, created, **kwargs):

    if not created:
        return

    # -------------------------
    # MAIN WORKSPACE
    # -------------------------

    main_workspace = Group.objects.filter(
        group_type="MAIN",
        name="Main Workspace",
    ).first()

    if main_workspace:
        GroupMember.objects.get_or_create(
            group=main_workspace,
            user=instance,
        )

    # -------------------------
    # DEPARTMENT WORKSPACE
    # -------------------------

    if instance.department:

        department_workspace = Group.objects.filter(
            group_type="DEPARTMENT",
            department=instance.department,
        ).first()

        if department_workspace:
            GroupMember.objects.get_or_create(
                group=department_workspace,
                user=instance,
            )