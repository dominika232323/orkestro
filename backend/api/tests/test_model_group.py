from django.test import TestCase

from api.models import Group


class GroupModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group", description="A group for musicians")

    def test_group_creation(self):
        self.assertEqual(self.group.name, "Music Group")

    def test_string_representation(self):
        self.assertEqual(str(self.group), f"Music Group ({self.group.group_id})")

    def tearDown(self):
        self.group.delete()
