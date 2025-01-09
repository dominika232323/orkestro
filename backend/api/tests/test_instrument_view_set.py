from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Instrument, UserInstrument, Track, File, FileInstrument
from api.views.instrument_view_set import InstrumentViewSet
from api.tests.common_setups import basic_setup, basic_setup_teardown


class InstrumentViewSetTestCase(TestCase):
    def setUp(self):
        # Setup common users and permissions
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        # Create sample instruments
        self.instrument_1 = Instrument.objects.create(name_en="Guitar", name_pl="Gitara")
        self.instrument_2 = Instrument.objects.create(name_en="Piano", name_pl="Pianino")
        self.instrument_3 = Instrument.objects.create(name_en="Violin", name_pl="Skrzypce")

        self.user_instrument_1 = UserInstrument.objects.create(user=self.musician, instrument=self.instrument_1)
        self.user_instrument_2 = UserInstrument.objects.create(user=self.musician, instrument=self.instrument_3)
        self.user_instrument_3 = UserInstrument.objects.create(user=self.moderator, instrument=self.instrument_2)
        self.user_instrument_4 = UserInstrument.objects.create(user=self.moderator, instrument=self.instrument_3)
        self.user_instrument_5 = UserInstrument.objects.create(user=self.manager, instrument=self.instrument_2)

        self.track = Track.objects.create(group=self.group, name="Track 1", artist="Artist 1")
        self.file = File.objects.create(track=self.track, name="File 1", content=b"Content 1")

        self.file_instrument_1 = FileInstrument.objects.create(file=self.file, instrument=self.instrument_1)
        self.file_instrument_2 = FileInstrument.objects.create(file=self.file, instrument=self.instrument_3)

    def test_leftover(self):
        test_cases = [
            {
                "user": self.staff,
                "expected_status": 200,
                "expected_count": 3,
                "expected_items": [self.instrument_1.instrument_id, self.instrument_2.instrument_id, self.instrument_3.instrument_id]
            },
            {
                "user": self.manager,
                "expected_status": 200,
                "expected_count": 2,
                "expected_items": [self.instrument_1.instrument_id, self.instrument_3.instrument_id]
            },
            {
                "user": self.moderator,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_1.instrument_id]
            },
            {
                "user": self.musician,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_2.instrument_id]
            },
            {
                "user": self.outsider,
                "expected_status": 200,
                "expected_count": 3,
                "expected_items": [self.instrument_1.instrument_id, self.instrument_2.instrument_id, self.instrument_3.instrument_id]
            }
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                request = self.factory.get("/api/instruments/leftover/")
                force_authenticate(request, user=case["user"])

                response = InstrumentViewSet.as_view({"get": "leftover"})(request)

                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data), case["expected_count"])

                received_instruments = [instrument["instrument_id"] for instrument in response.data]
                self.assertEqual(received_instruments, case["expected_items"])

    def test_leftover_with_user_id(self):
        test_cases = [
            {
                "user": self.staff,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_2.instrument_id]
            },
            {
                "user": self.manager,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_2.instrument_id]
            },
            {
                "user": self.moderator,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_2.instrument_id]
            },
            {
                "user": self.musician,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_2.instrument_id]
            },
            {
                "user": self.outsider,
                "expected_status": 403,
            }
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                request = self.factory.get(f"/api/instruments/leftover/?user_id={self.musician.user_id}")
                force_authenticate(request, user=case["user"])

                response = InstrumentViewSet.as_view({"get": "leftover"})(request)

                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 200:
                    self.assertEqual(len(response.data), case["expected_count"])

                    received_instruments = [instrument["instrument_id"] for instrument in response.data]
                    self.assertEqual(received_instruments, case["expected_items"])

    def test_leftover_with_file_id(self):
        test_cases = [
            {
                "user": self.staff,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_2.instrument_id]
            },
            {
                "user": self.manager,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_2.instrument_id]
            },
            {
                "user": self.moderator,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_2.instrument_id]
            },
            {
                "user": self.musician,
                "expected_status": 200,
                "expected_count": 1,
                "expected_items": [self.instrument_2.instrument_id]
            },
            {
                "user": self.outsider,
                "expected_status": 403,
            }
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                request = self.factory.get(f"/api/instruments/leftover/?file_id={self.file.file_id}")
                force_authenticate(request, user=case["user"])

                response = InstrumentViewSet.as_view({"get": "leftover"})(request)

                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 200:
                    self.assertEqual(len(response.data), case["expected_count"])

                    received_instruments = [instrument["instrument_id"] for instrument in response.data]
                    self.assertEqual(received_instruments, case["expected_items"])


    def test_search_by_name_in_english(self):
        # Create a request to search instruments by name in English
        request = self.factory.get("/api/instruments/search/?language=en&name=Guitar")
        force_authenticate(request, user=self.staff)

        # Call the search view
        view = InstrumentViewSet.as_view({"get": "search"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name_en"], "Guitar")
        self.assertEqual(response.data[0]["name_pl"], "Gitara")

    def test_search_by_name_in_polish(self):
        # Create a request to search instruments by name in Polish
        request = self.factory.get("/api/instruments/search/?language=pl&name=Gitara")
        force_authenticate(request, user=self.staff)

        # Call the search view
        view = InstrumentViewSet.as_view({"get": "search"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name_en"], "Guitar")
        self.assertEqual(response.data[0]["name_pl"], "Gitara")

    def test_search_no_results(self):
        # Create a request for a name that doesn't exist
        request = self.factory.get("/api/instruments/search/?language=en&name=Flute")
        force_authenticate(request, user=self.staff)

        # Call the search view
        view = InstrumentViewSet.as_view({"get": "search"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def tearDown(self):
        self.user_instrument_1.delete()
        self.user_instrument_2.delete()
        self.user_instrument_3.delete()
        self.user_instrument_4.delete()
        self.user_instrument_5.delete()

        self.instrument_1.delete()
        self.instrument_2.delete()
        self.instrument_3.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
