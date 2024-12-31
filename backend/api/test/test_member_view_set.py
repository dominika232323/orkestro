from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.member_view_set import MemberViewSet


class MemberViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

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
