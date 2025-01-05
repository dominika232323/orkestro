from django.test import TestCase
from django.utils import timezone

from api.models import Message
from api.tests.common_setups import basic_setup, basic_setup_teardown


class MessageModelTests(TestCase):
    def setUp(self):
        self.fixed_date = timezone.now()
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.message = Message.objects.create(user=self.moderator, group=self.group, title="Title", content="Content", date=self.fixed_date)

    def test_message_creation(self):
        self.assertEqual(self.message.user, self.moderator)
        self.assertEqual(self.message.group, self.group)

        self.assertEqual(self.message.title, "Title")
        self.assertEqual(self.message.content, "Content")

        self.assertIsNotNone(self.message.date)
        self.assertEqual(self.message.date, self.fixed_date)

    def test_message_creation_with_invalid_user(self):
        with self.assertRaises(Exception):
            Message.objects.create(user="User", group=self.group, title="Title", content="Content", date=self.fixed_date)

    def test_message_creation_with_invalid_group(self):
        with self.assertRaises(Exception):
            Message.objects.create(user=self.moderator, group="Group", title="Title", content="Content", date=self.fixed_date)

    def test_string_representation(self):
        self.assertEqual(str(self.message), f"{self.message.user} → {self.message.group.name} ({self.message.message_id})")

    def tearDown(self):
        self.message.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
