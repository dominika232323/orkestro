from django.test import TestCase

from api.models import Instrument


class InstrumentModelTests(TestCase):
    def setUp(self):
        self.instrument = Instrument.objects.create(name_en="Guitar", name_pl="Gitara")

    def test_instrument_creation(self):
        self.assertEqual(self.instrument.name_en, "Guitar")
        self.assertEqual(self.instrument.name_pl, "Gitara")

    def test_string_representation(self):
        self.assertEqual(str(self.instrument), f"{self.instrument.name_pl}/{self.instrument.name_en} ({self.instrument.instrument_id})")

    def tearDown(self):
        self.instrument.delete()
