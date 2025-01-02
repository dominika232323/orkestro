from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Track, File, User, Member, FileAllowedMember
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.file_allowed_member_view_set import FileAllowedMemberViewSet


class FileAllowedMemberViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.track = Track.objects.create(name="Test Track", group=self.group, artist="Artist")
        self.file = File.objects.create(name="Test File", track=self.track, content=b"Test Content")

        self.file_allowed_manager = FileAllowedMember.objects.create(file=self.file, user=self.manager)
        self.file_allowed_musician = FileAllowedMember.objects.create(file=self.file, user=self.musician)

    def test_destroy_last_manager(self):
        # Attempt to delete the last manager's access
        request = self.factory.delete(f"/api/file-allowed-members/{self.file_allowed_manager.file_allowed_member_id}/")
        force_authenticate(request, user=self.manager)

        view = FileAllowedMemberViewSet.as_view({"delete": "destroy"})
        response = view(request, pk=self.file_allowed_manager.file_allowed_member_id)

        # Assert response and check error
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Can't remove the last manager's access to the file")

    def test_destroy_non_last_manager(self):
        self.manager2 = User.objects.create(email="manager@a.com", name="Manage", surname="R", date_joined=timezone.now())
        Member.objects.create(group=self.group, user=self.manager2, permission_level="A")
        self.file_allowed_manager2 = FileAllowedMember.objects.create(file=self.file, user=self.manager2)

        # Attempt to delete manager2's access
        request = self.factory.delete(f"/api/file-allowed-members/{self.file_allowed_manager2.file_allowed_member_id}/")
        force_authenticate(request, user=self.manager2)

        view = FileAllowedMemberViewSet.as_view({"delete": "destroy"})
        response = view(request, pk=self.file_allowed_manager2.file_allowed_member_id)

        # Assert response and ensure deletion
        self.assertEqual(response.status_code, 204)
        self.assertFalse(FileAllowedMember.objects.filter(file_allowed_member_id=self.file_allowed_manager2.file_allowed_member_id).exists())

    def tearDown(self):
        self.file_allowed_manager.delete()
        self.file_allowed_musician.delete()

        self.file.delete()
        self.track.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
