from django.test import TestCase

from api.models import Member
from api.tests.common_setups import basic_setup, basic_setup_teardown


class MemberModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.member = Member.objects.create(user=self.outsider, group=self.group, permission_level="C")

    def test_member_creation(self):
        self.assertEqual(self.member.user, self.outsider)
        self.assertEqual(self.member.group, self.group)
        self.assertEqual(self.member.permission_level, "C")

    def test_string_representation(self):
        self.assertEqual(str(self.member), f"{self.group.name} → {self.outsider} ({self.member.member_id})")

    def tearDown(self):
        self.member.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
