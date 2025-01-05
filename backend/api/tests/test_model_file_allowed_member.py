from django.test import TestCase

from api.models import Track, File, FileAllowedMember
from api.tests.common_setups import basic_setup, basic_setup_teardown


class FileAllowedMemberModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")
        self.file = File.objects.create(track=self.track, name="Music File")
        self.file_allowed_member = FileAllowedMember.objects.create(file=self.file, user=self.moderator)

    def test_file_allowed_member_creation(self):
        self.assertEqual(self.file_allowed_member.file, self.file)
        self.assertEqual(self.file_allowed_member.user, self.moderator)

    def test_file_allowed_member_creation_with_invalid_file(self):
        with self.assertRaises(Exception):
            FileAllowedMember.objects.create(file="File", user=self.moderator)

    def test_file_allowed_member_creation_with_invalid_user(self):
        with self.assertRaises(Exception):
            FileAllowedMember.objects.create(file=self.file, user="User")

    def test_string_representation(self):
        self.assertEqual(str(self.file_allowed_member), f"{self.file.name} → {self.moderator} ({self.file_allowed_member.file_allowed_member_id})")

    def tearDown(self):
        self.file_allowed_member.delete()
        self.file.delete()
        self.track.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
