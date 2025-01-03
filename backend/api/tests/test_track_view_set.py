from django.utils import timezone
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Track, Event, EventTrack, Instrument, FileInstrument, File
from api.tests.common_setups import basic_setup, basic_setup_teardown
from api.views.track_view_set import TrackViewSet


class TrackViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.track1 = Track.objects.create(name="Track 1", group=self.group, artist="Artist 1")
        self.track2 = Track.objects.create(name="Track 2", group=self.group, artist="Artist 2")
        self.track3 = Track.objects.create(name="Another Track", group=self.group, artist="Artist 3")

        self.event1 = Event.objects.create(group=self.group, name="Event 1", description="D", date=timezone.now(), place="P")
        self.event2 = Event.objects.create(group=self.group, name="Event 2", description="D", date=timezone.now(), place="P")

        self.event_track1 = EventTrack.objects.create(event=self.event1, track=self.track1)
        self.event_track2 = EventTrack.objects.create(event=self.event1, track=self.track2)
        self.event_track3 = EventTrack.objects.create(event=self.event2, track=self.track3)

        self.file1 = File.objects.create(track=self.track1, name="File 1", content=b"Content 1")
        self.file2 = File.objects.create(track=self.track2, name="File 2", content=b"Content 2")
        self.file3 = File.objects.create(track=self.track3, name="File 3", content=b"Content 3")

        self.instrument1 = Instrument.objects.create(name_pl="Gitara", name_en="Guitar")

        self.file_instrument1 = FileInstrument.objects.create(file=self.file1, instrument=self.instrument1)
        self.file_instrument2 = FileInstrument.objects.create(file=self.file2, instrument=self.instrument1)
        self.file_instrument3 = FileInstrument.objects.create(file=self.file3, instrument=self.instrument1)

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
                # Prepare valid data
                track_data = {
                    "group": self.group.group_id,
                    "name": "Test Track",
                    "artist": "Test Artist",
                }

                # Create a request
                request = self.factory.post("/api/tracks/", track_data, format="json")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the create method
                view = TrackViewSet.as_view({"post": "create"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 201:
                    self.assertEqual(response.data["name"], "Test Track")
                    self.assertEqual(response.data["artist"], "Test Artist")
                    self.assertEqual(response.data["group"], self.group.group_id)

    def test_create_invalid_data(self):
        # Prepare invalid data
        track_data = {
            "group": "self.group.group_id",
            "name": "Test Track",
            "artist": "Test Artist",
        }

        # Create a request
        request = self.factory.post("/api/tracks/", track_data, format="json")
        force_authenticate(request, user=self.staff)

        # Instantiate the view and call the create method
        view = TrackViewSet.as_view({"post": "create"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Data validation failed")

    def test_search_tracks(self):
        # Test cases
        test_cases = [
            {
                "query_params": {"group_id": self.group.group_id},
                "expected_tracks": [self.track1, self.track2, self.track3],
            },
            {
                "query_params": {"group_id": self.group.group_id, "event": "Event 1"},
                "expected_tracks": [self.track1, self.track2],
            },
            {
                "query_params": {"group_id": self.group.group_id, "name": "Track"},
                "expected_tracks": [self.track1, self.track2, self.track3],
            },
            {
                "query_params": {
                    "group_id": self.group.group_id,
                    "instrument_id": [self.instrument1.instrument_id],
                },
                "expected_tracks": [self.track1, self.track2, self.track3],
            },
            {
                "query_params": {"group_id": self.group.group_id, "event": "Nonexistent"},
                "expected_tracks": [],
            },
        ]

        for case in test_cases:
            with self.subTest(query_params=case["query_params"]):
                # Create and authenticate request
                request = self.factory.get("/api/tracks/search/", case["query_params"])
                force_authenticate(request, user=self.manager)

                # Call the view
                view = TrackViewSet.as_view({"get": "search"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, 200)
                returned_tracks = [track["track_id"] for track in response.data]
                expected_track_ids = [track.track_id for track in case["expected_tracks"]]
                self.assertCountEqual(returned_tracks, expected_track_ids)

    def tearDown(self):
        self.file_instrument1.delete()
        self.file_instrument2.delete()
        self.file_instrument3.delete()

        self.instrument1.delete()

        self.file1.delete()
        self.file2.delete()
        self.file3.delete()

        self.event_track1.delete()
        self.event_track2.delete()
        self.event_track3.delete()

        self.event1.delete()
        self.event2.delete()

        self.track1.delete()
        self.track2.delete()
        self.track3.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
