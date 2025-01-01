from django.utils import timezone
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Event, EventAttendee
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.event_attendee_view_set import EventAttendeeViewSet
from api.view_set.event_view_set import EventViewSet


class EventAttendeeViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_view_event_attendee_access(self):
        # Define test cases with user and expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200},
            {"user": self.manager, "expected_status": 403},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/event-attendees/", content_type='application/json')
                force_authenticate(request, user=case["user"])
                response = EventViewSet.as_view({'get': 'list'})(request)

                # Assert the status code
                self.assertEqual(response.status_code, case["expected_status"])

    def test_by_event(self):
        event_1 = Event.objects.create(group=self.group, name="n 1", description="d 1", date=timezone.now(), place="p 1")
        event_2 = Event.objects.create(group=self.group, name="n 2", description="d 2", date=timezone.now(), place="p 2")

        EventAttendee.objects.create(event=event_1, user=self.moderator)
        EventAttendee.objects.create(event=event_1, user=self.musician)
        EventAttendee.objects.create(event=event_2, user=self.musician)

        # Define test cases with expected outcomes
        test_cases = [
            {"event": event_1, "expected_status": 200, "expected_count": 2},
            {"event": event_2, "expected_status": 200, "expected_count": 1},
        ]

        for case in test_cases:
            with self.subTest(event=case["event"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/event-attendees/by_event/?event_id={case["event"].event_id}")
                force_authenticate(request, user=self.staff)
                response = EventAttendeeViewSet.as_view({'get': 'by_event'})(request)

                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data), case["expected_count"])

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
