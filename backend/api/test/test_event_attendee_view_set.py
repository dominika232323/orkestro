from datetime import datetime, timezone

from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Event, EventAttendee
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.event_view_set import EventViewSet


class EventAttendeeViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_view_event_access(self):
        # Define test cases with user and expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200},
            {"user": self.manager, "expected_status": 403},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
            {"user": self.unauthenticated, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/event-attendees/", content_type='application/json')
                force_authenticate(request, user=case["user"])
                response = EventViewSet.as_view({'get': 'list'})(request)

                # Assert the status code
                self.assertEqual(response.status_code, case["expected_status"])


    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
