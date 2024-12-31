"""
Handles API requests regarding instrument data:
- viewing all or one instrument, searching by name and language
- creating, editing, deleting entries (managed by staff users)
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Instrument
from api.serializers import InstrumentSerializer


class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer
    permission_classes = [IsAuthenticated]
