from django.utils import timezone
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Event, Track, EventTrack
from api.test.common_setups import basic_setup_teardown, basic_setup
from api.view_set.event_track_view_set import EventTrackViewSet


class EventTrackViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_by_track(self):
        event_1 = Event.objects.create(group=self.group, name="e 1", description="d 1", date=timezone.now(), place="p 1")
        event_2 = Event.objects.create(group=self.group, name="e 2", description="d 2", date=timezone.now(), place="p 2")
        event_3 = Event.objects.create(group=self.group, name="e 3", description="d 3", date=timezone.now(), place="p 3")

        track_1 = Track.objects.create(group=self.group, name="t 1", artist="a 1")
        track_2 = Track.objects.create(group=self.group, name="t 2", artist="a 2")
        track_3 = Track.objects.create(group=self.group, name="t 3", artist="a 3")

        EventTrack.objects.create(event=event_1, track=track_1)
        EventTrack.objects.create(event=event_2, track=track_1)
        EventTrack.objects.create(event=event_1, track=track_2)
        EventTrack.objects.create(event=event_1, track=track_3)
        EventTrack.objects.create(event=event_2, track=track_3)
        EventTrack.objects.create(event=event_3, track=track_3)

        test_cases = [
            {"track": track_1, "expected_status": 200, "expected_count": 2},
            {"track": track_2, "expected_status": 200, "expected_count": 1},
            {"track": track_3, "expected_status": 200, "expected_count": 3},
        ]

        for case in test_cases:
            with self.subTest(track=case["track"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/event-tracks/by_track/?track_id={case["track"].track_id}")
                force_authenticate(request, user=self.staff)
                response = EventTrackViewSet.as_view({'get': 'by_track'})(request)

                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data), case["expected_count"])

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
