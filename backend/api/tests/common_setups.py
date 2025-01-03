"""
Contains setUp/tearDown elements that are used in multiple test classes.
"""
from django.utils import timezone

from api.models import User, Group, Member


def basic_setup():
    group = Group.objects.create(name="Group")

    now = timezone.now()
    staff = User.objects.create(email="staff@a.com", name="Staf", surname="F",date_joined=now,
                                is_staff=True, is_superuser=True)
    manager = User.objects.create(email="manager@a.com", name="Manage", surname="R", date_joined=now)
    moderator = User.objects.create(email="moderator@a.com", name="Moderato", surname="R", date_joined=now)
    musician = User.objects.create(email="musician@a.com", name="Musicia", surname="N", date_joined=now)
    outsider = User.objects.create(email="outsider@a.com", name="Outside", surname="R", date_joined=now)
    unauthenticated = User.objects.create(email="unauthenticated@a.com", name="Unauthenticate", surname="D", date_joined=now)

    Member.objects.create(group=group, user=manager, permission_level="A")
    Member.objects.create(group=group, user=moderator, permission_level="B")
    Member.objects.create(group=group, user=musician, permission_level="C")

    return staff, manager, moderator, musician, outsider, unauthenticated, group

def basic_setup_teardown(group, users):
    group.delete()
    for user in users:
        user.delete()
