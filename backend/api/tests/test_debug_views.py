from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.tests.common_setups import basic_setup, basic_setup_teardown
from api.views.debug_views import hello_protected, hello_world


class ViewTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_hello_world(self):
        # Create the request
        request = self.factory.get(f"/api/hello-world/")
        response = hello_world(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"text": "Hello, world!"})

    def test_hello_protected(self):
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_data": {"text": "Hello, staff@a.com!"}},
            {"user": self.manager, "expected_status": 200, "expected_data": {"text": "Hello, manager@a.com!"}},
            {"user": self.moderator, "expected_status": 200, "expected_data": {"text": "Hello, moderator@a.com!"}},
            {"user": self.musician, "expected_status": 200, "expected_data": {"text": "Hello, musician@a.com!"}},
            {"user": self.outsider, "expected_status": 200, "expected_data": {"text": "Hello, outsider@a.com!"}},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/hello-protected/")
                force_authenticate(request, user=case["user"])
                response = hello_protected(request)

                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(response.data, case["expected_data"])

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
