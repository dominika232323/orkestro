from django.test import TestCase
from django.utils import timezone

from api.models import User


class UserModelTests(TestCase):
    def setUp(self):
        self.fixed_date = timezone.now()
        self.user = User.objects.create_user(email="testuser@example.com", password="securepassword", name="Test", surname="User", date_joined=self.fixed_date)
        self.superuser = User.objects.create_superuser(email="admin@example.com", password="securepassword", name="Admin", surname="User", date_joined=self.fixed_date)

    def test_user_creation(self):
        self.assertEqual(self.user.email, "testuser@example.com")
        self.assertEqual(self.user.name, "Test")
        self.assertEqual(self.user.surname, "User")
        self.assertEqual(self.user.date_joined, self.fixed_date)

        self.assertTrue(self.user.is_active)
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)

        self.assertIsNone(self.user.google_user_id)
        self.assertIsNone(self.user.profile_picture_url)
        self.assertFalse(self.user.gcalendar_is_linked)
        self.assertIsNone(self.user.gcalendar_refresh_token)
        self.assertIsNone(self.user.gcalendar_access_token)

        self.assertTrue(self.user.check_password("securepassword"))

    def test_create_user_without_email(self):
        with self.assertRaises(ValueError) as context:
            User.objects.create_user(email=None, password="securepassword", name="Test", surname="User")
        self.assertEqual(str(context.exception), "The Email field must be set")

    def test_superuser_creation(self):
        self.assertEqual(self.superuser.email, "admin@example.com")
        self.assertEqual(self.superuser.name, "Admin")
        self.assertEqual(self.superuser.surname, "User")
        self.assertEqual(self.superuser.date_joined, self.fixed_date)

        self.assertTrue(self.superuser.is_active)
        self.assertTrue(self.superuser.is_staff)
        self.assertTrue(self.superuser.is_superuser)

        self.assertIsNone(self.superuser.google_user_id)
        self.assertIsNone(self.superuser.profile_picture_url)
        self.assertFalse(self.user.gcalendar_is_linked)
        self.assertIsNone(self.user.gcalendar_refresh_token)
        self.assertIsNone(self.user.gcalendar_access_token)

        self.assertTrue(self.superuser.check_password("securepassword"))

    def test_superuser_creation_is_staff_not_true(self):
        with self.assertRaises(ValueError) as context:
            User.objects.create_superuser(email="super@email.com", password="securepassword", name="Super", surname="User", is_staff=False)
        self.assertEqual(str(context.exception), "Superuser must have is_staff=True.")

    def test_superuser_creation_is_superuser_not_true(self):
        with self.assertRaises(ValueError) as context:
            User.objects.create_superuser(email="super@email.com", password="securepassword", name="Super", surname="User", is_superuser=False)
        self.assertEqual(str(context.exception), "Superuser must have is_superuser=True.")

    def test_string_representation(self):
        self.assertEqual(str(self.user), "Test (testuser@example.com)")

    def tearDown(self):
        self.user.delete()
        self.superuser.delete()
