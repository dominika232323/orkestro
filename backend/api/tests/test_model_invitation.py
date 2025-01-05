from django.test import TestCase

from api.models import Invitation
from api.tests.common_setups import basic_setup, basic_setup_teardown


class InvitationModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.invitation = Invitation.objects.create(group=self.group, user=self.outsider, permission_level="C")

    def test_invitation_creation(self):
        self.assertEqual(self.invitation.group, self.group)
        self.assertEqual(self.invitation.user, self.outsider)
        self.assertEqual(self.invitation.permission_level, "C")

    def test_invitation_creation_with_invalid_group(self):
        with self.assertRaises(Exception):
            Invitation.objects.create(group="Group", user=self.outsider, permission_level="C")

    def test_invitation_creation_with_invalid_user(self):
        with self.assertRaises(Exception):
            Invitation.objects.create(group=self.group, user="User", permission_level="C")

    def test_string_representation(self):
        self.assertEqual(str(self.invitation), f"{self.group.name} → {self.outsider} ({self.invitation.invitation_id})")

    def tearDown(self):
        self.invitation.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
