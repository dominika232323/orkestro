from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.tests.common_setups import basic_setup_teardown, basic_setup
from api.views.group_view_set import GroupViewSet


class GroupViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_create_access(self):
        test_cases = [
            {"user": self.staff, "expected_status": 201},
            {"user": self.manager, "expected_status": 201},
            {"user": self.moderator, "expected_status": 201},
            {"user": self.musician, "expected_status": 201},
            {"user": self.outsider, "expected_status": 201},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Prepare valid group data
                group_data = {
                    "name": "Test Group",
                    "description": "Group Description",
                }

                # Create a request
                request = self.factory.post("/api/groups/", group_data, format="json")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the create method
                view = GroupViewSet.as_view({"post": "create"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 201:
                    self.assertEqual(response.data["name"], "Test Group")
                    self.assertEqual(response.data["description"], "Group Description")

    def test_create_invalid_data(self):
        # Prepare invalid group data
        group_data = {
            "description": "Group Description",
        }

        # Create a request
        request = self.factory.post("/api/groups/", group_data, format="json")
        force_authenticate(request, user=self.staff)

        # Instantiate the view and call the create method
        view = GroupViewSet.as_view({"post": "create"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Data validation failed")


    def test_me(self):
        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_group_count": 0},
            {"user": self.manager, "expected_status": 200, "expected_group_count": 1},
            {"user": self.moderator, "expected_status": 200, "expected_group_count": 1},
            {"user": self.musician, "expected_status": 200, "expected_group_count": 1},
            {"user": self.outsider, "expected_status": 200, "expected_group_count": 0},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/groups/me/")
                force_authenticate(request, user=case["user"])
                response = GroupViewSet.as_view({'get': 'me'})(request)

                # Assert the response status and count
                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data), case["expected_group_count"])

    def test_role(self):
        # Define test cases with expected outcomes
        test_cases = [
            {
                "user": self.staff,
                "expected_status": 200,
                "expected_is_manager": False,
                "expected_is_moderator": False
            },
            {
                "user": self.manager,
                "expected_status": 200,
                "expected_is_manager": True,
                "expected_is_moderator": True
            },
            {
                "user": self.moderator,
                "expected_status": 200,
                "expected_is_manager": False,
                "expected_is_moderator": True
            },
            {
                "user": self.musician,
                "expected_status": 200,
                "expected_is_manager": False,
                "expected_is_moderator": False
            },
            {
                "user": self.outsider,
                "expected_status": 200,
                "expected_is_manager": False,
                "expected_is_moderator": False
            },
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/groups/{self.group.group_id}/role/")
                force_authenticate(request, user=case["user"])
                response = GroupViewSet.as_view({'get': 'role'})(request, pk=self.group.group_id)

                # Assert the response status and data
                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(response.data["is_manager"], case["expected_is_manager"])
                self.assertEqual(response.data["is_moderator"], case["expected_is_moderator"])

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
