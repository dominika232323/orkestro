from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import Instrument
from api.serializers import InstrumentSerializer


class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer
    permission_classes = [IsAuthenticated]
