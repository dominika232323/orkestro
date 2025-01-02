from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.member_view_set import MemberViewSet


class MemberViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_create_access(self):
        test_cases = [
            {"user": self.staff, "expected_status": 201},
            {"user": self.manager, "expected_status": 403},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Prepare valid data
                member_data = {
                    "group": self.group.group_id,
                    "user": self.outsider.user_id,
                    "permission_level": "C"
                }

                # Create a request
                request = self.factory.post("/api/members/", member_data, format="json")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the create method
                view = MemberViewSet.as_view({"post": "create"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 201:
                    self.assertEqual(response.data["group"], self.group.group_id)
                    self.assertEqual(response.data["user"], self.outsider.user_id)
                    self.assertEqual(response.data["permission_level"], "C")

    def test_create_invalid_data(self):
        # Prepare invalid data
        member_data = {
            "group": "self.group.group_id",
            "user": self.outsider.user_id,
            "permission_lever": "C"
        }

        # Create a request
        request = self.factory.post("/api/members/", member_data, format="json")
        force_authenticate(request, user=self.staff)

        # Instantiate the view and call the create method
        view = MemberViewSet.as_view({"post": "create"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Data validation failed")

    def test_by_group(self):
        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_count": 3},
            {"user": self.manager, "expected_status": 200, "expected_count": 3},
            {"user": self.moderator, "expected_status": 200, "expected_count": 3},
            {"user": self.musician, "expected_status": 200, "expected_count": 3},
            {"user": self.outsider, "expected_status": 403, "expected_count": 0},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/members/by_group/?group_id={self.group.group_id}")
                force_authenticate(request, user=case["user"])
                response = MemberViewSet.as_view({'get': 'by_group'})(request)

                # Assert the response status
                self.assertEqual(response.status_code, case["expected_status"])

                # Assert the event count for valid responses
                if case["expected_status"] == 200:
                    self.assertEqual(len(response.data), case["expected_count"])

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
