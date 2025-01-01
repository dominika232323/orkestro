from django.test import TestCase
from django.utils import timezone

from api.models import User, Group, Event, Message, MessageRecipient, Track, EventAttendee, EventTrack, Member, \
    Instrument, File, FileAllowedMember, FileInstrument
from api.test.common_setups import basic_setup, basic_setup_teardown


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

    def tearDown(self):
        self.user.delete()
        self.superuser.delete()


class GroupModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group", description="A group for musicians")

    def test_group_creation(self):
        self.assertEqual(self.group.name, "Music Group")

    def test_string_representation(self):
        self.assertEqual(str(self.group), f"Music Group ({self.group.group_id})")

    def tearDown(self):
        self.group.delete()


class EventModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group")
        self.event = Event.objects.create(group=self.group, name="Concert", description="A great concert", date=timezone.now(), place="NYC")

    def test_event_creation(self):
        self.assertEqual(self.event.name, "Concert")
        self.assertEqual(self.event.group, self.group)

    def test_string_representation(self):
        self.assertEqual(str(self.event), f"Concert ({self.event.event_id})")

    def tearDown(self):
        self.event.delete()
        self.group.delete()


class TrackModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group")
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")

    def test_track_creation(self):
        self.assertEqual(self.track.name, "Music Track")
        self.assertEqual(self.track.artist, "Artist")

    def test_string_representation(self):
        self.assertEqual(str(self.track), f"Music Track ({self.track.track_id})")

    def tearDown(self):
        self.track.delete()
        self.group.delete()


class FileModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group")
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")
        self.file = File.objects.create(track=self.track, name="Music File")

    def test_file_creation(self):
        self.assertEqual(self.file.name, "Music File")

    def test_string_representation(self):
        self.assertEqual(str(self.file), f"Music File ({self.file.file_id})")

    def tearDown(self):
        self.file.delete()
        self.track.delete()
        self.group.delete()


class InstrumentModelTests(TestCase):
    def setUp(self):
        self.instrument = Instrument.objects.create(name="Guitar")

    def test_instrument_creation(self):
        self.assertEqual(self.instrument.name, "Guitar")

    def test_string_representation(self):
        self.assertEqual(str(self.instrument), f"Guitar ({self.instrument.instrument_id})")

    def tearDown(self):
        self.instrument.delete()


class MessageModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.message = Message.objects.create(user=self.moderator, group=self.group, title="Title", content="Content", date=timezone.now())

    def test_message_creation(self):
        self.assertEqual(self.message.title, "Title")
        self.assertEqual(self.message.content, "Content")

    def test_string_representation(self):
        self.assertEqual(str(self.message), f"{self.message.user} → {self.message.group.name} ({self.message.message_id})")

    def tearDown(self):
        self.message.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])


class EventAttendeeModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.event = Event.objects.create(group=self.group, name="Concert", description="Description", date=timezone.now(), place="NYC")
        self.attendee = EventAttendee.objects.create(event=self.event, user=self.moderator)

    def test_event_attendee_creation(self):
        self.assertEqual(self.attendee.event, self.event)
        self.assertEqual(self.attendee.user, self.moderator)

    def test_string_representation(self):
        self.assertEqual(str(self.attendee), f"{self.event.name} → {self.moderator} ({self.attendee.event_attendee_id})")

    def tearDown(self):
        self.attendee.delete()
        self.event.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])


class EventTrackModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.event = Event.objects.create(group=self.group, name="Concert", description="Description", date=timezone.now(), place="NYC")
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")
        self.event_track = EventTrack.objects.create(track=self.track, event=self.event)

    def test_event_track_creation(self):
        self.assertEqual(self.event_track.track, self.track)
        self.assertEqual(self.event_track.event, self.event)

    def test_string_representation(self):
        self.assertEqual(str(self.event_track), f"{self.event.name} → {self.track.name} ({self.event_track.event_track_id})")

    def tearDown(self):
        self.event_track.delete()
        self.track.delete()
        self.event.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])


class FileAllowedMemberModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")
        self.file = File.objects.create(track=self.track, name="Music File")
        self.file_allowed_member = FileAllowedMember.objects.create(file=self.file, user=self.moderator)

    def test_file_allowed_member_creation(self):
        self.assertEqual(self.file_allowed_member.file, self.file)
        self.assertEqual(self.file_allowed_member.user, self.moderator)

    def test_string_representation(self):
        self.assertEqual(str(self.file_allowed_member), f"{self.file.name} → {self.moderator} ({self.file_allowed_member.file_allowed_member_id})")

    def tearDown(self):
        self.file_allowed_member.delete()
        self.file.delete()
        self.track.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])


class FileInstrumentModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")
        self.file = File.objects.create(track=self.track, name="Music File")
        self.instrument = Instrument.objects.create(name="Instrument")
        self.file_instrument = FileInstrument.objects.create(file=self.file, instrument=self.instrument)

    def test_file_instrument_creation(self):
        self.assertEqual(self.file_instrument.instrument, self.instrument)
        self.assertEqual(self.file_instrument.file, self.file)

    def test_string_representation(self):
        self.assertEqual(str(self.file_instrument), f"{self.file.name} → {self.instrument.name} ({self.file_instrument.file_instrument_id})")

    def tearDown(self):
        self.file_instrument.delete()
        self.instrument.delete()
        self.file.delete()
        self.track.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])


class MessageRecipientModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.message = Message.objects.create(user=self.moderator, group=self.group, title="Hello", content="Test message", date=timezone.now())
        self.recipient = MessageRecipient.objects.create(message=self.message, user=self.musician, is_read=False)

    def test_message_recipient_creation(self):
        self.assertEqual(self.recipient.message, self.message)
        self.assertFalse(self.recipient.is_read)

    def test_string_representation(self):
        self.assertEqual(str(self.recipient), f"{self.message.user} → {self.message.group.name} → {self.musician} ({self.recipient.message_recipient_id})")

    def tearDown(self):
        self.recipient.delete()
        self.message.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
