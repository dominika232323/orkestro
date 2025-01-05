from django.test import TestCase

from api.models import Track, File, Instrument, FileInstrument
from api.tests.common_setups import basic_setup, basic_setup_teardown


class FileInstrumentModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.track = Track.objects.create(group=self.group, name="Music Track", artist="Artist")
        self.file = File.objects.create(track=self.track, name="Music File")
        self.instrument = Instrument.objects.create(name_en="Guitar", name_pl="Gitara")
        self.file_instrument = FileInstrument.objects.create(file=self.file, instrument=self.instrument)

    def test_file_instrument_creation(self):
        self.assertEqual(self.file_instrument.file, self.file)
        self.assertEqual(self.file_instrument.instrument, self.instrument)

    def test_file_instrument_creation_with_invalid_file(self):
        with self.assertRaises(Exception):
            FileInstrument.objects.create(file="File", instrument=self.instrument)

    def test_file_instrument_creation_with_invalid_instrument(self):
        with self.assertRaises(Exception):
            FileInstrument.objects.create(file=self.file, instrument="Instrument")

    def test_string_representation(self):
        self.assertEqual(str(self.file_instrument), f"{self.file.name} → {self.instrument.name_pl}/{self.instrument.name_en} ({self.file_instrument.file_instrument_id})")

    def tearDown(self):
        self.file_instrument.delete()
        self.instrument.delete()
        self.file.delete()
        self.track.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
