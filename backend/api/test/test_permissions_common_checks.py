from django.utils import timezone
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from api.models import Event, Message, Track, File
from api.permissions.common_checks import get_group_by_event_id, get_group_by_message_id, get_group_by_track_id, \
    get_group_by_file_id, is_manager, is_moderator, is_member
from api.test.common_setups import basic_setup, basic_setup_teardown


class PermissionsCommonChecksTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

    def test_is_manager_with_valid_group(self):
        test_cases = [
            {"user": self.staff, "is_manager": False},
            {"user": self.manager, "is_manager": True},
            {"user": self.moderator, "is_manager": False},
            {"user": self.musician, "is_manager": False},
            {"user": self.outsider, "is_manager": False},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                request = self.factory.get("/")
                request.user = case["user"]

                self.assertEqual(is_manager(request, self.group.group_id), case["is_manager"])

    def test_is_manager_with_group_id_is_none(self):
        test_cases = [
            {"user": self.staff, "is_manager": False},
            {"user": self.manager, "is_manager": False},
            {"user": self.moderator, "is_manager": False},
            {"user": self.musician, "is_manager": False},
            {"user": self.outsider, "is_manager": False},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                request = self.factory.get("/")
                request.user = case["user"]

                self.assertEqual(is_manager(request, None), case["is_manager"])

    def test_is_moderator_with_valid_group(self):
        test_cases = [
            {"user": self.staff, "is_moderator": False},
            {"user": self.manager, "is_moderator": True},
            {"user": self.moderator, "is_moderator": True},
            {"user": self.musician, "is_moderator": False},
            {"user": self.outsider, "is_moderator": False},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                request = self.factory.get("/")
                request.user = case["user"]

                self.assertEqual(is_moderator(request, self.group.group_id), case["is_moderator"])

    def test_is_moderator_with_group_id_is_none(self):
        test_cases = [
            {"user": self.staff, "is_moderator": False},
            {"user": self.manager, "is_moderator": False},
            {"user": self.moderator, "is_moderator": False},
            {"user": self.musician, "is_moderator": False},
            {"user": self.outsider, "is_moderator": False},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                request = self.factory.get("/")
                request.user = case["user"]

                self.assertEqual(is_moderator(request, None), case["is_moderator"])

    def test_is_member_with_valid_group(self):
        test_cases = [
            {"user": self.staff, "is_member": False},
            {"user": self.manager, "is_member": True},
            {"user": self.moderator, "is_member": True},
            {"user": self.musician, "is_member": True},
            {"user": self.outsider, "is_member": False},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                request = self.factory.get("/")
                request.user = case["user"]

                self.assertEqual(is_member(request, self.group.group_id), case["is_member"])

    def test_is_member_with_group_id_is_none(self):
        test_cases = [
            {"user": self.staff, "is_member": False},
            {"user": self.manager, "is_member": False},
            {"user": self.moderator, "is_member": False},
            {"user": self.musician, "is_member": False},
            {"user": self.outsider, "is_member": False},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                request = self.factory.get("/")
                request.user = case["user"]

                self.assertEqual(is_member(request, None), case["is_member"])

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

    def test_get_group_by_track_id(self):
        track = Track.objects.create(group=self.group, name="n", artist="a")
        self.assertEqual(get_group_by_track_id(track.track_id), self.group.group_id)

    def test_get_group_by_track_id_event_does_not_exist(self):
        self.assertEqual(get_group_by_track_id(1), None)

    def test_get_group_by_file_id(self):
        track = Track.objects.create(group=self.group, name="n", artist="a")
        file = File.objects.create(track=track, name="n")
        self.assertEqual(get_group_by_file_id(file.file_id), self.group.group_id)

    def test_get_group_by_file_id_event_does_not_exist(self):
        self.assertEqual(get_group_by_file_id(1), None)

    def tearDown(self):
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
