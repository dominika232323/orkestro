from django.test import TestCase

from api.models import User


class UserModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="testuser@example.com", password="securepassword", name="Test", surname="User")
        self.superuser = User.objects.create_superuser(email="admin@example.com", password="securepassword", name="Admin", surname="User")

    def test_user_creation(self):
        self.assertEqual(self.user.email, "testuser@example.com")
        self.assertTrue(self.user.check_password("securepassword"))
        self.assertFalse(self.user.is_staff)

    def test_create_user_without_email(self):
        with self.assertRaises(ValueError) as context:
            User.objects.create_user(email=None, password="securepassword", name="Test", surname="User")
        self.assertEqual(str(context.exception), "The Email field must be set")

    def test_superuser_creation(self):
        self.assertTrue(self.superuser.is_staff)
        self.assertTrue(self.superuser.is_superuser)

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
