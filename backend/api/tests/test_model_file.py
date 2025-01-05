from django.test import TestCase

from api.models import Group, Track, File


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
