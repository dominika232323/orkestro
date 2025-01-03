from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Track, File, Instrument, FileInstrument
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.file_instrument_view_set import FileInstrumentViewSet


class FileInstrumentViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.track_1 = Track.objects.create(group=self.group, name="Track 1", artist="Artist 1")
        self.track_2 = Track.objects.create(group=self.group, name="Track 2", artist="Artist 2")

        self.file_1 = File.objects.create(track=self.track_1, name="File 1", content=b"Content 1")
        self.file_2 = File.objects.create(track=self.track_2, name="File 2", content=b"Content 2")

        self.instrument_1 = Instrument.objects.create(name_en="Guitar", name_pl="Gitara")
        self.instrument_2 = Instrument.objects.create(name_en="Piano", name_pl="Pianino")

        self.file_instrument_1 = FileInstrument.objects.create(file=self.file_1, instrument=self.instrument_1)
        self.file_instrument_2 = FileInstrument.objects.create(file=self.file_1, instrument=self.instrument_2)
        self.file_instrument_3 = FileInstrument.objects.create(file=self.file_2, instrument=self.instrument_1)
        self.file_instrument_4 = FileInstrument.objects.create(file=self.file_2, instrument=self.instrument_2)

    def test_by_file(self):
        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "file": self.file_1, "expected_status": 200, "expected_event_count": 2},
            {"user": self.manager, "file": self.file_1, "expected_status": 200, "expected_event_count": 2},
            {"user": self.moderator, "file": self.file_1, "expected_status": 200, "expected_event_count": 2},
            {"user": self.musician, "file": self.file_1, "expected_status": 200, "expected_event_count": 2},
            {"user": self.outsider, "file": self.file_1, "expected_status": 403, "expected_event_count": 2},
            {"user": self.staff, "file": self.file_2, "expected_status": 200, "expected_event_count": 2},
            {"user": self.manager, "file": self.file_2, "expected_status": 200, "expected_event_count": 2},
            {"user": self.moderator, "file": self.file_2, "expected_status": 200, "expected_event_count": 2},
            {"user": self.musician, "file": self.file_2, "expected_status": 200, "expected_event_count": 2},
            {"user": self.outsider, "file": self.file_2, "expected_status": 403, "expected_event_count": 2},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"], file=case["file"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/file-instruments/by_file/?file_id={case['file'].file_id}")
                force_authenticate(request, user=case["user"])
                response = FileInstrumentViewSet.as_view({'get': 'by_file'})(request)

                # Assert the response status
                self.assertEqual(response.status_code, case["expected_status"])

                # Assert the event count for valid responses
                if case["expected_status"] == 200:
                    self.assertEqual(len(response.data), case["expected_event_count"])


    def tearDown(self):
        self.file_instrument_1.delete()
        self.file_instrument_2.delete()
        self.file_instrument_3.delete()
        self.file_instrument_4.delete()

        self.instrument_1.delete()
        self.instrument_2.delete()

        self.file_1.delete()
        self.file_2.delete()

        self.track_1.delete()
        self.track_2.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
