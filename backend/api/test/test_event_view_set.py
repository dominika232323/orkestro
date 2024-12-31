from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Event, EventAttendee
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.event_view_set import EventViewSet


class EventViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_view_event_access(self):
        # Create a test event
        Event.objects.create(group=self.group, name="n", description="d", date=timezone.now(), place="p")

        # Define test cases with user and expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_name": "n"},
            {"user": self.manager, "expected_status": 403, "expected_name": None},
            {"user": self.moderator, "expected_status": 403, "expected_name": None},
            {"user": self.musician, "expected_status": 403, "expected_name": None},
            {"user": self.outsider, "expected_status": 403, "expected_name": None},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/events/", content_type='application/json')
                force_authenticate(request, user=case["user"])
                response = EventViewSet.as_view({'get': 'list'})(request)

                # Assert the status code
                self.assertEqual(response.status_code, case["expected_status"])

                # If the status is 200, check the event name
                if case["expected_status"] == 200:
                    self.assertEqual(response.data[0]["name"], case["expected_name"])

    def test_by_group(self):
        Event.objects.create(group=self.group, name="n 1", description="d 1", date=timezone.now(), place="p 1")
        Event.objects.create(group=self.group, name="n 2", description="d 2", date=timezone.now(), place="p 2")

        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_event_count": 2},
            {"user": self.manager, "expected_status": 200, "expected_event_count": 2},
            {"user": self.moderator, "expected_status": 200, "expected_event_count": 2},
            {"user": self.musician, "expected_status": 200, "expected_event_count": 2},
            {"user": self.outsider, "expected_status": 403, "expected_event_count": 0},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/events/by_group/?group_id={self.group.group_id}")
                force_authenticate(request, user=case["user"])
                response = EventViewSet.as_view({'get': 'by_group'})(request)

                # Assert the response status
                self.assertEqual(response.status_code, case["expected_status"])

                # Assert the event count for valid responses
                if case["expected_status"] == 200:
                    self.assertEqual(len(response.data), case["expected_event_count"])

    def test_me(self):
        # Create events
        event1 = Event.objects.create(group=self.group, name="Event 1", description="Desc 1", date=timezone.now(), place="Place 1")
        event2 = Event.objects.create(group=self.group, name="Event 2", description="Desc 2", date=timezone.now(), place="Place 2")
        event3 = Event.objects.create(group=self.group, name="Event 3", description="Desc 3", date=timezone.now(), place="Place 3")

        # Assign participations
        EventAttendee.objects.create(user=self.staff, event=event1)
        EventAttendee.objects.create(user=self.staff, event=event2)
        EventAttendee.objects.create(user=self.musician, event=event3)

        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_event_names": ["Event 1", "Event 2"]},
            {"user": self.musician, "expected_status": 200, "expected_event_names": ["Event 3"]},
            {"user": self.manager, "expected_status": 200, "expected_event_names": []},
            {"user": self.outsider, "expected_status": 200, "expected_event_names": []},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/events/me/")
                force_authenticate(request, user=case["user"])
                response = EventViewSet.as_view({'get': 'me'})(request)

                # Assert the response status
                self.assertEqual(response.status_code, case["expected_status"])

                # Assert the returned event names for valid responses
                if case["expected_status"] == 200:
                    returned_event_names = [event["name"] for event in response.data]
                    self.assertEqual(returned_event_names, case["expected_event_names"])

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
