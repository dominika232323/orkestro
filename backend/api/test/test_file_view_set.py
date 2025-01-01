from django.test import TestCase
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import File, Track
from api.test.common_setups import basic_setup, basic_setup_teardown
from api.view_set.file_view_set import FileViewSet


class FileViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.track_1 = Track.objects.create(group=self.group, name="Track 1", artist="Artist 1")
        self.track_2 = Track.objects.create(group=self.group, name="Track 2", artist="Artist 2")
        self.track_3 = Track.objects.create(group=self.group, name="Track 3", artist="Artist 3")
        self.track_4 = Track.objects.create(group=self.group, name="Track 4", artist="Artist 4")

        self.file_1 = File.objects.create(track=self.track_1, name="File 1", content=b"Content 1")
        self.file_2 = File.objects.create(track=self.track_2, name="File 2", content=b"Content 2")
        self.file_3 = File.objects.create(track=self.track_3, name="File 3", content=b"Content 3")
        self.file_4 = File.objects.create(track=self.track_4, name="File 4", content=b"Content 4")

    def test_create_access(self):
        test_cases = [
            {"user": self.staff, "expected_status": 201},
            {"user": self.manager, "expected_status": 201},
            {"user": self.moderator, "expected_status": 403},
            {"user": self.musician, "expected_status": 403},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create a sample file to upload
                test_file = SimpleUploadedFile(
                    "test_file.txt", b"Sample file content", content_type="text/plain"
                )
                file_data = {
                    "track": self.track_1.track_id,
                    "name": "File name",
                    "file": test_file,
                }

                # Create a request
                request = self.factory.post("/api/files/", file_data, format="multipart")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the create method
                view = FileViewSet.as_view({"post": "create"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 201:
                    self.assertEqual(response.data["track"], self.track_1.track_id)
                    self.assertEqual(response.data["name"], "File name")

    def test_create_invalid_data(self):
        file_data = {
            "track": "track 1",
            "name": "File name",
        }

        # Create a request
        request = self.factory.post("/api/files/", file_data, format="json")
        force_authenticate(request, user=self.staff)

        # Instantiate the view and call the create method
        view = FileViewSet.as_view({"post": "create"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Data validation failed")

    def test_download(self):
        # Authenticated user allowed to download
        test_cases = [
            {"user": self.staff, "expected_status": 200},
            {"user": self.manager, "expected_status": 200},
            {"user": self.moderator, "expected_status": 200},
            {"user": self.musician, "expected_status": 200},
            {"user": self.outsider, "expected_status": 403},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create a request
                request = self.factory.get(f"/files/{self.file_1.file_id}/download/")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the download method
                view = FileViewSet.as_view({"get": "download"})
                response = view(request, pk=self.file_1.file_id)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

    def tearDown(self):
        self.file_1.delete()
        self.file_2.delete()
        self.file_3.delete()
        self.file_4.delete()

        self.track_1.delete()
        self.track_2.delete()
        self.track_3.delete()
        self.track_4.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
