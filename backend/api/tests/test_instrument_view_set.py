from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Instrument
from api.views.instrument_view_set import InstrumentViewSet
from api.tests.common_setups import basic_setup, basic_setup_teardown


class InstrumentViewSetTestCase(TestCase):
    def setUp(self):
        # Setup common users and permissions
        self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated, self.group = basic_setup()
        self.factory = APIRequestFactory()

        # Create sample instruments
        self.instrument_1 = Instrument.objects.create(name_en="Guitar", name_pl="Gitara")
        self.instrument_2 = Instrument.objects.create(name_en="Piano", name_pl="Pianino")
        self.instrument_3 = Instrument.objects.create(name_en="Violin", name_pl="Skrzypce")

    def test_search_by_name_in_english(self):
        # Create a request to search instruments by name in English
        request = self.factory.get("/api/instruments/search/?language=en&name=Guitar")
        force_authenticate(request, user=self.staff)

        # Call the search view
        view = InstrumentViewSet.as_view({"get": "search"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name_en"], "Guitar")
        self.assertEqual(response.data[0]["name_pl"], "Gitara")

    def test_search_by_name_in_polish(self):
        # Create a request to search instruments by name in Polish
        request = self.factory.get("/api/instruments/search/?language=pl&name=Gitara")
        force_authenticate(request, user=self.staff)

        # Call the search view
        view = InstrumentViewSet.as_view({"get": "search"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name_en"], "Guitar")
        self.assertEqual(response.data[0]["name_pl"], "Gitara")

    def test_search_no_results(self):
        # Create a request for a name that doesn't exist
        request = self.factory.get("/api/instruments/search/?language=en&name=Flute")
        force_authenticate(request, user=self.staff)

        # Call the search view
        view = InstrumentViewSet.as_view({"get": "search"})
        response = view(request)

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def tearDown(self):
        self.instrument_1.delete()
        self.instrument_2.delete()
        self.instrument_3.delete()

        basic_setup_teardown(self.group, [self.staff, self.manager, self.moderator, self.musician, self.outsider, self.unauthenticated])
