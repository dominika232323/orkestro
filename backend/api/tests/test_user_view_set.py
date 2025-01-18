from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Group
from api.tests.common_setups import basic_setup, basic_setup_teardown
from api.views.user_view_set import UserViewSet


class UserViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_me(self):
        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200},
            {"user": self.manager, "expected_status": 200},
            {"user": self.moderator, "expected_status": 200},
            {"user": self.musician, "expected_status": 200},
            {"user": self.outsider, "expected_status": 200},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/users/me/")
                force_authenticate(request, user=case["user"])
                response = UserViewSet.as_view({'get': 'me'})(request)

                # Assert the response status and response data
                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(response.data["user_id"], case["user"].user_id)
                self.assertEqual(response.data["email"], case["user"].email)
                self.assertEqual(response.data["name"], case["user"].name)
                self.assertEqual(response.data["surname"], case["user"].surname)
                self.assertEqual(response.data["google_user_id"], case["user"].google_user_id)
                self.assertEqual(response.data["profile_picture_url"], case["user"].profile_picture_url)
                self.assertEqual(response.data["gcalendar_is_linked"], case["user"].gcalendar_is_linked)

    def test_by_email(self):
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_event_count": 1},
            {"user": self.manager, "expected_status": 200, "expected_event_count": 1},
            {"user": self.moderator, "expected_status": 200, "expected_event_count": 1},
            {"user": self.musician, "expected_status": 200, "expected_event_count": 1},
            {"user": self.outsider, "expected_status": 200, "expected_event_count": 1},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/users/by_email/?email=outsider@a.com")
                force_authenticate(request, user=case["user"])
                response = UserViewSet.as_view({'get': 'by_email'})(request)

                # Assert the response status
                self.assertEqual(response.status_code, case["expected_status"])

                # Assert the event count for valid responses
                if case["expected_status"] == 200:
                    self.assertEqual(len(response.data), case["expected_event_count"])
                    self.assertEqual(response.data["user_id"], self.outsider.user_id)

    def test_by_email_non_existent(self):
        # Test for an invalid email
        request = self.factory.get("/api/users/by_email/?email=nonexistent@example.com")
        force_authenticate(request, user=self.staff)
        response = UserViewSet.as_view({"get": "by_email"})(request)

        # Assert that the response returns 404 NOT FOUND
        self.assertEqual(response.status_code, 404)

    def test_by_group(self):
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_event_count": 3},
            {"user": self.manager, "expected_status": 200, "expected_event_count": 3},
            {"user": self.moderator, "expected_status": 200, "expected_event_count": 3},
            {"user": self.musician, "expected_status": 200, "expected_event_count": 3},
            {"user": self.outsider, "expected_status": 403, "expected_event_count": 0},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Test for a valid group
                request = self.factory.get(f"/api/users/by_group/?group_id={self.group.group_id}")
                force_authenticate(request, user=case["user"])
                response = UserViewSet.as_view({"get": "by_group"})(request)

                # Assert that the response is successful and correct
                self.assertEqual(response.status_code, case["expected_status"])

                if case["expected_status"] == 200:
                    self.assertEqual(len(response.data), case["expected_event_count"])

    def test_by_group_empty(self):
        # Test for a group with no members
        empty_group = Group.objects.create(name="Empty Group", description="Empty Group")

        request = self.factory.get(f"/api/users/by_group/?group_id={empty_group.group_id}")
        force_authenticate(request, user=self.staff)
        response = UserViewSet.as_view({"get": "by_group"})(request)

        # Assert that the response is successful but empty
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
