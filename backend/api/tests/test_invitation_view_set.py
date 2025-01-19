from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Invitation, User, Member
from api.tests.common_setups import basic_setup, basic_setup_teardown
from api.views.invitation_view_set import InvitationViewSet


class InvitationViewSetTestCase(TestCase):
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
                user_to_invite = User.objects.create(email=f"outsider{case["user"].name}@a.com", name="Outside", surname="R", date_joined=timezone.now())

                # Prepare valid data
                invitation_data = {
                    "group": self.group.group_id,
                    "user": user_to_invite.user_id,
                    "permission_level": "C"
                }

                # Create a request
                request = self.factory.post("/api/invitations/", invitation_data, format="json")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the create method
                view = InvitationViewSet.as_view({"post": "create"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 201:
                    self.assertEqual(response.data["group"], self.group.group_id)
                    self.assertEqual(response.data["user"], user_to_invite.user_id)
                    self.assertEqual(response.data["permission_level"], "C")

    def test_create_invalid_data(self):
        # Prepare invalid event data
        invitation_data = {
            "group": "self.group.group_id",
            "user": self.outsider.user_id,
            "permission_level": "C"
        }

        # Create a request
        request = self.factory.post("/api/invitations/", invitation_data, format="json")
        force_authenticate(request, user=self.staff)

        # Instantiate the view and call the create method
        view = InvitationViewSet.as_view({"post": "create"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Data validation failed")

    def test_create_is_not_invitable(self):
        Invitation.objects.create(group=self.group, user=self.outsider, permission_level="C")

        test_cases = [
            {"user": self.staff, "expected_status": 400},
            {"user": self.manager, "expected_status": 400},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Prepare valid data
                invitation_data = {
                    "group": self.group.group_id,
                    "user": self.musician.user_id,
                    "permission_level": "C"
                }

                # Create a request
                request = self.factory.post("/api/invitations/", invitation_data, format="json")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the create method
                view = InvitationViewSet.as_view({"post": "create"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 400:
                    self.assertEqual(response.data["error"], "User not invitable")

    def test_accept_invitation(self):
        invitation = Invitation.objects.create(group=self.group, user=self.outsider, permission_level="C")

        # Authenticate the outsider (invitee)
        request = self.factory.post(f"/api/invitations/{invitation.invitation_id}/accept/")
        force_authenticate(request, user=self.outsider)

        # Call the accept method
        view = InvitationViewSet.as_view({"post": "accept"})
        response = view(request, pk=invitation.invitation_id)

        # Assertions
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Invitation.objects.filter(pk=invitation.invitation_id).exists())

        # Check if a membership was created
        membership = Member.objects.filter(
            group=self.group, user=self.outsider, permission_level="C"
        )
        self.assertTrue(membership.exists())

    def test_accept_invitation_invalid_user(self):
        invitation = Invitation.objects.create(group=self.group, user=self.outsider, permission_level="C")

        # Authenticate a user who is not the invitee
        request = self.factory.post(f"/api/invitations/{invitation.invitation_id}/accept/")
        force_authenticate(request, user=self.manager)

        # Call the accept method
        view = InvitationViewSet.as_view({"post": "accept"})
        response = view(request, pk=invitation.invitation_id)

        # Assertions
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Invitation.objects.filter(pk=invitation.invitation_id).exists())

    def test_reject_invitation(self):
        invitation = Invitation.objects.create(group=self.group, user=self.outsider, permission_level="C")

        # Authenticate the outsider (invitee)
        request = self.factory.post(f"/api/invitations/{invitation.invitation_id}/reject/")
        force_authenticate(request, user=self.outsider)

        # Call the reject method
        view = InvitationViewSet.as_view({"post": "reject"})
        response = view(request, pk=invitation.invitation_id)

        # Assertions
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Invitation.objects.filter(pk=invitation.invitation_id).exists())

    def test_reject_invitation_invalid_user(self):
        invitation = Invitation.objects.create(group=self.group, user=self.outsider, permission_level="C")

        # Authenticate a user who is not the invitee
        request = self.factory.post(f"/api/invitations/{invitation.invitation_id}/reject/")
        force_authenticate(request, user=self.manager)

        # Call the reject method
        view = InvitationViewSet.as_view({"post": "reject"})
        response = view(request, pk=invitation.invitation_id)

        # Assertions
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Invitation.objects.filter(pk=invitation.invitation_id).exists())

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
