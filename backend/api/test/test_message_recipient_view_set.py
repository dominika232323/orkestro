from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Message, MessageRecipient
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.message_recipient_view_set import MessageRecipientViewSet


class MessageRecipientViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.message_1 = Message.objects.create(user=self.moderator, group=self.group, title="t 1", content="c 1", date=timezone.now())
        self.message_2 = Message.objects.create(user=self.manager, group=self.group, title="t 2", content="c 2", date=timezone.now())
        self.message_3 = Message.objects.create(user=self.musician, group=self.group, title="t 3", content="c 3", date=timezone.now())
        self.message_4 = Message.objects.create(user=self.moderator, group=self.group, title="t 4", content="c 4", date=timezone.now())
        self.message_5 = Message.objects.create(user=self.manager, group=self.group, title="t 5", content="c 5", date=timezone.now())

    def test_mark_as_read(self):
        MessageRecipient.objects.create(message=self.message_1, user=self.musician, is_read=False)
        MessageRecipient.objects.create(message=self.message_1, user=self.manager, is_read=False)
        MessageRecipient.objects.create(message=self.message_2, user=self.musician, is_read=False)
        MessageRecipient.objects.create(message=self.message_2, user=self.moderator, is_read=False)
        MessageRecipient.objects.create(message=self.message_3, user=self.manager, is_read=False)
        MessageRecipient.objects.create(message=self.message_3, user=self.moderator, is_read=False)
        MessageRecipient.objects.create(message=self.message_4, user=self.manager, is_read=False)
        MessageRecipient.objects.create(message=self.message_5, user=self.moderator, is_read=False)

    def test_me(self):
        MessageRecipient.objects.create(message=self.message_1, user=self.musician, is_read=True)
        MessageRecipient.objects.create(message=self.message_1, user=self.manager, is_read=False)
        MessageRecipient.objects.create(message=self.message_2, user=self.musician, is_read=True)
        MessageRecipient.objects.create(message=self.message_2, user=self.moderator, is_read=True)
        MessageRecipient.objects.create(message=self.message_3, user=self.manager, is_read=False)
        MessageRecipient.objects.create(message=self.message_3, user=self.moderator, is_read=True)
        MessageRecipient.objects.create(message=self.message_4, user=self.manager, is_read=False)
        MessageRecipient.objects.create(message=self.message_5, user=self.moderator, is_read=False)

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
                request = self.factory.get("/api/message-recipients/me/")
                force_authenticate(request, user=case["user"])
                response = MessageRecipientViewSet.as_view({'get': 'me'})(request)

                # Assert the response status and count
                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data), case["expected_count"])

    def tearDown(self):
        self.message_1.delete()
        self.message_2.delete()
        self.message_3.delete()
        self.message_4.delete()
        self.message_5.delete()
        
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
