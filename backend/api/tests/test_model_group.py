from django.test import TestCase

from api.models import Group


class GroupModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group", description="A group for musicians")

    def test_group_creation(self):
        self.assertEqual(self.group.name, "Music Group")
        self.assertEqual(self.group.description, "A group for musicians")
        self.assertIsNone(self.group.supergroup)

    def test_group_creation_with_supergroup(self):
        group = Group.objects.create(name="Music Group 2", description="A group for musicians", supergroup=self.group)

        self.assertEqual(group.name, "Music Group 2")
        self.assertEqual(group.description, "A group for musicians")
        self.assertEqual(group.supergroup, self.group)

    def test_group_creation_with_invalid_supergroup(self):
        with self.assertRaises(Exception):
            Group.objects.create(name="Music Group 2", description="A group for musicians", supergroup="ABC")

    def test_string_representation(self):
        self.assertEqual(str(self.group), f"Music Group ({self.group.group_id})")

    def tearDown(self):
        self.group.delete()
