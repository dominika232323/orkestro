from django.test import TestCase
from django.utils import timezone

from api.models import Group, Event


class EventModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group")
        self.event = Event.objects.create(group=self.group, name="Concert", description="A great concert", date=timezone.now(), place="NYC")

    def test_event_creation(self):
        self.assertEqual(self.event.name, "Concert")
        self.assertEqual(self.event.group, self.group)

    def test_string_representation(self):
        self.assertEqual(str(self.event), f"Concert ({self.event.event_id})")

    def tearDown(self):
        self.event.delete()
        self.group.delete()
