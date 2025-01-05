from django.test import TestCase

from api.models import Instrument, UserInstrument
from api.tests.common_setups import basic_setup, basic_setup_teardown


class UserInstrumentModelTests(TestCase):
    def setUp(self):
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.instrument = Instrument.objects.create(name_en="Guitar", name_pl="Gitara")
        self.user_instrument = UserInstrument.objects.create(user=self.musician, instrument=self.instrument)

    def test_user_instrument_creation(self):
        self.assertEqual(self.user_instrument.instrument, self.instrument)
        self.assertEqual(self.user_instrument.user, self.musician)

    def test_user_instrument_creation_with_invalid_instrument(self):
        with self.assertRaises(Exception):
            UserInstrument.objects.create(user=self.musician, instrument="Instrument")

    def test_user_instrument_creation_with_invalid_user(self):
        with self.assertRaises(Exception):
            UserInstrument.objects.create(user="User", instrument=self.instrument)

    def test_string_representation(self):
        self.assertEqual(str(self.user_instrument), f"{self.musician} → {self.instrument.name_pl}/{self.instrument.name_en} ({self.user_instrument.user_instrument_id})")

    def tearDown(self):
        self.user_instrument.delete()
        self.instrument.delete()
        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
