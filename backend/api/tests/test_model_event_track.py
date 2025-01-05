from django.test import TestCase
from django.utils import timezone

from api.models import Event, Track, EventTrack
from api.tests.common_setups import basic_setup, basic_setup_teardown


class EventTrackModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.event = Event.objects.create(group=self.group, name="Concert", description="Description", date=timezone.now(), place="NYC")
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")
        self.event_track = EventTrack.objects.create(track=self.track, event=self.event)

    def test_event_track_creation(self):
        self.assertEqual(self.event_track.track, self.track)
        self.assertEqual(self.event_track.event, self.event)

    def test_event_track_creation_with_invalid_track(self):
        with self.assertRaises(Exception):
            EventTrack.objects.create(track="Track", event=self.event)

    def test_event_track_creation_with_invalid_user(self):
        with self.assertRaises(Exception):
            EventTrack.objects.create(track=self.track, event="Event")

    def test_string_representation(self):
        self.assertEqual(str(self.event_track), f"{self.event.name} → {self.track.name} ({self.event_track.event_track_id})")

    def tearDown(self):
        self.event_track.delete()
        self.track.delete()
        self.event.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
