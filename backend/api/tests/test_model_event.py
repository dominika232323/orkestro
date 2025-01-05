from django.test import TestCase
from django.utils import timezone

from api.models import Group, Event


class EventModelTests(TestCase):
    def setUp(self):
        self.fixed_date = timezone.now()
        self.group = Group.objects.create(name="Music Group", description="A group for musicians")
        self.event = Event.objects.create(group=self.group, name="Concert", description="A great concert", date=self.fixed_date, place="NYC")

    def test_event_creation(self):
        self.assertEqual(self.event.group, self.group)

        self.assertEqual(self.event.name, "Concert")
        self.assertEqual(self.event.description, "A great concert")

        self.assertIsNotNone(self.event.date)
        self.assertEqual(self.event.date, self.fixed_date)

        self.assertEqual(self.event.place, "NYC")

    def test_event_creation_with_invalid_group(self):
        with self.assertRaises(Exception):
            Event.objects.create(group="Group", name="Concert", description="A great concert", date=self.fixed_date, place="NYC")

    def test_string_representation(self):
        self.assertEqual(str(self.event), f"Concert ({self.event.event_id})")

    def tearDown(self):
        self.event.delete()
        self.group.delete()
