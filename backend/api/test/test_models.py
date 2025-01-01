from django.test import TestCase
from django.utils import timezone

from api.models import User, Group, Event, Message, MessageRecipient, Track, EventAttendee, EventTrack, Member, \
    Instrument, File


class UserModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="testuser@example.com", password="securepassword", name="Test", surname="User")
        self.superuser = User.objects.create_superuser(email="admin@example.com", password="securepassword", name="Admin", surname="User")

    def test_user_creation(self):
        self.assertEqual(self.user.email, "testuser@example.com")
        self.assertTrue(self.user.check_password("securepassword"))
        self.assertFalse(self.user.is_staff)

    def test_superuser_creation(self):
        self.assertTrue(self.superuser.is_staff)
        self.assertTrue(self.superuser.is_superuser)

    def test_create_user_without_email(self):
        with self.assertRaises(ValueError) as context:
            User.objects.create_user(email=None, password="securepassword", name="Test", surname="User")
        self.assertEqual(str(context.exception), "The Email field must be set")

    def test_string_representation(self):
        self.assertEqual(str(self.user), "Test (testuser@example.com)")


class GroupModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group", description="A group for musicians")

    def test_group_creation(self):
        self.assertEqual(self.group.name, "Music Group")

    def test_string_representation(self):
        self.assertEqual(str(self.group), f"Music Group ({self.group.group_id})")


class EventModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group")
        self.event = Event.objects.create(group=self.group, name="Concert", description="A great concert", date=timezone.now(), place="NYC")

    def test_event_creation(self):
        self.assertEqual(self.event.name, "Concert")
        self.assertEqual(self.event.group, self.group)

    def test_string_representation(self):
        self.assertEqual(str(self.event), f"Concert ({self.event.event_id})")


class TrackModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group")
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")

    def test_track_creation(self):
        self.assertEqual(self.track.name, "Music Track")
        self.assertEqual(self.track.artist, "Artist")

    def test_string_representation(self):
        self.assertEqual(str(self.track), f"Music Track ({self.track.track_id})")


class FileModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group")
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")
        self.file = File.objects.create(track=self.track, name="Music File")

    def test_file_creation(self):
        self.assertEqual(self.file.name, "Music File")

    def test_string_representation(self):
        self.assertEqual(str(self.file), f"Music File ({self.file.file_id})")


class InstrumentModelTests(TestCase):
    def setUp(self):
        self.instrument = Instrument.objects.create(name="Guitar")

    def test_instrument_creation(self):
        self.assertEqual(self.instrument.name, "Guitar")

    def test_string_representation(self):
        self.assertEqual(str(self.instrument), f"Guitar ({self.instrument.instrument_id})")


# class MessageModelTests(TestCase):
#     pass


class MessageRecipientModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="testuser@example.com", password="password", name="Test", surname="User")
        self.group = Group.objects.create(name="Music Group")
        self.message = Message.objects.create(user=self.user, group=self.group, title="Hello", content="Test message", date=timezone.now())
        self.recipient = MessageRecipient.objects.create(message=self.message, user=self.user, is_read=False)

    def test_message_recipient_creation(self):
        self.assertEqual(self.recipient.message, self.message)
        self.assertFalse(self.recipient.is_read)

    def test_unique_constraint(self):
        with self.assertRaises(Exception):
            MessageRecipient.objects.create(message=self.message, user=self.user)

    def test_string_representation(self):
        self.assertEqual(str(self.recipient), f"{self.message.user} → {self.message.group.name} → {self.user} ({self.recipient.message_recipient_id})")


class UniqueConstraintTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="testuser@example.com", password="password", name="Test", surname="User")
        self.group = Group.objects.create(name="Music Group")
        self.event = Event.objects.create(group=self.group, name="Concert", date=timezone.now(), place="NYC")
        self.track = Track.objects.create(group=self.group, name="Song", artist="Artist")

    def test_event_attendee_unique_constraint(self):
        EventAttendee.objects.create(event=self.event, user=self.user)
        with self.assertRaises(Exception):
            EventAttendee.objects.create(event=self.event, user=self.user)

    def test_event_track_unique_constraint(self):
        EventTrack.objects.create(event=self.event, track=self.track)
        with self.assertRaises(Exception):
            EventTrack.objects.create(event=self.event, track=self.track)

    def test_member_unique_constraint(self):
        Member.objects.create(group=self.group, user=self.user, permission_level="A")
        with self.assertRaises(Exception):
            Member.objects.create(group=self.group, user=self.user, permission_level="B")
