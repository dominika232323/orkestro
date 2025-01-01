from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.user_view_set import UserViewSet


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
                self.assertEqual(response.data["google_calendar_id"], case["user"].google_calendar_id)
                self.assertEqual(response.data["profile_picture_url"], case["user"].profile_picture_url)

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
