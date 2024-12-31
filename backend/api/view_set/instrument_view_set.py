"""
Handles API requests regarding instrument data:
- viewing all or one instrument, searching by name and language
- creating, editing, deleting entries (managed by staff users)
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Instrument
from api.serializers import InstrumentSerializer
from api.permissions.instrument_permissions import CanCreateEditDeleteInstrument


class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer
    permission_classes = [IsAuthenticated, CanCreateEditDeleteInstrument]
    http_method_names = ["get", "post", "put", "delete", "head"]

    @action(detail=False, methods=["get"])
    def search(self, request):
        instruments = Instrument.objects.filter(**{f"name_{request.GET.get('language')}__icontains": request.GET.get("name") or ""})
        serializer = self.get_serializer(instruments, many=True)
        return Response(serializer.data)
