from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Message, MessageRecipient
from api.tests.common_setups import basic_setup, basic_setup_teardown
from api.views.message_view_set import MessageViewSet


class MessageViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.message_1 = Message.objects.create(user=self.moderator, group=self.group, title="t 1", content="c 1", date=timezone.now())
        self.message_2 = Message.objects.create(user=self.manager, group=self.group, title="t 2", content="c 2", date=timezone.now())
        self.message_3 = Message.objects.create(user=self.musician, group=self.group, title="t 3", content="c 3", date=timezone.now())
        self.message_4 = Message.objects.create(user=self.moderator, group=self.group, title="t 4", content="c 4", date=timezone.now())
        self.message_5 = Message.objects.create(user=self.manager, group=self.group, title="t 5", content="c 5", date=timezone.now())

        self.message_recipient_1 = MessageRecipient.objects.create(message=self.message_1, user=self.musician, is_read=False)
        self.message_recipient_2 = MessageRecipient.objects.create(message=self.message_1, user=self.manager, is_read=False)
        self.message_recipient_3 = MessageRecipient.objects.create(message=self.message_2, user=self.musician, is_read=True)
        self.message_recipient_4 = MessageRecipient.objects.create(message=self.message_2, user=self.moderator, is_read=False)
        self.message_recipient_5 = MessageRecipient.objects.create(message=self.message_3, user=self.manager, is_read=True)
        self.message_recipient_6 = MessageRecipient.objects.create(message=self.message_3, user=self.moderator, is_read=False)
        self.message_recipient_7 = MessageRecipient.objects.create(message=self.message_4, user=self.manager, is_read=False)
        self.message_recipient_8 = MessageRecipient.objects.create(message=self.message_5, user=self.moderator, is_read=True)

    def test_create_access(self):
        test_cases = [
            {
                "user": self.staff,
                "data": {
                    "user": self.staff.user_id,
                    "group": self.group.group_id,
                    "title": "Message title",
                    "content": "Message content",
                    "date": timezone.now(),
                },
                "recipients": [self.musician.user_id, self.moderator.user_id],
                "expected_status": 201
            },
            {
                "user": self.manager,
                "data": {
                    "user": self.manager.user_id,
                    "group": self.group.group_id,
                    "title": "Message title",
                    "content": "Message content",
                    "date": timezone.now(),
                },
                "recipients": [self.musician.user_id, self.moderator.user_id],
                "expected_status": 201
            },
            {
                "user": self.moderator,
                "data": {
                    "user": self.moderator.user_id,
                    "group": self.group.group_id,
                    "title": "Message title",
                    "content": "Message content",
                    "date": timezone.now(),
                },
                "recipients": [self.musician.user_id, self.manager.user_id],
                "expected_status": 201
            },
            {
                "user": self.musician,
                "data": {
                    "user": self.musician.user_id,
                    "group": self.group.group_id,
                    "title": "Message title",
                    "content": "Message content",
                    "date": timezone.now(),
                },
                "recipients": [self.manager.user_id, self.moderator.user_id],
                "expected_status": 403
            },
            {
                "user": self.outsider,
                "data": {
                    "user": self.outsider.user_id,
                    "group": self.group.group_id,
                    "title": "Message title",
                    "content": "Message content",
                    "date": timezone.now(),
                },
                "recipients": [self.musician.user_id, self.moderator.user_id],
                "expected_status": 403
            },
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                ids = "&".join([f"id={user_id}" for user_id in case['recipients']])

                # Create a request
                request = self.factory.post(
                    f"/api/messages/?{ids}",
                    data=case["data"],
                    format="json"
                )
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the create method
                view = MessageViewSet.as_view({"post": "create"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 201:
                    self.assertEqual(response.data["title"], "Message title")
                    self.assertEqual(response.data["content"], "Message content")
                    self.assertEqual(response.data["group"], self.group.group_id)
                    self.assertEqual(response.data["user"], case["user"].user_id)

    def test_create_invalid_data(self):
        # Prepare invalid data
        message_data = {
            "user": self.manager.user_id,
            "group": self.group.group_id,
            "title": "Message title",
            "content": "Message content",
            "date": timezone.now(),
        }

        # Create a request
        request = self.factory.post("/api/messages/", message_data, format="json")
        force_authenticate(request, user=self.manager)

        # Instantiate the view and call the create method
        view = MessageViewSet.as_view({"post": "create"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Message must have at least one recipient")

    def test_create_zero_recipients(self):
        # Prepare invalid data
        message_data = {
            "user": self.staff.user_id,
            "title": "Message title",
            "content": "Message content",
            "date": timezone.now(),
        }

        # Create a request
        request = self.factory.post("/api/messages/", message_data, format="json")
        force_authenticate(request, user=self.staff)

        # Instantiate the view and call the create method
        view = MessageViewSet.as_view({"post": "create"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Data validation failed")

    def test_by_group(self):
        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_count": 0},
            {"user": self.manager, "expected_status": 200, "expected_count": 3},
            {"user": self.moderator, "expected_status": 200, "expected_count": 3},
            {"user": self.musician, "expected_status": 200, "expected_count": 2},
            {"user": self.outsider, "expected_status": 200, "expected_count": 0},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get(f"/api/messages/by_group/?group_id={self.group.group_id}")
                force_authenticate(request, user=case["user"])
                response = MessageViewSet.as_view({'get': 'by_group'})(request)

                # Assert the response status
                self.assertEqual(response.status_code, case["expected_status"])

                # Assert the event count for valid responses
                if case["expected_status"] == 200:
                    self.assertEqual(len(response.data), case["expected_count"])


    def tearDown(self):
        self.message_recipient_1.delete()
        self.message_recipient_2.delete()
        self.message_recipient_3.delete()
        self.message_recipient_4.delete()
        self.message_recipient_5.delete()
        self.message_recipient_6.delete()
        self.message_recipient_7.delete()
        self.message_recipient_8.delete()

        self.message_1.delete()
        self.message_2.delete()
        self.message_3.delete()
        self.message_4.delete()
        self.message_5.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
