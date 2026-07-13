from django.db.models.signals import post_save
from django.dispatch import receiver

from users.models import User

from .models import Group, GroupMember


@receiver(post_save, sender=User)
def auto_join_groups(sender, instance, created, **kwargs):

    if not created:
        return

    # -------------------------
    # MAIN GROUP
    # -------------------------

    main_group, _ = Group.objects.get_or_create(
        name="Main Group",
        defaults={
            "group_type": "MAIN",
            "description": "Everyone in the organisation"
        }
    )

    GroupMember.objects.get_or_create(
        group=main_group,
        user=instance
    )

    # -------------------------
    # DEPARTMENT GROUP
    # -------------------------

    if instance.department:

        department_group, _ = Group.objects.get_or_create(
            name=instance.department,
            defaults={
                "group_type": "DEPARTMENT",
                "department": instance.department,
                "description": f"{instance.department} Department"
            }
        )

        GroupMember.objects.get_or_create(
            group=department_group,
            user=instance
        )