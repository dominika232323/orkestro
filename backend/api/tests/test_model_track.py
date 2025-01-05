from django.test import TestCase

from api.models import Group, Track


class TrackModelTests(TestCase):
    def setUp(self):
        self.group = Group.objects.create(name="Music Group", description="A group for musicians")
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")

    def test_track_creation(self):
        self.assertEqual(self.track.group, self.group)

        self.assertEqual(self.track.name, "Music Track")
        self.assertEqual(self.track.artist, "Artist")

    def test_track_creation_with_invalid_group(self):
        with self.assertRaises(Exception):
            Track.objects.create(group="Group", name="Music Track", artist="Artist")

    def test_string_representation(self):
        self.assertEqual(str(self.track), f"Music Track ({self.track.track_id})")

    def tearDown(self):
        self.track.delete()
        self.group.delete()
