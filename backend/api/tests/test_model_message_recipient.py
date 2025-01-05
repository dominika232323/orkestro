from django.test import TestCase
from django.utils import timezone

from api.models import Message, MessageRecipient
from api.tests.common_setups import basic_setup, basic_setup_teardown


class MessageRecipientModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.message = Message.objects.create(user=self.moderator, group=self.group, title="Hello", content="Test message", date=timezone.now())
        self.recipient = MessageRecipient.objects.create(message=self.message, user=self.musician, is_read=False)

    def test_message_recipient_creation(self):
        self.assertEqual(self.recipient.message, self.message)
        self.assertEqual(self.recipient.user, self.musician)
        self.assertFalse(self.recipient.is_read)

    def test_message_recipient_creation_with_invalid_message(self):
        with self.assertRaises(Exception):
            MessageRecipient.objects.create(message="Message", user=self.musician, is_read=False)

    def test_message_recipient_creation_with_invalid_user(self):
        with self.assertRaises(Exception):
            MessageRecipient.objects.create(message=self.message, user="User", is_read=False)

    def test_string_representation(self):
        self.assertEqual(str(self.recipient), f"{self.message.user} → {self.message.group.name} → {self.musician} ({self.recipient.message_recipient_id})")

    def tearDown(self):
        self.recipient.delete()
        self.message.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
