from django.test import TestCase
from django.utils import timezone

from api.models import Event, EventAttendee
from api.tests.common_setups import basic_setup, basic_setup_teardown


class EventAttendeeModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.event = Event.objects.create(group=self.group, name="Concert", description="Description", date=timezone.now(), place="NYC")
        self.attendee = EventAttendee.objects.create(event=self.event, user=self.moderator)

    def test_event_attendee_creation(self):
        self.assertEqual(self.attendee.event, self.event)
        self.assertEqual(self.attendee.user, self.moderator)

    def test_string_representation(self):
        self.assertEqual(str(self.attendee), f"{self.event.name} → {self.moderator} ({self.attendee.event_attendee_id})")

    def tearDown(self):
        self.attendee.delete()
        self.event.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
