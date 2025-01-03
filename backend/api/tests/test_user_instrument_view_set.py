from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Instrument, UserInstrument
from api.tests.common_setups import basic_setup, basic_setup_teardown
from api.views.user_instrument_view_set import UserInstrumentViewSet


class UserInstrumentViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.instrument_1 = Instrument.objects.create(name_en="Guitar", name_pl="Gitara")
        self.instrument_2 = Instrument.objects.create(name_en="Piano", name_pl="Pianino")
        self.instrument_3 = Instrument.objects.create(name_en="Violin", name_pl="Skrzypce")

        self.user_instrument_1 = UserInstrument.objects.create(user=self.musician, instrument=self.instrument_1)
        self.user_instrument_2 = UserInstrument.objects.create(user=self.musician, instrument=self.instrument_2)
        self.user_instrument_3 = UserInstrument.objects.create(user=self.moderator, instrument=self.instrument_1)
        self.user_instrument_4 = UserInstrument.objects.create(user=self.moderator, instrument=self.instrument_3)

    def test_by_user(self):
        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_event_count": 0},
            {"user": self.manager, "expected_status": 200, "expected_event_count": 0},
            {"user": self.moderator, "expected_status": 200, "expected_event_count": 2},
            {"user": self.musician, "expected_status": 200, "expected_event_count": 2},
            {"user": self.outsider, "expected_status": 200, "expected_event_count": 0},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/user-instruments/by_user/?user_id={case['user'].user_id}")
                force_authenticate(request, user=case["user"])
                response = UserInstrumentViewSet.as_view({'get': 'by_user'})(request)

                # Assert the response status
                self.assertEqual(response.status_code, case["expected_status"])

                # Assert the event count for valid responses
                if case["expected_status"] == 200:
                    self.assertEqual(len(response.data), case["expected_event_count"])


    def tearDown(self):
        self.user_instrument_1.delete()
        self.user_instrument_2.delete()
        self.user_instrument_3.delete()
        self.user_instrument_4.delete()

        self.instrument_1.delete()
        self.instrument_2.delete()
        self.instrument_3.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
