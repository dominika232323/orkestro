from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.track_view_set import TrackViewSet


class TrackViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

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

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
