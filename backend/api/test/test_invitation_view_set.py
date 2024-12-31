from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Invitation
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.invitation_view_set import InvitationViewSet


class InvitationViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_me(self):
        Invitation.objects.create(group=self.group, user=self.outsider, permission_level="C")

        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_group_count": 0},
            {"user": self.manager, "expected_status": 200, "expected_group_count": 0},
            {"user": self.moderator, "expected_status": 200, "expected_group_count": 0},
            {"user": self.musician, "expected_status": 200, "expected_group_count": 0},
            {"user": self.outsider, "expected_status": 200, "expected_group_count": 1},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/invitations/me/")
                force_authenticate(request, user=case["user"])
                response = InvitationViewSet.as_view({'get': 'me'})(request)

                # Assert the response status and count
                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data), case["expected_group_count"])

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
