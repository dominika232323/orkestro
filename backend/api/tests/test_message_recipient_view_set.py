from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Message, MessageRecipient
from api.tests.common_setups import basic_setup, basic_setup_teardown
from api.views.message_recipient_view_set import MessageRecipientViewSet


class MessageRecipientViewSetTestCase(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        self.message_1 = Message.objects.create(
            user=self.moderator,
            group=self.group,
            title="Rehearsal",
            content="Reminder about rehearsal at 2pm, wear formal clothes",
            date=timezone.now()
        )
        self.message_2 = Message.objects.create(
            user=self.manager,
            group=self.group,
            title="Christmas concert update",
            content="Update: Final setlist confirmed. Be ready to perform!",
            date=timezone.now()
        )
        self.message_3 = Message.objects.create(
            user=self.musician,
            group=self.group,
            title="Concert Attire Guidelines",
            content="Reminder: Wear black formal attire for the upcoming concert.",
            date=timezone.now()
        )
        self.message_4 = Message.objects.create(
            user=self.moderator,
            group=self.group,
            title="Instrument Tuning Tips",
            content="Ensure your instrument is tuned before the performance. Let's sound great together!",
            date=timezone.now()
        )
        self.message_5 = Message.objects.create(
            user=self.manager,
            group=self.group,
            title="Sound Check Details",
            content="Sound check is scheduled for 1pm before rehearsal. Please be punctual.",
            date=timezone.now()
        )

        self.message_recipient_1 = MessageRecipient.objects.create(message=self.message_1, user=self.musician, is_read=False)
        self.message_recipient_2 = MessageRecipient.objects.create(message=self.message_1, user=self.manager, is_read=False)
        self.message_recipient_3 = MessageRecipient.objects.create(message=self.message_2, user=self.musician, is_read=True)
        self.message_recipient_4 = MessageRecipient.objects.create(message=self.message_2, user=self.moderator, is_read=False)
        self.message_recipient_5 = MessageRecipient.objects.create(message=self.message_3, user=self.manager, is_read=True)
        self.message_recipient_6 = MessageRecipient.objects.create(message=self.message_3, user=self.moderator, is_read=False)
        self.message_recipient_7 = MessageRecipient.objects.create(message=self.message_4, user=self.manager, is_read=False)
        self.message_recipient_8 = MessageRecipient.objects.create(message=self.message_5, user=self.moderator, is_read=True)

    def test_create_access(self):
        test_cases = [
            {"user": self.staff, "expected_status": 201},
            {"user": self.manager, "expected_status": 201},
            {"user": self.moderator, "expected_status": 201},
            {"user": self.musician, "expected_status": 201},
            {"user": self.outsider, "expected_status": 201},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                message = Message.objects.create(user=case["user"], group=self.group, title="t", content="c", date=timezone.now())

                # Prepare valid data
                message_recipient_data = {
                    "message": message.message_id,
                    "user": self.musician.user_id,
                    "is_read": False,
                }

                # Create a request
                request = self.factory.post("/api/message-recipients/", message_recipient_data, format="json")
                force_authenticate(request, user=case["user"])

                # Instantiate the view and call the create method
                view = MessageRecipientViewSet.as_view({"post": "create"})
                response = view(request)

                # Assertions
                self.assertEqual(response.status_code, case["expected_status"])

                if response.status_code == 201:
                    self.assertEqual(response.data["message"], message.message_id)
                    self.assertEqual(response.data["user"], self.musician.user_id)
                    self.assertEqual(response.data["is_read"], False)

    def test_create_invalid_data(self):
        # Prepare invalid data
        message_recipient_data = {
            "message": "self.message_4.message_id",
            "user": self.musician.user_id,
            "is_read": False,
        }

        # Create a request
        request = self.factory.post("/api/message-recipients/", message_recipient_data, format="json")
        force_authenticate(request, user=self.staff)

        # Instantiate the view and call the create method
        view = MessageRecipientViewSet.as_view({"post": "create"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Data validation failed")

    def test_mark_as_read(self):
        # Define test cases with expected outcomes
        test_cases = [
            {"message_recipient": self.message_recipient_1, "expected_status": 204},
            {"message_recipient": self.message_recipient_2, "expected_status": 204},
            {"message_recipient": self.message_recipient_3, "expected_status": 204},
            {"message_recipient": self.message_recipient_4, "expected_status": 204},
            {"message_recipient": self.message_recipient_5, "expected_status": 204},
            {"message_recipient": self.message_recipient_6, "expected_status": 204},
            {"message_recipient": self.message_recipient_7, "expected_status": 204},
            {"message_recipient": self.message_recipient_8, "expected_status": 204},
        ]

        for case in test_cases:
            with self.subTest(message_recipient=case["message_recipient"]):
                # Create and authenticate the request
                request = self.factory.post(f"/api/message-recipients/{case['message_recipient'].message_recipient_id}/mark_as_read/")
                force_authenticate(request, user=self.staff)
                response = MessageRecipientViewSet.as_view({'post': 'mark_as_read'})(request, pk=case["message_recipient"].message_recipient_id)

                # Refresh the message recipient from the database
                case["message_recipient"].refresh_from_db()

                self.assertEqual(response.status_code, case["expected_status"])
                self.assertTrue(case["message_recipient"].is_read)

    def test_me(self):
        # Define test cases with expected outcomes
        test_cases = [
            {"user": self.staff, "expected_status": 200, "expected_count": 0, "expected_page": 1, "expected_total_pages": 1},
            {"user": self.manager, "expected_status": 200, "expected_count": 3, "expected_page": 1, "expected_total_pages": 1},
            {"user": self.moderator, "expected_status": 200, "expected_count": 3, "expected_page": 1, "expected_total_pages": 1},
            {"user": self.musician, "expected_status": 200, "expected_count": 2, "expected_page": 1, "expected_total_pages": 1},
            {"user": self.outsider, "expected_status": 200, "expected_count": 0, "expected_page": 1, "expected_total_pages": 1},
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/message-recipients/me/")
                force_authenticate(request, user=case["user"])
                response = MessageRecipientViewSet.as_view({'get': 'me'})(request)

                # Assert the response status and count
                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data["messages"]), case["expected_count"])
                self.assertEqual(response.data["page_number"], case["expected_page"])
                self.assertEqual(response.data["total_pages"], case["expected_total_pages"])

    def test_me_with_term(self):
        # Define test cases with expected outcomes
        test_cases = [
            {
                "user": self.staff,
                "expected_status": 200,
                "expected_count": 0,
                "expected_messages": [],
                "expected_page": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.manager,
                "expected_status": 200,
                "expected_count": 2,
                "expected_messages": ["Rehearsal", "Concert Attire Guidelines"],
                "expected_page": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.moderator,
                "expected_status": 200,
                "expected_count": 2,
                "expected_messages": ["Concert Attire Guidelines", "Sound Check Details"],
                "expected_page": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.musician,
                "expected_status": 200,
                "expected_count": 1,
                "expected_messages": ["Rehearsal"],
                "expected_page": 1,
                "expected_total_pages": 1
            },
            {
                "user": self.outsider,
                "expected_status": 200,
                "expected_count": 0,
                "expected_messages": [],
                "expected_page": 1,
                "expected_total_pages": 1
            },
        ]

        for case in test_cases:
            with self.subTest(user=case["user"]):
                # Create and authenticate the request
                request = self.factory.get("/api/message-recipients/me/", {"search": "rehearsal reminder"})
                force_authenticate(request, user=case["user"])
                response = MessageRecipientViewSet.as_view({'get': 'me'})(request)

                # Assert the response status and count
                self.assertEqual(response.status_code, case["expected_status"])
                self.assertEqual(len(response.data["messages"]), case["expected_count"])
                self.assertEqual(response.data["page_number"], case["expected_page"])
                self.assertEqual(response.data["total_pages"], case["expected_total_pages"])

    def tearDown(self):
        self.message_recipient_1.delete()
        self.message_recipient_2.delete()
        self.message_recipient_3.delete()
        self.message_recipient_4.delete()
        self.message_recipient_5.delete()
        self.message_recipient_6.delete()
        self.message_recipient_7.delete()
        self.message_recipient_8.delete()

        self.message_1.delete()
        self.message_2.delete()
        self.message_3.delete()
        self.message_4.delete()
        self.message_5.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
