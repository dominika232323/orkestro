from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.test.common_setups import basic_setup, basic_setup_teardown
from api.models import Event
from future.backports.datetime import datetime, timezone

from api.view_set.event_view_set import EventViewSet


class EventViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_basic(self):
        Event.objects.create(group=self.group, name="n", description="d", date=datetime.now(timezone.utc), place="p")

        request = self.factory.get("/api/events/", content_type='application/json')
        force_authenticate(request, user=self.staff)
        response = EventViewSet.as_view({'get': 'list'})(request)

        self.assertEqual(response.data[0]["name"], "n")
        print(response, response.data)

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
