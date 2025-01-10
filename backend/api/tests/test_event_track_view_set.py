from tokenize import group

from django.utils import timezone
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Event, Track, EventTrack
from api.tests.common_setups import basic_setup_teardown, basic_setup
from api.views.event_track_view_set import EventTrackViewSet


class EventTrackViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.event = Event.objects.create(group=self.group, name="e", description="d", date=timezone.now(), place="p")
        self.track = Track.objects.create(name="t", artist="a", group=self.group)

    def test_create_access(self):
        test_cases = [
            {"user": self.staff, "expected_status": 201},
            {"user": self.manager, "expected_status": 201},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Prepare valid event data
                event_track_data = {
                    "track": self.track.track_id,
                    "event": self.event.event_id,
                }

                # Create a request
                request = self.factory.post("/api/event-tracks/", event_track_data, format="json")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the create method
                view = EventTrackViewSet.as_view({"post": "create"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 201:
                    self.assertEqual(response.data["event"], self.event.event_id)
                    self.assertEqual(response.data["track"], self.track.track_id)
                    EventTrack.objects.get(event_track_id=response.data["event_track_id"]).delete()

    def test_create_invalid_data(self):
        # Prepare invalid data
        event_track_data = {
            "track": "aaaa",
            "event": "bbbb",
        }

        # Create a request
        request = self.factory.post("/api/event-tracks/", event_track_data, format="json")
        force_authenticate(request, user=self.staff)

        # Instantiate the view and call the create method
        view = EventTrackViewSet.as_view({"post": "create"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Data validation failed")

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
            {
                "track": track_1,
                "expected_status": 200,
                "expected_count": 2,
                "expected_items": [event_1.event_id, event_2.event_id]
            },
            {
                "track": track_2,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [event_1.event_id]
            },
            {
                "track": track_3,
                "expected_status": 200,
                "expected_count": 3,
                "expected_items": [event_1.event_id, event_2.event_id, event_3.event_id]
            },
        ]

        for case in test_cases:
            with self.subTest(track=case["track"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/event-tracks/by_track/?track_id={case['track'].track_id}")
                force_authenticate(request, user=self.staff)
                response = EventTrackViewSet.as_view({'get': 'by_track'})(request)

                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data), case["expected_count"])

                returned_events = [event_track["event"] for event_track in response.data]
                self.assertEqual(returned_events, case["expected_items"])

    def test_by_event(self):
        event_1 = Event.objects.create(group=self.group, name="e 1", description="d 1", date=timezone.now(),
                                       place="p 1")
        event_2 = Event.objects.create(group=self.group, name="e 2", description="d 2", date=timezone.now(),
                                       place="p 2")
        event_3 = Event.objects.create(group=self.group, name="e 3", description="d 3", date=timezone.now(),
                                       place="p 3")

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
            {
                "event": event_1,
                "expected_status": 200,
                "expected_count": 3,
                "expected_items": [track_1.track_id, track_2.track_id, track_3.track_id]
            },
            {
                "event": event_2,
                "expected_status": 200,
                "expected_count": 2,
                "expected_items": [track_1.track_id, track_3.track_id]
            },
            {
                "event": event_3,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [track_3.track_id]
            },
        ]

        for case in test_cases:
            with self.subTest(track=case["event"]):
                # Prepare the request
                request = self.factory.get(f"/api/event-tracks/by_event/?event_id={case['event'].event_id}")
                force_authenticate(request, user=self.manager)

                # Execute the request
                response = EventTrackViewSet.as_view({"get": "by_event"})(request)

                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data), case["expected_count"])

                returned_tracks = [event_track["track"] for event_track in response.data]
                self.assertEqual(returned_tracks, case["expected_items"])

    def tearDown(self):
        self.track.delete()
        self.event.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
