from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Message, MessageRecipient
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.message_view_set import MessageViewSet


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
