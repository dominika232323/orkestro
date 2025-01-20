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
                new_user = User.objects.create(email=f"user_{case['user'].name}@a.com", name="User", surname="R", date_joined=timezone.now())
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
            {"user": self.staff, "expected_status": 400, "expected_error": "Can't demote the last manager"},
            {"user": self.manager, "expected_status": 400, "expected_error": "You can't change your own permission level"},
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
                    self.assertEqual(response.data["error"], case["expected_error"])

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

                new_user = User.objects.create(email=f"user_{case['user'].name}@a.com", name="User", surname="R", date_joined=timezone.now())
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
                new_user = User.objects.create(email=f"user_{case['user'].name}@a.com", name="User", surname="R", date_joined=timezone.now())
                member_to_destroy = Member.objects.create(user=new_user, group=self.group, permission_level="C")

                request = self.factory.delete(f"/api/members/{member_to_destroy.member_id}/")
                force_authenticate(request, user=case["user"])
                response = MemberViewSet.as_view({"delete": "destroy"})(request, pk=member_to_destroy.member_id)

                self.assertEqual(response.status_code, case["expected_status"])

    def test_destroy_last_manager(self):
        test_cases = [
            {"user": self.staff, "expected_status": 400, "expected_error": "Can't remove the last manager"},
            {"user": self.manager, "expected_status": 400, "expected_error": "You can't remove yourself from the group"},
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
                    self.assertEqual(response.data["error"], case["expected_error"])

    def test_leave(self):
        test_cases = [
            {
                "user": self.staff,
                "expected_status": 404,
                "expected_error": "Membership not found"
            },
            {
                "user": self.manager,
                "expected_status": 400,
                "expected_error": "Can't remove the last manager"
            },
            {
                "user": self.moderator,
                "expected_status": 204
            },
            {
                "user": self.musician,
                "expected_status": 204
            },
            {
                "user": self.outsider,
                "expected_status": 404,
                "expected_error": "Membership not found"
            },
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.post(
                    "/api/members/leave/",
                    {"group": self.group.group_id}
                )
                force_authenticate(request, user=case["user"])
                response = MemberViewSet.as_view({'post': 'leave'})(request)

                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 400 or response.status_code == 404:
                    self.assertEqual(response.data["error"], case["expected_error"])

    def test_leave_no_group_id(self):
        # Create and authenticate the request
        request = self.factory.post("/api/members/leave/")
        force_authenticate(request, user=self.staff)
        response = MemberViewSet.as_view({'post': 'leave'})(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Group ID is required")


    def test_search(self):
        # Define test cases with expected outcomes
        test_cases = [
            {
                "user": self.staff,
                "expected_status": 200,
                "expected_items": [self.moderator.user_id],
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "expected_status": 200,
                "expected_items": [self.moderator.user_id],
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "expected_status": 200,
                "expected_items": [self.moderator.user_id],
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "expected_status": 200,
                "expected_items": [self.moderator.user_id],
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "expected_status": 403,
                "expected_items": [],
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/members/search/", {"name": "R", "permission_level": "B", "group_id": self.group.group_id})
                force_authenticate(request, user=case["user"])
                response = MemberViewSet.as_view({'get': 'search'})(request)

                # Assert the response status
                self.assertEqual(response.status_code, case["expected_status"])

                # Assert the returned response.data for valid responses
                if case["expected_status"] == 200:
                    returned_items = [user["user"] for user in response.data["items"]]
                    self.assertEqual(returned_items, case["expected_items"])

                    self.assertEqual(response.data["page_number"], case["expected_page_number"])
                    self.assertEqual(response.data["total_pages"], case["expected_total_pages"])

    def test_by_group(self):
        test_cases = [
            {
                "user": self.staff,
                "expected_status": 200,
                "expected_count": 3,
                "expected_items": ["Manage", "Moderato", "Musicia"],
            },
            {
                "user": self.moderator,
                "expected_status": 200,
                "expected_count": 3,
                "expected_items": ["Manage", "Moderato", "Musicia"],
            },
            {
                "user": self.musician,
                "expected_status": 200,
                "expected_count": 3,
                "expected_items": ["Manage", "Moderato", "Musicia"],
            },
            {
                "user": self.manager,
                "expected_status": 200,
                "expected_count": 3,
                "expected_items": ["Manage", "Moderato", "Musicia"],
            },
            {
                "user": self.outsider,
                "expected_status": 403,
            },
        ]
        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Prepare the request
                request = self.factory.get(f"/api/members/by_group/?group_id={self.group.group_id}")
                force_authenticate(request, user=case["user"])

                # Execute the request
                response = MemberViewSet.as_view({"get": "by_group"})(request)

                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 200:
                    self.assertEqual(len(response.data), case["expected_count"])

                    returned_users = [member["user_details"]["name"] for member in response.data]
                    self.assertEqual(returned_users, case["expected_items"])


    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
