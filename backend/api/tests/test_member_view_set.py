from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Member, User
from api.tests.common_setups import basic_setup, basic_setup_teardown
from api.views.member_view_set import MemberViewSet


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

    def test_update(self):
        test_cases = [
            {"user": self.staff, "expected_status": 200},
            {"user": self.manager, "expected_status": 200},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                new_user = User.objects.create(email="user@a.com", name="User", surname="R", date_joined=timezone.now())
                member_to_update = Member.objects.create(group=self.group, user=new_user, permission_level="C")

                updated_data = {
                    "group": self.group.group_id,
                    "user": new_user.user_id,
                    "permission_level": "B"
                }

                request = self.factory.put(
                    f"/api/members/{member_to_update.member_id}/", updated_data, format="json"
                )
                force_authenticate(request, user=case["user"])
                response = MemberViewSet.as_view({"put": "update"})(request, pk=member_to_update.member_id)

                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 200:
                    self.assertEqual(response.data["permission_level"], updated_data["permission_level"])

    def test_update_demote_last_manager(self):
        test_cases = [
            {"user": self.staff, "expected_status": 400},
            {"user": self.manager, "expected_status": 400},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                updated_data = {
                    "group": self.group.group_id,
                    "user": self.manager.user_id,
                    "permission_level": "C"
                }

                member_manager = Member.objects.get(user=self.manager)

                request = self.factory.put(
                    f"/api/members/{member_manager.member_id}/", updated_data, format="json"
                )
                force_authenticate(request, user=case["user"])
                response = MemberViewSet.as_view({"put": "update"})(request, pk=member_manager.member_id)

                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 400:
                    self.assertEqual(response.data["error"], "Can't demote the last manager")

    def test_update_invalid_data(self):
        test_cases = [
            {"user": self.staff, "expected_status": 400},
            {"user": self.manager, "expected_status": 400},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                updated_data = {"permission_level": "Invalid"}

                new_user = User.objects.create(email="user@a.com", name="User", surname="R", date_joined=timezone.now())
                member_to_update = Member.objects.create(group=self.group, user=new_user, permission_level="C")

                request = self.factory.put(
                    f"/api/members/{member_to_update.member_id}/", updated_data, format="json"
                )
                force_authenticate(request, user=case["user"])
                response = MemberViewSet.as_view({"put": "update"})(request, pk=member_to_update.member_id)

                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 400:
                    self.assertEqual(response.data["error"], "Data validation failed")

    def test_destroy(self):
        test_cases = [
            {"user": self.staff, "expected_status": 204},
            {"user": self.manager, "expected_status": 204},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                new_user = User.objects.create(email="user@a.com", name="User", surname="R", date_joined=timezone.now())
                member_to_destroy = Member.objects.create(user=new_user, group=self.group)

                request = self.factory.delete(f"/api/members/{member_to_destroy.member_id}/")
                force_authenticate(request, user=case["user"])
                response = MemberViewSet.as_view({"delete": "destroy"})(request, pk=member_to_destroy.member_id)

                self.assertEqual(response.status_code, case["expected_status"])

    def test_destroy_last_manager(self):
        test_cases = [
            {"user": self.staff, "expected_status": 400},
            {"user": self.manager, "expected_status": 400},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                member_manager = Member.objects.get(user=self.manager)

                request = self.factory.delete(f"/api/members/{member_manager.member_id}/")
                force_authenticate(request, user=case["user"])
                response = MemberViewSet.as_view({"delete": "destroy"})(request, pk=member_manager.member_id)

                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 400:
                    self.assertEqual(response.data["error"], "Can't remove the last manager")

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
