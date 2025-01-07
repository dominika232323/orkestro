from django.test import TestCase
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import File, Track, Instrument, FileInstrument, FileAllowedMember, Event, EventTrack
from api.tests.common_setups import basic_setup, basic_setup_teardown
from api.views.file_view_set import FileViewSet


class FileViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.track_1 = Track.objects.create(group=self.group, name="Track 1", artist="Artist 1")
        self.track_2 = Track.objects.create(group=self.group, name="Track 2", artist="Artist 2")

        self.file_1 = File.objects.create(track=self.track_1, name="File 1", content=b"Content 1")
        self.file_2 = File.objects.create(track=self.track_1, name="File 2", content=b"Content 2")
        self.file_3 = File.objects.create(track=self.track_2, name="File 3", content=b"Content 3")
        self.file_4 = File.objects.create(track=self.track_2, name="File 4", content=b"Content 4")

        self.instrument_1 = Instrument.objects.create(name_en="Guitar", name_pl="Gitara")
        self.instrument_2 = Instrument.objects.create(name_en="Piano", name_pl="Pianino")

        self.file_instrument_1 = FileInstrument.objects.create(file=self.file_1, instrument=self.instrument_1)
        self.file_instrument_2 = FileInstrument.objects.create(file=self.file_2, instrument=self.instrument_1)
        self.file_instrument_3 = FileInstrument.objects.create(file=self.file_3, instrument=self.instrument_2)
        self.file_instrument_4 = FileInstrument.objects.create(file=self.file_4, instrument=self.instrument_2)

        self.file_allowed_member_1 = FileAllowedMember.objects.create(user=self.moderator, file=self.file_1)
        self.file_allowed_member_2 = FileAllowedMember.objects.create(user=self.musician, file=self.file_1)
        self.file_allowed_member_3 = FileAllowedMember.objects.create(user=self.moderator, file=self.file_2)
        self.file_allowed_member_4 = FileAllowedMember.objects.create(user=self.musician, file=self.file_3)
        self.file_allowed_member_5 = FileAllowedMember.objects.create(user=self.musician, file=self.file_4)

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
                request = self.factory.get(f"/api/files/{self.file_1.file_id}/download/")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the download method
                view = FileViewSet.as_view({"get": "download"})
                response = view(request, pk=self.file_1.file_id)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

    def test_search_by_name(self):
        test_cases = [
            {
                "user": self.staff,
                "track": self.track_1,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "track": self.track_1,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "track": self.track_1,
                "expected_count": 2,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "track": self.track_1,
                "expected_count": 1,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "track": self.track_1,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.staff,
                "track": self.track_2,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "track": self.track_2,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "track": self.track_2,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "track": self.track_2,
                "expected_count": 2,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "track": self.track_2,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
        ]

        for case in test_cases:
            with self.subTest(user=case["user"], track=case["track"]):
                # Simulate a search by name
                request = self.factory.get("/api/files/search/", {"name": "File", "track_id": case["track"].track_id})
                force_authenticate(request, user=case["user"])

                # Call the view
                view = FileViewSet.as_view({"get": "search"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, 200)
                self.assertEqual(len(response.data["items"]), case["expected_count"])
                self.assertEqual(response.data["page_number"], case["expected_page_number"])
                self.assertEqual(response.data["total_pages"], case["expected_total_pages"])

    def test_search_by_instrument(self):
        ins_1_id_list = str(self.instrument_1.instrument_id)
        ins_2_id_list = str(self.instrument_2.instrument_id)
        ins_1_2_id_list = ins_1_id_list + " " + ins_2_id_list

        test_cases = [
            {
                "user": self.staff,
                "track": self.track_1,
                "instrument_ids": ins_1_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "track": self.track_1,
                "instrument_ids": ins_1_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "track": self.track_1,
                "instrument_ids": ins_1_id_list,
                "expected_count": 2,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "track": self.track_1,
                "instrument_ids": ins_1_id_list,
                "expected_count": 1,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "track": self.track_1,
                "instrument_ids": ins_1_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.staff,
                "track": self.track_2,
                "instrument_ids": ins_1_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "track": self.track_2,
                "instrument_ids": ins_1_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "track": self.track_2,
                "instrument_ids": ins_1_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "track": self.track_2,
                "instrument_ids": ins_1_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "track": self.track_2,
                "instrument_ids": ins_1_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.staff,
                "track": self.track_1,
                "instrument_ids": ins_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "track": self.track_1,
                "instrument_ids": ins_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "track": self.track_1,
                "instrument_ids": ins_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "track": self.track_1,
                "instrument_ids": ins_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "track": self.track_1,
                "instrument_ids": ins_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.staff,
                "track": self.track_2,
                "instrument_ids": ins_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "track": self.track_2,
                "instrument_ids": ins_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "track": self.track_2,
                "instrument_ids": ins_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "track": self.track_2,
                "instrument_ids": ins_2_id_list,
                "expected_count": 2,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "track": self.track_2,
                "instrument_ids": ins_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.staff,
                "track": self.track_1,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "track": self.track_1,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "track": self.track_1,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 2,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "track": self.track_1,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 1,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "track": self.track_1,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.staff,
                "track": self.track_2,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "track": self.track_2,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "track": self.track_2,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "track": self.track_2,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 2,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "track": self.track_2,
                "instrument_ids": ins_1_2_id_list,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
        ]

        for case in test_cases:
            with self.subTest(user=case["user"], track=case["track"], instrument_ids=case["instrument_ids"]):
                # Simulate a search by instrument
                request = self.factory.get(
                    "/api/files/search/",
                    {"track_id": case["track"].track_id, "instrument_id": case["instrument_ids"], "name": "File"},
                )
                force_authenticate(request, user=case["user"])

                # Call the view
                view = FileViewSet.as_view({"get": "search"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, 200)
                self.assertEqual(len(response.data["items"]), case["expected_count"])
                self.assertEqual(response.data["page_number"], case["expected_page_number"])
                self.assertEqual(response.data["total_pages"], case["expected_total_pages"])

    def test_me_by_event(self):
        event_1 = Event.objects.create(group=self.group, name="E1", description="D1", date=timezone.now(), place="P1")
        event_2 = Event.objects.create(group=self.group, name="E2", description="D2", date=timezone.now(), place="P2")

        EventTrack.objects.create(track=self.track_1, event=event_1)
        EventTrack.objects.create(track=self.track_2, event=event_1)
        EventTrack.objects.create(track=self.track_2, event=event_2)

        test_cases = [
            {
                "user": self.staff,
                "event": event_1,
                "expected_status": 200,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "event": event_1,
                "expected_status": 200,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "event": event_1,
                "expected_status": 200,
                "expected_count": 2,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "event": event_1,
                "expected_status": 200,
                "expected_count": 3,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "event": event_1,
                "expected_status": 200,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.staff,
                "event": event_2,
                "expected_status": 200,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "event": event_2,
                "expected_status": 200,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "event": event_2,
                "expected_status": 200,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "event": event_2,
                "expected_status": 200,
                "expected_count": 2,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "event": event_2,
                "expected_status": 200,
                "expected_count": 0,
                "expected_page_number": 1,
                "expected_total_pages": 1
            },
        ]

        for case in test_cases:
            with self.subTest(user=case["user"], event=case["event"]):
                # Create a request to fetch files for the event
                request = self.factory.get(f"/api/files/me_by_event/?event_id={case['event'].event_id}")
                force_authenticate(request, user=case["user"])

                # Call the view
                view = FileViewSet.as_view({"get": "me_by_event"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data["items"]), case["expected_count"])
                self.assertEqual(response.data["page_number"], case["expected_page_number"])
                self.assertEqual(response.data["total_pages"], case["expected_total_pages"])

    def tearDown(self):
        self.file_allowed_member_1.delete()
        self.file_allowed_member_2.delete()

        self.file_instrument_1.delete()
        self.file_instrument_2.delete()

        self.instrument_1.delete()
        self.instrument_2.delete()

        self.file_1.delete()
        self.file_2.delete()
        self.file_3.delete()
        self.file_4.delete()

        self.track_1.delete()
        self.track_2.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
