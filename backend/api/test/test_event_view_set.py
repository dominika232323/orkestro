from datetime import datetime, timezone

from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Event
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.event_view_set import EventViewSet


class EventViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_view_event_access(self):
        # Create a test event
        Event.objects.create(group=self.group, name="n", description="d", date=datetime.now(timezone.utc), place="p")

        # Define test cases with user and expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_name": "n"},
            {"user": self.manager, "expected_status": 403, "expected_name": None},
            {"user": self.moderator, "expected_status": 403, "expected_name": None},
            {"user": self.musician, "expected_status": 403, "expected_name": None},
            {"user": self.outsider, "expected_status": 403, "expected_name": None},
            {"user": self.unauthenticated, "expected_status": 403, "expected_name": None},
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

    def test_create_event_serializer_validation(self):
        # Define valid event data
        valid_event_data = {
            "group": self.group.group_id,
            "name": "n",
            "description": "d",
            "date": datetime.now(timezone.utc).isoformat(),
            "place": "p",
        }

        # Define invalid event data
        invalid_event_data = {
            "group": self.group.group_id,
            "name": "",
            "description": "An event with no name",
        }

        # Define test cases with event data, user and expected outcomes
        test_cases = [
            {"event_data": valid_event_data, "user": self.staff, "expected_status": 201, "expected_name": valid_event_data["name"]},
            {"event_data": invalid_event_data, "user": self.staff, "expected_status": 400, "expected_name": None},
        ]

        for case in test_cases:
            with self.subTest(event_data=case["event_data"]):
                # Create and authenticate the request
                request = self.factory.post("/api/events/", data=case["event_data"], format="json")
                force_authenticate(request, user=case["user"])
                response = EventViewSet.as_view({"post": "create"})(request)

                # Assert the status code
                self.assertEqual(response.status_code, case["expected_status"])

                # If the status is 201, check response's object count and the event name
                if case["expected_status"] == 201:
                    self.assertEqual(Event.objects.count(), 1)
                    self.assertEqual(Event.objects.first().name, case["expected_name"])

    def test_create_event_access(self):
        # Define test cases with user roles and expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 201},
            {"user": self.manager, "expected_status": 201},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
            {"user": self.unauthenticated, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create the request data
                request_data = {
                    "group": self.group.group_id,
                    "name": "n",
                    "description": "d",
                    "date": datetime.now(timezone.utc).isoformat(),
                    "place": "p",
                }

                # Create and authenticate the request
                request = self.factory.post("/api/events/", data=request_data, format="json")
                force_authenticate(request, user=case["user"])
                response = EventViewSet.as_view({"post": "create"})(request)

                # Assert the response status
                self.assertEqual(response.status_code, case["expected_status"])

                # If the status is 201, check the event data
                if case["expected_status"] == 201:
                    self.assertEqual(response.data["name"], request_data["name"])
                    self.assertEqual(response.data["description"], request_data["description"])
                    self.assertEqual(response.data["place"], request_data["place"])

    def test_update_event_access(self):
        # Create a test event
        event = Event.objects.create(group=self.group, name="n", description="d", date=datetime.now(timezone.utc), place="p")

        # Define test cases for event update with different users
        test_cases = [
            {"user": self.staff, "expected_status": 200, "new_name": "Updated Event", "new_description": "Updated Description"},
            {"user": self.manager, "expected_status": 403, "new_name": "Manager Update", "new_description": "Manager Description"},
            {"user": self.moderator, "expected_status": 403, "new_name": "Unauthorized Update", "new_description": "Unauthorized Description"},
            {"user": self.musician, "expected_status": 403, "new_name": "Unauthorized Update", "new_description": "Unauthorized Description"},
            {"user": self.outsider, "expected_status": 403, "new_name": "Unauthorized Update", "new_description": "Unauthorized Description"},
            {"user": self.unauthenticated, "expected_status": 403, "new_name": "Unauthorized Update", "new_description": "Unauthorized Description"},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Prepare data for the event update
                request_data = {
                    "group": self.group.group_id,
                    "name": "n",
                    "description": "d",
                    "date": datetime.now(timezone.utc).isoformat(),
                    "place": "p",
                }

                # Create and authenticate the request
                request = self.factory.put(f"/api/events/{event.event_id}/", data=request_data, format="json")
                force_authenticate(request, user=case["user"])
                response = EventViewSet.as_view({'put': 'update'})(request, pk=event.event_id)

                # Assert the status code
                self.assertEqual(response.status_code, case["expected_status"])

                # If the status is 200 (OK), check if the event has been updated
                if case["expected_status"] == 200:
                    # Fetch the updated event and check the changes
                    event.refresh_from_db()
                    self.assertEqual(event.name, case["new_name"])
                    self.assertEqual(event.description, case["new_description"])

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
