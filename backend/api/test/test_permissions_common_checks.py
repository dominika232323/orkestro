import random
from datetime import datetime, timezone

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from api.models import Event
from api.permissions.common_checks import get_group_by_event_id
from api.test.common_setups import basic_setup, basic_setup_teardown


class PermissionsCommonChecksTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_get_group_by_event_id(self):
        event = Event.objects.create(group=self.group, name="n", description="d", date=datetime.now(timezone.utc), place="p")
        self.assertEqual(get_group_by_event_id(event.event_id), self.group.group_id)

    def test_get_group_by_event_id_event_does_not_exist(self):
        event_ids = Event.objects.values_list('event_id', flat=True)
        event_id = None

        while event_id is None:
            random_number = random.randint(10 ** 15, 10 ** 20)

            if random_number not in event_ids:
                event_id = random_number

        self.assertEqual(get_group_by_event_id(event_id), None)

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
