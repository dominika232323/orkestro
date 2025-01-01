from django.utils import timezone
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from api.models import Event, Message
from api.permissions.common_checks import get_group_by_event_id, get_group_by_message_id
from api.test.common_setups import basic_setup, basic_setup_teardown


class PermissionsCommonChecksTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_get_group_by_event_id(self):
        event = Event.objects.create(group=self.group, name="n", description="d", date=timezone.now(), place="p")
        self.assertEqual(get_group_by_event_id(event.event_id), self.group.group_id)

    def test_get_group_by_event_id_event_does_not_exist(self):
        self.assertEqual(get_group_by_event_id(1), None)

    def test_get_group_by_message_id(self):
        message = Message.objects.create(user=self.moderator, group=self.group, title="t", content="c", date=timezone.now())
        self.assertEqual(get_group_by_message_id(message.message_id), self.group.group_id)

    def test_get_group_by_message_id_event_does_not_exist(self):
        self.assertEqual(get_group_by_message_id(1), None)

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
